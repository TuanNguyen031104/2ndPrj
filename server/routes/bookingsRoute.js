const router = require("express").Router();
const stripe = require("stripe")(process.env.stripe_key);
const authMiddleware = require("../middlewares/authMiddleware");
const Booking = require("../models/bookingModel");
const Show = require("../models/showModel");

// make payment
router.post("/make-payment", authMiddleware, async (req, res) => {
    try {
        console.log("💳 /make-payment called with body:", req.body);

        const { token, amount } = req.body;

        console.log("💳 Creating Stripe customer with email:", token.email);
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id,
        });

        console.log("💳 Customer created:", customer.id);
        const charge = await stripe.charges.create({
            amount: amount,
            currency: "usd",
            customer: customer.id,
            receipt_email: token.email,
            description: "Ticket Booked for Movie",
        });

        console.log("💳 Charge created:", charge.id);
        const transactionId = charge.id;

        res.send({
            success: true,
            message: "Payment successful",
            data: transactionId,
        });
    } catch (error) {
        console.error("❌ /make-payment error:", error);
        res.send({
            success: false,
            message: error.message,
        });
    }
});

// book shows
router.post("/book-show", authMiddleware, async (req, res) => {
    try {
        const { show, seats, user, transactionId } = req.body; // Destructure all required payload fields

        const session = await mongoose.startSession(); // Start a Mongoose session for atomicity
        session.startTransaction(); // Start a transaction

        try {
            // 1. Fetch the show document within the transaction
            const currentShow = await Show.findById(show).session(session);

            if (!currentShow) {
                throw new Error("Show not found.");
            }

            // 2. Check for seat availability (Crucial step)
            const alreadyBookedSeats = currentShow.bookedSeats;
            const newSeats = seats;

            const conflictingSeats = newSeats.filter(seat =>
                alreadyBookedSeats.includes(seat)
            );

            if (conflictingSeats.length > 0) {
                await session.abortTransaction();
                session.endSession();
                // Return a specific error message to the client
                throw new Error(`Ghế ${conflictingSeats.join(", ")} đã được đặt. Vui lòng chọn ghế khác.`);
            }

            // Optional: Check if selected seats exceed total capacity
            if (alreadyBookedSeats.length + newSeats.length > currentShow.totalSeats) {
                await session.abortTransaction();
                session.endSession();
                throw new Error("Số ghế bạn chọn vượt quá tổng số ghế của suất chiếu.");
            }

            // 3. Atomically update the bookedSeats array in the Show document
            // Use $push with $each to add multiple elements
            const updatedShow = await Show.findByIdAndUpdate(
                show,
                { $push: { bookedSeats: { $each: newSeats } } },
                { new: true, session: session } // 'new: true' returns the updated doc; use the session
            );

            if (!updatedShow) {
                // This case should ideally not be hit if currentShow was found, but for robustness
                await session.abortTransaction();
                session.endSession();
                throw new Error("Không thể cập nhật suất chiếu. Vui lòng thử lại.");
            }

            // 4. Save the new Booking document within the same transaction
            const newBooking = new Booking({
                show: show,
                user: user,
                seats: newSeats,
                transactionId: transactionId,
            });
            await newBooking.save({ session: session }); // Pass the session to save()

            // 5. Commit the transaction if all operations are successful
            await session.commitTransaction();
            session.endSession();

            res.send({
                success: true,
                message: "Đặt vé thành công!",
                data: newBooking,
            });

        } catch (transactionError) {
            // If any error occurs during transaction (e.g., seat conflict), abort it
            if (session.inTransaction()) {
                await session.abortTransaction();
            }
            session.endSession();
            res.send({
                success: false,
                message: transactionError.message,
            });
        }
    } catch (error) {
        // Catch any errors outside the transaction logic (e.g., initial parsing errors)
        res.send({
            success: false,
            message: error.message,
        });
    }
});

// get all bookings by user
router.get("/get-bookings", authMiddleware, async (req, res) => {
    try {
        console.log("📥 /get-bookings called for user:", req.userId);
        const bookings = await Booking.find({ user: req.userId })
            .populate({
                path: "show",
                populate: [
                    { path: "movie", model: "movies" },
                    { path: "theatre", model: "theatres" },
                ],
            })
            .populate("user");

        console.log(`📊 Fetched ${bookings.length} bookings for user:`, req.userId);
        res.send({
            success: true,
            message: "Bookings fetched successfully",
            data: bookings,
        });
    } catch (error) {
        console.error("❌ /get-bookings error:", error);
        res.send({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;

import { message } from "antd";
import moment from "moment";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GetShowById } from "../../apiIntergration/theatres";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import StripeCheckout from "react-stripe-checkout";
import Button from "../../components/Button";
import { BookShowTickets, MakePayment } from "../../apiIntergration/bookings";

function BookShow() {
    const { user } = useSelector((state) => state.users);
    const [show, setShow] = React.useState(null);
    const [selectedSeats, setSelectedSeats] = React.useState([]);
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getData = async () => {
        try {
            dispatch(ShowLoading());
            console.log("🛰 Fetching show data with ID:", params.id);
            const response = await GetShowById({
                showId: params.id,
            });
            if (response.success) {
                console.log("📥 Show data received:", response.data);
                setShow(response.data);
            } else {
                console.log("❌ Failed to fetch show:", response.message);
                message.error(response.message);
            }
            dispatch(HideLoading());
        } catch (error) {
            dispatch(HideLoading());
            console.log("❌ Error fetching show:", error);
            message.error(error.message);
        }

        const response = await GetShowById({ showId: params.id });

        console.log("📥 Raw show response:", response);

        if (response.success) {
            console.log("✅ Show data contains:", response.data);
            console.log("📊 Booked seats in show:", response.data.bookedSeats);
            setShow(response.data);
        } else {
            message.error(response.message);
        }
    };

    useEffect(() => {
        if (show) {
            console.log("🧠 Current show state:", show);
            console.log("🎟 Booked seats after state set:", show.bookedSeats);
        }
    }, [show]);

    const getSeats = () => {
        if (!show) {
            console.log("⚠️ Show not loaded, cannot render seats");
            return null;
        }

        const columns = 12;
        const totalSeats = show.totalSeats;
        const rows = Math.ceil(totalSeats / columns);

        console.log("🎟 Rendering seat grid.");
        console.log("📊 Total seats:", totalSeats);
        console.log("📏 Columns:", columns, "| Rows:", rows);
        console.log("🎯 Selected seats:", selectedSeats);
        console.log("📥 Booked seats from show object:", show.bookedSeats);

        return (
            <div className="flex gap-1 flex-col p-2 card">
                {Array.from(Array(rows).keys()).map((seat, rowIndex) => {
                    return (
                        <div className="flex gap-1 justify-center" key={rowIndex}>
                            {Array.from(Array(columns).keys()).map((column, columnIndex) => {
                                const seatNumber = seat * columns + column + 1;
                                let seatClass = "seat";

                                const isSelected = selectedSeats.includes(seatNumber);
                                const isBooked = show.bookedSeats.includes(seatNumber);

                                console.log(`🪑 Seat ${seatNumber} → Selected: ${isSelected}, Booked: ${isBooked}`);

                                if (isSelected) {
                                    seatClass += " selected-seat";
                                }

                                if (isBooked) {
                                    seatClass += " booked-seat";
                                }

                                return (
                                    seatNumber <= totalSeats && (
                                        <div
                                            className={seatClass}
                                            onClick={() => {
                                                console.log("🖱 Seat clicked:", seatNumber);
                                                if (isSelected) {
                                                    setSelectedSeats(
                                                        selectedSeats.filter((item) => item !== seatNumber)
                                                    );
                                                } else {
                                                    setSelectedSeats([...selectedSeats, seatNumber]);
                                                }
                                            }}
                                            key={columnIndex}
                                        >
                                            <h1 className="text-sm">{seatNumber}</h1>
                                        </div>
                                    )
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    };

    const book = async (transactionId) => {
        try {
            dispatch(ShowLoading());
            const response = await BookShowTickets({
                show: params.id,
                seats: selectedSeats,
                transactionId,
                user: user._id,
            });

            // --- ADD DEBUG LOGS HERE ---
            console.log("Frontend Debug: Raw show API response:", response);
            if (response.success && response.data) {
                console.log("Frontend Debug: Booked seats in API response.data:", response.data.bookedSeats);
            }
            // --- END DEBUG LOGS ---

            if (response.success) {
                message.success(response.message);
                navigate("/profile");
            } else {
                message.error(response.message);
            }
            dispatch(HideLoading());
        } catch (error) {
            message.error(error.message);
            dispatch(HideLoading());
        }
    };

    const onToken = async (token) => {
        try {
            dispatch(ShowLoading());
            const response = await MakePayment(
                token,
                selectedSeats.length * show.ticketPrice * 100
            );
            if (response.success) {
                message.success(response.message);
                book(response.data);
            } else {
                message.error(response.message);
            }
            dispatch(HideLoading());
        } catch (error) {
            message.error(error.message);
            dispatch(HideLoading());
        }
        console.log(token);
    };

    useEffect(() => {
        getData();
    }, []);
    return (
        show && (
            <div>
                {/* show infomation */}

                <div className="flex justify-between card p-2 items-center">
                    <div>
                        <h1 className="text-sm">{show.theatre.name}</h1>
                        <h1 className="text-sm">{show.theatre.address}</h1>
                    </div>

                    <div>
                        <h1 className="text-2xl uppercase">
                            {show.movie.title} ({show.movie.language})
                        </h1>
                    </div>

                    <div>
                        <h1 className="text-sm">
                            {moment(show.date).format("MMM Do yyyy")} -{" "}
                            {moment(show.time, "HH:mm").format("hh:mm A")}
                        </h1>
                    </div>
                </div>

                {/* seats */}

                <div className="flex justify-center mt-2">{getSeats()}</div>

                {selectedSeats.length > 0 && (
                    <div className="mt-2 flex justify-center gap-2 items-center flex-col">
                        <div className="flex justify-center">
                            <div className="flex uppercase card p-2 gap-3">
                                <h1 className="text-sm"><b>Selected Seats</b> : {selectedSeats.join(" , ")}</h1>

                                <h1 className="text-sm">
                                    <b>Total Price</b> : {selectedSeats.length * show.ticketPrice}
                                </h1>
                            </div>
                        </div>
                        <StripeCheckout
                            currency="VNĐ"
                            token={onToken}
                            amount={selectedSeats.length * show.ticketPrice * 100}
                            billingAddress
                            stripeKey="pk_test_51RbInHAcSLpiPCGzhKR2l3S5fu66ZbyIcihcx7MeAmoyKy0sYajY9nkUGOtWwh4su4xlvmKUqkjRsVCIgyGNtY6F00MVEu9cif"
                        >
                            <Button title="Book Now" />
                        </StripeCheckout>
                    </div>
                )}
            </div>
        )
    );
}

export default BookShow;
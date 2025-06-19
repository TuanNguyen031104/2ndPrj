const router = require('express').Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');
console.log("Type of authMiddleware after require:", typeof authMiddleware);
console.log("Value of authMiddleware after require:", authMiddleware);

// đăng kí user
router.post('/register', async (req, res) => {
    try {
        const userExists = await User.findOne({ email: req.body.email });
        if (userExists) {
            return res.send({
                success: false,
                message: "User already exists",
            });
        }

        //hash pass
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;

        // lưu user
        const newUser = new User(req.body);
        await newUser.save();

        res.send({ success: true, message: "User created successfully " });

    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        });
    }
});

// đăng nhập user
router.post('/login', async (req, res) => {
    try {
        // kiểm tra user tồn tại không
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            // Add return here
            return res.send({
                success: false,
                message: "User doesn't exist",
            });
        }

        //kiểm tra pass
        // Make sure 'user' is defined before trying to access 'user.password'
        // If 'user' is null, the above 'if' block should handle it.
        const validPass = await bcrypt.compare(
            req.body.password,
            user.password
        );

        if (!validPass) {
            // Add return here
            return res.send({
                success: false,
                message: "Invalid password",
            });
        }

        //tạo token
        const token = jwt.sign({ userId: user._id }, process.env.jwt_secret, { expiresIn: "1d", });

        // This will only be reached if user exists and password is valid
        res.send({ success: true, message: "User logged in successfully", data: token });
    } catch (error) {
        // It's good practice to send a 500 status for server errors
        console.error("Error in /login route:", error.message);
        res.status(500).send({
            success: false,
            message: error.message,
        });
    }
});

// lấy chi tiết = id
router.get('/get-current-user', authMiddleware, async (req, res) => {
    try {
        // --- FIX THIS LINE ---
        const userId = req.userId; // Correct: Get userId directly from req
        // --- NO LONGER NEEDED: const user = await User.findById(req.body.userId).select('-password') ---
        console.log("req.userId from token:", req.userId);

        const user = await User.findById(userId).select('-password');

        if (!user) { // Add a check for user not found
            return res.status(404).send({ success: false, message: "User not found." });
        }

        res.send({
            success: true,
            message: "User details fetched successfully",
            data: user,
        });
    } catch (error) {
        console.error("Error in /get-current-user route:", error.message); // Add detailed logging
        res.status(500).send({ // Use 500 for internal server errors in the route handler
            success: false,
            message: error.message,
        });
    }
});


module.exports = router;
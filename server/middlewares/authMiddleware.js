// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    try {
        console.log("Middleware: authMiddleware entered.");
        console.log("Middleware: process.env.JWT_SECRET =", process.env.JWT_SECRET);
        console.log("Middleware: Authorization Header =", req.headers.authorization);

        if (!req.headers.authorization) {
            return res.status(401).send({ success: false, message: "No Authorization header provided." });
        }

        const token = req.headers.authorization.split(" ")[1];
        console.log("Middleware: Extracted Token:", token);
        if (!token) {
            return res.status(401).send({ success: false, message: "Token not found in Authorization header." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Middleware: Decoded Token Payload:", decoded);

        // --- ADD THIS CRITICAL LOG HERE ---
        req.userId = decoded.userId;
        console.log("Middleware (before next()): req.userId set to:", req.userId);
        // --- END ADDED LOG ---

        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        console.error("Middleware Auth Error Details:", error.message);
        res.status(401).send({ success: false, message: "Invalid token" });
    }
};
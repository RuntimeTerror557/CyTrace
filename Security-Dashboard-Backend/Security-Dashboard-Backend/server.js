const express = require("express");
const cors = require("cors");

const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Security Dashboard Backend is running"
    });
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "UP",
        service: "Security Dashboard Backend"
    });
});

// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
        path: req.originalUrl
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        success: false,
        error: "Internal server error"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Security Dashboard Backend running on http://localhost:${PORT}`);
});
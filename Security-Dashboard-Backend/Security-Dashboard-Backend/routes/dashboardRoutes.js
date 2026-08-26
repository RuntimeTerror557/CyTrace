const express = require("express");
const router = express.Router();

const dashboardData = require("../data/dashboardData");

// ==========================================
// 1. Dashboard Overview
// ==========================================
router.get("/overview", (req, res) => {
    res.json({
        success: true,
        data: dashboardData.overview
    });
});


// ==========================================
// 2. Threat Distribution
// ==========================================
router.get("/threats", (req, res) => {
    res.json({
        success: true,
        data: dashboardData.threats
    });
});


// ==========================================
// 3. Risk Trends
// Supports: ?days=3, ?days=7, etc.
// ==========================================
router.get("/trends", (req, res) => {

    const days = req.query.days !== undefined
        ? parseInt(req.query.days)
        : dashboardData.trends.length;

    // Validate days
    if (isNaN(days) || days <= 0) {
        return res.status(400).json({
            success: false,
            error: "Days must be a positive number"
        });
    }

    const trends = dashboardData.trends.slice(-days);

    res.json({
        success: true,
        daysRequested: days,
        data: trends
    });
});


// ==========================================
// 4. Recent Investigations
// Supports:
// ?risk=High
// ?status=Open
// ?risk=Critical&status=Open
// ==========================================
router.get("/recent", (req, res) => {

    const { risk, status } = req.query;

    let investigations = dashboardData.recentInvestigations;

    // Filter by risk
    if (risk) {
        investigations = investigations.filter(
            item => item.risk.toLowerCase() === risk.toLowerCase()
        );
    }

    // Filter by status
    if (status) {
        investigations = investigations.filter(
            item => item.status.toLowerCase() === status.toLowerCase()
        );
    }

    res.json({
        success: true,
        filters: {
            risk: risk || null,
            status: status || null
        },
        count: investigations.length,
        data: investigations
    });
});


// ==========================================
// 5. Incident Statistics
// ==========================================
router.get("/incidents", (req, res) => {
    res.json({
        success: true,
        data: dashboardData.incidents
    });
});


// ==========================================
// 6. Complete Dashboard Summary
// ==========================================
router.get("/summary", (req, res) => {
    res.json({
        success: true,
        data: {
            overview: dashboardData.overview,
            threats: dashboardData.threats,
            trends: dashboardData.trends,
            recentInvestigations: dashboardData.recentInvestigations,
            incidents: dashboardData.incidents
        }
    });
});


// ==========================================
// Export Router
// ==========================================
module.exports = router;
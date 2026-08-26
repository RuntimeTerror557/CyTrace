const dashboardData = {

    // ==========================================
    // Dashboard Overview
    // ==========================================
    overview: {
        totalEmails: 248,
        threatsDetected: 63,
        highRiskEmails: 21,
        openIncidents: 8
    },


    // ==========================================
    // Threat Distribution
    // ==========================================
    threats: {
        safe: 185,
        suspicious: 42,
        high: 15,
        critical: 6
    },


    // ==========================================
    // Threat / Risk Trends
    // ==========================================
    trends: [
        {
            date: "2026-08-20",
            threats: 5
        },
        {
            date: "2026-08-21",
            threats: 8
        },
        {
            date: "2026-08-22",
            threats: 4
        },
        {
            date: "2026-08-23",
            threats: 11
        },
        {
            date: "2026-08-24",
            threats: 7
        },
        {
            date: "2026-08-25",
            threats: 13
        },
        {
            date: "2026-08-26",
            threats: 15
        }
    ],


    // ==========================================
    // Recent Investigations
    // ==========================================
    recentInvestigations: [
        {
            id: 1,
            sender: "security-alert@example.com",
            subject: "Urgent Account Verification",
            risk: "High",
            status: "Investigating"
        },
        {
            id: 2,
            sender: "billing@example.net",
            subject: "Payment Failure Notice",
            risk: "Critical",
            status: "Open"
        },
        {
            id: 3,
            sender: "admin@example.org",
            subject: "Password Reset Request",
            risk: "Suspicious",
            status: "Investigating"
        },
        {
            id: 4,
            sender: "newsletter@example.com",
            subject: "Weekly Newsletter",
            risk: "Safe",
            status: "Resolved"
        }
    ],


    // ==========================================
    // Incident Statistics
    // ==========================================
    incidents: {
        open: 8,
        investigating: 5,
        resolved: 24,
        critical: 3
    }
};


module.exports = dashboardData;
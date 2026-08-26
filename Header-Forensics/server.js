const express = require('express');
const supabase = require('./config/supabase');

const { parseEmail } = require('./utils/emailParser');
const { analyzeAuthentication } = require('./utils/authAnalyzer');
const { analyzeHeaders } = require('./utils/headerAnalyzer');
const { analyzeUrls } = require('./utils/urlAnalyzer');
const { calculateRisk } = require('./utils/riskEngine');

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/', (req, res) => {
    res.json({
        message: 'Header Forensics API is running'
    });
});

// ==========================================
// MAIN ANALYSIS ENDPOINT
// ==========================================

app.post('/api/analyze', async (req, res) => {
    try {
        const { raw_email } = req.body;

        // 1. Validate input
        if (!raw_email) {
            return res.status(400).json({
                success: false,
                error: 'raw_email is required'
            });
        }

        // 2. Parse email
        const parsedEmail = await parseEmail(raw_email);

        // 3. Authentication analysis
        const authentication =
            analyzeAuthentication(parsedEmail);

        // 4. Header analysis
        const headerAnalysis =
            analyzeHeaders(parsedEmail);

        // 5. URL analysis
        const urlAnalysis =
            analyzeUrls(
                parsedEmail.html,
                parsedEmail.text
            );

        // 6. Combined risk analysis
        const risk =
            calculateRisk(
                authentication,
                headerAnalysis,
                urlAnalysis
            );

        // ==========================================
        // 7. SAVE EMAIL
        // ==========================================

        const { data: emailData, error: emailError } =
            await supabase
                .from('emails')
                .insert([
                    {
                        sender: parsedEmail.from,
                        recipient: parsedEmail.to,
                        subject: parsedEmail.subject,
                        raw_email: raw_email
                    }
                ])
                .select()
                .single();

        if (emailError) {
            console.error(
                'Email database error:',
                emailError
            );

            return res.status(500).json({
                success: false,
                error: 'Failed to save email',
                details: emailError.message
            });
        }

        // ==========================================
        // 8. SAVE ANALYSIS
        // ==========================================

        const { data: analysisData, error: analysisError } =
            await supabase
                .from('header_analysis')
                .insert([
                    {
                        email_id: emailData.id,

                        // Authentication
                        spf_result:
                            authentication.spf.result,

                        spf_reason:
                            authentication.spf.reason,

                        dkim_result:
                            authentication.dkim.result,

                        dkim_reason:
                            authentication.dkim.reason,

                        dmarc_result:
                            authentication.dmarc.result,

                        dmarc_reason:
                            authentication.dmarc.reason,

                        // Risk
                        risk_score:
                            risk.score,

                        risk_level:
                            risk.level,

                        risk_reasons:
                            risk.reasons,

                        // Domain
                        from_domain:
                            parsedEmail.from
                                ? parsedEmail.from.split('@')[1]
                                : null,

                        // Return path
                        return_path:
                            parsedEmail.returnPath,

                        // Sending IP
                        sending_ip: null,

                        // Complete forensic result
                        raw_result: {
                            parsedEmail,
                            authentication,
                            headerAnalysis,
                            urlAnalysis,
                            risk
                        }
                    }
                ])
                .select()
                .single();

        if (analysisError) {
            console.error(
                'Analysis database error:',
                analysisError
            );

            return res.status(500).json({
                success: false,
                error: 'Failed to save analysis',
                details: analysisError.message
            });
        }

        // ==========================================
        // 9. RETURN COMPLETE RESULT
        // ==========================================

        return res.json({
            success: true,

            message: 'Email analyzed successfully',

            email: emailData,

            authentication: authentication,

            headers: headerAnalysis,

            urls: urlAnalysis,

            risk: risk,

            database: {
                emailId: emailData.id,
                analysisId: analysisData.id
            }
        });

    } catch (error) {
        console.error(
            'Server error:',
            error
        );

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
    console.log(
        `🚀 Header Forensics server running on http://localhost:${PORT}`
    );
});
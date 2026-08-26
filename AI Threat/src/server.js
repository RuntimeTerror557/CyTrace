const express = require('express');
require('dotenv').config();
const { generateThreatScore } = require('./scoring_engine');
const { supabase } = require('./db');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get('/health', (req, res) => {
    res.json({ status: 'ok', module: 'module-4-ai' });
});

app.post('/api/v1/score', async (req, res) => {
    try {
        const features = req.body;

        if (!features || Object.keys(features).length === 0) {
            return res.status(400).json({ error: 'Request body must contain email features.' });
        }

        console.log("Received scoring request with features:", JSON.stringify(features));

        const result = await generateThreatScore(features);
        
        console.log("Generated threat score:", JSON.stringify(result));

        res.json(result);
    } catch (error) {
        console.error("Error in /api/v1/score:", error);
        res.status(500).json({ 
            error: 'Failed to generate threat score.',
            details: error.message 
        });
    }
});

app.post('/emails/:id/score', async (req, res) => {
    const emailId = req.params.id;

    try {
        console.log(`Fetching data for email ID: ${emailId}`);

        const { data: emailData, error: emailError } = await supabase
            .from('emails')
            .select('subject, body_text, from_addr')
            .eq('id', emailId)
            .single();
            
        if (emailError && emailError.code !== 'PGRST116') {
            console.error("Error fetching email:", emailError);
        }

        const { data: headerData, error: headerError } = await supabase
            .from('header_analysis')
            .select('*')
            .eq('investigation_id', emailId)
            .single();

        if (headerError && headerError.code !== 'PGRST116') {
            console.error("Error fetching header analysis:", headerError);
        }

        if (!emailData && !headerData) {
            return res.status(404).json({ error: `No email or header data found for ID ${emailId}` });
        }

        const features = {
            metadata: emailData || {},
            header_analysis: headerData || {}
        };

        console.log(`Generating AI threat score for email ${emailId}...`);
        const aiResult = await generateThreatScore(features);

        const { data: insertData, error: insertError } = await supabase
            .from('threat_scores')
            .upsert({
                investigation_id: emailId,
                score: aiResult.score,
                classification: aiResult.classification,
                reasons: JSON.stringify(aiResult.reasons),
                model_version: 'gemini-2.5-pro'
            }, { onConflict: 'investigation_id' })
            .select();

        if (insertError) {
            console.error("Error writing to threat_scores:", insertError);
            return res.status(500).json({ error: 'Failed to save threat score to database.', details: insertError.message });
        }

        res.json({
            message: 'Threat score generated and saved successfully.',
            result: aiResult,
            db_record: insertData
        });

    } catch (error) {
        console.error(`Error processing /emails/${emailId}/score:`, error);
        res.status(500).json({
            error: 'Failed to process email scoring.',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Module 4: AI Threat Detection service is running on port ${PORT}`);
});

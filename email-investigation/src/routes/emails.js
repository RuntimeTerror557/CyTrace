const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { simpleParser } = require('mailparser');
const supabase = require('../lib/supabaseClient');

const router = express.Router();

// Store uploaded file in memory (no disk writes needed for MVP)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB cap
});

/**
 * POST /api/emails
 * Accepts a raw .eml file upload, parses it, and stores structured
 * records in emails / attachments / links tables.
 */
router.post('/emails', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "file".' });
    }

    const rawBuffer = req.file.buffer;
    const parsed = await simpleParser(rawBuffer);

    // 1. Insert the email record
    const { data: email, error: emailError } = await supabase
      .from('emails')
      .insert({
        filename: req.file.originalname,
        raw_source: rawBuffer.toString('utf-8'),
        parsed_headers: parsed.headers ? Object.fromEntries(parsed.headers) : {},
        from_addr: parsed.from?.text || null,
        to_addr: parsed.to?.text || null,
        subject: parsed.subject || null,
        body_text: parsed.text || null,
        body_html: parsed.html || null,
        date_sent: parsed.date || null,
        status: 'parsed'
      })
      .select()
      .single();

    if (emailError) throw emailError;

    // 2. Insert attachments (with SHA256 / MD5 hashes)
    if (parsed.attachments && parsed.attachments.length > 0) {
      const attachmentRows = parsed.attachments.map((att) => ({
        email_id: email.id,
        filename: att.filename || 'unnamed',
        content_type: att.contentType || null,
        size_bytes: att.size || att.content?.length || 0,
        sha256: crypto.createHash('sha256').update(att.content).digest('hex'),
        md5: crypto.createHash('md5').update(att.content).digest('hex')
      }));

      const { error: attError } = await supabase.from('attachments').insert(attachmentRows);
      if (attError) throw attError;
    }

    // 3. Extract embedded links from HTML or plaintext body
    const source = parsed.html || parsed.text || '';
    const linkRegex = /https?:\/\/[^\s"'<>)]+/g;
    const foundLinks = [...new Set(source.match(linkRegex) || [])];

    if (foundLinks.length > 0) {
      const linkRows = foundLinks.map((url) => ({
        email_id: email.id,
        original_url: url,
        is_shortened: /bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly/i.test(url)
      }));

      const { error: linkError } = await supabase.from('links').insert(linkRows);
      if (linkError) throw linkError;
    }

    return res.status(201).json({
      email_id: email.id,
      subject: email.subject,
      from: email.from_addr,
      attachments_found: parsed.attachments?.length || 0,
      links_found: foundLinks.length,
      status: 'parsed'
    });
  } catch (err) {
    console.error('Error parsing email:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/emails/:id
 * Returns the full structured record for one investigated email.
 */
router.get('/emails/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: email, error: emailError } = await supabase
      .from('emails')
      .select('*')
      .eq('id', id)
      .single();

    if (emailError || !email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const { data: attachments } = await supabase
      .from('attachments')
      .select('*')
      .eq('email_id', id);

    const { data: links } = await supabase
      .from('links')
      .select('*')
      .eq('email_id', id);

    return res.json({ ...email, attachments: attachments || [], links: links || [] });
  } catch (err) {
    console.error('Error fetching email:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/emails
 * Lists all investigated emails (paginated, most recent first).
 */
router.get('/emails', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 25;
    const offset = parseInt(req.query.offset) || 0;

    const { data, error, count } = await supabase
      .from('emails')
      .select('id, filename, subject, from_addr, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return res.json({ total: count, limit, offset, emails: data });
  } catch (err) {
    console.error('Error listing emails:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

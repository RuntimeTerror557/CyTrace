const express = require('express');
const supabase = require('../lib/supabaseClient');

const router = express.Router();

const VALID_STATUSES = ['Open', 'In Progress', 'Contained', 'Resolved', 'Closed'];
const VALID_SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

/**
 * POST /api/incidents
 * Creates a new incident. Can be called automatically by the AI Threat
 * Detection module, or manually by an analyst.
 * Body: { email_id, threat_score_id, title, severity, summary }
 */
router.post('/incidents', async (req, res) => {
  try {
    const { email_id, threat_score_id, title, severity, summary } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const finalSeverity = VALID_SEVERITIES.includes(severity) ? severity : 'Medium';

    const { data: incident, error } = await supabase
      .from('incidents')
      .insert({
        email_id: email_id || null,
        threat_score_id: threat_score_id || null,
        title,
        severity: finalSeverity,
        summary: summary || null,
        status: 'Open'
      })
      .select()
      .single();

    if (error) throw error;

    // Log creation event to timeline
    await supabase.from('incident_timeline').insert({
      incident_id: incident.id,
      event_type: 'created',
      description: `Incident created with severity ${finalSeverity}`,
      actor: 'system'
    });

    return res.status(201).json(incident);
  } catch (err) {
    console.error('Error creating incident:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/incidents
 * Lists incidents, optionally filtered by status or severity.
 * Query params: ?status=Open&severity=Critical&limit=25&offset=0
 */
router.get('/incidents', async (req, res) => {
  try {
    const { status, severity } = req.query;
    const limit = parseInt(req.query.limit) || 25;
    const offset = parseInt(req.query.offset) || 0;

    let query = supabase
      .from('incidents')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (severity) query = query.eq('severity', severity);

    const { data, error, count } = await query;
    if (error) throw error;

    return res.json({ total: count, limit, offset, incidents: data });
  } catch (err) {
    console.error('Error listing incidents:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/incidents/:id
 * Returns a single incident with its full timeline and assignment history.
 */
router.get('/incidents/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: incident, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const { data: timeline } = await supabase
      .from('incident_timeline')
      .select('*')
      .eq('incident_id', id)
      .order('created_at', { ascending: true });

    const { data: assignments } = await supabase
      .from('incident_assignments')
      .select('*')
      .eq('incident_id', id)
      .order('assigned_at', { ascending: false });

    return res.json({ ...incident, timeline: timeline || [], assignments: assignments || [] });
  } catch (err) {
    console.error('Error fetching incident:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/incidents/:id/status
 * Updates the status of an incident (Open -> In Progress -> Resolved -> Closed).
 * Body: { status, actor, note }
 */
router.patch('/incidents/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actor, note } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const updates = { status, updated_at: new Date().toISOString() };
    if (status === 'Closed') {
      updates.closed_at = new Date().toISOString();
    }

    const { data: incident, error } = await supabase
      .from('incidents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    await supabase.from('incident_timeline').insert({
      incident_id: id,
      event_type: 'status_changed',
      description: note || `Status changed to ${status}`,
      actor: actor || 'analyst'
    });

    return res.json(incident);
  } catch (err) {
    console.error('Error updating incident status:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/incidents/:id/assign
 * Assigns (or reassigns) an incident to an analyst.
 * Body: { assigned_to, assigned_by }
 */
router.patch('/incidents/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, assigned_by } = req.body;

    if (!assigned_to) {
      return res.status(400).json({ error: 'assigned_to is required' });
    }

    const { data: incident, error } = await supabase
      .from('incidents')
      .update({ assigned_to, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    await supabase.from('incident_assignments').insert({
      incident_id: id,
      assigned_to,
      assigned_by: assigned_by || 'system'
    });

    await supabase.from('incident_timeline').insert({
      incident_id: id,
      event_type: 'assigned',
      description: `Assigned to ${assigned_to}`,
      actor: assigned_by || 'system'
    });

    return res.json(incident);
  } catch (err) {
    console.error('Error assigning incident:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/incidents/:id/notes
 * Adds an analyst note to the incident timeline (e.g. root cause, remediation).
 * Body: { note, actor }
 */
router.post('/incidents/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { note, actor } = req.body;

    if (!note) {
      return res.status(400).json({ error: 'note is required' });
    }

    const { data: incident } = await supabase
      .from('incidents')
      .select('id')
      .eq('id', id)
      .single();

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const { data: event, error } = await supabase
      .from('incident_timeline')
      .insert({
        incident_id: id,
        event_type: 'note_added',
        description: note,
        actor: actor || 'analyst'
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(event);
  } catch (err) {
    console.error('Error adding note:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

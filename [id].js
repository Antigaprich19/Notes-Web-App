import { getUserClient } from '../../lib/supabase.js';

const EDITABLE = ['title', 'content', 'color', 'tags', 'pinned', 'deleted_at'];

// PATCH  /api/notes/:id   -> update fields (also used for trash/restore via deleted_at)
// DELETE /api/notes/:id   -> delete forever
export default async function handler(req, res) {
  const supabase = await getUserClient(req, res);
  if (!supabase) return;
  const { id } = req.query;

  try {
    if (req.method === 'PATCH') {
      const updates = {};
      for (const key of EDITABLE) {
        if (req.body && key in req.body) updates[key] = req.body[key];
      }
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'PATCH, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

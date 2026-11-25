import { getUserClient } from '../../lib/supabase.js';

// GET  /api/notes?view=active|trash&q=search
// POST /api/notes
export default async function handler(req, res) {
  const supabase = await getUserClient(req, res);
  if (!supabase) return;

  try {
    if (req.method === 'GET') {
      const view = req.query.view === 'trash' ? 'trash' : 'active';
      // strip characters that would break PostgREST's or() filter syntax
      const q = String(req.query.q || '').replace(/[,()%*]/g, ' ').trim();

      let query = supabase
        .from('notes')
        .select('*')
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      query = view === 'trash'
        ? query.not('deleted_at', 'is', null)
        : query.is('deleted_at', null);

      if (q) query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { title = '', content = '', color = 'default', tags = [], pinned = false } = req.body || {};
      // user_id is filled in by the database default (auth.uid())
      const { data, error } = await supabase
        .from('notes')
        .insert({ title, content, color, tags, pinned })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

import { Pool } from 'pg';
import { attachDatabasePool } from '@neon/functions';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
attachDatabasePool(pool);
const handler = {
  async fetch(request: Request) {
    if (request.method !== 'POST' || !request.headers.get('x-neon-trigger-invocation-id')) {
      return new Response('Unauthorized', { status: 401 });
    }
    try {
      await pool.query('SELECT pondroot_impact.cleanup()');
      console.log('Impact cleanup completed');
      return Response.json({ ok: true });
    } catch {
      console.error('Impact cleanup failed');
      return Response.json({ ok: false }, { status: 503 });
    }
  },
};
export default handler;

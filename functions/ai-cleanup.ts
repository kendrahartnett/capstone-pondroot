import {Pool} from 'pg';
import {attachDatabasePool} from '@neon/functions';

// Neon supplies a branch-local DATABASE_URL. This function receives no résumé data.
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:1});
attachDatabasePool(pool);
const handler={
 async fetch(request:Request){
  if(request.method!=='POST'||!request.headers.get('x-neon-trigger-invocation-id'))return new Response('Unauthorized',{status:401});
  try{
   const result=await pool.query('SELECT pondroot_ai.cleanup() AS removed');
   console.log('AI metadata cleanup completed');
   return Response.json({ok:true,removed:Number(result.rows[0]?.removed??0)});
  }catch{
   console.error('AI metadata cleanup failed');
   return Response.json({ok:false},{status:503});
  }
 }
};
export default handler;

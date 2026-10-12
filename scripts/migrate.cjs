const {createClient}=require('@libsql/client');
const {drizzle}=require('drizzle-orm/libsql');
const {migrate}=require('drizzle-orm/libsql/migrator');
(async()=>{if(!process.env.TURSO_DATABASE_URL)throw Error('Missing TURSO_DATABASE_URL');const client=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});try{await migrate(drizzle(client),{migrationsFolder:'server/db/migrations'});console.log('Database migrations completed.');}finally{client.close();}})().catch(error=>{console.error(error.message);process.exitCode=1});

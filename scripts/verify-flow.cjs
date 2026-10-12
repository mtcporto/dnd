const assert=require('node:assert/strict');
const {createClient}=require('@libsql/client');const {drizzle}=require('drizzle-orm/libsql');const {betterAuth}=require('better-auth');const {drizzleAdapter}=require('@better-auth/drizzle-adapter');const {eq,inArray}=require('drizzle-orm');
const schema=require('../server/db/schema.ts');
const origin='http://localhost:3001',client=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN}),db=drizzle(client,{schema});
// This isolated test instance enables password signup only in-process. The app exposes Google only.
const testAuth=betterAuth({appName:'D&D Aventuras',baseURL:origin,secret:process.env.BETTER_AUTH_SECRET,database:drizzleAdapter(db,{provider:'sqlite'}),emailAndPassword:{enabled:true}});
const users=[];
async function identity(){const response=await testAuth.api.signUpEmail({body:{email:'verify-'+crypto.randomUUID()+'@example.test',name:'DND flow verification',password:crypto.randomUUID()},asResponse:true});assert.equal(response.status,200);const body=await response.json();users.push(body.user.id);const cookie=response.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');assert(cookie);return {id:body.user.id,cookie};}
(async()=>{try{
 const a=await identity(),b=await identity();
 assert.equal((await fetch(origin+'/api/personagens')).status,401);
 const input={name:'Personagem de verificação',classIndex:'fighter',speciesIndex:'dwarf',backgroundIndex:'soldier',attributes:{STR:15,DEX:14,CON:13,INT:8,WIS:12,CHA:10},bonusTwo:'STR',bonusOne:'CON',notes:'Teste temporário.',proficiencySelections:{'class-0':['skill-perception','skill-survival'],'background-0':['tool-dice']}};
 const write=await fetch(origin+'/api/personagens',{method:'POST',headers:{Cookie:a.cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(input)});assert.equal(write.status,201,await write.clone().text());const {id}=await write.json();
 const list=await fetch(origin+'/api/personagens',{headers:{Cookie:a.cookie}}).then(r=>r.json());const row=list.find(row=>row.id===id);assert(row);assert.equal(row.draft.hitPoints,13);assert.equal(row.draft.modifiers.STR,3);assert.equal(row.draft.training.passivePerception,13);assert.equal(row.draft.training.pending.length,0);assert.deepEqual(row.draft.input.proficiencySelections,input.proficiencySelections);
 const other=await fetch(origin+'/api/personagens',{headers:{Cookie:b.cookie}}).then(r=>r.json());assert(!other.some(row=>row.id===id));
 assert.equal((await fetch(origin+'/personagens/'+id,{headers:{Cookie:b.cookie}})).status,404);
 assert.equal((await fetch(origin+'/personagens/'+id,{headers:{Cookie:a.cookie}})).status,200);
 const forged=await fetch(origin+'/api/personagens',{method:'POST',headers:{Cookie:a.cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({...input,userId:b.id})});assert.equal(forged.status,400);
 const invalidTraining=await fetch(origin+'/api/personagens',{method:'POST',headers:{Cookie:a.cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({...input,proficiencySelections:{'class-0':['skill-arcana']}})});assert.equal(invalidTraining.status,400);
 const cross=await fetch(origin+'/api/personagens',{method:'POST',headers:{Cookie:a.cookie,Origin:'https://invalid.example','Content-Type':'application/json'},body:JSON.stringify(input)});assert.equal(cross.status,403);
 console.log('Verified signed sessions → character API → Turso → saved sheet, owner isolation, rejected injection and cross-origin writes.');
 }finally{if(users.length){for(const table of [schema.characters,schema.session,schema.account])await db.delete(table).where(inArray(table.userId,users));await db.delete(schema.user).where(inArray(schema.user.id,users));}client.close();}})().catch(error=>{console.error(error.message);process.exitCode=1});

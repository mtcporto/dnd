const fs=require('node:fs/promises');
const origin='https://www.dnd5eapi.co';
const cache=new Map();
function load(resource){
 if(resource.startsWith('/api/2024/'))resource=resource.slice('/api/2024/'.length);
 if(!/^[a-z0-9/-]+$/.test(resource))throw Error('Unsupported catalogue path');
 if(!cache.has(resource))cache.set(resource,(async()=>{for(let attempt=0;attempt<3;attempt++){
 const response=await fetch(origin+'/api/2024/'+resource,{signal:AbortSignal.timeout(20000)});
 if(response.ok){const value=await response.json();return {...value,desc:Array.isArray(value.desc)?value.desc:typeof value.description==='string'?[value.description]:[]};}if(attempt===2)throw Error('Import failed: '+resource);await new Promise(r=>setTimeout(r,500*(attempt+1)));
 }})());return cache.get(resource);
}
async function pool(entries,fn){let next=0;const result=[];await Promise.all(Array.from({length:4},async()=>{while(next<entries.length){const i=next++;result[i]=await fn(entries[i]);}}));return result;}
(async()=>{
 const [ci,si,bi,spells,skillIndex]=await Promise.all(['classes','species','backgrounds','spells','skills'].map(load));
 const classes=await pool(ci.results,async ref=>{const data=await load(ref.url),level=await load('classes/'+ref.index+'/levels/1');return {...data,levelOne:{...level,features:await pool(level.features,feature=>load(feature.url))}};});
 const species=await pool(si.results,async ref=>{const data=await load(ref.url);return {...data,traits:await pool(data.traits,trait=>load(trait.url))};});
 const backgrounds=await pool(bi.results,async ref=>{const data=await load(ref.url);return {...data,feat:await load(data.feat.url)};});
 const skills=await pool(skillIndex.results,skill=>load(skill.url));
 const result={edition:'2024',srdVersion:'5.2.1',importedAt:new Date().toISOString(),source:origin+'/api/2024',classes,species,backgrounds,spells:spells.results,skills};
 await fs.writeFile('data/catalogue.json.tmp',JSON.stringify(result,null,2));await fs.rename('data/catalogue.json.tmp','data/catalogue.json');console.log('Imported '+classes.length+' classes, '+species.length+' species, '+backgrounds.length+' backgrounds and '+spells.count+' spell references.');
})().catch(error=>{console.error(error.message);process.exitCode=1});

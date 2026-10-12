const test=require('node:test'),assert=require('node:assert/strict');
const {deriveDraft,draftInputSchema,modifier}=require('../domain/character.ts');
const catalogue=require('../data/catalogue.json');
const input={name:'Bruna',classIndex:'fighter',speciesIndex:'dwarf',backgroundIndex:'soldier',attributes:{STR:15,DEX:14,CON:13,INT:8,WIS:12,CHA:10},bonusTwo:'STR',bonusOne:'CON',notes:''};
test('2024 background bonuses use canonical attributes and dwarf hit points retain Dwarven Toughness',()=>{const draft=deriveDraft(input,catalogue);assert.equal(draft.attributes.STR,17);assert.equal(draft.attributes.CON,14);assert.equal(draft.modifiers.STR,3);assert.equal(draft.modifiers.CON,2);assert.equal(draft.hitPoints,13);assert.equal(draft.initiative,2);assert.equal(draft.unarmoredAC,12);assert.equal(draft.level,1);assert.equal(draft.status,'draft');assert.equal(draft.originFeat.index,'savage-attacker');assert(Object.values(draft.modifiers).every(Number.isFinite));});
test('standard array cannot be duplicated and background bonuses cannot target arbitrary abilities',()=>{assert.throws(()=>deriveDraft({...input,attributes:{...input.attributes,INT:15}},catalogue),/matriz/);assert.throws(()=>deriveDraft({...input,bonusOne:'INT'},catalogue),/antecedente/);assert.throws(()=>deriveDraft({...input,bonusOne:'STR'},catalogue),/diferentes/);});
test('draft input rejects old Portuguese attributes, nonfinite scores and owner/level injection',()=>{assert.equal(draftInputSchema.safeParse(input).success,true);for(const malformed of [{...input,userId:'someone-else'},{...input,level:20},{...input,attributes:{FOR:15,DES:14,CON:13,INT:8,SAB:12,CAR:10}},{...input,attributes:{...input.attributes,STR:NaN}}])assert.equal(draftInputSchema.safeParse(malformed).success,false);});
test('changing class or species produces finite combat previews without silently adding race ability bonuses',()=>{const draft=deriveDraft({...input,classIndex:'wizard',speciesIndex:'human'},catalogue);assert.equal(draft.hitPoints,8);assert.equal(draft.attributes.STR,17);assert.equal(modifier(9),-1);assert.equal(modifier(10),0);assert.equal(modifier(20),5);assert.throws(()=>deriveDraft({...input,classIndex:'unknown'},catalogue),/disponíveis/);});
test('snapshot includes actual 2024 backgrounds and species without mixing 2014 references',()=>{assert.equal(catalogue.edition,'2024');assert.equal(catalogue.classes.length,12);assert.equal(catalogue.species.length,9);assert.equal(catalogue.backgrounds.length,4);assert(catalogue.classes.every(entry=>entry.url.startsWith('/api/2024/')));assert(catalogue.backgrounds.every(entry=>entry.ability_scores.length===3));});
test('unarmored defenses use Constitution for barbarians and Wisdom for monks',()=>{assert.equal(deriveDraft({...input,classIndex:'barbarian'},catalogue).unarmoredAC,14);assert.equal(deriveDraft({...input,classIndex:'monk'},catalogue).unarmoredAC,13);});
test('2024 description fields are normalized for feature, trait and origin-feat rendering',()=>{assert(catalogue.classes.find(c=>c.index==='barbarian').levelOne.features.find(f=>f.index==='barbarian-unarmored-defense').desc.join(' ').includes('Dexterity'));assert(catalogue.species.find(s=>s.index==='dwarf').traits.some(t=>t.desc?.length));assert(catalogue.backgrounds.every(b=>b.feat.desc?.length));});

test('training combines class and background, with correct skill and saving-throw bonuses',()=>{
 const draft=deriveDraft({...input,proficiencySelections:{'class-0':['skill-perception','skill-survival'],'background-0':['tool-dice']}},catalogue);
 assert.equal(draft.training.skills.length,18);
 assert.equal(draft.training.skills.find(s=>s.index==='athletics').bonus,5);
 assert.equal(draft.training.skills.find(s=>s.index==='perception').bonus,3);
 assert.equal(draft.training.passivePerception,13);
 assert.deepEqual(draft.training.savingThrows.STR,{proficient:true,bonus:5});
 assert.deepEqual(draft.training.savingThrows.INT,{proficient:false,bonus:-1});
 assert.equal(draft.training.pending.length,0);
 assert(draft.pending.includes('Escolhas de idiomas'));
 assert(draft.pending.includes('Equipamento inicial e defesa'));
});
test('forged, duplicate, excessive and stale proficiency selections are rejected',()=>{
 for(const choices of [
  {'class-0':['skill-arcana']},
  {'class-0':['skill-perception','skill-perception']},
  {'class-0':['skill-perception','skill-survival','skill-insight']},
  {'class-0':['skill-athletics']},
  {'species-skillful':['skill-arcana']},
  {'class-0':['skill-perception'],'background-0':['tool-dice','tool-dragonchess']},
 ]) assert.throws(()=>deriveDraft({...input,proficiencySelections:choices},catalogue),/Escolha/);
});
test('human and elf skill choices normalize API skill references and reject overlaps',()=>{
 const human=deriveDraft({...input,speciesIndex:'human',proficiencySelections:{'species-skillful':['skill-arcana']}},catalogue);
 assert.equal(human.training.skills.find(s=>s.index==='arcana').proficient,true);
 assert.throws(()=>deriveDraft({...input,speciesIndex:'human',proficiencySelections:{'class-0':['skill-perception'],'species-skillful':['skill-perception']}},catalogue),/Escolha/);
 const elf=deriveDraft({...input,speciesIndex:'elf',proficiencySelections:{'species-keen-senses':['skill-insight']}},catalogue);
 assert.equal(elf.training.skills.find(s=>s.index==='insight').proficient,true);
 assert.throws(()=>deriveDraft({...input,speciesIndex:'elf',proficiencySelections:{'species-keen-senses':['skill-arcana']}},catalogue),/Escolha/);
});
test('bard instruments and monk nested tool alternatives are valid independent choices',()=>{
 const bard=deriveDraft({...input,classIndex:'bard',proficiencySelections:{'class-0':['skill-arcana','skill-history','skill-perception'],'class-1':['lute','flute','drum']}},catalogue);
 assert(bard.training.proficiencies.some(p=>p.index==='lute'));
 const monk=deriveDraft({...input,classIndex:'monk',proficiencySelections:{'class-1':['alchemists-supplies']}},catalogue);
 assert(monk.training.proficiencies.some(p=>p.index==='alchemists-supplies'));
});
test('Alert origin feat adds proficiency to initiative without altering Dexterity',()=>{
 const draft=deriveDraft({...input,backgroundIndex:'criminal',bonusTwo:'DEX',bonusOne:'CON'},catalogue);
 assert.equal(draft.modifiers.DEX,3);assert.equal(draft.initiative,5);
});
test('old drafts remain compatible and missing choices are explicit instead of automatic',()=>{
 const parsed=draftInputSchema.parse(input);assert.deepEqual(parsed.proficiencySelections,{});
 const draft=deriveDraft(parsed,catalogue);assert.equal(draft.training.pending.length,2);
 for(const c of catalogue.classes){const d=deriveDraft({...parsed,classIndex:c.index},catalogue);assert(d.training.skills.every(s=>Number.isFinite(s.bonus)));}
});

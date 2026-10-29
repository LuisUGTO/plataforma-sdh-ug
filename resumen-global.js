(function(root){
'use strict';
const KEY='GLOBAL',EXPECTED=107;
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const get=(r,k)=>r[k]??r[norm(k)];
const count=v=>v!==null&&v!==undefined&&typeof v!=='boolean'&&String(v).trim()!==''&&Number.isSafeInteger(Number(v))&&Number(v)>=0?Number(v):null;
// Only census counts are additive. Averages, percentages and categorical grades are excluded.
const fields=('POBTOT POBMAS POBFEM P_3YMAS P_5YMAS P_12YMAS P_12YMAS_F P_15YMAS P_15YMAS_M P_15YMAS_F P_18YMAS P_18YMAS_M P_18YMAS_F P_60YMAS P_60YMAS_M P_60YMAS_F '+
 'TVIVPAR TVIVPARHAB OCUPVIVPAR VIVPARH_CV VIVPAR_UT VPH_C_ELEC VPH_AGUADV VPH_DRENAJ VPH_EXCSA VPH_TINACO VPH_CISTER VPH_REFRI VPH_LAVAD VPH_AUTOM VPH_MOTO VPH_BICI VPH_HMICRO VPH_PC VPH_INTER VPH_TELEF VPH_CEL VPH_TV VPH_STVP VPH_RADIO '+
 'P3YM_HLI P3HLI_HE P3HLINHE PHOG_IND POB_AFRO P12YM_SOLT P12YM_CASA P12YM_SEPA PRESOE15 PNACOE PCATOLICA PRO_CRIEVA POTRAS_REL PSIN_RELIG '+
 'PCON_DISC PCON_LIMI PCLIM_PMEN PCDISC_MOT PCDISC_VIS PCDISC_LENG PCDISC_AUD PCDISC_MOT2 PCDISC_MEN PDER_SS PSINDER PDER_IMSS PDER_ISTE PDER_ISTEE PAFIL_PDOM PDER_IMSSB PDER_SEGP PAFIL_IPRIV PAFIL_OTRAI '+
 'PEA PE_INAC POCUPADA PDESOCUP PEA_F PEA_M POCUPADA_F POCUPADA_M P15YM_AN P15YM_SE P15PRI_CO P15SEC_CO P18YM_PB P_3A5 P3A5_NOA P_6A11 P6A11_NOA P_12A14 P12A14NOA P_15A17 P15A17A P_18A24 P18A24A').split(/\s+/);
function build(records,iter){
 if(!Array.isArray(records)||records.length!==EXPECTED)throw Error('El resumen global requiere las 107 comunidades del catálogo.');
 const seen=new Set(),sources=records.map(record=>{
  const key=String(get(record,'Clave INEGI')??'');
  if(!/^11\d{7}$/.test(key)||seen.has(key))throw Error('El resumen global requiere claves INEGI válidas y únicas.');
  seen.add(key);
  const join=key+'|'+get(record,'Comunidad / Localidad'),raw=iter[join];
  if(!raw)throw Error('Falta el insumo censal de '+join+'.');
  const population=[count(raw.POBTOT),count(raw.POBMAS),count(raw.POBFEM)];
  if(population.some(v=>v===null)||population[1]+population[2]!==population[0])throw Error('La población por sexo requiere revisión en '+join+'.');
  return {record,key,raw};
 });
 const coverage={},raw={};
 for(const field of fields){
  const values=sources.map(s=>count(s.raw[field]));coverage[field]=values.filter(v=>v!==null).length;
  raw[field]=coverage[field]===EXPECTED?values.reduce((a,b)=>a+b,0):null;
 }
 for(const field of ['POBTOT','POBMAS','POBFEM'])if(raw[field]===null)throw Error('Faltan conteos completos de '+field+' para el conjunto.');
 if(raw.POBMAS+raw.POBFEM!==raw.POBTOT)throw Error('Los totales globales por sexo requieren revisión.');
 raw.REL_H_M=raw.POBFEM>0?raw.POBMAS/raw.POBFEM*100:null;
 const municipalities=new Set(sources.map(s=>s.key.slice(0,5)));
 const high=label=>sources.filter(s=>['alto','muy alto'].includes(norm(get(s.record,label)))).length;
 const classificationCoverage=label=>sources.every(s=>['muy bajo','bajo','medio','alto','muy alto'].includes(norm(get(s.record,label))));
 // Only the pyramid excludes San Agustín; every other aggregate still uses 107 localities.
 const ageSources=sources.filter(s=>s.key!=='110090001'),ageCoverage={};
 const ageSum=field=>{const values=ageSources.map(s=>count(s.raw[field]));ageCoverage[field]=values.filter(v=>v!==null).length;return ageCoverage[field]===ageSources.length?values.reduce((a,b)=>a+b,0):null;};
 const ageBins=Array.from({length:18},(_,i)=>{const desde=i*5,hasta=i===17?null:desde+4,stem='P_'+desde+(hasta===null?'YMAS':'A'+hasta);return {desde,hasta,hombres:ageSum(stem+'_M'),mujeres:ageSum(stem+'_F')};});
 const agePopulation=field=>ageSources.reduce((sum,s)=>sum+count(s.raw[field]),0);
 const universe={communityCount:ageSources.length,total:agePopulation('POBTOT'),men:agePopulation('POBMAS'),women:agePopulation('POBFEM'),sourceKeys:ageSources.map(s=>s.key),excludedKeys:['110090001'],fieldCoverage:ageCoverage};
 universe.completeFields=ageBins.every(b=>b.hombres!==null&&b.mujeres!==null);
 universe.ageCounts=universe.completeFields?{men:ageBins.reduce((sum,b)=>sum+b.hombres,0),women:ageBins.reduce((sum,b)=>sum+b.mujeres,0)}:null;
 universe.populationGap=universe.ageCounts?universe.total-universe.ageCounts.men-universe.ageCounts.women:null;
 universe.differencesByLocality=ageSources.flatMap(s=>{const sums={};for(const [sex,suffix,pop]of [['men','M','POBMAS'],['women','F','POBFEM']]){const values=ageBins.map(b=>count(s.raw['P_'+b.desde+(b.hasta===null?'YMAS':'A'+b.hasta)+'_'+suffix]));sums[sex]=values.every(v=>v!==null)?count(s.raw[pop])-values.reduce((a,b)=>a+b,0):null;}return sums.men||sums.women||sums.men===null||sums.women===null?[{key:s.key,...sums}]:[];});
 const validAges=universe.completeFields&&universe.populationGap>=0&&universe.differencesByLocality.every(s=>s.men!==null&&s.women!==null&&s.men>=0&&s.women>=0);
 const ages=validAges?ageBins:[];
 universe.gapExplained=validAges;
 const religionFields=['PCATOLICA','PRO_CRIEVA','POTRAS_REL','PSIN_RELIG'];
 const validReligion=sources.every(s=>{const values=religionFields.map(f=>count(s.raw[f])),total=count(s.raw.POBTOT);return total!==null&&values.every(v=>v!==null)&&values.reduce((a,b)=>a+b,0)<=total;});
 const difference=(total,...parts)=>[total,...parts].every(v=>v!==null)?total-parts.reduce((a,b)=>a+b,0):null;
 const gaps={activity:difference(raw.P_12YMAS,raw.PEA,raw.PE_INAC),occupation:difference(raw.PEA,raw.POCUPADA,raw.PDESOCUP)};
 const validLanguage=sources.every(s=>{const values=['P3YM_HLI','P3HLI_HE','P3HLINHE'].map(f=>count(s.raw[f]));return values.every(v=>v!==null)&&values[1]+values[2]<=values[0];});
 const pyramidNote='Nota: La pirámide incluye '+ageSources.length+' localidades ('+universe.total.toLocaleString('es-MX')+' habitantes); excluye a San Agustín por no contar con grupos quinquenales comparables. '+(validAges&&universe.populationGap?'El desglose por edad difiere en '+universe.populationGap+' personas del total. ':'')+'Los demás indicadores incluyen las 107 localidades.';
 const extra={global:true,gruposAmplios:false,parcial:!validAges||universe.populationGap>0,edades:ages,pyramidUniverse:universe,communityCount:EXPECTED,municipalityCount:municipalities.size,
  highMarginalization:classificationCoverage('Grado Marginación (CONAPO)')?high('Grado Marginación (CONAPO)'):null,
  highSocialLag:classificationCoverage('Grado Rezago Social (CONEVAL)')?high('Grado Rezago Social (CONEVAL)'):null,
  communitiesWithSpeakers:coverage.P3YM_HLI===EXPECTED?sources.filter(s=>count(s.raw.P3YM_HLI)>0).length:null,
  religionResidual:validReligion?raw.POBTOT-religionFields.reduce((a,f)=>a+raw[f],0):null,
  languageResidual:validLanguage?raw.P3YM_HLI-raw.P3HLI_HE-raw.P3HLINHE:null,
  coverage,gaps,sourceKeys:[...seen],
  fuenteEdades:'Conteos censales quinquenales de 106 localidades, de 0–4 a 85+. San Agustín (110090001) se excluye solo de la pirámide; no se estima ni reparte su población por edad.',
  criteriosCarlos:{notaComposicion:pyramidNote,
   notaActividad:gaps.activity?'Nota: El total y el desglose de actividad difieren en '+gaps.activity.toLocaleString('es-MX')+' personas.':'',
   notaOcupacion:gaps.occupation?'Nota: El total de la PEA y su desglose ocupacional difieren en '+gaps.occupation.toLocaleString('es-MX')+' personas.':''}
 };
 return {record:{'Clave INEGI':KEY,'Comunidad / Localidad':'107 comunidades','Municipio':'Guanajuato'},raw,extra,
  history:'Introducción general pendiente de entrega.',
  identification:'Guanajuato · Propuesta de conjunto · '+EXPECTED+' comunidades · '+municipalities.size+' municipios'};
}
const api={KEY,build,fields:Object.freeze(fields)};
root.SDH_GLOBAL=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

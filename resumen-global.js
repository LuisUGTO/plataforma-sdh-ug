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
 const ageFields=['P_15YMAS_M','P_15YMAS_F','P_18YMAS_M','P_18YMAS_F','P_60YMAS_M','P_60YMAS_F'];
 const validAges=sources.every(s=>['M','F'].every(sex=>{const a=count(s.raw[sex==='M'?'POBMAS':'POBFEM']),b=count(s.raw['P_15YMAS_'+sex]),c=count(s.raw['P_18YMAS_'+sex]),d=count(s.raw['P_60YMAS_'+sex]);return [a,b,c,d].every(v=>v!==null)&&a>=b&&b>=c&&c>=d;}));
 const ages=validAges&&ageFields.every(f=>raw[f]!==null)?[
  {desde:0,hasta:14,hombres:raw.POBMAS-raw.P_15YMAS_M,mujeres:raw.POBFEM-raw.P_15YMAS_F},
  {desde:15,hasta:17,hombres:raw.P_15YMAS_M-raw.P_18YMAS_M,mujeres:raw.P_15YMAS_F-raw.P_18YMAS_F},
  {desde:18,hasta:59,hombres:raw.P_18YMAS_M-raw.P_60YMAS_M,mujeres:raw.P_18YMAS_F-raw.P_60YMAS_F},
  {desde:60,hasta:null,hombres:raw.P_60YMAS_M,mujeres:raw.P_60YMAS_F}
 ]:[];
 const religionFields=['PCATOLICA','PRO_CRIEVA','POTRAS_REL','PSIN_RELIG'];
 const validReligion=sources.every(s=>{const values=religionFields.map(f=>count(s.raw[f])),total=count(s.raw.POBTOT);return total!==null&&values.every(v=>v!==null)&&values.reduce((a,b)=>a+b,0)<=total;});
 const difference=(total,...parts)=>[total,...parts].every(v=>v!==null)?total-parts.reduce((a,b)=>a+b,0):null;
 const gaps={activity:difference(raw.P_12YMAS,raw.PEA,raw.PE_INAC),occupation:difference(raw.PEA,raw.POCUPADA,raw.PDESOCUP)};
 const validLanguage=sources.every(s=>{const values=['P3YM_HLI','P3HLI_HE','P3HLINHE'].map(f=>count(s.raw[f]));return values.every(v=>v!==null)&&values[1]+values[2]<=values[0];});
 const ageTotals=[difference(raw.POBTOT,raw.P_15YMAS),difference(raw.P_15YMAS,raw.P_18YMAS),difference(raw.P_18YMAS,raw.P_60YMAS),raw.P_60YMAS];
 const extra={global:true,gruposAmplios:true,parcial:!validAges,edades:ages,communityCount:EXPECTED,municipalityCount:municipalities.size,
  highMarginalization:classificationCoverage('Grado Marginación (CONAPO)')?high('Grado Marginación (CONAPO)'):null,
  highSocialLag:classificationCoverage('Grado Rezago Social (CONEVAL)')?high('Grado Rezago Social (CONEVAL)'):null,
  communitiesWithSpeakers:coverage.P3YM_HLI===EXPECTED?sources.filter(s=>count(s.raw.P3YM_HLI)>0).length:null,
  religionResidual:validReligion?raw.POBTOT-religionFields.reduce((a,f)=>a+raw[f],0):null,
  languageResidual:validLanguage?raw.P3YM_HLI-raw.P3HLI_HE-raw.P3HLINHE:null,
  ageDifferences:ages.map((b,i)=>({desde:b.desde,hasta:b.hasta,totalDeclarado:ageTotals[i],sumaPorSexo:b.hombres+b.mujeres})).filter(b=>b.totalDeclarado!==null&&b.totalDeclarado!==b.sumaPorSexo),
  coverage,gaps,sourceKeys:[...seen],
  fuenteEdades:'Suma de conteos censales por sexo; grupos 0–14, 15–17, 18–59 y 60+. No se estima una mediana.',
  criteriosCarlos:{notaComposicion:'Nota: Se reúne toda la población de las 107 localidades, no solo la indígena. Los desgloses por edad y sexo conservan las diferencias del insumo de San Agustín.',
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

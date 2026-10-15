(function(root){
'use strict';
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const number=v=>v!==null&&v!==undefined&&String(v).trim()!==''&&!String(v).includes('*')&&Number.isFinite(Number(v))?Number(v):null;
const ratio=(a,b)=>{a=number(a);b=number(b);return a!==null&&b>0&&a>=0&&a<=b?a/b:null;};
const sum=(...v)=>v.every(x=>number(x)!==null)?v.reduce((s,x)=>s+number(x),0):null;
const complement=(total,absent)=>number(total)!==null&&number(absent)!==null?ratio(number(total)-number(absent),total):null;
const format=(v,d=0)=>number(v)===null?'Dato no disponible':number(v).toLocaleString('es-MX',{minimumFractionDigits:d,maximumFractionDigits:d});
const percent=v=>number(v)===null?'Dato no disponible':(v*100).toFixed(1)+'%';
function median(extra,total){
 const bins=extra?.edades;if(!bins?.length||extra.parcial||!(number(total)>0))return null;
 let count=0,expected=0;
 for(const b of bins){if(b.desde!==expected||!Number.isInteger(b.hombres)||b.hombres<0||!Number.isInteger(b.mujeres)||b.mujeres<0||(b.hasta!==null&&b.hasta-b.desde!==4))return null;count+=b.hombres+b.mujeres;expected=b.hasta===null?Infinity:b.hasta+1;}
 if(count!==number(total)||bins.at(-1).hasta!==null)return null;
 let previous=0;for(const b of bins){const n=b.hombres+b.mujeres;if(previous+n>=total/2){return b.hasta===null||!n?null:b.desde+(total/2-previous)/n*(b.hasta-b.desde+1);}previous+=n;}return null;
}
const ordered=items=>items.map((a,i)=>({a,i})).sort((a,b)=>((number(b.a[1])??-1)-(number(a.a[1])??-1))||a.i-b.i).map(x=>x.a);
function build(record={},raw={},extra=null){
 const get=k=>record[norm(k)]??record[k],total=raw.POBTOT??get('Población Total'),housing=raw.VIVPARH_CV;
 const official=number(get('Edad mediana')),bins=extra?.edades,sexConsistent=!bins||((number(raw.POBMAS??get('Población Hombres'))===null||bins.reduce((a,b)=>a+(number(b.hombres)??0),0)===number(raw.POBMAS??get('Población Hombres')))&&(number(raw.POBFEM??get('Población Mujeres'))===null||bins.reduce((a,b)=>a+(number(b.mujeres)??0),0)===number(raw.POBFEM??get('Población Mujeres')))),estimated=sexConsistent?median(extra,total):null,age=official??estimated;
 const model={total,men:raw.POBMAS??get('Población Hombres'),women:raw.POBFEM??get('Población Mujeres'),age,ageEstimated:official===null&&estimated!==null,relation:raw.REL_H_M??get('Relación Hombres-Mujeres')};
 model.housing=[['Total de viviendas particulares habitadas',format(raw.TVIVPARHAB),true],['Población en viviendas particulares habitadas',format(raw.OCUPVIVPAR),true],['Promedio de ocupantes por vivienda',format(raw.PROM_OCUP??get('Promedio Ocupantes por Vivienda'),2)],['Promedio de ocupantes por cuarto',format(raw.PRO_OCUP_C??get('Promedio Ocupantes por Cuarto'),2)]];
 const group=(title,items)=>[title,ordered(items.map(([label,field])=>[label,ratio(raw[field],housing)]))];
 model.housingGroups=[group('Disponibilidad de servicios y equipamiento',[['Electricidad','VPH_C_ELEC'],['Agua entubada','VPH_AGUADV'],['Drenaje','VPH_DRENAJ'],['Servicio sanitario','VPH_EXCSA'],['Tinaco','VPH_TINACO'],['Cisterna o aljibe','VPH_CISTER']]),group('Disponibilidad de bienes',[['Refrigerador','VPH_REFRI'],['Lavadora','VPH_LAVAD'],['Automóvil','VPH_AUTOM'],['Motocicleta','VPH_MOTO'],['Bicicleta','VPH_BICI'],['Horno de microondas','VPH_HMICRO']]),group('Disponibilidad de tecnologías de información',[['Computadora','VPH_PC'],['Internet','VPH_INTER'],['Línea telefónica fija','VPH_TELEF'],['Teléfono celular','VPH_CEL'],['Televisor','VPH_TV'],['Televisión de paga','VPH_STVP'],['Radio','VPH_RADIO']])];
 model.ethnicity=[['Pueblo indígena por autoadscripción',get('Pueblo Originario')||'Dato no disponible'],['Población de 3 años y más que habla alguna lengua indígena',percent(ratio(raw.P3YM_HLI,raw.P_3YMAS))],['Población en hogares censales indígenas',percent(ratio(raw.PHOG_IND,total))],['Población que se considera afromexicana o afrodescendiente',percent(ratio(raw.POB_AFRO,total))]];
 const languageTotal=number(raw.P3YM_HLI),languageItems=[['Habla español',number(raw.P3HLI_HE)],['No habla español',number(raw.P3HLINHE)]],complete=languageItems.every(a=>a[1]!==null&&a[1]>=0)&&languageTotal!==null&&languageItems.reduce((a,b)=>a+b[1],0)===languageTotal;
 model.language={total:languageTotal,items:languageItems,status:complete&&languageTotal>0?'ready':complete&&languageTotal===0?'empty':'pending'};
 model.fertility=['Promedio de hijos o hijas nacidas vivas de mujeres de 12 años y más',format(raw.PROM_HNV??get('Promedio Hijas(os) Nacidas(os) Vivas(os)'),2)];
 model.marital=[['Soltera',raw.P12YM_SOLT],['Casada o unida',raw.P12YM_CASA],['Separada, divorciada o viuda',raw.P12YM_SEPA]];
 model.social=[['Grado de marginación',get('Grado Marginación (CONAPO)')||'Dato no disponible'],['Grado de rezago social',get('Grado Rezago Social (CONEVAL)')||'Dato no disponible']];
 model.migration=[['Población de 5 años y más residente en otra entidad en marzo de 2015',percent(ratio(raw.PRESOE15,raw.P_5YMAS))],['Población nacida en otra entidad',percent(ratio(raw.PNACOE,total))]];
 model.religion=ordered([['Católica',ratio(raw.PCATOLICA,total)],['Protestante/Cristiano evangélica',ratio(raw.PRO_CRIEVA,total)],['Otras religiones',ratio(raw.POTRAS_REL,total)],['Sin religión o sin adscripción religiosa',ratio(raw.PSIN_RELIG,total)]]);
 model.disability=[['Población con discapacidad',percent(ratio(raw.PCON_DISC,total))],['Población con limitación',percent(ratio(raw.PCON_LIMI,total))],['Población con algún problema o condición mental',percent(ratio(raw.PCLIM_PMEN,total))]];
 model.disabilityActivities=[['Caminar, subir o bajar','PCDISC_MOT'],['Ver (aun usando lentes)','PCDISC_VIS'],['Hablar o comunicarse','PCDISC_LENG'],['Oír (aun usando aparato auditivo)','PCDISC_AUD'],['Vestirse, bañarse o comer','PCDISC_MOT2'],['Recordar o concentrarse','PCDISC_MEN']].map(([label,key])=>[label,ratio(raw[key],raw.PCON_DISC)]);
 model.health=[['Población afiliada',percent(ratio(raw.PDER_SS,total)),'(incluye afiliaciones múltiples)'],['Población no afiliada',percent(ratio(raw.PSINDER,total))]];
 model.institutions=[['IMSS',ratio(raw.PDER_IMSS,raw.PDER_SS)],['ISSSTE o|ISSSTE estatal',ratio(sum(raw.PDER_ISTE,raw.PDER_ISTEE),raw.PDER_SS)],['PEMEX,|la Defensa|o la Marina',ratio(raw.PAFIL_PDOM,raw.PDER_SS)],['IMSS|Bienestar',ratio(raw.PDER_IMSSB,raw.PDER_SS)],['Centro|de salud',ratio(raw.PDER_SEGP,raw.PDER_SS)],['Seguro|privado',ratio(raw.PAFIL_IPRIV,raw.PDER_SS)],['Otra|institución',ratio(raw.PAFIL_OTRAI,raw.PDER_SS)]];
 model.economy=[['Población de 12 años y más económicamente activa (PEA)',percent(ratio(raw.PEA,raw.P_12YMAS))],['Porcentaje de la PEA ocupada',percent(ratio(raw.POCUPADA,raw.PEA))],['Población de 12 años y más no económicamente activa (PNEA)',percent(ratio(raw.PE_INAC,raw.P_12YMAS))],['Porcentaje de la PEA desocupada',percent(ratio(raw.PDESOCUP,raw.PEA))]];
 model.sexPEA=[['Mujeres',ratio(raw.PEA_F,raw.PEA)],['Hombres',ratio(raw.PEA_M,raw.PEA)]];
 model.sexOccupied=[['Mujeres',ratio(raw.POCUPADA_F,raw.POCUPADA)],['Hombres',ratio(raw.POCUPADA_M,raw.POCUPADA)]];
 model.education=[['Grado promedio de escolaridad de la población de 15 años y más',format(raw.GRAPROES??get('Grado Promedio Escolaridad (15+)'),2)],['Población de 15 años y más analfabeta',percent(ratio(raw.P15YM_AN,raw.P_15YMAS))]];
 model.schooling=[['Sin escolaridad|(15+)',ratio(raw.P15YM_SE,raw.P_15YMAS)],['Primaria|completa (15+)',ratio(raw.P15PRI_CO,raw.P_15YMAS)],['Secundaria|completa (15+)',ratio(raw.P15SEC_CO,raw.P_15YMAS)],['Posbásica|(18+)',ratio(raw.P18YM_PB,raw.P_18YMAS)]];
 model.attendance=[['3 a 5|años',complement(raw.P_3A5,raw.P3A5_NOA)],['6 a 11|años',complement(raw.P_6A11,raw.P6A11_NOA)],['12 a 14|años',complement(raw.P_12A14,raw.P12A14NOA)],['15 a 17|años',ratio(raw.P15A17A,raw.P_15A17)],['18 a 24|años',ratio(raw.P18A24A,raw.P_18A24)]];
 return model;
}
root.SDH_INDICADORES={build,number,ratio,format,percent,median,ordered};if(typeof module!=='undefined')module.exports=root.SDH_INDICADORES;
})(typeof window!=='undefined'?window:globalThis);

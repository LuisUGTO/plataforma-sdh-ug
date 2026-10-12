# Definiciones para registrar en Fichas técnicas

Actualización: 11 de octubre de 2026. Fuente de los conteos: INEGI, Censo de Población y Vivienda 2020, Principales resultados por localidad (ITER). Cobertura: localidad; referencia temporal: 2020; estudio: censal. Los ejemplos corresponden exclusivamente a Alonso Yáñez, clave 110030008.

Estos registros se prepararon para incorporarlos a la matriz. Este paquete no modifica Google Sheets. La matriz conserva su ficha de edad mediana; no es necesario duplicarla.

## Viviendas: aclaración para Carlos

**El indicador solicitado es Total de viviendas particulares habitadas.** Se utiliza `TVIVPARHAB`, no `TVIVPAR`, porque el segundo incluye viviendas deshabitadas y de uso temporal.

| Indicador | Variable | Valor de Alonso Yáñez | Unidad |
|---|---|---:|---|
| Total de viviendas particulares | TVIVPAR | 225 | Viviendas |
| Total de viviendas particulares habitadas | TVIVPARHAB | **195** | Viviendas |
| Viviendas particulares deshabitadas | VIVPAR_DES | 20 | Viviendas |
| Viviendas particulares de uso temporal | VIVPAR_UT | 10 | Viviendas |
| Población en viviendas particulares habitadas | OCUPVIVPAR | 904 | Personas |

En esta localidad se cumple 225 = 195 + 20 + 10. La corrección del código respecto a la observación del profesor fue acordada con Luis. No se interpreta TVIVPAR como viviendas habitadas. Los indicadores de características de la vivienda usan `VIVPARH_CV` como denominador, que aquí también es 195; esa coincidencia no debe generalizarse a otras localidades.

## Fórmulas de los indicadores nuevos o reorganizados

Cada cociente se multiplica por 100 para expresarlo en porcentaje. El generador muestra una cifra decimal. Los cálculos usan los conteos originales sin redondearlos previamente.

| Dimensión e indicador | Algoritmo | Universo / aclaración |
|---|---|---|
| Servicios, equipamiento, bienes y tecnologías | Variable VPH correspondiente / VIVPARH_CV × 100 | Viviendas particulares habitadas con características captadas. Variables de tecnologías: VPH_PC, VPH_INTER, VPH_TELEF, VPH_CEL, VPH_TV, VPH_STVP, VPH_RADIO. Microondas: VPH_HMICRO. |
| Lengua indígena, 3 años y más | P3YM_HLI / P_3YMAS × 100 | Población de 3 años y más. |
| Hablantes de lengua indígena que hablan español | P3HLI_HE / P3YM_HLI × 100 | Hablantes de lengua indígena de 3 años y más. Aquí 1/1 = 100.0%; no es el 100% de la comunidad. |
| Hablantes de lengua indígena que no hablan español | P3HLINHE / P3YM_HLI × 100 | Mismo universo de hablantes; aquí 0/1 = 0.0%. |
| Población en hogares censales indígenas | PHOG_IND / POBTOT × 100 | Población total. |
| Población afromexicana o afrodescendiente | POB_AFRO / POBTOT × 100 | Población total. |
| Grupo religioso | PCATOLICA, PRO_CRIEVA, POTRAS_REL o PSIN_RELIG / POBTOT × 100 | Población total. |
| Población con discapacidad, limitación o condición mental | PCON_DISC, PCON_LIMI o PCLIM_PMEN / POBTOT × 100 | Población total. Son indicadores distintos; no se suman como categorías excluyentes. |
| Discapacidad por actividad con dificultad | PCDISC_MOT, PCDISC_VIS, PCDISC_LENG, PCDISC_AUD, PCDISC_MOT2 o PCDISC_MEN / PCON_DISC × 100 | Población con discapacidad. Una persona puede tener dificultad en varias actividades; las barras no tienen que sumar 100%. |
| Afiliación y no afiliación | PDER_SS o PSINDER / POBTOT × 100 | Población total. No afiliación no significa reconocimiento del acceso. |
| Afiliación por institución | Conteo institucional / PDER_SS × 100 | Población afiliada. Afiliaciones múltiples; las instituciones no forman una partición. ISSSTE o ISSSTE estatal agrupa PDER_ISTE + PDER_ISTEE. PEMEX, la Defensa o la Marina: PAFIL_PDOM; Centro de salud: PDER_SEGP. |
| PEA y PNEA | PEA o PE_INAC / P_12YMAS × 100 | Población de 12 años y más. No se elimina la condición de actividad no especificada. |
| PEA ocupada y desocupada | POCUPADA o PDESOCUP / PEA × 100 | Población económicamente activa. |
| PEA según sexo | PEA_F o PEA_M / PEA × 100 | Composición por sexo de la PEA. |
| Población ocupada según sexo | POCUPADA_F o POCUPADA_M / POCUPADA × 100 | Composición por sexo de la población ocupada. |
| Analfabetismo | P15YM_AN / P_15YMAS × 100 | Población de 15 años y más. |
| Escolaridad, grupos de referencia | P15YM_SE, P15PRI_CO o P15SEC_CO / P_15YMAS; P18YM_PB / P_18YMAS; cada cociente × 100 | Los tres primeros indicadores usan 15 años y más; el último 18 años y más. No son una distribución completa. |
| Asistencia de 3 a 5 años | (P_3A5 − P3A5_NOA) / P_3A5 × 100 | Población de 3 a 5 años. Estimación por complemento del indicador de no asistencia; puede incluir no especificados si la fuente no permite separarlos. |
| Asistencia de 6 a 11 años | (P_6A11 − P6A11_NOA) / P_6A11 × 100 | Población de 6 a 11 años; misma limitación del complemento. |
| Asistencia de 12 a 14 años | (P_12A14 − P12A14NOA) / P_12A14 × 100 | Población de 12 a 14 años; misma limitación del complemento. |
| Asistencia de 15 a 17 años | P15A17A / P_15A17 × 100 | Asistencia directa de ITER, población de 15 a 17 años. |
| Asistencia de 18 a 24 años | P18A24A / P_18A24 × 100 | Asistencia directa de ITER, población de 18 a 24 años. |
| Migración, residencia en otra entidad | PRESOE15 / P_5YMAS × 100 | Población de 5 años y más, lugar de residencia en marzo de 2015. |
| Migración, nacimiento en otra entidad | PNACOE / POBTOT × 100 | Población total. |
| Fecundidad | PROM_HNV, valor publicado sin recalcular | Promedio de hijos o hijas nacidas vivas de mujeres de 12 años y más. |

## Edad mediana

La ficha detallada se conserva en `FICHA_edad_mediana.md`. Es una estimación a partir de intervalos quinquenales completos y validados, mediante interpolación en el intervalo mediano:

`Mediana = L + ((N/2 − F_anterior) / f_intervalo) × amplitud`.

Para Alonso Yáñez: `20 + ((904/2 − 434)/79) × 5 = 21.1392405`, presentado como **21.1 años**. Carlos validó el método y pidió que el recuadro se llame “Edad mediana” y su nota sea “La mitad de la población tiene 21.1 años o menos”. La ficha conserva su carácter estimado; no se atribuye como una cifra oficial de INEGI. Con intervalos incompletos, inconsistencias de sexo o total, o mediana dentro de un intervalo abierto, el generador no calcula el valor.

## Datos faltantes y mantenimiento

Un cero real se conserva. Vacíos, valores reservados con `*`, denominadores cero y cocientes inconsistentes no se convierten en cero. Las variables ITER y edades siguen en los archivos locales y en el respaldo incrustado de `index.html`; actualizar únicamente Base 107 no reemplaza esos conteos. Si cambian los insumos locales, se debe actualizar también el respaldo incrustado mediante `sincronizar-respaldo.py` y volver a cargar el paquete completo.

El mapa del equipo se conserva para Alonso Yáñez. Su fuente y fecha cartográficas siguen pendientes de documentación. Los mapas genéricos emplean la geometría municipal que ya estaba en el proyecto (metadatos de diciembre de 2025); la referencia bibliográfica a Marco geoestadístico 2020 se reproduce como pidió Carlos y no acredita por sí sola la procedencia de esos mapas.

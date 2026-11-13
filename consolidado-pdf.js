(function(root){
'use strict';
const MM=72/25.4,W=594,H=420;
const C={blue:'#004B87',sky:'#69B3E7',text:'#54585A',line:'#CED9E3',teal:'#008E95',purple:'#84369B',orange:'#E66D42',green:'#319356',soft:'#F4F8FC',softBorder:'#D8E4F0'};
const FONTS=root.SDH_TIPOGRAFIA||(typeof require==='function'?require('./tipografia.js'):null);
const ICONS=root.SDH_ICONOGRAFIA||(typeof require==='function'?require('./iconografia.js'):null);
const PDFMOD=root.SDH_PDF||(typeof require==='function'?require('./pdf-export.js'):null);
const EDITORIAL={"mensaje":{"title":"Panorama Sociodemográfico de los Pueblos y Comunidades Indígenas y Afromexicanas del Estado de Guanajuato","paragraphs":["La Secretaría de Derechos Humanos del Estado de Guanajuato, en cumplimiento de su compromiso institucional de servirse hacia la sociedad de la entidad federativa y entregarle publicaciones de investigación de calidad y de utilidad pública, realizó un trabajo de carácter sociodemográfico sobre ciento siete Pueblos y Comunidades Indígenas y Afromexicanas inscritos actualmente en el padrón estatal.","Luego de la publicación por parte del Instituto Nacional de Estadística y Geografía (INEGI) del Censo de Población y Vivienda 2020, y de la Encuesta Intercensal 2025, la Secretaría de Derechos Humanos del Estado de Guanajuato consideró importante y pertinente actualizar la información sociodemográfica de cada pueblo y comunidad reconocida.","Es por ello por lo que, en este marco, la Secretaría presenta el Panorama Sociodemográfico de los Pueblos y Comunidades Indígenas y Afromexicanas del Estado de Guanajuato, donde la labor consistió en la elaboración de un trabajo de síntesis de datos relevantes de características geográficas, demográficas, sociales y económicas de la población y las viviendas particulares habitadas. La información se presenta desagregada por localidad.","Este trabajo se presenta en cumplimiento a la encomienda de impulsar políticas públicas centradas en las personas, particularmente en los pueblos y comunidades indígenas y en las personas afromexicanas que dan vida a Guanajuato. La publicación no persigue únicamente la finalidad de diagnosticar realidades por medio de indicadores sociodemográficos, sino también busca orientar políticas públicas con enfoque intercultural y, sobre todo, que los resultados lleguen directamente a las manos de la sociedad y especialmente a los habitantes de los Pueblos y de las Comunidades reconocidas.","Guanajuato es un estado cuya riqueza cultural se construye a partir de la diversidad de sus pueblos y comunidades, quienes representan una parte fundamental de su identidad, historia y patrimonio colectivo. Por ello, reconocer a los Pueblos y Comunidades Indígenas y Afromexicanas implica también atender las desigualdades históricas que han enfrentado y fortalecer el respeto a sus derechos. La diversidad cultural no solo forma parte de nuestro pasado, sino que constituye una pieza esencial para construir un futuro más justo e incluyente.","Que este trabajo contribuya a generar conciencia sobre la riqueza y el contexto sociodemográfico de nuestras comunidades y reafirme el compromiso de construir un Guanajuato donde todas las identidades sean reconocidas, respetadas y valoradas."]},"lista":[{"title":"Territorio y ubicación geográfica","icon":"territorio","items":["Municipio","Altitud","Latitud","Longitud"]},{"title":"Composición por edad y sexo","icon":"poblacion","items":["Población total","Porcentaje de población masculina","Porcentaje de población femenina","Relación hombres-mujeres","Edad mediana","Pirámide poblacional"]},{"title":"Fecundidad","icon":"fecundidad","items":["Promedio de hijos o hijas nacidas vivas de mujeres de 12 años y más"]},{"title":"Situación conyugal","icon":"situacion_conyugal","items":["Porcentaje de población de 12 años y más soltera","Porcentaje de población de 12 años y más casada o en unión libre","Porcentaje de población de 12 años y más separada, divorciada o viuda"]},{"title":"Vivienda","icon":"vivienda","items":["Total de viviendas particulares habitadas","Población en viviendas particulares habitadas","Promedio de ocupantes por vivienda","Promedio de ocupantes por cuarto","Porcentaje de viviendas con piso de tierra","Porcentaje de viviendas con piso de cemento o firme, madera, mosaico u otro recubrimiento","Porcentaje de viviendas con disponibilidad de energía eléctrica","Porcentaje de viviendas con disponibilidad de agua entubada","Porcentaje de viviendas con disponibilidad de drenaje","Porcentaje de viviendas con disponibilidad de servicio sanitario","Porcentaje de viviendas con disponibilidad de tinaco","Porcentaje de viviendas con disponibilidad de cisterna o aljibe","Porcentaje de viviendas con disponibilidad de refrigerador","Porcentaje de viviendas con disponibilidad de lavadora","Porcentaje de viviendas con disponibilidad de automóvil o camioneta","Porcentaje de viviendas con disponibilidad de horno de microondas","Porcentaje de viviendas con disponibilidad de bicicleta","Porcentaje de viviendas con disponibilidad de motocicleta o motoneta","Porcentaje de viviendas con disponibilidad de televisión","Porcentaje de viviendas con disponibilidad de teléfono celular","Porcentaje de viviendas con disponibilidad de radio","Porcentaje de viviendas con disponibilidad de televisión de paga","Porcentaje de viviendas con disponibilidad de internet","Porcentaje de viviendas con disponibilidad de computadora, laptop o tablet","Porcentaje de viviendas con disponibilidad de línea telefónica fija"]},{"title":"Etnicidad","icon":"etnicidad","items":["Pueblo indígena por autoadscripción","Porcentaje de población de 3 años y más que habla alguna lengua indígena","Porcentaje de población en hogares censales indígenas","Porcentaje de población que se considera afromexicana o afrodescendiente","Porcentaje de población de 3 años y más hablante de lengua indígena que habla español","Porcentaje de población de 3 años y más hablante de lengua indígena que no habla español"]},{"title":"Desarrollo social","icon":"desarrollo_social","items":["Grado de marginación","Grado de rezago social"]},{"title":"Religión","icon":"religion","items":["Porcentaje de población con religión católica","Porcentaje de población sin religión o sin adscripción religiosa","Porcentaje de población protestante o cristiana evangélica","Porcentaje de población con otras religiones"]},{"title":"Migración","icon":"migracion","items":["Porcentaje de la población de 5 años y más residente en otra entidad en marzo de 2015","Porcentaje de la población nacida en otra entidad"]},{"title":"Discapacidad, limitación y condición mental","icon":"discapacidad","items":["Porcentaje de la población con alguna discapacidad","Porcentaje de la población con limitación","Porcentaje de la población con algún problema o condición mental","Porcentaje de personas con discapacidad para caminar, subir o bajar","Porcentaje de personas con discapacidad para ver, aun usando lentes","Porcentaje de personas con discapacidad para hablar o comunicarse","Porcentaje de personas con discapacidad para oír, aun usando aparato auditivo","Porcentaje de personas con discapacidad para vestirse, bañarse o comer","Porcentaje de personas con discapacidad para recordar o concentrarse"]},{"title":"Afiliación a servicios de salud","icon":"salud","items":["Porcentaje de población afiliada a servicios de salud","Porcentaje de población no afiliada a servicios de salud","Porcentaje de población afiliada a IMSS","Porcentaje de población afiliada a ISSSTE o ISSSTE estatal","Porcentaje de población afiliada a IMSS Bienestar","Porcentaje de población afiliada a Pemex, Defensa o Marina","Porcentaje de población afiliada a institución privada","Porcentaje de población afiliada a Centro de salud","Porcentaje de población afiliada a otra institución"]},{"title":"Características económicas","icon":"economia","items":["Porcentaje de la población de 12 años y más económicamente activa (PEA)","Porcentaje de la población de 12 años y más no económicamente activa (PNEA)","Porcentaje de la PEA ocupada","Porcentaje de la PEA desocupada","Porcentaje de mujeres en la PEA","Porcentaje de hombres en la PEA","Porcentaje de mujeres en la población ocupada","Porcentaje de hombres en la población ocupada"]},{"title":"Características educativas","icon":"educacion","items":["Grado promedio de escolaridad de la población de 15 años y más","Porcentaje de población de 15 años y más analfabeta","Porcentaje de población de 15 años y más sin escolaridad","Porcentaje de población de 15 años y más con primaria completa","Porcentaje de población de 15 años y más con secundaria completa","Porcentaje de población de 18 años y más con educación posbásica","Porcentaje de la población de 3 a 5 años que no asiste a la escuela","Porcentaje de la población de 6 a 11 años que no asiste a la escuela","Porcentaje de la población de 12 a 14 años que no asiste a la escuela","Porcentaje de la población de 15 a 17 años que asiste a la escuela","Porcentaje de la población de 18 a 24 años que asiste a la escuela"]}],"guia":{"intro":["En este apartado se presenta la definición de los indicadores del Panorama Sociodemográfico de los Pueblos y Comunidades Indígenas y Afromexicanas del Estado de Guanajuato. Estos indicadores permiten observar, de manera global, los aspectos sociodemográficos más relevantes de cada una de las localidades indígenas y afromexicanas del estado.","Salvo que se indique otra fuente, la información proviene del Censo de Población y Vivienda 2020 del INEGI, en particular de los Principales resultados por localidad (ITER). Los usuarios interesados en profundizar en el conocimiento de estos u otros indicadores pueden consultar la información del Censo de Población y Vivienda 2020, disponible en el sitio de Internet del INEGI."],"sections":[{"title":"Territorio y ubicación geográfica","icon":"territorio","notes":[],"indicators":[{"title":"Municipio","blocks":[{"type":"text","text":"Nombre oficial del municipio o demarcación territorial."}]},{"title":"Altitud","blocks":[{"type":"text","text":"Altura a la que se encuentra una localidad, respecto al nivel medio del mar, expresada en metros."}]},{"title":"Latitud","blocks":[{"type":"text","text":"Ubicación de la localidad expresada en grados, minutos, segundos y milésimas de segundo, situada al norte del ecuador (N)."}]},{"title":"Longitud","blocks":[{"type":"text","text":"Ubicación de la localidad expresada en grados, minutos, segundos y milésimas de segundo, situada al oeste del meridiano de Greenwich (W)."}]}]},{"title":"Composición por edad y sexo","icon":"poblacion","notes":[],"indicators":[{"title":"Población total","blocks":[{"type":"text","text":"Total de personas que residen habitualmente en el país, la entidad federativa, el municipio o la demarcación territorial y la localidad. Incluye la estimación del número de personas en viviendas particulares sin información de ocupantes. Incluye a la población que no especificó su edad."}]},{"title":"Porcentaje de población masculina","blocks":[{"type":"text","text":"Es el número de hombres respecto al total de población, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de población masculina","=","Población masculina","× 100"],["","","Población total",""]]}]},{"title":"Porcentaje de población femenina","blocks":[{"type":"text","text":"Es el número de mujeres respecto al total de población, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de población femenina","=","Población femenina","× 100"],["","","Población total",""]]}]},{"title":"Relación hombres-mujeres","blocks":[{"type":"text","text":"Es el cociente del número de hombres entre el de mujeres en una población dada por cien. Se interpreta como el número de hombres por cada 100 mujeres."},{"type":"formula","rows":[["Relación hombres-mujeres","=","Población masculina","× 100"],["","","Población femenina",""]]}]},{"title":"Edad mediana","blocks":[{"type":"text","text":"Edad que, una vez ordenadas las edades, divide a una población en dos grupos numéricamente iguales, es decir, la edad en la cual la mitad de la población tiene una edad menor o igual, y la otra tiene una edad mayor o igual."},{"type":"text","text":"Nota: No se publica en el ITER; se estima por el método de datos agrupados, con los grupos quinquenales de edad y sin la población con edad no especificada."}]},{"title":"Pirámide poblacional","blocks":[{"type":"text","text":"Es un histograma que representa la estructura de la población por sexo y grupos quinquenales de edad. Para la generación del histograma se excluye la población con edad no especificada."},{"type":"formula","rows":[["Pirámide poblacional","=","Población del sexo X del grupo de edad x a y","× 100"],["","","Total de población con edad especificada",""]]},{"type":"text","text":"Nota: X = hombres o mujeres. Grupos de edad: 0 a 4, 5 a 9, 10 a 14, 15 a 19, 20 a 24, 25 a 29, 30 a 34, 35 a 39, 40 a 44, 45 a 49, 50 a 54, 55 a 59, 60 a 64, 65 a 69, 70 a 74, 75 a 79, 80 a 84, 85 y más años. Total de población con edad especificada = suma de los 18 grupos quinquenales. Población con edad no especificada = Población total − suma de los 18 grupos quinquenales."}]}]},{"title":"Fecundidad","icon":"fecundidad","notes":[],"indicators":[{"title":"Promedio de hijos o hijas nacidas vivas de mujeres de 12 años y más","blocks":[{"type":"text","text":"Es el número de hijos o hijas nacidas vivas de las mujeres de 12 años y más respecto al total de mujeres en este rango de edad."},{"type":"formula","rows":[["Promedio de hijos o hijas nacidas vivas de mujeres de 12 años y más","=","Número de hijos o hijas nacidas vivas de mujeres de 12 años y más",""],["","","Total de mujeres de 12 años y más",""]]},{"type":"text","text":"Nota: Excluye a las mujeres que no especificaron el número de hijas e hijos nacidos vivos."}]}]},{"title":"Situación conyugal","icon":"situacion_conyugal","notes":[],"indicators":[{"title":"Porcentaje de población de 12 años y más soltera","blocks":[{"type":"text","text":"Población de 12 años y más en situación conyugal soltera respecto al total de población de 12 años y más, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población de 12 años y más soltera","=","Población de 12 años y más soltera","× 100"],["","","Total de población de 12 años y más",""]]}]},{"title":"Porcentaje de población de 12 años y más casada o en unión libre","blocks":[{"type":"text","text":"Población de 12 años y más en situación conyugal casada o en unión libre respecto al total de población de 12 años y más, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población de 12 años y más casada o en unión libre","=","Población de 12 años y más casada o en unión libre","× 100"],["","","Total de población de 12 años y más",""]]}]},{"title":"Porcentaje de población de 12 años y más separada, divorciada o viuda","blocks":[{"type":"text","text":"Población de 12 años y más en situación conyugal separada, divorciada o viuda respecto al total de población de 12 años y más, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población de 12 años y más separada, divorciada o viuda","=","Población de 12 años y más separada, divorciada o viuda","× 100"],["","","Total de población de 12 años y más",""]]}]}]},{"title":"Vivienda","icon":"vivienda","notes":["Los porcentajes de esta sección usan como denominador el Total de viviendas particulares habitadas con características: excluye locales no construidos para habitación, viviendas móviles y refugios, e incluye las viviendas particulares sin información de ocupantes."],"indicators":[{"title":"Total de viviendas particulares habitadas","blocks":[{"type":"text","text":"Viviendas particulares ocupadas de cualquier clase: casa independiente, departamento en edificio, vivienda o cuarto en vecindad, vivienda o cuarto de azotea, local no construido para habitación, vivienda móvil, refugios y clase no especificada. Incluye a las viviendas particulares sin información de ocupantes."}]},{"title":"Población en viviendas particulares habitadas","blocks":[{"type":"text","text":"Número de personas residentes habituales que habitan en viviendas particulares ocupadas de cualquier clase: casa independiente, departamento en edificio, vivienda o cuarto en vecindad, vivienda o cuarto de azotea, local no construido para habitación, vivienda móvil, refugios y clase no especificada. Incluye a las viviendas particulares sin información de ocupantes. No considera a la población residente en viviendas colectivas, el Servicio Exterior Mexicano y a la población sin vivienda."}]},{"title":"Promedio de ocupantes por vivienda","blocks":[{"type":"text","text":"Es el resultado de dividir el número de personas que residen en viviendas particulares habitadas, entre el número de esas viviendas."},{"type":"formula","rows":[["Promedio de ocupantes por vivienda","=","Número de personas que residen en viviendas particulares habitadas",""],["","","Total de viviendas particulares habitadas",""]]}]},{"title":"Promedio de ocupantes por cuarto","blocks":[{"type":"text","text":"Resultado de dividir el número de personas que residen en viviendas particulares habitadas entre el número de cuartos de esas viviendas."},{"type":"formula","rows":[["Promedio de ocupantes por cuarto","=","Número de personas que residen en viviendas particulares habitadas",""],["","","Total de cuartos en viviendas particulares habitadas",""]]},{"type":"text","text":"Nota: Se calcula solo con las viviendas particulares habitadas con características."}]},{"title":"Porcentaje de viviendas con piso de tierra","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que tienen piso de tierra respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con piso de tierra","=","Número de viviendas con piso de tierra","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con piso de cemento o firme, madera, mosaico u otro recubrimiento","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que tienen piso de cemento o firme, madera, mosaico u otro recubrimiento respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con piso de cemento o firme, madera, mosaico u otro recubrimiento","=","Número de viviendas con piso de cemento o firme, madera, mosaico u otro recubrimiento","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de energía eléctrica","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con energía eléctrica respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de energía eléctrica","=","Número de viviendas que disponen de energía eléctrica","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de agua entubada","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con agua entubada en el ámbito de la vivienda respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de agua entubada","=","Número de viviendas que disponen de agua entubada en el ámbito de la vivienda","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de drenaje","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con drenaje respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de drenaje","=","Número de viviendas que disponen de drenaje","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de servicio sanitario","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con servicio sanitario respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de servicio sanitario","=","Número de viviendas que disponen de servicio sanitario","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de tinaco","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con tinaco respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de tinaco","=","Número de viviendas que disponen de tinaco","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de cisterna o aljibe","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con cisterna o aljibe respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de cisterna o aljibe","=","Número de viviendas que disponen de cisterna o aljibe","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de refrigerador","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con refrigerador respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de refrigerador","=","Número de viviendas que disponen de refrigerador","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de lavadora","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con lavadora respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de lavadora","=","Número de viviendas que disponen de lavadora","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de automóvil o camioneta","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con automóvil o camioneta respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de automóvil o camioneta","=","Número de viviendas que disponen de automóvil o camioneta","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de horno de microondas","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con horno de microondas respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de horno de microondas","=","Número de viviendas que disponen de horno de microondas","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de bicicleta","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con bicicleta que se utilice como medio de transporte respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de bicicleta","=","Número de viviendas que disponen de bicicleta","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de motocicleta o motoneta","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con motocicleta o motoneta respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de motocicleta o motoneta","=","Número de viviendas que disponen de motocicleta o motoneta","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de televisión","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con televisión respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de televisión","=","Número de viviendas que disponen de televisión","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de teléfono celular","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con teléfono celular respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de teléfono celular","=","Número de viviendas que disponen de teléfono celular","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de radio","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con radio respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de radio","=","Número de viviendas que disponen de radio","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de televisión de paga","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con televisión de paga respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de televisión de paga","=","Número de viviendas que disponen de televisión de paga","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de internet","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con internet respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de internet","=","Número de viviendas que disponen de internet","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de computadora, laptop o tablet","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con computadora, laptop o tablet respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de computadora","=","Número de viviendas que disponen de computadora, laptop o tablet","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]},{"title":"Porcentaje de viviendas con disponibilidad de línea telefónica fija","blocks":[{"type":"text","text":"Es el número de viviendas particulares habitadas que cuentan con línea telefónica fija respecto al total de viviendas particulares habitadas con características, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de viviendas con disponibilidad de línea telefónica fija","=","Número de viviendas que disponen de línea telefónica fija","× 100"],["","","Total de viviendas particulares habitadas con características",""]]}]}]},{"title":"Etnicidad","icon":"etnicidad","notes":[],"indicators":[{"title":"Pueblo indígena por autoadscripción","blocks":[{"type":"text","text":"Es aquella cultura con la que una población se identifica o se considera parte de ella."},{"type":"text","text":"Fuente: Padrón de Pueblos y Comunidades Indígenas y Afromexicanas del Estado de Guanajuato."}]},{"title":"Porcentaje de población de 3 años y más que habla alguna lengua indígena","blocks":[{"type":"text","text":"Es la población de 3 años y más que declaró hablar alguna lengua indígena, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población de 3 años y más que habla alguna lengua indígena","=","Número de personas de 3 años y más que declaró hablar alguna lengua indígena","× 100"],["","","Total de población de 3 años y más",""]]}]},{"title":"Porcentaje de población en hogares censales indígenas","blocks":[{"type":"text","text":"Porcentaje de personas que forman hogares censales donde la persona de referencia del hogar o su cónyuge o alguno de los ascendientes de éstos, declararon hablar lengua indígena, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de población en hogares censales indígenas","=","Total de población en hogares censales indígenas","× 100"],["","","Población total",""]]}]},{"title":"Porcentaje de población que se considera afromexicana o afrodescendiente","blocks":[{"type":"text","text":"Personas que se consideran afromexicanas o afrodescendientes, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de población que se considera afromexicana o afrodescendiente","=","Total de población afromexicana o afrodescendiente","× 100"],["","","Población total",""]]}]},{"title":"Porcentaje de población de 3 años y más hablante de lengua indígena que habla español","blocks":[{"type":"text","text":"Es el número de personas hablantes de lengua indígena que declararon hablar lengua española, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de población de 3 años y más hablante de lengua indígena que habla español","=","Población de 3 años y más hablante de lengua indígena que habla español","× 100"],["","","Total de población de 3 años y más hablante de lengua indígena",""]]}]},{"title":"Porcentaje de población de 3 años y más hablante de lengua indígena que no habla español","blocks":[{"type":"text","text":"Es el número de personas hablantes de lengua indígena que declararon no hablar lengua española, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de población de 3 años y más hablante de lengua indígena que no habla español","=","Población de 3 años y más hablante de lengua indígena que no habla español","× 100"],["","","Total de población de 3 años y más hablante de lengua indígena",""]]}]}]},{"title":"Desarrollo social","icon":"desarrollo_social","notes":[],"indicators":[{"title":"Grado de marginación","blocks":[{"type":"text","text":"Es una medida estadística que clasifica a las localidades, municipios o entidades federativas según la intensidad de las carencias y exclusiones socioeconómicas (acceso a la educación, vivienda y disponibilidad de bienes) que padece su población."},{"type":"text","text":"Nota: Fuente: CONAPO, Índice de marginación por localidad 2020. Categorías: muy bajo, bajo, medio, alto, muy alto."}]},{"title":"Grado de rezago social","blocks":[{"type":"text","text":"Es una medida estadística que resume las carencias sociales de la población y el acceso a determinados bienes y derechos básicos (educación, acceso a los servicios de salud, calidad y espacios de vivienda, servicios básicos en la vivienda y los activos en el hogar) en un territorio específico, entidades federativas, municipios o localidades."},{"type":"text","text":"Nota: Fuente: CONEVAL, Índice de Rezago Social 2020. Categorías: muy bajo, bajo, medio, alto, muy alto."}]}]},{"title":"Religión","icon":"religion","notes":[],"indicators":[{"title":"Porcentaje de población con religión católica","blocks":[{"type":"text","text":"Es la proporción de personas que declararon profesar la religión católica, respecto al total de población de la comunidad, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población con religión católica","=","Población con religión católica","× 100"],["","","Población total",""]]}]},{"title":"Porcentaje de población sin religión o sin adscripción religiosa","blocks":[{"type":"text","text":"Es la proporción de personas que declararon no tener religión o no estar adscritas a alguna, respecto al total de población de la comunidad, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población sin religión o sin adscripción religiosa","=","Población sin religión o sin adscripción religiosa","× 100"],["","","Población total",""]]}]},{"title":"Porcentaje de población protestante o cristiana evangélica","blocks":[{"type":"text","text":"Es la proporción de personas que declararon pertenecer al grupo religioso protestante o cristiano evangélico, respecto al total de población de la comunidad, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población protestante o cristiana evangélica","=","Población protestante o cristiana evangélica","× 100"],["","","Población total",""]]}]},{"title":"Porcentaje de población con otras religiones","blocks":[{"type":"text","text":"Es la proporción de personas que declararon profesar otras religiones diferentes a las anteriores, respecto al total de población de la comunidad, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población con otras religiones","=","Población con otras religiones","× 100"],["","","Población total",""]]}]}]},{"title":"Migración","icon":"migracion","notes":[],"indicators":[{"title":"Porcentaje de la población de 5 años y más residente en otra entidad en marzo de 2015","blocks":[{"type":"text","text":"Representa la proporción de habitantes de cinco años o más que, en marzo de 2015, vivían en una entidad federativa distinta de aquella en la que residen actualmente, respecto al total de población de ese mismo rango de edad."},{"type":"formula","rows":[["Porcentaje de la población de 5 años y más residente en otra entidad en marzo de 2015","=","Población de 5 años y más residente en otra entidad en marzo de 2015","× 100"],["","","Total de población de 5 años y más",""]]}]},{"title":"Porcentaje de la población nacida en otra entidad","blocks":[{"type":"text","text":"Indica el porcentaje de habitantes cuyo lugar de nacimiento se encuentra en una entidad federativa diferente a aquella donde reside actualmente, en relación con la población total."},{"type":"formula","rows":[["Porcentaje de la población nacida en otra entidad","=","Población nacida en otra entidad","× 100"],["","","Población total",""]]}]}]},{"title":"Discapacidad, limitación y condición mental","icon":"discapacidad","notes":["Nota: Una persona puede estar en más de una categoría y tener dificultad en más de una actividad, por lo que los porcentajes no deben sumarse."],"indicators":[{"title":"Porcentaje de la población con alguna discapacidad","blocks":[{"type":"text","text":"Muestra la proporción de habitantes que manifestaron tener mucha dificultad o no poder realizar al menos una actividad de la vida cotidiana, respecto a la población total. Entre estas actividades se encuentran ver, escuchar, caminar, recordar, concentrarse, bañarse, vestirse, comer, hablar o comunicarse."},{"type":"formula","rows":[["Porcentaje de la población con alguna discapacidad","=","Población que declaró tener alguna discapacidad","× 100"],["","","Población total",""]]}]},{"title":"Porcentaje de la población con limitación","blocks":[{"type":"text","text":"Expresa la proporción de personas que señalaron tener poca dificultad para realizar al menos una de las actividades cotidianas consideradas por el Censo de Población y Vivienda 2020, en relación con la población total."},{"type":"formula","rows":[["Porcentaje de la población con limitación","=","Población que presenta alguna limitación","× 100"],["","","Población total",""]]}]},{"title":"Porcentaje de la población con algún problema o condición mental","blocks":[{"type":"text","text":"Indica qué proporción de habitantes declaró presentar algún problema o condición mental, tomando como referencia el total de la población."},{"type":"formula","rows":[["Porcentaje de la población con algún problema o condición mental","=","Población con algún problema o condición mental","× 100"],["","","Población total",""]]}]},{"title":"Porcentaje de personas con discapacidad para caminar, subir o bajar","blocks":[{"type":"text","text":"Representa la proporción de personas con discapacidad que manifiestan tener mucha dificultad o no poder caminar, subir o bajar, respecto al total de población con discapacidad, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de personas con discapacidad para caminar, subir o bajar","=","Población con discapacidad para caminar, subir o bajar","× 100"],["","","Población con discapacidad",""]]}]},{"title":"Porcentaje de personas con discapacidad para ver, aun usando lentes","blocks":[{"type":"text","text":"Representa la proporción de personas con discapacidad que manifiestan tener mucha dificultad o no poder ver, aun usando lentes, respecto al total de población con discapacidad, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de personas con discapacidad para ver, aun usando lentes","=","Población con discapacidad para ver, aun usando lentes","× 100"],["","","Población con discapacidad",""]]}]},{"title":"Porcentaje de personas con discapacidad para hablar o comunicarse","blocks":[{"type":"text","text":"Representa la proporción de personas con discapacidad que manifiestan tener mucha dificultad o no poder hablar o comunicarse, respecto al total de población con discapacidad, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de personas con discapacidad para hablar o comunicarse","=","Población con discapacidad para hablar o comunicarse","× 100"],["","","Población con discapacidad",""]]}]},{"title":"Porcentaje de personas con discapacidad para oír, aun usando aparato auditivo","blocks":[{"type":"text","text":"Representa la proporción de personas con discapacidad que manifiestan tener mucha dificultad o no poder oír, aun usando aparato auditivo, respecto al total de población con discapacidad, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de personas con discapacidad para oír, aun usando aparato auditivo","=","Población con discapacidad para oír, aun usando aparato auditivo","× 100"],["","","Población con discapacidad",""]]}]},{"title":"Porcentaje de personas con discapacidad para vestirse, bañarse o comer","blocks":[{"type":"text","text":"Representa la proporción de personas con discapacidad que manifiestan tener mucha dificultad o no poder vestirse, bañarse o comer, respecto al total de población con discapacidad, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de personas con discapacidad para vestirse, bañarse o comer","=","Población con discapacidad para vestirse, bañarse o comer","× 100"],["","","Población con discapacidad",""]]}]},{"title":"Porcentaje de personas con discapacidad para recordar o concentrarse","blocks":[{"type":"text","text":"Representa la proporción de personas con discapacidad que manifiestan tener mucha dificultad o no poder recordar o concentrarse, respecto al total de población con discapacidad, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de personas con discapacidad para recordar o concentrarse","=","Población con discapacidad para recordar o concentrarse","× 100"],["","","Población con discapacidad",""]]}]}]},{"title":"Afiliación a servicios de salud","icon":"salud","notes":[],"indicators":[{"title":"Porcentaje de población afiliada a servicios de salud","blocks":[{"type":"text","text":"Es la población afiliada a alguna institución que brinda servicios de salud pública o privada respecto al total de población, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población afiliada a servicios de salud","=","Población afiliada a servicios de salud","× 100"],["","","Población total",""]]}]},{"title":"Porcentaje de población no afiliada a servicios de salud","blocks":[{"type":"text","text":"Es la proporción de personas que no están afiliadas a alguna institución que brinda servicios de salud pública o privada, respecto al total de población, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población no afiliada a servicios de salud","=","Población no afiliada a servicios de salud","× 100"],["","","Población total",""]]}]},{"title":"Porcentaje de población afiliada a IMSS","blocks":[{"type":"text","text":"Es la población afiliada a servicios de salud en el Instituto Mexicano del Seguro Social (IMSS) respecto al total de población afiliada, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población afiliada a IMSS","=","Población afiliada a IMSS","× 100"],["","","Población afiliada a servicios de salud",""]]},{"type":"text","text":"Nota: La suma por institución puede ser mayor a 100% porque una persona puede estar afiliada a más de una institución."}]},{"title":"Porcentaje de población afiliada a ISSSTE o ISSSTE estatal","blocks":[{"type":"text","text":"Es la población afiliada a servicios de salud en el Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado (ISSSTE) o en el ISSSTE estatal respecto al total de población afiliada, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población afiliada a ISSSTE o ISSSTE estatal","=","Población afiliada a ISSSTE o ISSSTE estatal","× 100"],["","","Población afiliada a servicios de salud",""]]},{"type":"text","text":"Nota: La suma por institución puede ser mayor a 100% porque una persona puede estar afiliada a más de una institución."}]},{"title":"Porcentaje de población afiliada a IMSS Bienestar","blocks":[{"type":"text","text":"Es la población afiliada a servicios de salud en el IMSS Bienestar respecto al total de población afiliada, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población afiliada a IMSS Bienestar","=","Población afiliada a IMSS Bienestar","× 100"],["","","Población afiliada a servicios de salud",""]]},{"type":"text","text":"Nota: La suma por institución puede ser mayor a 100% porque una persona puede estar afiliada a más de una institución."}]},{"title":"Porcentaje de población afiliada a Pemex, Defensa o Marina","blocks":[{"type":"text","text":"Es la población afiliada a servicios de salud en Petróleos Mexicanos, la Secretaría de la Defensa Nacional o la Secretaría de Marina respecto al total de población afiliada, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población afiliada a Pemex, Defensa o Marina","=","Población afiliada a Pemex, Defensa o Marina","× 100"],["","","Población afiliada a servicios de salud",""]]},{"type":"text","text":"Nota: La suma por institución puede ser mayor a 100% porque una persona puede estar afiliada a más de una institución."}]},{"title":"Porcentaje de población afiliada a institución privada","blocks":[{"type":"text","text":"Es la población afiliada a servicios de salud en una institución privada respecto al total de población afiliada, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población afiliada a institución privada","=","Población afiliada a institución privada","× 100"],["","","Población afiliada a servicios de salud",""]]},{"type":"text","text":"Nota: La suma por institución puede ser mayor a 100% porque una persona puede estar afiliada a más de una institución."}]},{"title":"Porcentaje de población afiliada a Centro de salud","blocks":[{"type":"text","text":"Es la población afiliada a servicios de salud en la Secretaría de Salud, mediante el Instituto de Salud para el Bienestar (Centro de salud) respecto al total de población afiliada, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población afiliada a Centro de salud","=","Población afiliada a Centro de salud","× 100"],["","","Población afiliada a servicios de salud",""]]},{"type":"text","text":"Nota: La suma por institución puede ser mayor a 100% porque una persona puede estar afiliada a más de una institución."}]},{"title":"Porcentaje de población afiliada a otra institución","blocks":[{"type":"text","text":"Es la población afiliada a servicios de salud en cualquier otra institución pública o privada respecto al total de población afiliada, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población afiliada a otra institución","=","Población afiliada a otra institución","× 100"],["","","Población afiliada a servicios de salud",""]]},{"type":"text","text":"Nota: La suma por institución puede ser mayor a 100% porque una persona puede estar afiliada a más de una institución."}]}]},{"title":"Características económicas","icon":"economia","notes":["Nota: Para el cálculo de estos indicadores se considera a las personas de 12 años y más."],"indicators":[{"title":"Porcentaje de la población de 12 años y más económicamente activa (PEA)","blocks":[{"type":"text","text":"Representa la proporción de personas de doce años o más que realizaron alguna actividad económica o buscaron incorporarse al mercado laboral durante la semana de referencia, respecto al total de habitantes de ese rango de edad. Este indicador también se conoce como tasa de participación económica."},{"type":"formula","rows":[["Porcentaje de la población de 12 años y más económicamente activa (PEA)","=","Población de 12 años y más económicamente activa (PEA)","× 100"],["","","Total de población de 12 años y más",""]]},{"type":"text","text":"Nota: PEA y PNEA pueden no sumar 100% por la población que no especificó su condición de actividad."}]},{"title":"Porcentaje de la población de 12 años y más no económicamente activa (PNEA)","blocks":[{"type":"text","text":"Señala la proporción de personas de doce años o más que no realizaron actividades económicas ni buscaron empleo durante la semana de referencia, en relación con el total de población de ese grupo de edad."},{"type":"formula","rows":[["Porcentaje de la población de 12 años y más no económicamente activa (PNEA)","=","Población de 12 años y más no económicamente activa (PNEA)","× 100"],["","","Total de población de 12 años y más",""]]},{"type":"text","text":"Nota: PEA y PNEA pueden no sumar 100% por la población que no especificó su condición de actividad."}]},{"title":"Porcentaje de la PEA ocupada","blocks":[{"type":"text","text":"Indica qué proporción de las personas económicamente activas contaba con una ocupación durante la semana de referencia. Su resultado se obtiene respecto al total de la población económicamente activa y también se conoce como tasa de ocupación."},{"type":"formula","rows":[["Porcentaje de la PEA ocupada","=","Población de 12 años y más ocupada","× 100"],["","","Población de 12 años y más económicamente activa (PEA)",""]]}]},{"title":"Porcentaje de la PEA desocupada","blocks":[{"type":"text","text":"Muestra la proporción de personas económicamente activas que se encontraban desocupadas durante la semana de referencia, respecto al total de la población económicamente activa."},{"type":"formula","rows":[["Porcentaje de la PEA desocupada","=","Población de 12 años y más desocupada","× 100"],["","","Población de 12 años y más económicamente activa (PEA)",""]]}]},{"title":"Porcentaje de mujeres en la PEA","blocks":[{"type":"text","text":"Es la proporción de mujeres dentro de la población económicamente activa. Refleja la composición del grupo, no la tasa de participación económica."},{"type":"formula","rows":[["Porcentaje de mujeres en la PEA","=","Población femenina económicamente activa","× 100"],["","","Población económicamente activa",""]]}]},{"title":"Porcentaje de hombres en la PEA","blocks":[{"type":"text","text":"Es la proporción de hombres dentro de la población económicamente activa. Refleja la composición del grupo, no la tasa de participación económica."},{"type":"formula","rows":[["Porcentaje de hombres en la PEA","=","Población masculina económicamente activa","× 100"],["","","Población económicamente activa",""]]}]},{"title":"Porcentaje de mujeres en la población ocupada","blocks":[{"type":"text","text":"Es la proporción de mujeres dentro de la población de 12 años y más ocupada. Refleja la composición del grupo, no la tasa de ocupación."},{"type":"formula","rows":[["Porcentaje de mujeres en la población ocupada","=","Población femenina ocupada","× 100"],["","","Población de 12 años y más ocupada",""]]}]},{"title":"Porcentaje de hombres en la población ocupada","blocks":[{"type":"text","text":"Es la proporción de hombres dentro de la población de 12 años y más ocupada. Refleja la composición del grupo, no la tasa de ocupación."},{"type":"formula","rows":[["Porcentaje de hombres en la población ocupada","=","Población masculina ocupada","× 100"],["","","Población de 12 años y más ocupada",""]]}]}]},{"title":"Características educativas","icon":"educacion","notes":[],"indicators":[{"title":"Grado promedio de escolaridad de la población de 15 años y más","blocks":[{"type":"text","text":"Es el número promedio de grados escolares aprobados por población de 15 años y más. Permite aproximar el nivel de instrucción formal alcanzado por este grupo de población. Se excluye a quienes no especificaron sus grados."},{"type":"formula","rows":[["Grado promedio de escolaridad de la población de 15 años y más","=","Suma de grados escolares aprobados de la población de 15 años y más",""],["","","Total de población de 15 años y más",""]]}]},{"title":"Porcentaje de población de 15 años y más analfabeta","blocks":[{"type":"text","text":"Es el número de personas de 15 años y más que no saben leer ni escribir un recado, respecto al total de población de 15 años y más, expresado por cada cien."},{"type":"formula","rows":[["Porcentaje de población de 15 años y más analfabeta","=","Población de 15 años y más analfabeta","× 100"],["","","Total de población de 15 años y más",""]]}]},{"title":"Porcentaje de población de 15 años y más sin escolaridad","blocks":[{"type":"text","text":"Es la población de 15 años y más con sin escolaridad respecto al total de población de 15 años y más, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población de 15 años y más sin escolaridad","=","Población de 15 años y más sin escolaridad","× 100"],["","","Total de población de 15 años y más",""]]}]},{"title":"Porcentaje de población de 15 años y más con primaria completa","blocks":[{"type":"text","text":"Es la población de 15 años y más con primaria completa respecto al total de población de 15 años y más, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población de 15 años y más con primaria completa","=","Población de 15 años y más con primaria completa","× 100"],["","","Total de población de 15 años y más",""]]}]},{"title":"Porcentaje de población de 15 años y más con secundaria completa","blocks":[{"type":"text","text":"Es la población de 15 años y más con secundaria completa respecto al total de población de 15 años y más, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población de 15 años y más con secundaria completa","=","Población de 15 años y más con secundaria completa","× 100"],["","","Total de población de 15 años y más",""]]}]},{"title":"Porcentaje de población de 18 años y más con educación posbásica","blocks":[{"type":"text","text":"Es la población de 18 años y más con educación posbásica respecto al total de población de 18 años y más, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de población de 18 años y más con educación posbásica","=","Población de 18 años y más con educación posbásica","× 100"],["","","Total de población de 18 años y más",""]]},{"type":"text","text":"Nota: Para la educación posbásica el grupo de referencia es la población de 18 años y más."}]},{"title":"Porcentaje de la población de 3 a 5 años que no asiste a la escuela","blocks":[{"type":"text","text":"Es la población de 3 a 5 años que no asiste a la escuela respecto al total de población de ese grupo de edad, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de la población de 3 a 5 años que no asiste a la escuela","=","Población de 3 a 5 años que no asiste a la escuela","× 100"],["","","Total de población de 3 a 5 años",""]]}]},{"title":"Porcentaje de la población de 6 a 11 años que no asiste a la escuela","blocks":[{"type":"text","text":"Es la población de 6 a 11 años que no asiste a la escuela respecto al total de población de ese grupo de edad, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de la población de 6 a 11 años que no asiste a la escuela","=","Población de 6 a 11 años que no asiste a la escuela","× 100"],["","","Total de población de 6 a 11 años",""]]}]},{"title":"Porcentaje de la población de 12 a 14 años que no asiste a la escuela","blocks":[{"type":"text","text":"Es la población de 12 a 14 años que no asiste a la escuela respecto al total de población de ese grupo de edad, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de la población de 12 a 14 años que no asiste a la escuela","=","Población de 12 a 14 años que no asiste a la escuela","× 100"],["","","Total de población de 12 a 14 años",""]]}]},{"title":"Porcentaje de la población de 15 a 17 años que asiste a la escuela","blocks":[{"type":"text","text":"Es la población de 15 a 17 años que asiste a la escuela respecto al total de población de ese grupo de edad, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de la población de 15 a 17 años que asiste a la escuela","=","Población de 15 a 17 años que asiste a la escuela","× 100"],["","","Total de población de 15 a 17 años",""]]}]},{"title":"Porcentaje de la población de 18 a 24 años que asiste a la escuela","blocks":[{"type":"text","text":"Es la población de 18 a 24 años que asiste a la escuela respecto al total de población de ese grupo de edad, expresada por cada cien."},{"type":"formula","rows":[["Porcentaje de la población de 18 a 24 años que asiste a la escuela","=","Población de 18 a 24 años que asiste a la escuela","× 100"],["","","Total de población de 18 a 24 años",""]]}]}]}],"references":["Consejo Nacional de Evaluación de la Política de Desarrollo Social. (2021). Índice de Rezago Social 2020: Anexos [Conjunto de datos]. https://www.coneval.org.mx/Medicion/IRS/Paginas/Indice_de_Rezago_Social_2020_anexos.aspx","Consejo Nacional de Población. (2021). Índices de marginación 2020 [Conjunto de datos]. Gobierno de México. https://www.gob.mx/conapo/documentos/indices-de-marginacion-2020-284372","Instituto Nacional de Estadística y Geografía. (2021a). Censo de Población y Vivienda 2020: Principales resultados por localidad (ITER) [Conjunto de datos]. https://www.inegi.org.mx/programas/ccpv/2020/#datos_abiertos","Instituto Nacional de Estadística y Geografía. (2021b). Marco geoestadístico. Censo de Población y Vivienda 2020 [Conjunto de datos]. https://www.inegi.org.mx/app/biblioteca/ficha.html?upc=889463807469","Instituto Nacional de los Pueblos Indígenas. (s.f.). Catálogo Nacional de Pueblos y Comunidades Indígenas y Afromexicanas. https://catalogo.inpi.gob.mx/cedulas/","Secretaría del Nuevo Comienzo. (s.f.). Monografías de las comunidades indígenas del estado de Guanajuato. Gobierno del Estado de Guanajuato. https://portalsocial.guanajuato.gob.mx/alcance/localidad"]}};

function winCode(c){
  const special={'–':150,'—':151,'−':150,'’':146,'‘':145,'“':147,'”':148,'…':133,'•':149,'€':128};
  return special[c]??(c.charCodeAt(0)<=255?c.charCodeAt(0):63);
}
function charWidth(c,style){
  const role=style===true?'bold':style||'normal';
  const metrics=FONTS?.[role]?.widths;
  if(!metrics)throw Error('Falta la tipografía institucional '+role+'.');
  return metrics[winCode(c)]??metrics[63];
}
function hex(s){return Array.from(String(s)).map(c=>winCode(c).toString(16).padStart(2,'0')).join('');}
function tw(s,pt,style=false){return Array.from(String(s)).reduce((a,c)=>a+charWidth(c,style),0)*pt/1000/MM;}
function wrap(s,width,pt,style=false){
  const out=[];
  for(const paragraph of String(s).split(/\r?\n/)){
    let line='';
    for(const word of paragraph.split(/\s+/).filter(Boolean)){
      const candidate=line?line+' '+word:word;
      if(tw(candidate,pt,style)>width&&line){out.push(line);line=word;}
      else line=candidate;
    }
    if(line)out.push(line);
  }
  return out.length?out:[''];
}
function rgb(color){return color.replace('#','').match(/../g).map(c=>(parseInt(c,16)/255).toFixed(4)).join(' ');}
function joinBytes(arr){const out=new Uint8Array(arr.reduce((s,a)=>s+a.length,0));let at=0;for(const a of arr){out.set(a,at);at+=a.length;}return out;}
function num(v){if(v===null||v===undefined||String(v).trim()===''||String(v).includes('*'))return null;const n=Number(String(v).replace(/,/g,''));return Number.isFinite(n)?n:null;}
function fmt(v){const n=num(v);return n===null?'0':n.toLocaleString('es-MX',{maximumFractionDigits:0});}

/**
 * Pure vector multi-page A2 horizontal PDF builder using institutional fonts and iconography.
 */
class MultiPDF{
  constructor(){this.pages=[];this.images=[];this.current=null;}
  addPage(){this.current={cmd:[],links:[],imageUses:[]};this.pages.push(this.current);return this.current;}
  ensurePage(){return this.current||this.addPage();}
  registerImage(data){
    if(!data)return null;
    const found=this.images.find(im=>im.bytes===data.bytes);
    if(found)return found.name;
    const name='Img'+this.images.length;
    this.images.push({...data,name});
    return name;
  }
  image(data,x,y,w,h){
    if(!data)return;
    const p=this.ensurePage(),name=this.registerImage(data);
    p.imageUses.push(name);
    p.cmd.push(`q ${w*MM} 0 0 ${h*MM} ${x*MM} ${(H-y-h)*MM} cm /${name} Do Q`);
  }
  text(s,x,y,pt=11,style=false,color=C.text,width=1000,align='left',leading=1.2){
    const p=this.ensurePage(),lines=wrap(s,width,pt,style),step=pt*leading/MM;
    const fId=style==='headline'?'F4':style==='support'?'F5':style==='identity'?'F6':style==='italic'?'F3':style?'F2':'F1';
    for(let i=0;i<lines.length;i++){
      const dx=align==='right'?width-tw(lines[i],pt,style):align==='center'?(width-tw(lines[i],pt,style))/2:0;
      p.cmd.push(`BT /${fId} ${pt} Tf ${rgb(color)} rg 1 0 0 1 ${((x+dx)*MM).toFixed(3)} ${((H-y-i*step)-pt/MM)*MM} Tm <${hex(lines[i])}> Tj ET`);
    }
    return lines.length*step;
  }
  justified(s,x,y,pt,width,leading=1.42,color=C.text){
    const p=this.ensurePage(),lines=wrap(s,width,pt,false),step=pt*leading/MM;
    lines.forEach((line,i)=>{
      const spaces=(line.match(/ /g)||[]).length;
      const wordSpace=i<lines.length-1&&spaces?(width-tw(line,pt,false))*MM/spaces:0;
      p.cmd.push(`BT /F1 ${pt} Tf ${rgb(color)} rg ${wordSpace.toFixed(3)} Tw 1 0 0 1 ${(x*MM).toFixed(3)} ${((H-y-i*step)*MM-pt).toFixed(3)} Tm <${hex(line)}> Tj 0 Tw ET`);
    });
    return lines.length*step;
  }
  note(s,x,y,pt=9.5,color=C.text,width=278,measureOnly=false){
    const match=String(s??'').match(/^\s*(Nota:)(?:\s+|$)/);
    if(!match){
      const lines=wrap(s,width,pt,false);
      if(!measureOnly)this.text(s,x,y,pt,false,color,width,'left',1.25);
      return lines.length*pt*1.25/MM;
    }
    const label=match[1],offset=tw(label,pt,true)+tw(' ',pt),step=pt*1.25/MM,lines=[];
    let line='',first=true;
    for(const paragraph of String(s).slice(match[0].length).split(/\r?\n/)){
      for(const word of paragraph.split(/\s+/).filter(Boolean)){
        const candidate=line?line+' '+word:word;
        if(line&&tw(candidate,pt,false)>width-(first?offset:0)){lines.push(line);line=word;first=false;}
        else line=candidate;
      }
      lines.push(line);line='';first=false;
    }
    if(!measureOnly){
      this.text(label,x,y,pt,true,color,100,'left',1.25);
      lines.forEach((txt,i)=>{if(txt)this.text(txt,x+(i?0:offset),y+i*step,pt,false,color,width-(i?0:offset)+.001,'left',1.25);});
    }
    return Math.max(1,lines.length)*step;
  }
  rect(x,y,w,h,fill=null,stroke=null,lw=.25){
    const p=this.ensurePage();
    p.cmd.push(`q ${fill?rgb(fill)+' rg ':''}${stroke?rgb(stroke)+' RG '+(lw*MM)+' w ':''}${x*MM} ${(H-y-h)*MM} ${w*MM} ${h*MM} re ${fill&&stroke?'B':fill?'f':'S'} Q`);
  }
  line(x1,y1,x2,y2,color=C.line,lw=.25){
    const p=this.ensurePage();
    p.cmd.push(`q ${rgb(color)} RG ${lw*MM} w ${x1*MM} ${(H-y1)*MM} m ${x2*MM} ${(H-y2)*MM} l S Q`);
  }
  circle(x,y,r,fill,stroke=null){
    const p=this.ensurePage(),k=.5522847498*r,px=x*MM,py=(H-y)*MM;
    const q=(a,b)=>`${(px+a*MM).toFixed(3)} ${(py+b*MM).toFixed(3)}`;
    p.cmd.push(`q ${rgb(fill)} rg ${stroke?rgb(stroke)+' RG ':''}${q(r,0)} m ${q(r,k)} ${q(k,r)} ${q(0,r)} c ${q(-k,r)} ${q(-r,k)} ${q(-r,0)} c ${q(-r,-k)} ${q(-k,-r)} ${q(0,-r)} c ${q(k,-r)} ${q(r,-k)} ${q(r,0)} c ${stroke?'B':'f'} Q`);
  }
  icon(name,x,y,size=8.4){
    const p=this.ensurePage(),ic=ICONS?.icons[name]||ICONS?.icons[ICONS?.sectionIcons?.[name]];
    if(!ic)throw Error('Falta el ícono '+name);
    const top=y-.7,scale=size/ICONS.size;
    this.rect(x,top,size,size,C.blue);
    p.cmd.push(`q ${scale*MM} 0 0 ${-scale*MM} ${x*MM} ${(H-top)*MM} cm 1 1 1 rg 1 1 1 RG`);
    ic.paths.forEach(path=>{
      const commands=path.commands.map(([op,...vals])=>op==='Z'?'h':vals.join(' ')+' '+({M:'m',L:'l',C:'c'}[op])).join(' ');
      const paint=path.fill?(path.stroke?'B':'f')+(path.rule==='evenodd'?'*':''):path.stroke?'S':'n';
      p.cmd.push(`q ${path.width} w ${path.cap==='round'?1:0} J ${path.join==='round'?1:0} j ${commands} ${paint} Q`);
    });
    p.cmd.push('Q');
  }
  sectionTitle(label,x,y,w,kind='historia',pt=14.5){
    this.icon(kind,x,y);
    const h=this.text(label,x+10,y+.3,pt,true,C.blue,w-10),bottom=y+Math.max(7,h)+1.5;
    this.line(x,bottom,x+w,bottom,C.blue,.65);
    return bottom+2.5;
  }
  reference(ref,x,y,w){
    const p=this.ensurePage(),pt=9.7,step=pt*1.2/MM,indent=12.7;
    const [author,title,tail,url]=ref;
    const tokens=[...author.split(/\s+/).map(t=>[t,false]),...title.split(/\s+/).map(t=>[t,'italic']),...tail.split(/\s+/).filter(Boolean).map(t=>[t,false])];
    let line=[],lineWidth=0,yy=y,first=true;
    const flush=()=>{let xx=x+(first?0:indent);for(const [word,st] of line){this.text(word,xx,yy,pt,st,C.text);xx+=tw(word+' ',pt,st);}yy+=step;first=false;line=[];lineWidth=0;};
    for(const token of tokens){const width=tw(token[0]+' ',pt,token[1]);if(line.length&&lineWidth+width>w-(first?0:indent))flush();line.push(token);lineWidth+=width;}
    if(line.length)flush();
    this.text(url,x+indent,yy,8.7,false,C.text,w-indent);
    const uh=wrap(url,w-indent,8.7).length*8.7*1.2/MM;
    p.links.push({x:x+indent,y:yy,w:w-indent,h:uh,url});
    return yy+uh+2.2;
  }
  finish(){
    const encoder=new TextEncoder(),objects=[];
    const allStreams=this.pages.map(p=>p.cmd.join('\n'));
    const joinedAll=allStreams.join('\n');
    const faces=[['F1','normal'],['F2','bold'],['F3','italic'],['F4','headline'],['F5','support'],['F6','identity']].filter(([id,role])=>FONTS?.[role]&&joinedAll.includes('/'+id+' '));
    // Fixed layout: 1=Catalog, 2=Pages, 3..3+N-1=Images, fonts, then for each page: Page obj, Content obj, Link annots
    objects.push(null); // 1 Catalog
    objects.push(null); // 2 Pages
    const imageObjNums={};
    this.images.forEach(im=>{
      const numObj=objects.length+1;
      imageObjNums[im.name]=numObj;
      objects.push(joinBytes([encoder.encode(`<< /Type /XObject /Subtype /Image /Width ${im.pxWidth} /Height ${im.pxHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>\nstream\n`),im.bytes,encoder.encode('\nendstream')]));
    });
    const fontObjNums={};
    faces.forEach(([id,role])=>{
      const f=FONTS[role],fontNum=objects.length+1,descNum=fontNum+1,fileNum=fontNum+2,cff=f.kind==='Type1C',data=Uint8Array.from(atob(f.data),c=>c.charCodeAt(0));
      fontObjNums[id]=fontNum;
      objects.push(encoder.encode(`<< /Type /Font /Subtype /${cff?'Type1':'TrueType'} /BaseFont /${f.name} /Encoding /WinAnsiEncoding /FirstChar 0 /LastChar 255 /Widths [${f.widths.join(' ')}] /FontDescriptor ${descNum} 0 R >>`));
      objects.push(encoder.encode(`<< /Type /FontDescriptor /FontName /${f.name} /Flags ${(role==='headline'?34:32)+(f.italicAngle?64:0)} /FontBBox [${f.bbox.join(' ')}] /ItalicAngle ${f.italicAngle} /Ascent ${f.ascent} /Descent ${f.descent} /CapHeight ${f.capHeight} /StemV 100 /FontFile${cff?'3':'2'} ${fileNum} 0 R >>`));
      objects.push(joinBytes([encoder.encode(`<< /Length ${data.length} ${cff?'/Subtype /Type1C':'/Length1 '+data.length} >>\nstream\n`),data,encoder.encode('\nendstream')]));
    });
    const pageObjNums=[];
    this.pages.forEach((p,idx)=>{
      const pageNum=objects.length+1,contentNum=pageNum+1;
      pageObjNums.push(pageNum);
      const linkNums=p.links.map((_,li)=>pageNum+2+li);
      const uniqueImgs=[...new Set(p.imageUses)];
      const fontMap=Object.entries(fontObjNums).map(([id,n])=>`/${id} ${n} 0 R`).join(' ');
      const xobjMap=uniqueImgs.length?'/XObject << '+uniqueImgs.map(name=>`/${name} ${imageObjNums[name]} 0 R`).join(' ')+' >>':'';
      const annots=linkNums.length?`/Annots [${linkNums.map(n=>n+' 0 R').join(' ')}]`:'';
      objects.push(encoder.encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W*MM} ${H*MM}] /Resources << /Font << ${fontMap} >> ${xobjMap} >> /Contents ${contentNum} 0 R ${annots} >>`));
      const cBytes=encoder.encode(allStreams[idx]);
      objects.push(joinBytes([encoder.encode(`<< /Length ${cBytes.length} >>\nstream\n`),cBytes,encoder.encode('\nendstream')]));
      p.links.forEach(l=>objects.push(encoder.encode(`<< /Type /Annot /Subtype /Link /Rect [${l.x*MM} ${(H-l.y-l.h)*MM} ${(l.x+l.w)*MM} ${(H-l.y)*MM}] /Border [0 0 0] /A << /S /URI /URI (${l.url.replace(/[()\\]/g,'\\$&')}) >> >>`)));
    });
    objects[0]=encoder.encode('<< /Type /Catalog /Pages 2 0 R >>');
    objects[1]=encoder.encode(`<< /Type /Pages /Kids [${pageObjNums.map(n=>n+' 0 R').join(' ')}] /Count ${pageObjNums.length} >>`);
    const parts=[encoder.encode('%PDF-1.4\n')],offsets=[0];let size=parts[0].length;
    objects.forEach((o,i)=>{offsets.push(size);const part=joinBytes([encoder.encode(`${i+1} 0 obj\n`),o,encoder.encode('\nendobj\n')]);parts.push(part);size+=part.length;});
    const xref=size;
    parts.push(encoder.encode(`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n ').join('\n')}\ntrailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`));
    return joinBytes(parts);
  }
}

function drawHeader(p,title,subtitle,logo){
  const h=PDFMOD.headerLayout(title,subtitle,'Carlos',logo?logo.pxHeight/logo.pxWidth:1496/4452,11.5);
  p.rect(11,0,203.5,43,C.blue);p.circle(214.5,21.5,21.5,C.blue);p.rect(11,40,W-22,3.5,C.blue);
  p.text(title,h.name.x,h.name.y,h.name.pt,'headline','#FFFFFF',h.name.w);
  if(subtitle)p.text(subtitle,h.identification.x,h.identification.y,h.identification.pt,'identity','#FFFFFF',h.identification.w);
  p.text(h.panorama.lines[0],h.panorama.x,h.panorama.y,h.panorama.pt,'headline',h.panorama.colors[0],h.panorama.w,'center');
  h.panorama.lines.slice(1).forEach((line,i)=>p.text(line,h.panorama.x,h.panorama.supportY+i*h.panorama.supportStep,h.panorama.supportPt,'headline',h.panorama.colors[i+1],h.panorama.w,'center'));
  if(logo)p.image(logo,h.logo.x,h.logo.y,h.logo.w,h.logo.h);
}
function drawFooter(p,pageLabel=''){
  p.text('Secretaría de Derechos Humanos · Gobierno del Estado de Guanajuato',11,412.5,9.5,false,'#717579',400);
  if(pageLabel)p.text(String(pageLabel),553,412.5,12,true,'#54585A',30,'right');
}

/**
 * Group the 107 community records alphabetically by municipality (A through M).
 */
function groupByMunicipality(records=[]){
  const map=new Map();
  records.forEach(r=>{
    const m=r['Municipio']||'Sin municipio';
    if(!map.has(m))map.set(m,[]);
    map.get(m).push(r);
  });
  return [...map.keys()].sort((a,b)=>a.localeCompare(b,'es')).map((municipio,idx)=>{
    const items=map.get(municipio);
    const totalPop=items.reduce((s,r)=>s+(num(r['Población Total'])||0),0);
    const totalViv=items.reduce((s,r)=>s+(num(r['Viviendas con caracteristicas']??r['Viviendas Particulares Habitadas'])||0),0);
    const pueblos=[...new Set(items.map(r=>r['Pueblo Originario']).filter(Boolean))];
    return {letter:String.fromCharCode(65+idx),municipio,items,totalPop,totalViv,pueblos};
  });
}

/**
 * Render Sheet: Internal title page ("Página con nombre del proyecto en grande").
 */
function renderProjectTitleSheet(logo=null){
  const p=new MultiPDF();p.addPage();
  p.rect(0,0,7,H,C.blue);p.rect(7,0,2.5,H,C.sky);
  if(logo){const r=logo.pxHeight/logo.pxWidth,lh=36,lw=lh/r;p.image(logo,(W-lw)/2,34,lw,lh);}
  p.rect(42,96,510,206,'#FFFFFF',C.softBorder,.45);
  p.rect(42,96,510,5,C.blue);
  p.text('SECRETARÍA DE DERECHOS HUMANOS · GOBIERNO DEL ESTADO DE GUANAJUATO',62,118,12.5,true,C.teal,470,'center');
  p.text('Panorama Sociodemográfico de los',62,146,35,'headline',C.blue,470,'center',1.15);
  p.text('Pueblos y Comunidades Indígenas y Afromexicanas',62,174,40,'headline',C.blue,470,'center',1.15);
  p.text('del Estado de Guanajuato',62,216,35,'headline',C.sky,470,'center',1.15);
  p.rect(227,246,140,1.6,C.sky);
  p.text('Comunidades registradas en el Padrón Estatal al 2026',62,262,15,true,C.text,470,'center');
  const cards=[
    ['107','Comunidades indígenas y afromexicanas reconocidas en el Padrón Estatal',C.blue],
    ['13','Municipios con presencia histórica y cultural en el estado de Guanajuato',C.teal],
    ['2020','Base estadística principal del Censo de Población y Vivienda (INEGI)',C.purple]
  ];
  cards.forEach(([big,desc,color],i)=>{
    const cx=42+i*174;
    p.rect(cx,322,162,48,C.soft,C.softBorder,.35);
    p.rect(cx,322,4,48,color);
    p.text(big,cx+12,331,26,'headline',color,140,'left');
    p.text(desc,cx+12,346,10,false,C.text,142,'left',1.25);
  });
  drawFooter(p);
  return {bytes:p.finish()};
}

/**
 * Render Sheet: Mensaje introductorio (verbatim from Mensaje introductorio.docx).
 */
function renderIntroMessageSheet(logo=null){
  const p=new MultiPDF();p.addPage();
  drawHeader(p,'Mensaje introductorio','Secretaría de Derechos Humanos',logo);
  let y=p.sectionTitle('Presentación institucional',11,53,572,'historia');
  p.rect(11,y+2,572,332,'#FAFBFD',C.softBorder,.35);
  p.rect(11,y+2,4,332,C.blue);
  p.text(EDITORIAL.mensaje.title,24,y+12,19,'headline',C.blue,546,'center',1.25);
  p.line(187,y+31,407,y+31,C.sky,1.1);
  const bodyY=y+42,paras=EDITORIAL.mensaje.paragraphs,half=Math.ceil(paras.length/2);
  let y1=bodyY,y2=bodyY;
  paras.slice(0,half).forEach(txt=>{y1+=p.justified(txt,28,y1,13.2,256,1.45,C.text)+9;});
  paras.slice(half).forEach(txt=>{y2+=p.justified(txt,310,y2,13.2,256,1.45,C.text)+9;});
  const sigY=Math.max(y2+8,354);
  p.line(310,sigY,566,sigY,C.line,.4);
  p.text('Secretaría de Derechos Humanos',310,sigY+5,13,true,C.blue,256,'right');
  p.text('Gobierno del Estado de Guanajuato',310,sigY+12,11,false,C.text,256,'right');
  drawFooter(p);
  return {bytes:p.finish()};
}

/**
 * Render Sheet: Índice general del documento consolidado.
 */
function renderTableOfContentsSheet(records=[],logo=null){
  const p=new MultiPDF();p.addPage();
  drawHeader(p,'Índice de contenido','Comunidades registradas en el Padrón al 2026',logo);
  let ly=p.sectionTitle('Estructura del documento',11,53,276,'historia');
  const entries=[
    ['I','Portada institucional','Diseño de cubierta principal (por integrar).'],
    ['II','Página titular','Panorama Sociodemográfico de los Pueblos y Comunidades Indígenas y Afromexicanas del Estado de Guanajuato.'],
    ['III','Mensaje introductorio','Presentación institucional de la Secretaría de Derechos Humanos.'],
    ['IV','Índice de contenido','Organización temática y directorio municipal alfabético (A–M).'],
    ['V','Padrón de comunidades','Listado oficial de las 107 localidades con Clave INEGI y municipio.'],
    ['VI','Lista de indicadores','Catálogo de los 90 indicadores organizados en 13 dimensiones.'],
    ['VII','Mapa de distribución territorial','Cartografía estatal con las 107 comunidades y ampliaciones regionales.'],
    ['VIII','Infografías por municipio (A–M)','Separadores municipales alfabéticos y 107 fichas sociodemográficas A2.'],
    ['IX','Guía metodológica y fuentes','Definiciones, fórmulas de cálculo, notas técnicas y referencias APA.']
  ];
  entries.forEach(([badge,title,desc],i)=>{
    p.rect(11,ly,276,28,i%2?C.soft:'#FFFFFF',C.line,.25);
    p.rect(15,ly+5,18,18,C.blue);
    p.text(badge,15,ly+9,11,'headline','#FFFFFF',18,'center');
    p.text(title,39,ly+4.5,12,true,C.blue,242);
    p.text(desc,39,ly+11.5,9.5,false,C.text,242,'left',1.25);
    ly+=31;
  });

  const groups=groupByMunicipality(records);
  let ry=p.sectionTitle('Infografías por municipio (orden alfabético A–M)',307,53,276,'territorio');
  const wL=16,wM=146,wC=34,wP=40,wV=40,hh=9,rh=21;
  p.rect(307,ry,276,hh,C.blue);
  p.text('Letra',309,ry+2.5,9,true,'#FFFFFF',wL);
  p.text('Municipio',307+wL+2,ry+2.5,9,true,'#FFFFFF',wM);
  p.text('Comunidades',307+wL+wM,ry+2.5,8.5,true,'#FFFFFF',wC-2,'right');
  p.text('Población',307+wL+wM+wC,ry+2.5,8.5,true,'#FFFFFF',wP-2,'right');
  p.text('Viviendas',307+wL+wM+wC+wP,ry+2.5,8.5,true,'#FFFFFF',wV-2,'right');
  ry+=hh;
  let offset=1;
  groups.forEach((g,idx)=>{
    p.rect(307,ry,276,rh,idx%2?C.soft:'#FFFFFF',C.line,.2);
    p.rect(310,ry+4,12,13,C.blue);
    p.text(g.letter,310,ry+7,11,'headline','#FFFFFF',12,'center');
    const mLines=wrap(g.municipio,wM-4,10,true),mTop=ry+(rh-mLines.length*4.2)/2-1;
    p.text(g.municipio,307+wL+2,mTop,10,true,C.blue,wM-4);
    p.text(`${offset}–${offset+g.items.length-1} (${g.items.length})`,307+wL+wM,ry+7,9.5,true,C.text,wC-2,'right');
    p.text(fmt(g.totalPop),307+wL+wM+wC,ry+7,9.5,false,C.text,wP-2,'right');
    p.text(fmt(g.totalViv),307+wL+wM+wC+wP,ry+7,9.5,false,C.text,wV-2,'right');
    offset+=g.items.length;
    ry+=rh;
  });
  const totalPop=groups.reduce((s,g)=>s+g.totalPop,0),totalViv=groups.reduce((s,g)=>s+g.totalViv,0);
  p.rect(307,ry,276,11,'#E9F2FA',C.blue,.35);
  p.text('Total Padrón Estatal (13 municipios)',307+6,ry+3,10,true,C.blue,wL+wM);
  p.text('107',307+wL+wM,ry+3,10,true,C.blue,wC-2,'right');
  p.text(fmt(totalPop),307+wL+wM+wC,ry+3,10,true,C.blue,wP-2,'right');
  p.text(fmt(totalViv),307+wL+wM+wC+wP,ry+3,10,true,C.blue,wV-2,'right');
  drawFooter(p);
  return {bytes:p.finish()};
}

/**
 * Render Sheet: Lista de indicadores (13 thematic sections balanced across 3 A2 columns).
 */
function renderIndicatorListSheet(logo=null){
  const p=new MultiPDF();p.addPage();
  drawHeader(p,'Lista de indicadores','Comunidades registradas en el Padrón al 2026',logo);
  const cols=[{x:11,y:54},{x:205,y:54},{x:399,y:54}],colW=184,pt=9.6,itemGap=1.7;
  EDITORIAL.lista.forEach((sec,idx)=>{
    const colIdx=idx<=4?0:idx<=9?1:2;
    const col=cols[colIdx];
    let y=p.sectionTitle(sec.title,col.x,col.y,colW,sec.icon,14);
    sec.items.forEach(it=>{
      p.circle(col.x+2.2,y+1.9,.9,C.sky);
      y+=p.text(it,col.x+6,y,pt,false,C.text,colW-6.5,'left',1.24)+itemGap;
    });
    col.y=y+4.2;
  });
  drawFooter(p);
  return {bytes:p.finish(),columnBottoms:cols.map(c=>c.y)};
}

/**
 * Render Sheet: Portadilla de la sección de infografías por municipio.
 */
function renderInfographicsCoverSheet(records=[],logo=null){
  const p=new MultiPDF();p.addPage();
  drawHeader(p,'Infografías por Municipio y Comunidad','107 comunidades · 13 municipios · Orden alfabético A–M',logo);
  const groups=groupByMunicipality(records);
  const introY=p.sectionTitle('Sección de infografías sociodemográficas por municipio',11,53,572,'territorio');
  const colW=185,gapX=8.5,cardH=60,gapY=6;
  groups.forEach((g,idx)=>{
    const c=idx%3,r=Math.floor(idx/3),cx=11+c*(colW+gapX),cy=introY+2+r*(cardH+gapY);
    p.rect(cx,cy,colW,cardH,'#FFFFFF',C.line,.35);
    p.rect(cx,cy,colW,2,C.blue);
    p.rect(cx+5,cy+7,18,18,C.blue);
    p.text(g.letter,cx+5,cy+11,13,'headline','#FFFFFF',18,'center');
    p.text(g.municipio,cx+27,cy+7,11.5,true,C.blue,colW-32,'left',1.15);
    p.text(`${g.items.length} ${g.items.length===1?'comunidad':'comunidades'} · ${g.pueblos.join(', ')}`,cx+27,cy+17.5,8.5,false,C.teal,colW-32);
    p.line(cx+5,cy+29,cx+colW-5,cy+29,C.line,.25);
    const names=g.items.map(it=>it['Comunidad / Localidad']).join(' · ');
    p.text(names,cx+5,cy+32,8.1,false,C.text,colW-10,'left',1.18);
  });
  drawFooter(p);
  return {bytes:p.finish()};
}

/**
 * Render all 13 municipality separator sheets (A–M) as a multi-page A2 PDF (or per-group).
 */
function drawMunicipalitySeparatorPage(p,g,logo){
  p.addPage();
  drawHeader(p,`Municipio ${g.letter}: ${g.municipio}`,'Comunidades registradas en el Padrón al 2026',logo);
  p.rect(11,52,572,38,C.soft,C.softBorder,.35);
  p.rect(16,57,28,28,C.blue);
  p.text(g.letter,16,62.5,24,'headline','#FFFFFF',28,'center');
  p.text(g.municipio,52,58,20,'headline',C.blue,285,'left',1.15);
  p.text(`Pueblo(s) originario(s): ${g.pueblos.join(', ')}`,52,74,10.5,true,C.teal,285);
  const kpis=[
    ['Comunidades',String(g.items.length),C.blue],
    ['Población total',fmt(g.totalPop),C.teal],
    ['Viviendas habitadas',fmt(g.totalViv),C.purple]
  ];
  kpis.forEach(([lbl,val,col],i)=>{
    const kx=346+i*78;
    p.rect(kx,57,74,28,'#FFFFFF',C.line,.25);
    p.rect(kx,57,74,2,col);
    p.text(lbl,kx+4,60.5,8.5,false,C.text,66,'center');
    p.text(val,kx+4,68.5,15,'headline',col,66,'center');
  });

  let y=98;
  const cols=[['#',16,'center'],['Clave INEGI',36,'left'],['Comunidad / Localidad',165,'left'],['Pueblo originario',75,'left'],['Año rec.',34,'center'],['Población total',56,'right'],['Hombres',56,'right'],['Mujeres',56,'right'],['Viviendas hab.',78,'right']];
  const hh=9,rh=g.items.length>22?8.5:10;
  p.rect(11,y,572,hh,C.blue);
  let cx=11;
  cols.forEach(([title,cw,align])=>{
    p.text(title,cx+3,y+2.5,9,true,'#FFFFFF',cw-6,align);
    cx+=cw;
  });
  y+=hh;
  g.items.forEach((r,idx)=>{
    p.rect(11,y,572,rh,idx%2?C.soft:'#FFFFFF',C.line,.18);
    const viv=r['Viviendas con caracteristicas']??r['Viviendas Particulares Habitadas'];
    const row=[
      String(idx+1),
      String(r['Clave INEGI']||''),
      String(r['Comunidad / Localidad']||''),
      String(r['Pueblo Originario']||''),
      String(r['Año Reconocimiento']||''),
      fmt(r['Población Total']),
      fmt(r['Población Hombres']),
      fmt(r['Población Mujeres']),
      fmt(viv)
    ];
    let rx=11;
    row.forEach((cell,ci)=>{
      const [,cw,align]=cols[ci];
      const bold=ci===2;
      const color=ci===2?C.blue:C.text;
      p.text(cell,rx+3,y+(rh-3.6)/2,9,bold,color,cw-6,align);
      rx+=cw;
    });
    y+=rh;
  });
  drawFooter(p);
}

function renderMunicipalitySeparatorsPdf(records=[],logo=null){
  const p=new MultiPDF(),groups=groupByMunicipality(records);
  groups.forEach(g=>drawMunicipalitySeparatorPage(p,g,logo));
  return {bytes:p.finish(),groups};
}

/**
 * Draw a 2x4 fraction equation block cleanly inside width w. Returns total height consumed.
 */
function formulaBlock(p,rows,x,y,w,measureOnly=false){
  const lhs=rows[0][0],eq=rows[0][1]||'=',numTxt=rows[0][2],mult=rows[0][3]||'',denTxt=rows[1][2];
  const pt=8.5,step=pt*1.18/MM;
  const maxLhsW=Math.min(w*0.36,tw(lhs,pt,true)+2),multW=mult?tw(mult,pt,true)+3:0;
  const rhsAvail=w-maxLhsW-14-multW-8;
  const lhsLines=wrap(lhs,maxLhsW,pt,true);
  const numLines=wrap(numTxt,rhsAvail,pt,false);
  const denLines=wrap(denTxt,rhsAvail,pt,false);
  const fracW=Math.max(24,Math.min(rhsAvail,Math.max(...numLines.map(l=>tw(l,pt,false)),...denLines.map(l=>tw(l,pt,false)))+6));
  const fracH=(numLines.length+denLines.length)*step+4.2;
  const boxH=Math.max(fracH+4,lhsLines.length*step+5);
  if(!measureOnly){
    p.rect(x,y,w,boxH,C.soft,C.softBorder,.22);
    p.rect(x,y,1.4,boxH,C.sky);
    const lhsY=y+(boxH-lhsLines.length*step)/2+.3;
    lhsLines.forEach((l,i)=>p.text(l,x+4,lhsY+i*step,pt,true,C.blue,maxLhsW,'left',1.18));
    const eqX=x+4+maxLhsW+2,midY=y+boxH/2;
    p.text(eq,eqX,midY-1.8,9,true,C.text,6,'center');
    const fx=eqX+7;
    const numY=y+(boxH-fracH)/2+1;
    numLines.forEach((l,i)=>p.text(l,fx,numY+i*step,pt,false,C.text,fracW,'center',1.18));
    const barY=numY+numLines.length*step+1;
    p.line(fx,barY,fx+fracW,barY,C.blue,.35);
    denLines.forEach((l,i)=>p.text(l,fx,barY+1.4+i*step,pt,false,C.text,fracW,'center',1.18));
    if(mult)p.text(mult,fx+fracW+2.5,barY-1.8,pt,true,C.blue,multW,'left');
  }
  return boxH+2;
}

/**
 * Render multi-page A2 Guía metodológica (intro, 13 sections, 90 indicators, 79 formulas, 6 APA references).
 */
function renderMethodologicalGuidePdf(logo=null){
  const p=new MultiPDF();
  const colXs=[11,305],colW=278,topY=53,maxY=399;
  let colIdx=0,y=topY,pageNo=1;
  const openPage=()=>{
    p.addPage();
    drawHeader(p,'Guía metodológica','Definiciones, criterios de cálculo y fuentes de los indicadores',logo);
    drawFooter(p,String(pageNo));
    colIdx=0;y=topY;
  };
  const advance=(needed)=>{
    if(y+needed<=maxY)return;
    if(colIdx===0){colIdx=1;y=topY;}
    else{pageNo++;openPage();}
  };
  openPage();

  // Intro box
  const introPads=4;
  const introH=EDITORIAL.guia.intro.reduce((s,t)=>s+wrap(t,colW-8,9.5,false).length*9.5*1.25/MM+2,0)+introPads*2;
  p.rect(colXs[0],y,colW,introH,C.soft,C.softBorder,.25);
  p.rect(colXs[0],y,2,introH,C.blue);
  let iy=y+introPads;
  EDITORIAL.guia.intro.forEach(t=>{iy+=p.text(t,colXs[0]+5,iy,9.5,false,C.text,colW-9,'left',1.25)+2;});
  y+=introH+5;

  const measureInd=(ind)=>{
    let h=wrap(ind.title,colW,10,true).length*10*1.2/MM+1.2;
    ind.blocks.forEach(b=>{
      if(b.type==='text'){
        h+=b.text.startsWith('Nota:')?p.note(b.text,0,0,8.7,C.text,colW,true)+1.5:wrap(b.text,colW,9.2,false).length*9.2*1.25/MM+1.5;
      }else h+=formulaBlock(p,b.rows,0,0,colW,true);
    });
    return h+2.8;
  };

  EDITORIAL.guia.sections.forEach(sec=>{
    const secNotesH=sec.notes.reduce((s,n)=>s+(n.startsWith('Nota:')?p.note(n,0,0,8.7,C.text,colW,true):wrap(n,colW,9,false).length*9*1.25/MM)+2,0);
    const firstIndH=sec.indicators.length?measureInd(sec.indicators[0]):0;
    advance(12+secNotesH+Math.min(firstIndH,40));
    y=p.sectionTitle(sec.title,colXs[colIdx],y,colW,sec.icon,13.5);
    sec.notes.forEach(n=>{
      y+=(n.startsWith('Nota:')?p.note(n,colXs[colIdx],y,8.7,C.text,colW):p.text(n,colXs[colIdx],y,9,false,C.text,colW,'left',1.25))+2;
    });
    sec.indicators.forEach(ind=>{
      const ih=measureInd(ind);
      advance(ih);
      const cx=colXs[colIdx];
      y+=p.text(ind.title,cx,y,10,true,C.blue,colW,'left',1.2)+1;
      ind.blocks.forEach(b=>{
        if(b.type==='text'){
          y+=(b.text.startsWith('Nota:')?p.note(b.text,cx,y,8.7,C.text,colW):p.text(b.text,cx,y,9.2,false,C.text,colW,'left',1.25))+1.5;
        }else y+=formulaBlock(p,b.rows,cx,y,colW,false);
      });
      y+=2.5;
    });
    y+=2;
  });

  // Fuentes y referencias
  const refBlockH=13+PDFMOD.refs.length*15;
  advance(Math.min(refBlockH,70));
  y=p.sectionTitle('Fuentes y referencias',colXs[colIdx],y,colW,'fuentes',13.5);
  PDFMOD.refs.forEach(r=>{
    advance(16);
    y=p.reference(r,colXs[colIdx],y,colW);
  });

  return {bytes:p.finish(),pageCount:p.pages.length};
}

const api={EDITORIAL,MultiPDF,groupByMunicipality,renderProjectTitleSheet,renderIntroMessageSheet,renderTableOfContentsSheet,renderIndicatorListSheet,renderInfographicsCoverSheet,renderMunicipalitySeparatorsPdf,renderMethodologicalGuidePdf};
root.SDH_CONSOLIDADO=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

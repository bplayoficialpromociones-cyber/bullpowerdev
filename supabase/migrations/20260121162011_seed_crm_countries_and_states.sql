/*
  # Datos Iniciales CRM - Países y Estados

  ## Contenido
  1. Países del Mundo (195 países reconocidos por la ONU)
  2. Provincias/Estados de América Latina (completo)
  3. Estados principales de otros países relevantes
  4. Tipos de Cliente iniciales
  5. Cargos/Posiciones iniciales comunes

  ## Nota
  Se incluyen todos los países y los estados/provincias de:
  - LATAM completo: Argentina, Brasil, Chile, Uruguay, Paraguay, Bolivia, Perú, 
    Ecuador, Colombia, Venezuela, México, América Central, Caribe
  - Principales estados de: USA, Canadá, España, Reino Unido, otros relevantes
*/

-- =====================================================
-- PAÍSES DEL MUNDO (195 países)
-- =====================================================

-- América del Sur
INSERT INTO crm_countries (name, code) VALUES
  ('Argentina', 'AR'),
  ('Brasil', 'BR'),
  ('Chile', 'CL'),
  ('Uruguay', 'UY'),
  ('Paraguay', 'PY'),
  ('Bolivia', 'BO'),
  ('Perú', 'PE'),
  ('Ecuador', 'EC'),
  ('Colombia', 'CO'),
  ('Venezuela', 'VE'),
  ('Guyana', 'GY'),
  ('Surinam', 'SR'),
  ('Guayana Francesa', 'GF')
ON CONFLICT (code) DO NOTHING;

-- América Central
INSERT INTO crm_countries (name, code) VALUES
  ('México', 'MX'),
  ('Guatemala', 'GT'),
  ('Belice', 'BZ'),
  ('El Salvador', 'SV'),
  ('Honduras', 'HN'),
  ('Nicaragua', 'NI'),
  ('Costa Rica', 'CR'),
  ('Panamá', 'PA')
ON CONFLICT (code) DO NOTHING;

-- Caribe
INSERT INTO crm_countries (name, code) VALUES
  ('Cuba', 'CU'),
  ('República Dominicana', 'DO'),
  ('Haití', 'HT'),
  ('Jamaica', 'JM'),
  ('Puerto Rico', 'PR'),
  ('Trinidad y Tobago', 'TT'),
  ('Bahamas', 'BS'),
  ('Barbados', 'BB'),
  ('Santa Lucía', 'LC'),
  ('Granada', 'GD'),
  ('San Vicente y las Granadinas', 'VC'),
  ('Antigua y Barbuda', 'AG'),
  ('Dominica', 'DM'),
  ('San Cristóbal y Nieves', 'KN')
ON CONFLICT (code) DO NOTHING;

-- América del Norte
INSERT INTO crm_countries (name, code) VALUES
  ('Estados Unidos', 'US'),
  ('Canadá', 'CA')
ON CONFLICT (code) DO NOTHING;

-- Europa Occidental
INSERT INTO crm_countries (name, code) VALUES
  ('España', 'ES'),
  ('Portugal', 'PT'),
  ('Francia', 'FR'),
  ('Italia', 'IT'),
  ('Alemania', 'DE'),
  ('Reino Unido', 'GB'),
  ('Irlanda', 'IE'),
  ('Países Bajos', 'NL'),
  ('Bélgica', 'BE'),
  ('Luxemburgo', 'LU'),
  ('Suiza', 'CH'),
  ('Austria', 'AT'),
  ('Grecia', 'GR'),
  ('Dinamarca', 'DK'),
  ('Suecia', 'SE'),
  ('Noruega', 'NO'),
  ('Finlandia', 'FI'),
  ('Islandia', 'IS'),
  ('Malta', 'MT'),
  ('Chipre', 'CY'),
  ('Mónaco', 'MC'),
  ('Andorra', 'AD'),
  ('San Marino', 'SM'),
  ('Liechtenstein', 'LI'),
  ('Ciudad del Vaticano', 'VA')
ON CONFLICT (code) DO NOTHING;

-- Europa del Este
INSERT INTO crm_countries (name, code) VALUES
  ('Polonia', 'PL'),
  ('República Checa', 'CZ'),
  ('Eslovaquia', 'SK'),
  ('Hungría', 'HU'),
  ('Rumania', 'RO'),
  ('Bulgaria', 'BG'),
  ('Croacia', 'HR'),
  ('Eslovenia', 'SI'),
  ('Serbia', 'RS'),
  ('Bosnia y Herzegovina', 'BA'),
  ('Montenegro', 'ME'),
  ('Macedonia del Norte', 'MK'),
  ('Albania', 'AL'),
  ('Kosovo', 'XK'),
  ('Ucrania', 'UA'),
  ('Bielorrusia', 'BY'),
  ('Moldavia', 'MD'),
  ('Rusia', 'RU'),
  ('Estonia', 'EE'),
  ('Letonia', 'LV'),
  ('Lituania', 'LT')
ON CONFLICT (code) DO NOTHING;

-- Asia
INSERT INTO crm_countries (name, code) VALUES
  ('China', 'CN'),
  ('Japón', 'JP'),
  ('Corea del Sur', 'KR'),
  ('Corea del Norte', 'KP'),
  ('India', 'IN'),
  ('Pakistán', 'PK'),
  ('Bangladesh', 'BD'),
  ('Sri Lanka', 'LK'),
  ('Nepal', 'NP'),
  ('Bután', 'BT'),
  ('Maldivas', 'MV'),
  ('Afganistán', 'AF'),
  ('Irán', 'IR'),
  ('Irak', 'IQ'),
  ('Turquía', 'TR'),
  ('Arabia Saudita', 'SA'),
  ('Emiratos Árabes Unidos', 'AE'),
  ('Qatar', 'QA'),
  ('Kuwait', 'KW'),
  ('Bahréin', 'BH'),
  ('Omán', 'OM'),
  ('Yemen', 'YE'),
  ('Siria', 'SY'),
  ('Jordania', 'JO'),
  ('Líbano', 'LB'),
  ('Israel', 'IL'),
  ('Palestina', 'PS'),
  ('Tailandia', 'TH'),
  ('Vietnam', 'VN'),
  ('Malasia', 'MY'),
  ('Singapur', 'SG'),
  ('Indonesia', 'ID'),
  ('Filipinas', 'PH'),
  ('Myanmar', 'MM'),
  ('Camboya', 'KH'),
  ('Laos', 'LA'),
  ('Brunéi', 'BN'),
  ('Timor Oriental', 'TL'),
  ('Mongolia', 'MN'),
  ('Kazajistán', 'KZ'),
  ('Uzbekistán', 'UZ'),
  ('Turkmenistán', 'TM'),
  ('Kirguistán', 'KG'),
  ('Tayikistán', 'TJ'),
  ('Armenia', 'AM'),
  ('Azerbaiyán', 'AZ'),
  ('Georgia', 'GE')
ON CONFLICT (code) DO NOTHING;

-- África
INSERT INTO crm_countries (name, code) VALUES
  ('Egipto', 'EG'),
  ('Sudáfrica', 'ZA'),
  ('Nigeria', 'NG'),
  ('Kenia', 'KE'),
  ('Marruecos', 'MA'),
  ('Túnez', 'TN'),
  ('Argelia', 'DZ'),
  ('Libia', 'LY'),
  ('Etiopía', 'ET'),
  ('Ghana', 'GH'),
  ('Costa de Marfil', 'CI'),
  ('Senegal', 'SN'),
  ('Camerún', 'CM'),
  ('Angola', 'AO'),
  ('Mozambique', 'MZ'),
  ('Madagascar', 'MG'),
  ('Zimbabue', 'ZW'),
  ('Botsuana', 'BW'),
  ('Namibia', 'NA'),
  ('Tanzania', 'TZ'),
  ('Uganda', 'UG'),
  ('Ruanda', 'RW'),
  ('Burundi', 'BI'),
  ('Sudán', 'SD'),
  ('Sudán del Sur', 'SS'),
  ('Somalia', 'SO'),
  ('Yibuti', 'DJ'),
  ('Eritrea', 'ER'),
  ('Malaui', 'MW'),
  ('Zambia', 'ZM'),
  ('República Democrática del Congo', 'CD'),
  ('República del Congo', 'CG'),
  ('Gabón', 'GA'),
  ('Guinea Ecuatorial', 'GQ'),
  ('Chad', 'TD'),
  ('Níger', 'NE'),
  ('Malí', 'ML'),
  ('Burkina Faso', 'BF'),
  ('Mauritania', 'MR'),
  ('Benín', 'BJ'),
  ('Togo', 'TG'),
  ('Sierra Leona', 'SL'),
  ('Liberia', 'LR'),
  ('Guinea', 'GN'),
  ('Guinea-Bisáu', 'GW'),
  ('Gambia', 'GM'),
  ('Cabo Verde', 'CV'),
  ('Santo Tomé y Príncipe', 'ST'),
  ('Mauricio', 'MU'),
  ('Seychelles', 'SC'),
  ('Comoras', 'KM'),
  ('Lesoto', 'LS'),
  ('Suazilandia', 'SZ')
ON CONFLICT (code) DO NOTHING;

-- Oceanía
INSERT INTO crm_countries (name, code) VALUES
  ('Australia', 'AU'),
  ('Nueva Zelanda', 'NZ'),
  ('Papúa Nueva Guinea', 'PG'),
  ('Fiyi', 'FJ'),
  ('Islas Salomón', 'SB'),
  ('Vanuatu', 'VU'),
  ('Samoa', 'WS'),
  ('Tonga', 'TO'),
  ('Micronesia', 'FM'),
  ('Palaos', 'PW'),
  ('Islas Marshall', 'MH'),
  ('Kiribati', 'KI'),
  ('Nauru', 'NR'),
  ('Tuvalu', 'TV')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- PROVINCIAS/ESTADOS DE AMÉRICA LATINA (COMPLETO)
-- =====================================================

-- ARGENTINA (24 provincias)
INSERT INTO crm_states (country_id, name)
SELECT id, province FROM crm_countries, (VALUES
  ('Buenos Aires'),
  ('Catamarca'),
  ('Chaco'),
  ('Chubut'),
  ('Córdoba'),
  ('Corrientes'),
  ('Entre Ríos'),
  ('Formosa'),
  ('Jujuy'),
  ('La Pampa'),
  ('La Rioja'),
  ('Mendoza'),
  ('Misiones'),
  ('Neuquén'),
  ('Río Negro'),
  ('Salta'),
  ('San Juan'),
  ('San Luis'),
  ('Santa Cruz'),
  ('Santa Fe'),
  ('Santiago del Estero'),
  ('Tierra del Fuego'),
  ('Tucumán'),
  ('Ciudad Autónoma de Buenos Aires')
) AS provinces(province)
WHERE code = 'AR'
ON CONFLICT (country_id, name) DO NOTHING;

-- BRASIL (27 estados)
INSERT INTO crm_states (country_id, name)
SELECT id, state FROM crm_countries, (VALUES
  ('Acre'),
  ('Alagoas'),
  ('Amapá'),
  ('Amazonas'),
  ('Bahia'),
  ('Ceará'),
  ('Distrito Federal'),
  ('Espírito Santo'),
  ('Goiás'),
  ('Maranhão'),
  ('Mato Grosso'),
  ('Mato Grosso do Sul'),
  ('Minas Gerais'),
  ('Pará'),
  ('Paraíba'),
  ('Paraná'),
  ('Pernambuco'),
  ('Piauí'),
  ('Rio de Janeiro'),
  ('Rio Grande do Norte'),
  ('Rio Grande do Sul'),
  ('Rondônia'),
  ('Roraima'),
  ('Santa Catarina'),
  ('São Paulo'),
  ('Sergipe'),
  ('Tocantins')
) AS states(state)
WHERE code = 'BR'
ON CONFLICT (country_id, name) DO NOTHING;

-- CHILE (16 regiones)
INSERT INTO crm_states (country_id, name)
SELECT id, region FROM crm_countries, (VALUES
  ('Arica y Parinacota'),
  ('Tarapacá'),
  ('Antofagasta'),
  ('Atacama'),
  ('Coquimbo'),
  ('Valparaíso'),
  ('Metropolitana de Santiago'),
  ('O''Higgins'),
  ('Maule'),
  ('Ñuble'),
  ('Biobío'),
  ('Araucanía'),
  ('Los Ríos'),
  ('Los Lagos'),
  ('Aysén'),
  ('Magallanes')
) AS regions(region)
WHERE code = 'CL'
ON CONFLICT (country_id, name) DO NOTHING;

-- URUGUAY (19 departamentos)
INSERT INTO crm_states (country_id, name)
SELECT id, dept FROM crm_countries, (VALUES
  ('Montevideo'),
  ('Artigas'),
  ('Canelones'),
  ('Cerro Largo'),
  ('Colonia'),
  ('Durazno'),
  ('Flores'),
  ('Florida'),
  ('Lavalleja'),
  ('Maldonado'),
  ('Paysandú'),
  ('Río Negro'),
  ('Rivera'),
  ('Rocha'),
  ('Salto'),
  ('San José'),
  ('Soriano'),
  ('Tacuarembó'),
  ('Treinta y Tres')
) AS depts(dept)
WHERE code = 'UY'
ON CONFLICT (country_id, name) DO NOTHING;

-- PARAGUAY (17 departamentos + Capital)
INSERT INTO crm_states (country_id, name)
SELECT id, dept FROM crm_countries, (VALUES
  ('Asunción'),
  ('Concepción'),
  ('San Pedro'),
  ('Cordillera'),
  ('Guairá'),
  ('Caaguazú'),
  ('Caazapá'),
  ('Itapúa'),
  ('Misiones'),
  ('Paraguarí'),
  ('Alto Paraná'),
  ('Central'),
  ('Ñeembucú'),
  ('Amambay'),
  ('Canindeyú'),
  ('Presidente Hayes'),
  ('Alto Paraguay'),
  ('Boquerón')
) AS depts(dept)
WHERE code = 'PY'
ON CONFLICT (country_id, name) DO NOTHING;

-- BOLIVIA (9 departamentos)
INSERT INTO crm_states (country_id, name)
SELECT id, dept FROM crm_countries, (VALUES
  ('La Paz'),
  ('Cochabamba'),
  ('Santa Cruz'),
  ('Potosí'),
  ('Oruro'),
  ('Chuquisaca'),
  ('Tarija'),
  ('Beni'),
  ('Pando')
) AS depts(dept)
WHERE code = 'BO'
ON CONFLICT (country_id, name) DO NOTHING;

-- PERÚ (25 regiones)
INSERT INTO crm_states (country_id, name)
SELECT id, region FROM crm_countries, (VALUES
  ('Lima'),
  ('Amazonas'),
  ('Áncash'),
  ('Apurímac'),
  ('Arequipa'),
  ('Ayacucho'),
  ('Cajamarca'),
  ('Callao'),
  ('Cusco'),
  ('Huancavelica'),
  ('Huánuco'),
  ('Ica'),
  ('Junín'),
  ('La Libertad'),
  ('Lambayeque'),
  ('Loreto'),
  ('Madre de Dios'),
  ('Moquegua'),
  ('Pasco'),
  ('Piura'),
  ('Puno'),
  ('San Martín'),
  ('Tacna'),
  ('Tumbes'),
  ('Ucayali')
) AS regions(region)
WHERE code = 'PE'
ON CONFLICT (country_id, name) DO NOTHING;

-- ECUADOR (24 provincias)
INSERT INTO crm_states (country_id, name)
SELECT id, province FROM crm_countries, (VALUES
  ('Pichincha'),
  ('Guayas'),
  ('Azuay'),
  ('Manabí'),
  ('El Oro'),
  ('Tungurahua'),
  ('Los Ríos'),
  ('Esmeraldas'),
  ('Chimborazo'),
  ('Cotopaxi'),
  ('Imbabura'),
  ('Loja'),
  ('Carchi'),
  ('Bolívar'),
  ('Cañar'),
  ('Santo Domingo de los Tsáchilas'),
  ('Santa Elena'),
  ('Pastaza'),
  ('Morona Santiago'),
  ('Napo'),
  ('Zamora Chinchipe'),
  ('Sucumbíos'),
  ('Orellana'),
  ('Galápagos')
) AS provinces(province)
WHERE code = 'EC'
ON CONFLICT (country_id, name) DO NOTHING;

-- COLOMBIA (33 departamentos)
INSERT INTO crm_states (country_id, name)
SELECT id, dept FROM crm_countries, (VALUES
  ('Amazonas'),
  ('Antioquia'),
  ('Arauca'),
  ('Atlántico'),
  ('Bolívar'),
  ('Boyacá'),
  ('Caldas'),
  ('Caquetá'),
  ('Casanare'),
  ('Cauca'),
  ('Cesar'),
  ('Chocó'),
  ('Córdoba'),
  ('Cundinamarca'),
  ('Guainía'),
  ('Guaviare'),
  ('Huila'),
  ('La Guajira'),
  ('Magdalena'),
  ('Meta'),
  ('Nariño'),
  ('Norte de Santander'),
  ('Putumayo'),
  ('Quindío'),
  ('Risaralda'),
  ('San Andrés y Providencia'),
  ('Santander'),
  ('Sucre'),
  ('Tolima'),
  ('Valle del Cauca'),
  ('Vaupés'),
  ('Vichada'),
  ('Bogotá D.C.')
) AS depts(dept)
WHERE code = 'CO'
ON CONFLICT (country_id, name) DO NOTHING;

-- VENEZUELA (23 estados + Distrito Capital)
INSERT INTO crm_states (country_id, name)
SELECT id, state FROM crm_countries, (VALUES
  ('Distrito Capital'),
  ('Amazonas'),
  ('Anzoátegui'),
  ('Apure'),
  ('Aragua'),
  ('Barinas'),
  ('Bolívar'),
  ('Carabobo'),
  ('Cojedes'),
  ('Delta Amacuro'),
  ('Falcón'),
  ('Guárico'),
  ('Lara'),
  ('Mérida'),
  ('Miranda'),
  ('Monagas'),
  ('Nueva Esparta'),
  ('Portuguesa'),
  ('Sucre'),
  ('Táchira'),
  ('Trujillo'),
  ('Vargas'),
  ('Yaracuy'),
  ('Zulia')
) AS states(state)
WHERE code = 'VE'
ON CONFLICT (country_id, name) DO NOTHING;

-- MÉXICO (32 estados)
INSERT INTO crm_states (country_id, name)
SELECT id, state FROM crm_countries, (VALUES
  ('Aguascalientes'),
  ('Baja California'),
  ('Baja California Sur'),
  ('Campeche'),
  ('Chiapas'),
  ('Chihuahua'),
  ('Ciudad de México'),
  ('Coahuila'),
  ('Colima'),
  ('Durango'),
  ('Guanajuato'),
  ('Guerrero'),
  ('Hidalgo'),
  ('Jalisco'),
  ('México'),
  ('Michoacán'),
  ('Morelos'),
  ('Nayarit'),
  ('Nuevo León'),
  ('Oaxaca'),
  ('Puebla'),
  ('Querétaro'),
  ('Quintana Roo'),
  ('San Luis Potosí'),
  ('Sinaloa'),
  ('Sonora'),
  ('Tabasco'),
  ('Tamaulipas'),
  ('Tlaxcala'),
  ('Veracruz'),
  ('Yucatán'),
  ('Zacatecas')
) AS states(state)
WHERE code = 'MX'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- ESTADOS DE OTROS PAÍSES RELEVANTES
-- =====================================================

-- ESTADOS UNIDOS (50 estados)
INSERT INTO crm_states (country_id, name)
SELECT id, state FROM crm_countries, (VALUES
  ('Alabama'), ('Alaska'), ('Arizona'), ('Arkansas'), ('California'),
  ('Colorado'), ('Connecticut'), ('Delaware'), ('Florida'), ('Georgia'),
  ('Hawaii'), ('Idaho'), ('Illinois'), ('Indiana'), ('Iowa'),
  ('Kansas'), ('Kentucky'), ('Louisiana'), ('Maine'), ('Maryland'),
  ('Massachusetts'), ('Michigan'), ('Minnesota'), ('Mississippi'), ('Missouri'),
  ('Montana'), ('Nebraska'), ('Nevada'), ('New Hampshire'), ('New Jersey'),
  ('New Mexico'), ('New York'), ('North Carolina'), ('North Dakota'), ('Ohio'),
  ('Oklahoma'), ('Oregon'), ('Pennsylvania'), ('Rhode Island'), ('South Carolina'),
  ('South Dakota'), ('Tennessee'), ('Texas'), ('Utah'), ('Vermont'),
  ('Virginia'), ('Washington'), ('West Virginia'), ('Wisconsin'), ('Wyoming')
) AS states(state)
WHERE code = 'US'
ON CONFLICT (country_id, name) DO NOTHING;

-- CANADÁ (13 provincias y territorios)
INSERT INTO crm_states (country_id, name)
SELECT id, province FROM crm_countries, (VALUES
  ('Alberta'),
  ('British Columbia'),
  ('Manitoba'),
  ('New Brunswick'),
  ('Newfoundland and Labrador'),
  ('Northwest Territories'),
  ('Nova Scotia'),
  ('Nunavut'),
  ('Ontario'),
  ('Prince Edward Island'),
  ('Quebec'),
  ('Saskatchewan'),
  ('Yukon')
) AS provinces(province)
WHERE code = 'CA'
ON CONFLICT (country_id, name) DO NOTHING;

-- ESPAÑA (17 comunidades autónomas + 2 ciudades autónomas)
INSERT INTO crm_states (country_id, name)
SELECT id, region FROM crm_countries, (VALUES
  ('Andalucía'),
  ('Aragón'),
  ('Asturias'),
  ('Islas Baleares'),
  ('Canarias'),
  ('Cantabria'),
  ('Castilla y León'),
  ('Castilla-La Mancha'),
  ('Cataluña'),
  ('Comunidad Valenciana'),
  ('Extremadura'),
  ('Galicia'),
  ('Madrid'),
  ('Murcia'),
  ('Navarra'),
  ('País Vasco'),
  ('La Rioja'),
  ('Ceuta'),
  ('Melilla')
) AS regions(region)
WHERE code = 'ES'
ON CONFLICT (country_id, name) DO NOTHING;

-- PORTUGAL (18 distritos)
INSERT INTO crm_states (country_id, name)
SELECT id, district FROM crm_countries, (VALUES
  ('Aveiro'), ('Beja'), ('Braga'), ('Bragança'), ('Castelo Branco'),
  ('Coimbra'), ('Évora'), ('Faro'), ('Guarda'), ('Leiria'),
  ('Lisboa'), ('Portalegre'), ('Porto'), ('Santarém'), ('Setúbal'),
  ('Viana do Castelo'), ('Vila Real'), ('Viseu'),
  ('Açores'), ('Madeira')
) AS districts(district)
WHERE code = 'PT'
ON CONFLICT (country_id, name) DO NOTHING;

-- REINO UNIDO (4 naciones constituyentes)
INSERT INTO crm_states (country_id, name)
SELECT id, nation FROM crm_countries, (VALUES
  ('England'),
  ('Scotland'),
  ('Wales'),
  ('Northern Ireland')
) AS nations(nation)
WHERE code = 'GB'
ON CONFLICT (country_id, name) DO NOTHING;

-- ITALIA (20 regiones)
INSERT INTO crm_states (country_id, name)
SELECT id, region FROM crm_countries, (VALUES
  ('Abruzzo'), ('Basilicata'), ('Calabria'), ('Campania'), ('Emilia-Romagna'),
  ('Friuli-Venezia Giulia'), ('Lazio'), ('Liguria'), ('Lombardia'), ('Marche'),
  ('Molise'), ('Piemonte'), ('Puglia'), ('Sardegna'), ('Sicilia'),
  ('Toscana'), ('Trentino-Alto Adige'), ('Umbria'), ('Valle d''Aosta'), ('Veneto')
) AS regions(region)
WHERE code = 'IT'
ON CONFLICT (country_id, name) DO NOTHING;

-- ALEMANIA (16 estados)
INSERT INTO crm_states (country_id, name)
SELECT id, state FROM crm_countries, (VALUES
  ('Baden-Württemberg'), ('Bayern'), ('Berlin'), ('Brandenburg'), ('Bremen'),
  ('Hamburg'), ('Hessen'), ('Mecklenburg-Vorpommern'), ('Niedersachsen'),
  ('Nordrhein-Westfalen'), ('Rheinland-Pfalz'), ('Saarland'), ('Sachsen'),
  ('Sachsen-Anhalt'), ('Schleswig-Holstein'), ('Thüringen')
) AS states(state)
WHERE code = 'DE'
ON CONFLICT (country_id, name) DO NOTHING;

-- FRANCIA (18 regiones)
INSERT INTO crm_states (country_id, name)
SELECT id, region FROM crm_countries, (VALUES
  ('Auvergne-Rhône-Alpes'), ('Bourgogne-Franche-Comté'), ('Bretagne'),
  ('Centre-Val de Loire'), ('Corse'), ('Grand Est'), ('Hauts-de-France'),
  ('Île-de-France'), ('Normandie'), ('Nouvelle-Aquitaine'), ('Occitanie'),
  ('Pays de la Loire'), ('Provence-Alpes-Côte d''Azur')
) AS regions(region)
WHERE code = 'FR'
ON CONFLICT (country_id, name) DO NOTHING;

-- AUSTRALIA (8 estados y territorios)
INSERT INTO crm_states (country_id, name)
SELECT id, state FROM crm_countries, (VALUES
  ('New South Wales'),
  ('Victoria'),
  ('Queensland'),
  ('South Australia'),
  ('Western Australia'),
  ('Tasmania'),
  ('Northern Territory'),
  ('Australian Capital Territory')
) AS states(state)
WHERE code = 'AU'
ON CONFLICT (country_id, name) DO NOTHING;

-- =====================================================
-- TIPOS DE CLIENTE INICIALES
-- =====================================================
INSERT INTO crm_client_types (name, description) VALUES
  ('Operador', 'Empresas operadoras de juegos de azar online'),
  ('Agregador', 'Empresas agregadoras de contenido y plataformas'),
  ('Fabricante', 'Empresas fabricantes de software y juegos')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- CARGOS/POSICIONES INICIALES
-- =====================================================
INSERT INTO crm_positions (name, description) VALUES
  ('CEO', 'Chief Executive Officer - Director Ejecutivo'),
  ('CTO', 'Chief Technology Officer - Director de Tecnología'),
  ('CFO', 'Chief Financial Officer - Director Financiero'),
  ('COO', 'Chief Operating Officer - Director de Operaciones'),
  ('CMO', 'Chief Marketing Officer - Director de Marketing'),
  ('Sales Manager', 'Gerente de Ventas'),
  ('Account Manager', 'Gerente de Cuentas'),
  ('Product Manager', 'Gerente de Producto'),
  ('Business Development Manager', 'Gerente de Desarrollo de Negocios'),
  ('Technical Lead', 'Líder Técnico'),
  ('Project Manager', 'Gerente de Proyecto'),
  ('Customer Success Manager', 'Gerente de Éxito del Cliente'),
  ('Operations Manager', 'Gerente de Operaciones'),
  ('Compliance Officer', 'Oficial de Cumplimiento'),
  ('Legal Director', 'Director Legal'),
  ('HR Manager', 'Gerente de Recursos Humanos'),
  ('Marketing Director', 'Director de Marketing'),
  ('Sales Representative', 'Representante de Ventas'),
  ('Account Executive', 'Ejecutivo de Cuentas'),
  ('Business Analyst', 'Analista de Negocios')
ON CONFLICT (name) DO NOTHING;
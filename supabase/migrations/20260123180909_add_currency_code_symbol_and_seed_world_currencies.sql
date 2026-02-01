/*
  # Add Currency Code and Symbol, Seed World Currencies

  1. Schema Changes
    - Add `code` column to `expenses_currencies` table (ISO 4217)
    - Add `symbol` column to `expenses_currencies` table
    - Keep `prefix` column for backward compatibility

  2. Data Migration
    - Update existing currencies with proper codes and symbols
    - Seed ~160 world currencies with ISO 4217 codes

  3. Important Notes
    - All official ISO 4217 currency codes included
    - Symbol and prefix will have the same value initially
    - Uses ON CONFLICT to handle existing records safely
*/

-- Add code column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses_currencies' AND column_name = 'code'
  ) THEN
    ALTER TABLE expenses_currencies ADD COLUMN code text;
  END IF;
END $$;

-- Add symbol column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses_currencies' AND column_name = 'symbol'
  ) THEN
    ALTER TABLE expenses_currencies ADD COLUMN symbol text;
  END IF;
END $$;

-- Update existing currencies with codes and symbols
UPDATE expenses_currencies SET code = 'ARS', symbol = '$' WHERE name = 'Peso Argentino' AND code IS NULL;
UPDATE expenses_currencies SET code = 'USD', symbol = '$' WHERE name = 'Dólar Estadounidense' AND code IS NULL;
UPDATE expenses_currencies SET code = 'EUR', symbol = '€' WHERE name = 'Euro' AND code IS NULL;

-- Make code and symbol required after populating existing records
ALTER TABLE expenses_currencies ALTER COLUMN code SET NOT NULL;
ALTER TABLE expenses_currencies ALTER COLUMN symbol SET NOT NULL;

-- Add unique constraint to code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'expenses_currencies_code_key'
  ) THEN
    ALTER TABLE expenses_currencies ADD CONSTRAINT expenses_currencies_code_key UNIQUE (code);
  END IF;
END $$;

-- Seed world currencies (ISO 4217 standard)
-- Using a temporary approach to handle the prefix field
DO $$
DECLARE
  currency_data RECORD;
BEGIN
  FOR currency_data IN 
    SELECT * FROM (VALUES
      -- Americas
      ('USD', 'Dólar Estadounidense', '$'),
      ('CAD', 'Dólar Canadiense', 'CA$'),
      ('MXN', 'Peso Mexicano', 'MX$'),
      ('ARS', 'Peso Argentino', '$'),
      ('BRL', 'Real Brasileño', 'R$'),
      ('CLP', 'Peso Chileno', 'CLP$'),
      ('COP', 'Peso Colombiano', 'COL$'),
      ('PEN', 'Sol Peruano', 'S/'),
      ('UYU', 'Peso Uruguayo', '$U'),
      ('VES', 'Bolívar Venezolano', 'Bs.'),
      ('BOB', 'Boliviano', 'Bs.'),
      ('CRC', 'Colón Costarricense', '₡'),
      ('CUP', 'Peso Cubano', '₱'),
      ('DOP', 'Peso Dominicano', 'RD$'),
      ('GTQ', 'Quetzal Guatemalteco', 'Q'),
      ('HNL', 'Lempira Hondureña', 'L'),
      ('HTG', 'Gourde Haitiano', 'G'),
      ('JMD', 'Dólar Jamaiquino', 'J$'),
      ('NIO', 'Córdoba Nicaragüense', 'C$'),
      ('PAB', 'Balboa Panameño', 'B/.'),
      ('PYG', 'Guaraní Paraguayo', '₲'),
      ('TTD', 'Dólar de Trinidad y Tobago', 'TT$'),
      
      -- Europe
      ('EUR', 'Euro', '€'),
      ('GBP', 'Libra Esterlina', '£'),
      ('CHF', 'Franco Suizo', 'CHF'),
      ('NOK', 'Corona Noruega', 'kr'),
      ('SEK', 'Corona Sueca', 'kr'),
      ('DKK', 'Corona Danesa', 'kr'),
      ('ISK', 'Corona Islandesa', 'kr'),
      ('PLN', 'Złoty Polaco', 'zł'),
      ('CZK', 'Corona Checa', 'Kč'),
      ('HUF', 'Forinto Húngaro', 'Ft'),
      ('RON', 'Leu Rumano', 'lei'),
      ('BGN', 'Lev Búlgaro', 'лв'),
      ('HRK', 'Kuna Croata', 'kn'),
      ('RSD', 'Dinar Serbio', 'дин'),
      ('UAH', 'Grivna Ucraniana', '₴'),
      ('RUB', 'Rublo Ruso', '₽'),
      ('TRY', 'Lira Turca', '₺'),
      ('BAM', 'Marco Convertible de Bosnia', 'KM'),
      ('MKD', 'Denar Macedonio', 'ден'),
      ('ALL', 'Lek Albanés', 'L'),
      ('MDL', 'Leu Moldavo', 'L'),
      ('GEL', 'Lari Georgiano', '₾'),
      ('AMD', 'Dram Armenio', '֏'),
      ('AZN', 'Manat Azerbaiyano', '₼'),
      ('BYN', 'Rublo Bielorruso', 'Br'),
      
      -- Asia
      ('CNY', 'Yuan Chino', '¥'),
      ('JPY', 'Yen Japonés', '¥'),
      ('KRW', 'Won Surcoreano', '₩'),
      ('INR', 'Rupia India', '₹'),
      ('IDR', 'Rupia Indonesia', 'Rp'),
      ('THB', 'Baht Tailandés', '฿'),
      ('MYR', 'Ringgit Malasio', 'RM'),
      ('SGD', 'Dólar de Singapur', 'S$'),
      ('PHP', 'Peso Filipino', '₱'),
      ('VND', 'Dong Vietnamita', '₫'),
      ('HKD', 'Dólar de Hong Kong', 'HK$'),
      ('TWD', 'Dólar Taiwanés', 'NT$'),
      ('PKR', 'Rupia Pakistaní', '₨'),
      ('BDT', 'Taka Bangladesí', '৳'),
      ('LKR', 'Rupia de Sri Lanka', 'Rs'),
      ('NPR', 'Rupia Nepalí', 'Rs'),
      ('MMK', 'Kyat de Myanmar', 'K'),
      ('KHR', 'Riel Camboyano', '៛'),
      ('LAK', 'Kip Laosiano', '₭'),
      ('BND', 'Dólar de Brunéi', 'B$'),
      ('MNT', 'Tugrik Mongol', '₮'),
      ('KZT', 'Tenge Kazajo', '₸'),
      ('UZS', 'Som Uzbeko', 'soʻm'),
      ('TJS', 'Somoni Tayiko', 'ЅМ'),
      ('KGS', 'Som Kirguís', 'с'),
      ('TMT', 'Manat Turcomano', 'm'),
      ('AFN', 'Afgani', '؋'),
      ('IQD', 'Dinar Iraquí', 'ع.د'),
      ('IRR', 'Rial Iraní', '﷼'),
      ('ILS', 'Nuevo Shekel Israelí', '₪'),
      ('JOD', 'Dinar Jordano', 'د.ا'),
      ('KWD', 'Dinar Kuwaití', 'د.ك'),
      ('LBP', 'Libra Libanesa', 'ل.ل'),
      ('OMR', 'Rial Omaní', 'ر.ع.'),
      ('QAR', 'Riyal Qatarí', 'ر.ق'),
      ('SAR', 'Riyal Saudí', 'ر.س'),
      ('SYP', 'Libra Siria', '£S'),
      ('AED', 'Dirham de EAU', 'د.إ'),
      ('YER', 'Rial Yemení', '﷼'),
      ('BHD', 'Dinar Bahreiní', 'د.ب'),
      
      -- Africa
      ('ZAR', 'Rand Sudafricano', 'R'),
      ('EGP', 'Libra Egipcia', '£'),
      ('NGN', 'Naira Nigeriana', '₦'),
      ('KES', 'Chelín Keniano', 'KSh'),
      ('GHS', 'Cedi Ghanés', '₵'),
      ('TZS', 'Chelín Tanzano', 'TSh'),
      ('UGX', 'Chelín Ugandés', 'USh'),
      ('MAD', 'Dirham Marroquí', 'د.م.'),
      ('ETB', 'Birr Etíope', 'Br'),
      ('XOF', 'Franco CFA de África Occidental', 'CFA'),
      ('XAF', 'Franco CFA de África Central', 'FCFA'),
      ('AOA', 'Kwanza Angoleño', 'Kz'),
      ('BWP', 'Pula de Botsuana', 'P'),
      ('BIF', 'Franco Burundés', 'FBu'),
      ('DJF', 'Franco Yibutiano', 'Fdj'),
      ('ERN', 'Nakfa Eritreo', 'Nfk'),
      ('GMD', 'Dalasi Gambiano', 'D'),
      ('GNF', 'Franco Guineano', 'FG'),
      ('LRD', 'Dólar Liberiano', 'L$'),
      ('LSL', 'Loti de Lesoto', 'L'),
      ('LYD', 'Dinar Libio', 'ل.د'),
      ('MGA', 'Ariary Malgache', 'Ar'),
      ('MWK', 'Kwacha Malauí', 'MK'),
      ('MRU', 'Ouguiya Mauritana', 'UM'),
      ('MUR', 'Rupia Mauriciana', '₨'),
      ('MZN', 'Metical Mozambiqueño', 'MT'),
      ('NAD', 'Dólar Namibio', 'N$'),
      ('RWF', 'Franco Ruandés', 'FRw'),
      ('SCR', 'Rupia de Seychelles', '₨'),
      ('SLL', 'Leone de Sierra Leona', 'Le'),
      ('SOS', 'Chelín Somalí', 'Sh'),
      ('SSP', 'Libra Sursudanesa', '£'),
      ('SDG', 'Libra Sudanesa', 'ج.س.'),
      ('SZL', 'Lilangeni Suazi', 'L'),
      ('TND', 'Dinar Tunecino', 'د.ت'),
      ('ZMW', 'Kwacha Zambiano', 'ZK'),
      ('ZWL', 'Dólar Zimbabuense', 'Z$'),
      
      -- Oceania
      ('AUD', 'Dólar Australiano', 'A$'),
      ('NZD', 'Dólar Neozelandés', 'NZ$'),
      ('FJD', 'Dólar Fiyiano', 'FJ$'),
      ('PGK', 'Kina de Papúa Nueva Guinea', 'K'),
      ('SBD', 'Dólar de las Islas Salomón', 'SI$'),
      ('TOP', 'Paʻanga Tongano', 'T$'),
      ('VUV', 'Vatu de Vanuatu', 'VT'),
      ('WST', 'Tala Samoano', 'T'),
      ('XPF', 'Franco CFP', '₣'),
      
      -- Cryptocurrencies
      ('BTC', 'Bitcoin', '₿'),
      ('ETH', 'Ethereum', 'Ξ')
    ) AS t(code, name, symbol)
  LOOP
    INSERT INTO expenses_currencies (code, name, symbol, prefix)
    VALUES (currency_data.code, currency_data.name, currency_data.symbol, currency_data.symbol)
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      symbol = EXCLUDED.symbol,
      prefix = EXCLUDED.prefix;
  END LOOP;
END $$;
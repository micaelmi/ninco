-- CreateTable
CREATE TABLE "UserType" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "UserType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimalPlaces" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("code")
);

-- Seed common currencies so FK defaults work
INSERT INTO "Currency" ("code", "name", "symbol", "decimalPlaces") VALUES
    ('USD', 'US Dollar', '$', 2),
    ('EUR', 'Euro', '€', 2),
    ('GBP', 'British Pound', '£', 2),
    ('BRL', 'Brazilian Real', 'R$', 2),
    ('AUD', 'Australian Dollar', 'A$', 2),
    ('CAD', 'Canadian Dollar', 'C$', 2),
    ('JPY', 'Japanese Yen', '¥', 0),
    ('CNY', 'Chinese Yuan', '¥', 2),
    ('INR', 'Indian Rupee', '₹', 2),
    ('MXN', 'Mexican Peso', '$', 2),
    ('CHF', 'Swiss Franc', 'CHF', 2),
    ('KRW', 'South Korean Won', '₩', 0),
    ('SEK', 'Swedish Krona', 'kr', 2),
    ('NOK', 'Norwegian Krone', 'kr', 2),
    ('DKK', 'Danish Krone', 'kr', 2),
    ('NZD', 'New Zealand Dollar', 'NZ$', 2),
    ('SGD', 'Singapore Dollar', 'S$', 2),
    ('HKD', 'Hong Kong Dollar', 'HK$', 2),
    ('ARS', 'Argentine Peso', '$', 2),
    ('CLP', 'Chilean Peso', '$', 0),
    ('COP', 'Colombian Peso', '$', 2),
    ('PEN', 'Peruvian Sol', 'S/', 2),
    ('UYU', 'Uruguayan Peso', '$U', 2),
    ('ZAR', 'South African Rand', 'R', 2),
    ('TRY', 'Turkish Lira', '₺', 2),
    ('PLN', 'Polish Zloty', 'zł', 2),
    ('CZK', 'Czech Koruna', 'Kč', 2),
    ('HUF', 'Hungarian Forint', 'Ft', 2),
    ('ILS', 'Israeli Shekel', '₪', 2),
    ('THB', 'Thai Baht', '฿', 2),
    ('PHP', 'Philippine Peso', '₱', 2),
    ('IDR', 'Indonesian Rupiah', 'Rp', 2),
    ('MYR', 'Malaysian Ringgit', 'RM', 2),
    ('TWD', 'Taiwan Dollar', 'NT$', 2),
    ('SAR', 'Saudi Riyal', '﷼', 2),
    ('AED', 'UAE Dirham', 'د.إ', 2),
    ('NGN', 'Nigerian Naira', '₦', 2),
    ('EGP', 'Egyptian Pound', 'E£', 2),
    ('PKR', 'Pakistani Rupee', '₨', 2),
    ('BDT', 'Bangladeshi Taka', '৳', 2),
    ('VND', 'Vietnamese Dong', '₫', 0),
    ('RON', 'Romanian Leu', 'lei', 2),
    ('UAH', 'Ukrainian Hryvnia', '₴', 2),
    ('BGN', 'Bulgarian Lev', 'лв', 2),
    ('HRK', 'Croatian Kuna', 'kn', 2),
    ('RUB', 'Russian Ruble', '₽', 2),
    ('KES', 'Kenyan Shilling', 'KSh', 2),
    ('GHS', 'Ghanaian Cedi', 'GH₵', 2),
    ('MAD', 'Moroccan Dirham', 'MAD', 2),
    ('QAR', 'Qatari Riyal', '﷼', 2)
ON CONFLICT ("code") DO NOTHING;

-- AlterTable: Add userTypeId and preferredCurrencyCode to User
ALTER TABLE "User" ADD COLUMN "userTypeId" TEXT;
ALTER TABLE "User" ADD COLUMN "preferredCurrencyCode" TEXT DEFAULT 'USD';

-- AlterTable: Add currencyCode to Account
ALTER TABLE "Account" ADD COLUMN "currencyCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserType_type_key" ON "UserType"("type");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "UserType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_preferredCurrencyCode_fkey" FOREIGN KEY ("preferredCurrencyCode") REFERENCES "Currency"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "Currency"("code") ON DELETE SET NULL ON UPDATE CASCADE;

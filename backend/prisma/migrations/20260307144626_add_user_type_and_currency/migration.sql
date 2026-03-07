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

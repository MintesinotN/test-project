/*
  Warnings:

  - You are about to drop the `Currency` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Currency";

-- CreateTable
CREATE TABLE "Conversion" (
    "id" SERIAL NOT NULL,
    "fromCurrency" TEXT NOT NULL,
    "toCurrency" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "result" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversion_pkey" PRIMARY KEY ("id")
);

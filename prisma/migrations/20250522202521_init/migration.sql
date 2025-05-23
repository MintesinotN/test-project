-- CreateTable
CREATE TABLE "Currency" (
    "id" SERIAL NOT NULL,
    "USD" INTEGER NOT NULL,
    "EUR" INTEGER NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

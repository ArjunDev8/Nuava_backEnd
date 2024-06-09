-- CreateTable
CREATE TABLE "Otp" (
    "id" SERIAL NOT NULL,
    "userLogin" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

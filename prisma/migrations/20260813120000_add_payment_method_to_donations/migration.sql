-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'PAYPAL');

-- AlterTable
ALTER TABLE "donations" ADD COLUMN "paymentMethod" "PaymentMethod";
ALTER TABLE "donations" ADD COLUMN "stripePaymentId" TEXT;
ALTER TABLE "donations" ADD COLUMN "stripeSessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "donations_stripePaymentId_key" ON "donations"("stripePaymentId");

CREATE INDEX "donations_paymentMethod_idx" ON "donations"("paymentMethod");

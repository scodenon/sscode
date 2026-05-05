ALTER TABLE "Account" ADD COLUMN "balanceStartAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Account" SET "balanceStartAt" = "createdAt";

CREATE INDEX IF NOT EXISTS "Account_userId_balanceStartAt_idx" ON "Account"("userId", "balanceStartAt");

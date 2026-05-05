ALTER TABLE "Transaction" ADD COLUMN "category" TEXT;

CREATE INDEX IF NOT EXISTS "Transaction_category_idx" ON "Transaction"("category");

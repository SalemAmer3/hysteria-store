-- Add is_available field to ProductOption (default true = in stock)
ALTER TABLE "ProductOption"
ADD COLUMN "is_available" BOOLEAN NOT NULL DEFAULT true;

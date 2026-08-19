-- Make Product.brand_id nullable
ALTER TABLE "Product"
ALTER COLUMN "brand_id" DROP NOT NULL;

-- Update foreign key to match Prisma schema
ALTER TABLE "Product"
DROP CONSTRAINT IF EXISTS "Product_brand_id_fkey";

ALTER TABLE "Product"
ADD CONSTRAINT "Product_brand_id_fkey"
FOREIGN KEY ("brand_id")
REFERENCES "Brand"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
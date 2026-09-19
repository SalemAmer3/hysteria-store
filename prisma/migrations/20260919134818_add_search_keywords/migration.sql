-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "search_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[];

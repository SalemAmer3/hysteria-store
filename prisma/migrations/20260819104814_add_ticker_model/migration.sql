-- CreateTable
CREATE TABLE "Ticker" (
    "id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "arabic" TEXT,
    "hebrew" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticker_pkey" PRIMARY KEY ("id")
);

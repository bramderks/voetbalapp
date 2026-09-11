-- Add wedstrijd score fields.
ALTER TABLE "Activity"
ADD COLUMN "scoreFor" INTEGER,
ADD COLUMN "scoreAgainst" INTEGER;

-- Step 1: Create the new Kondisi enum
CREATE TYPE "Kondisi" AS ENUM ('Baru', 'Bekas');

-- Step 2: Add a temporary column with the new type
ALTER TABLE "auction_items" ADD COLUMN "kondisi" "Kondisi";

-- Step 3: Migrate data from grade to kondisi
UPDATE "auction_items" SET "kondisi" = CASE 
  WHEN "grade" = 'A' THEN 'Baru'::"Kondisi"
  ELSE 'Bekas'::"Kondisi"
END;

-- Step 4: Make kondisi NOT NULL
ALTER TABLE "auction_items" ALTER COLUMN "kondisi" SET NOT NULL;

-- Step 5: Drop the old grade column
ALTER TABLE "auction_items" DROP COLUMN "grade";

-- Step 6: Drop the old Grade enum
DROP TYPE "Grade";

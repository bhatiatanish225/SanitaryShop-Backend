-- Safe migration script to add Pincode table and update existing data
-- This preserves all existing data while adding the new features

BEGIN;

-- Step 1: Create the Pincode table
CREATE TABLE IF NOT EXISTS "Pincode" (
    "id" SERIAL NOT NULL,
    "code" INTEGER NOT NULL,
    "deliveryPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Pincode_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create unique index on pincode code
CREATE UNIQUE INDEX IF NOT EXISTS "Pincode_code_key" ON "Pincode"("code");

-- Step 3: Create performance indexes on Pincode
CREATE INDEX IF NOT EXISTS "Pincode_code_idx" ON "Pincode"("code");
CREATE INDEX IF NOT EXISTS "Pincode_deliveryPrice_idx" ON "Pincode"("deliveryPrice");

-- Step 4: Insert default pincodes for existing addresses
-- We'll create some common pincodes that existing addresses can use
INSERT INTO "Pincode" ("code", "deliveryPrice") VALUES 
(160001, 50.0),  -- Default Chandigarh
(140301, 60.0),  -- Default Mohali  
(134101, 70.0),  -- Default Panchkula
(999999, 100.0)  -- Generic default for any unknown area
ON CONFLICT ("code") DO NOTHING;

-- Step 5: Add pincodeId column to Address table as nullable first
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "pincodeId" INTEGER;

-- Step 6: Update existing addresses to use default pincode based on city
UPDATE "Address" SET "pincodeId" = (
    CASE 
        WHEN LOWER("city") LIKE '%chandigarh%' THEN (SELECT "id" FROM "Pincode" WHERE "code" = 160001)
        WHEN LOWER("city") LIKE '%mohali%' THEN (SELECT "id" FROM "Pincode" WHERE "code" = 140301)
        WHEN LOWER("city") LIKE '%panchkula%' THEN (SELECT "id" FROM "Pincode" WHERE "code" = 134101)
        ELSE (SELECT "id" FROM "Pincode" WHERE "code" = 999999)
    END
)
WHERE "pincodeId" IS NULL;

-- Step 7: Now make pincodeId NOT NULL since all rows have values
ALTER TABLE "Address" ALTER COLUMN "pincodeId" SET NOT NULL;

-- Step 8: Add foreign key constraint
ALTER TABLE "Address" ADD CONSTRAINT "Address_pincodeId_fkey" 
FOREIGN KEY ("pincodeId") REFERENCES "Pincode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 9: Add isPipe column to Product table with default false
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isPipe" BOOLEAN NOT NULL DEFAULT false;

-- Step 10: Fix CartItem table - add cartId column
-- First, let's create a cart for each user who has cart items but no cart
INSERT INTO "Cart" ("userId", "createdAt", "updatedAt")
SELECT DISTINCT "userId", NOW(), NOW() 
FROM "CartItem" 
WHERE "userId" NOT IN (SELECT "userId" FROM "Cart")
ON CONFLICT ("userId") DO NOTHING;

-- Step 11: Add cartId column to CartItem
ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS "cartId" INTEGER;

-- Step 12: Update existing CartItems to reference their user's cart
UPDATE "CartItem" SET "cartId" = (
    SELECT "id" FROM "Cart" WHERE "Cart"."userId" = "CartItem"."userId"
)
WHERE "cartId" IS NULL;

-- Step 13: Make cartId NOT NULL
ALTER TABLE "CartItem" ALTER COLUMN "cartId" SET NOT NULL;

-- Step 14: Add foreign key constraint for cartId
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" 
FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 15: Add all the performance indexes we defined in schema

-- Address indexes
CREATE INDEX IF NOT EXISTS "Address_pincodeId_idx" ON "Address"("pincodeId");
CREATE INDEX IF NOT EXISTS "Address_userId_idx" ON "Address"("userId");
CREATE INDEX IF NOT EXISTS "Address_city_idx" ON "Address"("city");
CREATE INDEX IF NOT EXISTS "Address_createdAt_idx" ON "Address"("createdAt");

-- User indexes
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_phone_idx" ON "User"("phone");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "User_isBlocked_idx" ON "User"("isBlocked");
CREATE INDEX IF NOT EXISTS "User_isTricity_idx" ON "User"("isTricity");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");

-- Product indexes
CREATE INDEX IF NOT EXISTS "Product_itemCode_idx" ON "Product"("itemCode");
CREATE INDEX IF NOT EXISTS "Product_name_idx" ON "Product"("name");
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_isFeatured_idx" ON "Product"("isFeatured");
CREATE INDEX IF NOT EXISTS "Product_isBestseller_idx" ON "Product"("isBestseller");
CREATE INDEX IF NOT EXISTS "Product_isPipe_idx" ON "Product"("isPipe");
CREATE INDEX IF NOT EXISTS "Product_brandGroup_idx" ON "Product"("brandGroup");
CREATE INDEX IF NOT EXISTS "Product_availableStock_idx" ON "Product"("availableStock");
CREATE INDEX IF NOT EXISTS "Product_price_idx" ON "Product"("price");
CREATE INDEX IF NOT EXISTS "Product_rating_idx" ON "Product"("rating");
CREATE INDEX IF NOT EXISTS "Product_createdAt_idx" ON "Product"("createdAt");
CREATE INDEX IF NOT EXISTS "Product_hsn_idx" ON "Product"("hsn");

-- Order indexes
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_addressId_idx" ON "Order"("addressId");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_paymentMethod_idx" ON "Order"("paymentMethod");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX IF NOT EXISTS "Order_totalAmount_idx" ON "Order"("totalAmount");

-- OrderItem indexes
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX IF NOT EXISTS "OrderItem_price_idx" ON "OrderItem"("price");

-- Payment indexes
CREATE INDEX IF NOT EXISTS "Payment_paymentId_idx" ON "Payment"("paymentId");
CREATE INDEX IF NOT EXISTS "Payment_orderRef_idx" ON "Payment"("orderRef");
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");
CREATE INDEX IF NOT EXISTS "Payment_amount_idx" ON "Payment"("amount");
CREATE INDEX IF NOT EXISTS "Payment_createdAt_idx" ON "Payment"("createdAt");

-- Cart indexes
CREATE INDEX IF NOT EXISTS "Cart_userId_idx" ON "Cart"("userId");
CREATE INDEX IF NOT EXISTS "Cart_createdAt_idx" ON "Cart"("createdAt");
CREATE INDEX IF NOT EXISTS "Cart_updatedAt_idx" ON "Cart"("updatedAt");

-- CartItem indexes
CREATE INDEX IF NOT EXISTS "CartItem_cartId_idx" ON "CartItem"("cartId");
CREATE INDEX IF NOT EXISTS "CartItem_userId_idx" ON "CartItem"("userId");
CREATE INDEX IF NOT EXISTS "CartItem_productId_idx" ON "CartItem"("productId");
CREATE INDEX IF NOT EXISTS "CartItem_createdAt_idx" ON "CartItem"("createdAt");

-- ProductImage indexes
CREATE INDEX IF NOT EXISTS "ProductImage_productId_idx" ON "product_images"("productId");
CREATE INDEX IF NOT EXISTS "ProductImage_sortOrder_idx" ON "product_images"("sortOrder");
CREATE INDEX IF NOT EXISTS "ProductImage_createdAt_idx" ON "product_images"("createdAt");

-- Category indexes
CREATE INDEX IF NOT EXISTS "Category_name_idx" ON "Category"("name");
CREATE INDEX IF NOT EXISTS "Category_createdAt_idx" ON "Category"("createdAt");

-- EmailVerification indexes
CREATE INDEX IF NOT EXISTS "EmailVerification_email_idx" ON "EmailVerification"("email");
CREATE INDEX IF NOT EXISTS "EmailVerification_code_idx" ON "EmailVerification"("code");
CREATE INDEX IF NOT EXISTS "EmailVerification_expiresAt_idx" ON "EmailVerification"("expiresAt");
CREATE INDEX IF NOT EXISTS "EmailVerification_createdAt_idx" ON "EmailVerification"("createdAt");

-- BlockedUser indexes
CREATE INDEX IF NOT EXISTS "BlockedUser_email_idx" ON "BlockedUser"("email");
CREATE INDEX IF NOT EXISTS "BlockedUser_createdAt_idx" ON "BlockedUser"("createdAt");

COMMIT;

-- Verification queries to check the migration worked
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as total_pincodes FROM "Pincode";
SELECT COUNT(*) as addresses_with_pincodes FROM "Address" WHERE "pincodeId" IS NOT NULL;
SELECT COUNT(*) as products_with_ispipe FROM "Product" WHERE "isPipe" IS NOT NULL;
SELECT COUNT(*) as cartitems_with_cartid FROM "CartItem" WHERE "cartId" IS NOT NULL;

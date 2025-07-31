-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "totalAmount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "originalPrice" DOUBLE PRECISION,
ADD COLUMN     "reviewsCount" INTEGER DEFAULT 0,
ADD COLUMN     "stockQuantity" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "wishlist_type" VARCHAR(16) NOT NULL,
    "ref_id" VARCHAR(512) NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "image_url" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wishlist_items_user_id_idx" ON "wishlist_items"("user_id");

-- CreateIndex
CREATE INDEX "wishlist_items_user_id_wishlist_type_idx" ON "wishlist_items"("user_id", "wishlist_type");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_user_id_wishlist_type_ref_id_key" ON "wishlist_items"("user_id", "wishlist_type", "ref_id");

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

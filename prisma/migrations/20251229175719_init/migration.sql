/*
  Warnings:

  - You are about to alter the column `url` on the `Url` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `short` on the `Url` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - Added the required column `updated_at` to the `Url` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Url" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "url" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "short" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

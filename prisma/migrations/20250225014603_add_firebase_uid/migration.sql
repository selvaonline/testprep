/*
  Warnings:

  - You are about to drop the column `token` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[firebase_uid]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firebase_uid` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_token_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "token",
ADD COLUMN     "firebase_uid" TEXT NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_firebase_uid_key" ON "User"("firebase_uid");

/*
  Warnings:

  - You are about to drop the `todo-table` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "todo-table";

-- CreateTable
CREATE TABLE "todo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "todo_pkey" PRIMARY KEY ("id")
);

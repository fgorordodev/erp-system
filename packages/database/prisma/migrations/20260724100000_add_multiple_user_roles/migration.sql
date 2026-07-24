-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId", "roleId")
);

-- Preserve every existing user-role assignment before removing User.roleId.
INSERT INTO "UserRole" ("userId", "roleId")
SELECT "id", "roleId"
FROM "User";

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey"
FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove the old single-role relation.
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_roleId_fkey";
DROP INDEX IF EXISTS "User_roleId_idx";
ALTER TABLE "User" DROP COLUMN "roleId";

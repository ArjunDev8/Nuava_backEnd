-- CreateTable
CREATE TABLE "TeamVersion" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "players" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamVersion_teamId_version_key" ON "TeamVersion"("teamId", "version");

-- AddForeignKey
ALTER TABLE "TeamVersion" ADD CONSTRAINT "TeamVersion_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

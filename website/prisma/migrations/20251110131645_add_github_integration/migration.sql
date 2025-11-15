-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "content" TEXT,
ADD COLUMN     "postType" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "publishedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "githubToken" TEXT,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "lastSynced" TIMESTAMP(3),
ADD COLUMN     "trackProgress" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Post_postType_idx" ON "Post"("postType");

-- CreateIndex
CREATE INDEX "Post_projectId_idx" ON "Post"("projectId");

-- CreateIndex
CREATE INDEX "Project_trackProgress_idx" ON "Project"("trackProgress");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

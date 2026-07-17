-- PRJ-18 Wave 3: unified field-report feed facets.
-- Additive only: two nullable/defaulted columns + two indexes. No data loss.
--   topics        controlled 7-topic vocab (see lib/taxonomy.ts)
--   editorialType 'essay' | 'build-log'

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "editorialType" TEXT,
ADD COLUMN     "topics" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "Post_editorialType_idx" ON "Post"("editorialType");

-- CreateIndex
CREATE INDEX "Post_topics_idx" ON "Post" USING GIN ("topics");

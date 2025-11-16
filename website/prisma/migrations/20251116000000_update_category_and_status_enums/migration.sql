-- Add new values to Category enum
ALTER TYPE "Category" ADD VALUE IF NOT EXISTS 'PRODUCTIVITY';
ALTER TYPE "Category" ADD VALUE IF NOT EXISTS 'FINANCE';
ALTER TYPE "Category" ADD VALUE IF NOT EXISTS 'WELLBEING';

-- Add new values to ProjectStatus enum
ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'RESEARCH';
ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'DESIGN';
ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'BUILD';
ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'MVP';
ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'LIVE';

-- Note: PostgreSQL doesn't support removing enum values easily
-- ACTIVE will remain in the enum but won't be used
-- Future cleanup would require recreating the enum type
-- Migration of ACTIVE to LIVE will need to be done separately after commit

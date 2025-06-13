-- Reset database and apply new schema
-- Run these commands in order:

-- 1. Reset the database
-- npx prisma migrate reset --force

-- 2. Generate new migration
-- npx prisma migrate dev --name update-schema

-- 3. Generate Prisma client
-- npx prisma generate

CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "Status" AS ENUM ('new', 'in_progress', 'done');

CREATE TABLE "Task" (
    "id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" VARCHAR(5000) NOT NULL DEFAULT '',
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "status" "Status" NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Task_title_not_blank" CHECK (length(btrim("title")) > 0)
);

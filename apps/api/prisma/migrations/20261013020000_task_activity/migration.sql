CREATE TABLE "TaskActivity" (
  "id" UUID NOT NULL,
  "taskId" UUID NOT NULL,
  "kind" VARCHAR(16) NOT NULL,
  "message" VARCHAR(5000) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TaskActivity_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TaskActivity_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TaskActivity_kind_valid" CHECK ("kind" IN ('created', 'updated', 'comment'))
);
CREATE INDEX "TaskActivity_taskId_createdAt_idx" ON "TaskActivity"("taskId", "createdAt");

ALTER TABLE "Task" ADD COLUMN "labels" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
CREATE TABLE "Attachment" (
  "id" UUID NOT NULL,
  "taskId" UUID NOT NULL,
  "name" VARCHAR(180) NOT NULL,
  "contentType" VARCHAR(100) NOT NULL,
  "size" INTEGER NOT NULL,
  "data" BYTEA NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Attachment_size_limit" CHECK ("size" >= 0 AND "size" <= 2097152)
);
CREATE INDEX "Attachment_taskId_idx" ON "Attachment"("taskId");

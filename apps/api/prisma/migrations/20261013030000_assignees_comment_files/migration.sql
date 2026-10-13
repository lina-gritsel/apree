CREATE TABLE "WorkspaceUser" (
  "id" UUID NOT NULL,
  "name" VARCHAR(80) NOT NULL,
  "color" VARCHAR(7) NOT NULL,
  CONSTRAINT "WorkspaceUser_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Task" ADD COLUMN "assigneeId" UUID;
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "WorkspaceUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Attachment" ADD COLUMN "taskActivityId" UUID;
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_taskActivityId_fkey" FOREIGN KEY ("taskActivityId") REFERENCES "TaskActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

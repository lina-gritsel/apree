export const attachmentMetadata = { id: true, name: true, contentType: true, size: true } as const;
export const activityInclude = {
  attachments: { select: attachmentMetadata, orderBy: { createdAt: 'asc' as const } },
};
export const taskInclude = {
  assignee: true,
  attachments: {
    where: { taskActivityId: null },
    select: attachmentMetadata,
    orderBy: { createdAt: 'asc' as const },
  },
};

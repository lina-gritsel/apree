import { test as base, expect } from '@playwright/test';

export const test = base.extend<{ taskIds: Set<string> }>({
  taskIds: async ({ request }, use) => {
    const ids = new Set<string>();
    try {
      await use(ids);
    } finally {
      const results = await Promise.allSettled(
        [...ids].map(async (id) => {
          const response = await request.delete(`/api/tasks/${id}`);
          expect([204, 404], `Удаление собственной тестовой задачи ${id}`).toContain(
            response.status(),
          );
        }),
      );
      expect(results.filter((result) => result.status === 'rejected')).toEqual([]);
    }
  },
});

export { expect };

import { expect, test } from './fixtures';

test('участник создается и назначение сохраняется на доске, в списке и на странице', async ({
  taskIds,
  page,
  request,
}) => {
  const title = `E2E исполнитель ${Date.now()}`;
  const userName = 'E2E Участник';
  const users = (await (await request.get('/api/users')).json()) as {
    id: string;
    name: string;
  }[];
  await page.goto('/');
  await page.getByRole('button', { name: 'Создать задачу', exact: true }).click();
  const form = page.getByRole('dialog');
  await form.getByRole('textbox', { name: /^Название/ }).fill(title);
  await form.getByRole('button', { name: 'Исполнитель', exact: true }).click();
  await page.getByRole('textbox', { name: 'Поиск исполнителя' }).fill(userName);
  if (users.some((user) => user.name === userName)) {
    await page.getByText(userName, { exact: true }).click();
  } else {
    const createdUser = page.waitForResponse(
      (response) => response.url().endsWith('/api/users') && response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Добавить участника', exact: true }).click();
    expect((await createdUser).status()).toBe(201);
  }
  await expect(form.getByRole('button', { name: 'Исполнитель', exact: true })).toContainText(
    userName,
  );
  const created = page.waitForResponse(
    (response) => response.url().endsWith('/api/tasks') && response.request().method() === 'POST',
  );
  await form.getByRole('button', { name: 'Создать задачу', exact: true }).click();
  const task = (await (await created).json()) as { id: string; assignee: { name: string } };
  taskIds.add(task.id);
  expect(task.assignee.name).toBe(userName);
  await expect(
    page.getByTestId(`task-${task.id}`).getByLabel(userName, { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Список', exact: true }).click();
  await expect(
    page.getByTestId(`list-task-${task.id}`).getByLabel(userName, { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: `Открыть задачу: ${title}`, exact: true }).click();
  await page.reload();
  await expect(
    page.getByTestId('task-page').getByRole('button', { name: 'Исполнитель', exact: true }),
  ).toContainText(userName);
});

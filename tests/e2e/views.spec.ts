import { expect, test } from './fixtures';

test('поиск, фильтр приоритета и сохранение темы', async ({ taskIds, page, request }) => {
  const prefix = `E2E фильтр ${Date.now()}`;
  for (const priority of ['low', 'high']) {
    const response = await request.post('/api/tasks', {
      data: { title: `${prefix} ${priority}`, priority },
    });
    expect(response.ok()).toBeTruthy();
    taskIds.add(((await response.json()) as { id: string }).id);
  }
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Поиск задач' }).fill(prefix);
  await expect(page.getByRole('button', { name: /^Открыть задачу:/ })).toHaveCount(2);
  await page.getByRole('combobox', { name: 'Фильтр приоритета' }).click();
  await page.getByRole('option', { name: 'Высокий', exact: true }).click();
  await expect(page.getByRole('button', { name: /^Открыть задачу:/ })).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: `Открыть задачу: ${prefix} high`, exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Светлая тема' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Тёмная тема' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('forma-theme'))).toBe('light');
});

test('список сохраняет фильтры и выбранный вид после перезагрузки', async ({
  taskIds,
  page,
  request,
}) => {
  const prefix = `E2E список ${Date.now()}`;
  for (const priority of ['low', 'high']) {
    const response = await request.post('/api/tasks', {
      data: { title: `${prefix} ${priority}`, priority },
    });
    expect(response.ok()).toBeTruthy();
    taskIds.add(((await response.json()) as { id: string }).id);
  }
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Поиск задач' }).fill(prefix);
  await page.getByRole('combobox', { name: 'Фильтр приоритета' }).click();
  await page.getByRole('option', { name: 'Высокий', exact: true }).click();
  await page.getByRole('button', { name: 'Список', exact: true }).click();
  await expect(page.getByTestId('task-list')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Открыть задачу:/ })).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: `Открыть задачу: ${prefix} high`, exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Доска', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Поиск задач' })).toHaveValue(prefix);
  await expect(page.getByRole('button', { name: /^Открыть задачу:/ })).toHaveCount(1);
  await page.getByRole('button', { name: 'Список', exact: true }).click();
  await page.reload();
  await expect(page.getByTestId('task-list')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Список', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Свернуть: Новая', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Развернуть: Новая', exact: true }),
  ).toHaveAttribute('aria-expanded', 'false');
});

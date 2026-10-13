import { expect, test } from '@playwright/test';

test.describe('Доска задач', () => {
  const taskIds = new Set<string>();

  test.afterEach(async ({ request }) => {
    for (const id of taskIds) {
      await request.delete(`/api/tasks/${id}`);
    }
    taskIds.clear();
  });

  test('создание → редактирование → смена статуса → перезагрузка → удаление', async ({ page }) => {
    const title = `E2E задача ${Date.now()}`;
    await page.goto('/');
    await page.getByRole('button', { name: 'Создать задачу', exact: true }).click();
    const form = page.getByRole('dialog');
    await form.getByRole('textbox', { name: /^Название/ }).fill(title);
    await form
      .getByRole('textbox', { name: 'Описание', exact: true })
      .fill('Проверка сохранения в PostgreSQL');
    const created = page.waitForResponse(
      (response) => response.url().endsWith('/api/tasks') && response.request().method() === 'POST',
    );
    await form.getByRole('button', { name: 'Создать задачу', exact: true }).click();
    const response = await created;
    expect(response.status()).toBe(201);
    const task = (await response.json()) as { id: string };
    taskIds.add(task.id);
    await expect(form).not.toBeVisible();
    await page.getByRole('button', { name: `Открыть задачу: ${title}`, exact: true }).click();
    await form.getByRole('textbox', { name: /^Название/ }).fill(`${title} — обновлено`);
    await form.getByRole('button', { name: 'Сохранить изменения', exact: true }).click();
    await expect(form).not.toBeVisible();
    await page.getByRole('button', { name: `Действия: ${title} — обновлено`, exact: true }).click();
    const moved = page.waitForResponse(
      (result) =>
        result.url().endsWith(`/api/tasks/${task.id}`) && result.request().method() === 'PATCH',
    );
    await page.getByRole('menuitem', { name: 'В работе', exact: true }).click();
    expect((await moved).ok()).toBeTruthy();
    await page.reload();
    await page
      .getByRole('button', { name: `Открыть задачу: ${title} — обновлено`, exact: true })
      .click();
    await expect(form.getByRole('textbox', { name: 'Описание', exact: true })).toHaveValue(
      'Проверка сохранения в PostgreSQL',
    );
    await expect(form.getByRole('combobox', { name: /^Статус/ })).toHaveText('В работе');
    await form.getByRole('button', { name: 'Удалить задачу', exact: true }).click();
    await page.getByRole('button', { name: 'Удалить', exact: true }).click();
    await expect(
      page.getByRole('button', { name: `Открыть задачу: ${title} — обновлено`, exact: true }),
    ).toHaveCount(0);
  });

  test('ошибка API сохраняет введенный текст и позволяет повторить создание', async ({ page }) => {
    const title = `E2E повтор ${Date.now()}`;
    await page.goto('/');
    await page.getByRole('button', { name: 'Создать задачу', exact: true }).click();
    const form = page.getByRole('dialog');
    await form.getByRole('textbox', { name: /^Название/ }).fill(title);
    await form
      .getByRole('textbox', { name: 'Описание', exact: true })
      .fill('Этот текст нельзя потерять');
    await page.route('**/api/tasks', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: '{"message":"Сервис временно недоступен"}',
        });
      } else {
        await route.continue();
      }
    });
    await form.getByRole('button', { name: 'Создать задачу', exact: true }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
    await expect(form.getByRole('textbox', { name: /^Название/ })).toHaveValue(title);
    await expect(form.getByRole('textbox', { name: 'Описание', exact: true })).toHaveValue(
      'Этот текст нельзя потерять',
    );
    await page.unroute('**/api/tasks');
    const created = page.waitForResponse(
      (response) => response.url().endsWith('/api/tasks') && response.request().method() === 'POST',
    );
    await form.getByRole('button', { name: 'Создать задачу', exact: true }).click();
    const task = (await (await created).json()) as { id: string };
    taskIds.add(task.id);
    await expect(form).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: `Открыть задачу: ${title}`, exact: true }),
    ).toBeVisible();
  });

  test('мобильный экран: форма помещается, задача доступна после создания', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const title = `E2E мобильная ${Date.now()}`;
    await page.goto('/');
    await page.getByRole('button', { name: 'Создать задачу', exact: true }).click();
    const form = page.getByRole('dialog');
    await form.getByRole('textbox', { name: /^Название/ }).fill(title);
    await form.getByRole('combobox', { name: /^Статус/ }).click();
    await page.getByRole('option', { name: 'В работе', exact: true }).click();
    const created = page.waitForResponse(
      (response) => response.url().endsWith('/api/tasks') && response.request().method() === 'POST',
    );
    await form.getByRole('button', { name: 'Создать задачу', exact: true }).click();
    const task = (await (await created).json()) as { id: string };
    taskIds.add(task.id);
    await expect(form).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: `Открыть задачу: ${title}`, exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('tab', { name: /^В работе/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy();
  });

  test('перетаскивание сохраняет статус в БД', async ({ page, request }) => {
    const title = `E2E drag ${Date.now()}`;
    const response = await request.post('/api/tasks', { data: { title } });
    expect(response.ok()).toBeTruthy();
    const task = (await response.json()) as { id: string };
    taskIds.add(task.id);
    await page.goto('/');
    const handle = page.getByRole('button', { name: `Переместить: ${title}`, exact: true });
    const target = page.getByTestId('column-in_progress');
    const sourceBox = await handle.boundingBox();
    const targetBox = await target.boundingBox();
    expect(sourceBox).not.toBeNull();
    expect(targetBox).not.toBeNull();
    if (!sourceBox || !targetBox) throw new Error('Не найдена область перетаскивания');
    const moved = page.waitForResponse(
      (result) =>
        result.url().endsWith(`/api/tasks/${task.id}`) && result.request().method() === 'PATCH',
    );
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      sourceBox.x + sourceBox.width / 2 + 12,
      sourceBox.y + sourceBox.height / 2,
      { steps: 3 },
    );
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 110, { steps: 20 });
    await page.mouse.up();
    expect((await moved).ok()).toBeTruthy();
    await expect(target.getByTestId(`task-${task.id}`)).toBeVisible();
    await page.reload();
    await expect(target.getByTestId(`task-${task.id}`)).toBeVisible();
  });

  test('ошибка смены статуса возвращает карточку в исходную колонку', async ({ page, request }) => {
    const title = `E2E rollback ${Date.now()}`;
    const response = await request.post('/api/tasks', { data: { title } });
    expect(response.ok()).toBeTruthy();
    const task = (await response.json()) as { id: string };
    taskIds.add(task.id);
    await page.goto('/');
    await expect(page.getByTestId('column-new').getByTestId(`task-${task.id}`)).toBeVisible();
    await page.route(`**/api/tasks/${task.id}`, async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: '{"message":"Сервис временно недоступен"}',
        });
      } else {
        await route.continue();
      }
    });
    await page.getByRole('button', { name: `Действия: ${title}`, exact: true }).click();
    await page.getByRole('menuitem', { name: 'В работе', exact: true }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
    await expect(page.getByTestId('column-new').getByTestId(`task-${task.id}`)).toBeVisible();
    const persisted = await request.get(`/api/tasks/${task.id}`);
    expect(((await persisted.json()) as { status: string }).status).toBe('new');
  });

  test('поиск, фильтр приоритета и сохранение темы', async ({ page, request }) => {
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
    await page.getByRole('button', { name: 'Тёмная тема' }).click();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Светлая тема' })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('sobrano-theme'))).toBe('dark');
  });
});

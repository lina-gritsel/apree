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
    const detail = page.getByTestId('task-page');
    await page.getByRole('button', { name: `Открыть задачу: ${title}`, exact: true }).click();
    await detail.getByRole('textbox', { name: /^Название/ }).fill(`${title} — обновлено`);
    const saved = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/api/tasks/${task.id}`) && response.request().method() === 'PATCH',
    );
    await detail.getByRole('button', { name: 'Сохранить изменения', exact: true }).click();
    expect((await saved).ok()).toBeTruthy();
    await page.getByRole('button', { name: 'Назад к задачам', exact: true }).click();
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
    await expect(detail.getByRole('textbox', { name: 'Описание', exact: true })).toHaveValue(
      'Проверка сохранения в PostgreSQL',
    );
    await expect(detail.getByRole('combobox', { name: /^Статус/ })).toHaveText('В работе');
    await detail.getByRole('button', { name: 'Удалить задачу', exact: true }).click();
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
    const card = page.getByRole('button', { name: `Открыть задачу: ${title}`, exact: true });
    const target = page.getByTestId('column-in_progress');
    await expect(card).toHaveCSS('cursor', 'pointer');
    const sourceBox = await card.boundingBox();
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
    await expect(page.getByTestId(`overlay-${task.id}`)).toHaveCSS('cursor', 'grabbing');
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 110, { steps: 20 });
    await page.mouse.up();
    expect((await moved).ok()).toBeTruthy();
    await expect(target.getByTestId(`task-${task.id}`)).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.reload();
    await expect(target.getByTestId(`task-${task.id}`)).toBeVisible();
    await card.click();
    await expect(page.getByTestId('task-page')).toBeVisible();
    await expect(page).toHaveURL(`/tasks/${task.id}`);
    await expect(page.getByRole('textbox', { name: /^Название/ })).toHaveValue(title);
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
    await page.getByRole('button', { name: 'Светлая тема' }).click();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Тёмная тема' })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('forma-theme'))).toBe('light');
  });

  test('метка и файл сохраняются после редактирования и доступны для скачивания', async ({
    page,
    request,
  }) => {
    const title = `E2E вложение ${Date.now()}`;
    const fileText = 'Реальный файл: контроль сохранения и скачивания.';
    await page.goto('/');
    await page.getByRole('button', { name: 'Создать задачу', exact: true }).click();
    const form = page.getByRole('dialog');
    await form.getByRole('textbox', { name: /^Название/ }).fill(title);
    await form.getByRole('button', { name: 'Метки', exact: true }).click();
    await page.getByRole('textbox', { name: 'Новая метка', exact: true }).fill('Проверка');
    await page.getByRole('button', { name: 'Добавить метку', exact: true }).click();
    await form
      .getByLabel('Файлы', { exact: true })
      .setInputFiles({ name: 'brief.txt', mimeType: 'text/plain', buffer: Buffer.from(fileText) });
    await expect(form.getByText('brief.txt', { exact: true })).toBeVisible();
    const created = page.waitForResponse(
      (response) => response.url().endsWith('/api/tasks') && response.request().method() === 'POST',
    );
    await form.getByRole('button', { name: 'Создать задачу', exact: true }).click();
    const task = (await (await created).json()) as { id: string };
    taskIds.add(task.id);
    await expect(form).not.toBeVisible();
    await page.reload();
    const detail = page.getByTestId('task-page');
    await page.getByRole('button', { name: `Открыть задачу: ${title}`, exact: true }).click();
    await expect(detail.getByText('Проверка', { exact: true })).toBeVisible();
    const attachment = detail.getByRole('link', { name: 'brief.txt', exact: true });
    await expect(attachment).toBeVisible();
    const href = await attachment.getAttribute('href');
    expect(href).toBeTruthy();
    const download = await request.get(href!);
    expect(download.status()).toBe(200);
    expect(await download.text()).toBe(fileText);
    expect(download.headers()['content-disposition']).toContain('attachment');
    await detail
      .getByRole('textbox', { name: 'Описание', exact: true })
      .fill('Изменили описание, сохранили файл');
    const saved = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/api/tasks/${task.id}`) && response.request().method() === 'PATCH',
    );
    await detail.getByRole('button', { name: 'Сохранить изменения', exact: true }).click();
    expect((await saved).ok()).toBeTruthy();
    await page.reload();
    await expect(detail.getByText('Проверка', { exact: true })).toBeVisible();
    await expect(detail.getByRole('link', { name: 'brief.txt', exact: true })).toHaveAttribute(
      'href',
      href!,
    );
    const persisted = await request.get(href!);
    expect(await persisted.text()).toBe(fileText);
  });

  test('страница задачи: прямая ссылка, комментарий, активность и история браузера', async ({
    page,
    request,
  }) => {
    const title = `E2E страница ${Date.now()}`;
    const response = await request.post('/api/tasks', { data: { title } });
    expect(response.ok()).toBeTruthy();
    const task = (await response.json()) as { id: string };
    taskIds.add(task.id);
    await page.goto('/');
    await page.getByRole('button', { name: `Открыть задачу: ${title}`, exact: true }).click();
    await expect(page).toHaveURL(`/tasks/${task.id}`);
    const detail = page.getByTestId('task-page');
    await expect(detail).toBeVisible();
    await page.reload();
    await expect(detail.getByRole('textbox', { name: /^Название/ })).toHaveValue(title);
    await expect(
      page
        .getByRole('region', { name: 'Активность', exact: true })
        .getByText('Задача создана', { exact: true }),
    ).toBeVisible();
    await detail
      .getByRole('textbox', { name: 'Описание', exact: true })
      .fill('Несохраненный черновик');
    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: 'Назад к задачам', exact: true }).click();
    await expect(page).toHaveURL(`/tasks/${task.id}`);
    await expect(detail.getByRole('textbox', { name: 'Описание', exact: true })).toHaveValue(
      'Несохраненный черновик',
    );
    await detail.getByRole('textbox', { name: 'Описание', exact: true }).fill('');
    const comment = `Согласовали следующий шаг ${Date.now()}`;
    await detail.getByRole('textbox', { name: 'Комментарий', exact: true }).fill(comment);
    await page
      .getByRole('region', { name: 'Активность' })
      .getByLabel('Файлы', { exact: true })
      .setInputFiles({
        name: 'comment.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Файл комментария'),
      });
    await page.route(`**/api/tasks/${task.id}/comments`, (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{"message":"Попробуйте еще раз"}',
      }),
    );
    await detail.getByRole('button', { name: 'Отправить комментарий', exact: true }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
    await expect(detail.getByRole('textbox', { name: 'Комментарий', exact: true })).toHaveValue(
      comment,
    );
    await page.unroute(`**/api/tasks/${task.id}/comments`);
    await detail.getByRole('button', { name: 'Отправить комментарий', exact: true }).click();
    await expect(
      page
        .getByRole('region', { name: 'Активность', exact: true })
        .getByText(comment, { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page
        .getByRole('region', { name: 'Активность', exact: true })
        .getByText(comment, { exact: true }),
    ).toBeVisible();
    const commentFile = page
      .getByRole('region', { name: 'Активность' })
      .getByRole('link', { name: 'comment.txt', exact: true });
    await expect(commentFile).toBeVisible();
    const fileResponse = await request.get((await commentFile.getAttribute('href'))!);
    expect(await fileResponse.text()).toBe('Файл комментария');
    await page.goBack();
    await expect(page).toHaveURL('/');
    await expect(
      page.getByRole('button', { name: `Открыть задачу: ${title}`, exact: true }),
    ).toBeVisible();
    await page.goForward();
    await expect(detail).toBeVisible();
    await page.goto(`/tasks/${task.id}`);
    await expect(detail.getByRole('textbox', { name: /^Название/ })).toHaveValue(title);
    await expect(
      page
        .getByRole('region', { name: 'Активность', exact: true })
        .getByText(comment, { exact: true }),
    ).toBeVisible();
  });

  test('список сохраняет фильтры и выбранный вид после перезагрузки', async ({ page, request }) => {
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

  test('участник создается и назначение сохраняется на доске, в списке и на странице', async ({
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
        (response) =>
          response.url().endsWith('/api/users') && response.request().method() === 'POST',
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

  test('панель свойств остается видимой при прокрутке длинной активности', async ({
    page,
    request,
  }) => {
    const response = await request.post('/api/tasks', {
      data: { title: `E2E прокрутка ${Date.now()}` },
    });
    const task = (await response.json()) as { id: string };
    taskIds.add(task.id);
    for (let index = 0; index < 5; index++) {
      const comment = await request.post(`/api/tasks/${task.id}/comments`, {
        data: { body: `Запись ${index}\n` + 'Подробный контекст задачи.\n'.repeat(12) },
      });
      expect(comment.ok()).toBeTruthy();
    }
    await page.goto(`/tasks/${task.id}`);
    const detail = page.getByTestId('task-page');
    const properties = page.getByTestId('task-properties');
    await expect(properties).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Активность' }).getByText(/^Запись 4/),
    ).toBeVisible();
    await detail.evaluate((element) => {
      element.scrollTop = 600;
    });
    await expect.poll(() => detail.evaluate((element) => element.scrollTop)).toBeGreaterThan(200);
    const container = await detail.boundingBox();
    const sidebar = await properties.boundingBox();
    expect(container).not.toBeNull();
    expect(sidebar).not.toBeNull();
    expect(sidebar!.y).toBeGreaterThanOrEqual(container!.y);
    expect(sidebar!.y).toBeLessThan(container!.y + 40);
    await expect(
      properties.getByRole('button', { name: 'Исполнитель', exact: true }),
    ).toBeInViewport();
  });
});

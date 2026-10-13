import { expect, test } from './fixtures';

test('метка и файл сохраняются после редактирования и доступны для скачивания', async ({
  taskIds,
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
  taskIds,
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

test('панель свойств остается видимой при прокрутке длинной активности', async ({
  taskIds,
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

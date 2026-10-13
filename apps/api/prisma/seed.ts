import { PrismaClient, Priority, Status } from '@prisma/client';

const prisma = new PrismaClient();
const samples = [
  {
    id: 'b23b46ae-6c84-44dc-b62a-ab710a5c8a01',
    title: 'Собрать обратную связь команды',
    description: 'Узнать, что помогает держать фокус, а что мешает в ежедневной работе.',
    priority: Priority.high,
    status: Status.new,
  },
  {
    id: 'b23b46ae-6c84-44dc-b62a-ab710a5c8a02',
    title: 'Продумать мобильный сценарий',
    description: 'Проверить создание и перемещение задач на небольшом экране.',
    priority: Priority.medium,
    status: Status.new,
  },
  {
    id: 'b23b46ae-6c84-44dc-b62a-ab710a5c8a03',
    title: 'Обновить визуальный язык',
    description: 'Согласовать типографику, цвета и состояния компонентов.',
    priority: Priority.high,
    status: Status.in_progress,
  },
  {
    id: 'b23b46ae-6c84-44dc-b62a-ab710a5c8a04',
    title: 'Подготовить заметки к релизу',
    description: 'Коротко описать улучшения и собрать ссылки на готовые задачи.',
    priority: Priority.low,
    status: Status.in_progress,
  },
  {
    id: 'b23b46ae-6c84-44dc-b62a-ab710a5c8a05',
    title: 'Настроить рабочее пространство',
    description: 'Всё готово для спокойной и продуктивной работы.',
    priority: Priority.medium,
    status: Status.done,
  },
  {
    id: 'b23b46ae-6c84-44dc-b62a-ab710a5c8a06',
    title: 'Определить цель спринта',
    description: 'Сделать управление задачами простым и приятным.',
    priority: Priority.low,
    status: Status.done,
  },
];

async function seed() {
  const demoUsers = [
    { id: 'fac91aa1-150e-4085-94cd-990ae94da001', name: 'Алексей · демо', color: '#7c6ee6' },
    { id: 'fac91aa1-150e-4085-94cd-990ae94da002', name: 'Мария · демо', color: '#39866f' },
    { id: 'fac91aa1-150e-4085-94cd-990ae94da003', name: 'Денис · демо', color: '#497fb3' },
  ];
  for (const user of demoUsers) {
    await prisma.workspaceUser.upsert({ where: { id: user.id }, create: user, update: {} });
  }
  for (const task of samples) {
    await prisma.task.upsert({ where: { id: task.id }, create: task, update: {} });
  }
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

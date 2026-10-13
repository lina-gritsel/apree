import { useState } from 'react';
import { Box } from '@mui/material';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { statuses } from '../../model/constants';
import type { Status, Task } from '../../model/types';
import { BoardColumn } from './BoardColumn';
import { TaskCard } from './TaskCard';

interface Props {
  tasks: Task[];
  mobile: boolean;
  mobileStatus: Status;
  loading: boolean;
  filtered: boolean;
  busy: boolean;
  onCreate: (status: Status) => void;
  onOpen: (task: Task) => void;
  onMove: (id: string, status: Status) => void;
  onDelete: (task: Task) => void;
}
export function KanbanBoard({
  tasks,
  mobile,
  mobileStatus,
  loading,
  filtered,
  busy,
  onCreate,
  onOpen,
  onMove,
  onDelete,
}: Props) {
  const [active, setActive] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );
  function dragEnd({ active: dragged, over }: DragEndEvent) {
    setActive(null);
    const task = tasks.find((item) => item.id === dragged.id);
    const status = statuses.find((item) => item.value === over?.id)?.value;
    if (task && status && task.status !== status) onMove(task.id, status);
  }
  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event) => setActive(tasks.find((task) => task.id === event.active.id) ?? null)}
      onDragEnd={dragEnd}
      onDragCancel={() => setActive(null)}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            'Чтобы взять задачу, нажмите пробел. Перемещайте её стрелками. Нажмите пробел для завершения или Escape для отмены. Статус также можно изменить через меню задачи.',
        },
      }}
    >
      {active && <Box component="style">{'body, body * { cursor: grabbing !important; }'}</Box>}
      <Box
        sx={{
          display: 'grid',
          flex: 1,
          minHeight: 0,
          gridTemplateRows: 'minmax(0, 1fr)',
          gridTemplateColumns: mobile ? 'minmax(0, 1fr)' : 'repeat(3, minmax(0, 1fr))',
          gap: 1.5,
          pt: 0.5,
          pb: 1,
        }}
      >
        {statuses
          .filter((status) => !mobile || status.value === mobileStatus)
          .map((status) => (
            <BoardColumn
              key={status.value}
              status={status}
              tasks={tasks.filter((task) => task.status === status.value)}
              loading={loading}
              filtered={filtered}
              busy={busy}
              onCreate={onCreate}
              onOpen={onOpen}
              onMove={onMove}
              onDelete={onDelete}
            />
          ))}
      </Box>
      <DragOverlay dropAnimation={null}>
        {active && (
          <TaskCard task={active} onOpen={onOpen} onMove={onMove} onDelete={onDelete} overlay />
        )}
      </DragOverlay>
    </DndContext>
  );
}

import { useState } from 'react';
import { filterTasks } from './filterTasks';
import type { Priority, Status, Task } from './types';

export function useBoardState(tasks: Task[]) {
  const [view, setView] = useState<'board' | 'list'>(() => {
    try {
      return localStorage.getItem('apri-view') === 'list' ? 'list' : 'board';
    } catch {
      return 'board';
    }
  });
  const changeView = (value: 'board' | 'list') => {
    setView(value);
    try {
      localStorage.setItem('apri-view', value);
    } catch {
      /* View remains usable without storage. */
    }
  };
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<Priority | 'all'>('all');
  const [mobileStatus, setMobileStatus] = useState<Status>('new');
  return {
    view,
    changeView,
    search,
    setSearch,
    priority,
    setPriority,
    mobileStatus,
    setMobileStatus,
    filteredTasks: filterTasks(tasks, search, priority),
    filtered: !!search.trim() || priority !== 'all',
  };
}

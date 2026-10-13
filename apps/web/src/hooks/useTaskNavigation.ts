import { useCallback, useEffect, useRef, useState } from 'react';

const taskFromPath = () => /^\/tasks\/([^/]+)\/?$/.exec(location.pathname)?.[1] ?? null;

export function useTaskNavigation() {
  const [taskId, setTaskId] = useState(taskFromPath);
  const dirty = useRef(false);
  const currentPath = useRef(location.pathname);
  const onDirtyChange = useCallback((value: boolean) => {
    dirty.current = value;
  }, []);
  const canLeave = () =>
    !dirty.current || window.confirm('Есть несохранённые изменения. Покинуть задачу?');
  const navigate = (id: string | null, force = false) => {
    if (!force && !canLeave()) return;
    dirty.current = false;
    const path = id ? '/tasks/' + encodeURIComponent(id) : '/';
    if (location.pathname !== path) history.pushState(null, '', path);
    currentPath.current = path;
    setTaskId(id);
  };
  useEffect(() => {
    const pop = () => {
      if (!canLeave()) {
        history.pushState(null, '', currentPath.current);
        return;
      }
      dirty.current = false;
      currentPath.current = location.pathname;
      setTaskId(taskFromPath());
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('popstate', pop);
    window.addEventListener('beforeunload', unload);
    return () => {
      window.removeEventListener('popstate', pop);
      window.removeEventListener('beforeunload', unload);
    };
  }, []);
  return { taskId, navigate, onDirtyChange };
}

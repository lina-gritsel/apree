export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json' },
  }).catch((error: unknown) => {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new Error('Не удалось связаться с сервером. Проверьте подключение и попробуйте ещё раз.');
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    const message = Array.isArray(body?.message) ? body.message.join('. ') : body?.message;
    throw new Error(message || 'Не удалось связаться с сервером. Попробуйте ещё раз.');
  }
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
}

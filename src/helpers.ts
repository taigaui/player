export function humanTimestamp(sec: number): string {
  const seconds = Math.floor(sec % 60);
  const minutes = Math.floor(sec / 60);
  const hours = Math.floor(sec / 3600);

  if (!hours && !minutes) {
    return `0:${String(seconds).padStart(2, '0')}`;
  } else if (!hours) {
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  } else {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(
      seconds,
    ).padStart(2, '0')}`;
  }
}

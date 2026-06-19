export function getApiUrl(): string {
  const host = window.location.hostname;
  return `http://${host}:8080/hoyjugas/auth`;
}

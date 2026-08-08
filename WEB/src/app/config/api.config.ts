export function getAuthApiUrl(): string {
  const host = window.location.hostname;
  return `http://${host}:8080/hoyjugas/auth`;
}

export function getUserApiUrl(): string {
  const host = window.location.hostname;
  return `http://${host}:8080/hoyjugas/user`;
}

export function getBookingApiUrl(): string {
  const host = window.location.hostname;
  return `http://${host}:8080/hoyjugas/bookings`;
}

export function getSpaceApiUrl(): string {
  const host = window.location.hostname;
  return `http://${host}:8080/hoyjugas/spaces`;
}

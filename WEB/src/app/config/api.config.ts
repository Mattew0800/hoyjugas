
function getApiBaseUrl(): string {
  const hostname = window.location.hostname;

  // Entorno local: Angular (4200) → Spring Boot (8080)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080/hoyjugas';
  }

  // Entorno público (ngrok/deploy): utiliza el mismo dominio y protocolo
  return `${window.location.origin}/hoyjugas`;
}

export function getAuthApiUrl(): string {
  return `${getApiBaseUrl()}/auth`;
}

export function getUserApiUrl(): string {
  return `${getApiBaseUrl()}/user`;
}

export function getBookingApiUrl(): string {
  return `${getApiBaseUrl()}/bookings`;
}

export function getSpaceApiUrl(): string {
  return `${getApiBaseUrl()}/internal/spaces`;
}

export function getAdminSpaceApiUrl(): string {
  return `${getApiBaseUrl()}/admin/spaces`;
}

export function getAdminConfigApiUrl(): string {
  return `${getApiBaseUrl()}/admin/config`;
}

export function getComplexScheduleApiUrl(): string {
  return `${getApiBaseUrl()}/complex-schedule`;
}

export function getRecurringBookingApiUrl(): string {
  return `${getApiBaseUrl()}/recurring-bookings`;
}

export function getProductApiUrl(): string {
  const host = window.location.hostname;
  return `http://${host}:8080/hoyjugas/product`;
}

export function getCategoryApiUrl(): string {
  const host = window.location.hostname;
  return `http://${host}:8080/hoyjugas/category`;
}

export function getSupplierApiUrl(): string {
  const host = window.location.hostname;
  return `http://${host}:8080/hoyjugas/suppliers`;
}

export function getInventoryApiUrl(): string {
  const host = window.location.hostname;
  return `http://${host}:8080/hoyjugas/inventory`;
}


export function getSaleApiUrl(): string {
  const host = window.location.hostname;
  return `http://${host}:8080/hoyjugas/sales`;
}

export function getGoodsReceiptApiUrl(): string {
  const host = window.location.hostname;
  return `http://${host}:8080/hoyjugas/goods-receipt`;
}

export function getExpenseApiUrl(): string {
  const host = window.location.hostname;
  return `http://${host}:8080/hoyjugas/expenses`;
}

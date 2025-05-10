import { useAlert } from '@/contexts/AlertContext';

export async function fetchWithAlert(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  const { showAlert } = useAlert();
  const response = await fetch(input, init);
  let message = '';
  let type: 'success' | 'info' | 'danger' = 'info';

  try {
    const data = await response.clone().json();
    if (data && data.message) {
      message = data.message;
    }
  } catch {}

  if (response.ok) {
    if (message) showAlert(message, 'success');
  } else if (response.status >= 400 && response.status < 500) {
    if (message) showAlert(message, 'info');
  } else if (response.status >= 500) {
    showAlert('خطای سرور! لطفا بعدا تلاش کنید.', 'danger');
  }

  return response;
} 
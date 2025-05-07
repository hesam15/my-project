/**
 * Gets the XSRF token from cookies
 * @returns {string | null} The XSRF token if found, null otherwise
 */
export const getXsrfToken = (): string | null => {
  const cookies = document.cookie.split(';');
  const xsrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
  if (xsrfCookie) {
    return decodeURIComponent(xsrfCookie.split('=')[1]);
  }
  return null;
};

/**
 * Sets the XSRF token in cookies
 * @param {string} token - The XSRF token to set
 */
export const setXsrfToken = (token: string): void => {
  document.cookie = `XSRF-TOKEN=${encodeURIComponent(token)}; path=/`;
};

/**
 * Removes the XSRF token from cookies
 */
export const removeXsrfToken = (): void => {
  document.cookie = 'XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};
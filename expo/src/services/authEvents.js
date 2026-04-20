let onUnauthorizedHandler = null;

export function registerUnauthorizedHandler(handler) {
  onUnauthorizedHandler = handler;
}

export async function triggerUnauthorized() {
  if (typeof onUnauthorizedHandler === 'function') {
    try {
      await onUnauthorizedHandler();
    } catch (_) {}
  }
}

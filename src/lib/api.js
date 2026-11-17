const KEY_STORAGE = 'klearway.workspaceKey';

export const accessKey = {
  get: () => (typeof window === 'undefined' ? '' : window.sessionStorage.getItem(KEY_STORAGE) || ''),
  set: (k) => window.sessionStorage.setItem(KEY_STORAGE, k),
  clear: () => window.sessionStorage.removeItem(KEY_STORAGE),
};

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details || {};
  }
}

/** fetch wrapper: JSON in/out, workspace key header, readable errors. Never fakes success. */
export async function api(path, { method = 'GET', body, form, signal } = {}) {
  const headers = {};
  const key = accessKey.get();
  if (key) headers['x-workspace-key'] = key;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(path, { method, headers, body: payload, signal });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new ApiError(0, 'Could not reach the Klearway server. Check your connection, or that the API is running.');
  }
  if (res.status === 204) return null;
  const type = res.headers.get('content-type') || '';
  const data = type.includes('application/json') ? await res.json().catch(() => null) : null;
  if (!res.ok || !data) {
    const msg = data?.error || (res.status === 404 ? 'The Klearway API is not available at this address.' : `Request failed (${res.status}).`);
    throw new ApiError(res.status, msg, data?.details);
  }
  return data;
}

export const fileUrl = (shipmentId, docId) => `/api/workspace/shipments/${shipmentId}/documents/${docId}/file`;

/** Fetches a stored document with the access key and returns an object URL for preview. */
export async function fetchFileBlobUrl(shipmentId, docId) {
  const headers = {};
  const key = accessKey.get();
  if (key) headers['x-workspace-key'] = key;
  const res = await fetch(fileUrl(shipmentId, docId), { headers });
  if (!res.ok) throw new ApiError(res.status, 'Could not load the stored file.');
  return URL.createObjectURL(await res.blob());
}

const ACCEPTED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
const ACCEPTED_VIDEO = ['video/mp4', 'video/quicktime', 'video/webm'];
const ACCEPTED_DOC = ['application/pdf'];
export const ACCEPTED_MIME = [...ACCEPTED_IMAGE, ...ACCEPTED_VIDEO, ...ACCEPTED_DOC];

export function isImage(mime: string) {
  return ACCEPTED_IMAGE.includes(mime);
}
export function isVideo(mime: string) {
  return ACCEPTED_VIDEO.includes(mime);
}

export type UploadResult = {
  url: string;
  pathname: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
};

function getToken(): string | null {
  return localStorage.getItem('ps_admin_token');
}

function getApiBase(): string {
  if (import.meta.env.PROD) return '/api';
  return import.meta.env.VITE_API_URL || '/api';
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve({ width: 0, height: 0 });
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
}

async function getVideoMetadata(file: File): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('video/')) return resolve({ width: 0, height: 0, duration: 0 });
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
        duration: Math.round(video.duration) || 0,
      });
    };
    video.onerror = () => resolve({ width: 0, height: 0, duration: 0 });
    video.src = URL.createObjectURL(file);
  });
}

export async function uploadFile(
  file: File,
  category: string,
  onProgress?: (pct: number) => void,
  signal?: AbortSignal
): Promise<UploadResult> {
  if (!ACCEPTED_MIME.includes(file.type)) {
    throw new Error(`Tipo de archivo no soportado: ${file.type}`);
  }

  const token = getToken();
  if (!token) throw new Error('No autenticado');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${getApiBase()}/media?action=upload&category=${encodeURIComponent(category)}&fileName=${encodeURIComponent(file.name)}`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', file.type);

    if (signal) {
      if (signal.aborted) { xhr.abort(); }
      signal.addEventListener('abort', () => xhr.abort());
    }

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        let dims = { width: 0, height: 0 };
        let duration: number | undefined;
        let thumbnail: string | undefined;

        if (isImage(file.type)) {
          dims = await getImageDimensions(file);
          thumbnail = data.url;
        } else if (isVideo(file.type)) {
          const meta = await getVideoMetadata(file);
          dims = { width: meta.width, height: meta.height };
          duration = meta.duration;
        }

        resolve({
          url: data.url,
          pathname: data.pathname,
          mimeType: file.type,
          fileSize: file.size,
          width: dims.width || undefined,
          height: dims.height || undefined,
          duration,
          thumbnail,
        });
      } else {
        reject(new Error(`Error al subir (${xhr.status})`));
      }
    };

    xhr.onabort = () => reject(new Error('Subida cancelada'));
    xhr.onerror = () => reject(new Error('Error de red al subir el archivo'));
    xhr.send(file);
  });
}

export async function deleteFile(url: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('No autenticado');
  const res = await fetch(`${getApiBase()}/media?action=blob&url=${encodeURIComponent(url)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al eliminar el archivo');
}

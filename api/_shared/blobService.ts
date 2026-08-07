import { put, del } from '@vercel/blob';

type PutBody = Parameters<typeof put>[1];

export type UploadedBlob = {
  url: string;
  downloadUrl: string;
  pathname: string;
  contentType: string;
  contentDisposition: string | undefined;
};

export async function uploadBlob(
  pathname: string,
  body: PutBody,
  contentType: string,
): Promise<UploadedBlob> {
  const blob = await put(pathname, body, {
    access: 'public',
    contentType,
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
    contentType: blob.contentType,
    contentDisposition: blob.contentDisposition,
  };
}

export async function deleteBlob(url: string): Promise<void> {
  await del(url);
}

import 'server-only';

import { google } from 'googleapis';
import { decryptAudiencePin } from '@/lib/audience-pdf-auth';

const DRIVE_FOLDER_ID = '1HQQgM1ziIm1ZG4gSkutqFewgEFKm0HX7';
const GOOGLE_SLIDES_MIME_TYPE = 'application/vnd.google-apps.presentation';

const requiredEnv = (key: string) => {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

const getAuth = () =>
  new google.auth.JWT({
    email: requiredEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL').replace(/^"|"$/g, ''),
    key: requiredEnv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY').replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/presentations.readonly',
    ],
  });

export type DrivePresentation = {
  id: string;
  title: string;
  modifiedTime: string;
  thumbnailUrl: string | null;
  slideUrls: string[];
  previewUrl: string;
  audiencePdf: { id: string; enabled: boolean; pin: string | null } | null;
};

export const AUDIENCE_PDF_FOLDER_ID = '1AaU0FFP3PUrkDnuR5g8ijHFHxgiwO9CY';

export const getDriveClient = () => google.drive({ version: 'v3', auth: getAuth() });

export async function getDrivePresentations(): Promise<DrivePresentation[]> {
  const auth = getAuth();
  const drive = google.drive({ version: 'v3', auth });
  const slides = google.slides({ version: 'v1', auth });
  const pdfResponse = await drive.files.list({
    q: "mimeType = 'application/pdf' and trashed = false",
    fields: 'files(id,parents,appProperties)',
    pageSize: 100,
  });
  const audiencePdfs = (pdfResponse.data.files ?? []).filter((file) => file.parents?.includes(AUDIENCE_PDF_FOLDER_ID));
  const matchedFiles: Array<{ id: string; name: string; modifiedTime: string }> = [];
  let pageToken: string | undefined;

  do {
    const response = await drive.files.list({
      q: `mimeType = '${GOOGLE_SLIDES_MIME_TYPE}' and trashed = false`,
      fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,parents)',
      orderBy: 'modifiedTime desc',
      pageSize: 100,
      pageToken,
    });

    for (const file of response.data.files ?? []) {
      if (!file.id || !file.name || !file.parents?.includes(DRIVE_FOLDER_ID)) continue;
      matchedFiles.push({ id: file.id, name: file.name, modifiedTime: file.modifiedTime ?? '' });
    }
    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return Promise.all(
    matchedFiles.map(async (file) => {
      let slideUrls: string[] = [];
      try {
        const deck = await slides.presentations.get({ presentationId: file.id, fields: 'slides(objectId)' });
        const thumbnails = await Promise.all(
          (deck.data.slides ?? []).map(async (slide) => {
            if (!slide.objectId) return null;
            const thumbnail = await slides.presentations.pages.getThumbnail({
              presentationId: file.id,
              pageObjectId: slide.objectId,
              'thumbnailProperties.mimeType': 'PNG',
              'thumbnailProperties.thumbnailSize': 'LARGE',
            });
            return thumbnail.data.contentUrl ?? null;
          }),
        );
        slideUrls = thumbnails.filter((url): url is string => Boolean(url));
      } catch {
        // The card remains visible even if Google cannot produce thumbnails.
      }

      return {
        id: file.id,
        title: file.name.replace(/_/g, ' '),
        modifiedTime: file.modifiedTime,
        thumbnailUrl: slideUrls[0] ?? null,
        slideUrls,
        previewUrl: `https://docs.google.com/presentation/d/${file.id}/preview`,
        audiencePdf: (() => {
          const pdf = audiencePdfs.find((item) => item.appProperties?.sourcePresentationId === file.id);
          return pdf?.id ? { id: pdf.id, enabled: pdf.appProperties?.audienceEnabled === 'true', pin: decryptAudiencePin(pdf.id, pdf.appProperties?.audiencePinCipher) } : null;
        })(),
      };
    }),
  );
}

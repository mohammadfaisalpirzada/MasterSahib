'use client';

// Shared client-side image helpers for the admission form photo pipeline —
// used by both the main admission form (page.tsx) and the admin records
// view/edit tool (records/page.tsx), so a photo added or replaced from
// either place goes through the exact same HEIC-safe, size-capped pipeline.

export const MAX_PICTURE_BASE64_LENGTH = 32_000;
export const PICTURE_TARGET_WIDTH = 300;
export const PICTURE_TARGET_HEIGHT = 375;
export const MIN_PICTURE_WIDTH = 160;
export const MIN_PICTURE_HEIGHT = 200;
export const MIN_PICTURE_QUALITY = 0.4;

export const extractBase64Payload = (dataUrl: string) => {
  const [, payload = ''] = dataUrl.split(',');
  return payload;
};

export const loadImageElement = (file: File) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Selected image could not be opened.'));
    };

    image.src = objectUrl;
  });
};

// iPhones commonly save gallery photos as HEIC/HEIF, which browsers other than
// Safari cannot decode into an <img>/canvas at all — that's what causes
// "Selected image could not be opened." Detect it (by MIME type, since some
// phones report an empty/generic type, so we also fall back to the file
// extension) and transcode to JPEG in the browser before doing anything else.
export const isHeicFile = (file: File) => {
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  return type.includes('heic') || type.includes('heif') || name.endsWith('.heic') || name.endsWith('.heif');
};

export const prepareImageFile = async (file: File): Promise<File> => {
  if (!isHeicFile(file)) return file;
  try {
    const heic2any = (await import('heic2any')).default;
    const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
    const blob = Array.isArray(result) ? result[0] : result;
    return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
  } catch {
    throw new Error('This photo is in iPhone HEIC format and could not be converted. Please try "Take Photo" instead, or change your phone camera format to "Most Compatible" (Settings > Camera > Formats) and retake it.');
  }
};

export const drawCenteredCrop = (
  context: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  // 0 = anchor crop to the very top of the photo, 0.5 = dead-center (old
  // behaviour), 1 = anchor to the bottom. For an ID-style student photo we
  // want it biased near the top so it frames face-to-chest, not a random
  // center slice of a full-length photo.
  verticalBias = 0.5,
  // 0 = anchor crop to the very left of the photo, 0.5 = center, 1 = right.
  horizontalBias = 0.5,
  // 1 = the normal "cover" crop (as much of the photo as fits the target
  // box). Larger than 1 zooms in — the crop window shrinks so less of the
  // photo is used, then it's scaled up to fill the same target box.
  zoom = 1
) => {
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;

  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;

  if (sourceRatio > targetRatio) {
    cropWidth = sourceHeight * targetRatio;
  } else {
    cropHeight = sourceWidth / targetRatio;
  }

  const safeZoom = Math.max(1, Math.min(4, zoom));
  cropWidth = cropWidth / safeZoom;
  cropHeight = cropHeight / safeZoom;

  const offsetX = Math.max(0, (sourceWidth - cropWidth) * Math.min(1, Math.max(0, horizontalBias)));
  const offsetY = Math.max(0, (sourceHeight - cropHeight) * Math.min(1, Math.max(0, verticalBias)));

  context.drawImage(source, offsetX, offsetY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);
};

export const compressCanvasToJpegBase64 = (sourceCanvas: HTMLCanvasElement) => {
  let width = sourceCanvas.width;
  let height = sourceCanvas.height;
  let quality = 0.9;
  let attempts = 0;

  const exportCanvas = document.createElement('canvas');
  const exportContext = exportCanvas.getContext('2d');

  if (!exportContext) {
    throw new Error('Image processing is not supported in this browser.');
  }

  while (attempts < 12) {
    exportCanvas.width = width;
    exportCanvas.height = height;
    exportContext.clearRect(0, 0, width, height);
    exportContext.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, width, height);

    const dataUrl = exportCanvas.toDataURL('image/jpeg', quality);
    const base64 = extractBase64Payload(dataUrl);

    if (
      base64.length <= MAX_PICTURE_BASE64_LENGTH ||
      (quality <= MIN_PICTURE_QUALITY && width <= MIN_PICTURE_WIDTH && height <= MIN_PICTURE_HEIGHT)
    ) {
      return base64;
    }

    if (quality > 0.6) {
      quality -= 0.1;
    } else if (quality > MIN_PICTURE_QUALITY) {
      quality -= 0.05;
    } else {
      width = Math.max(MIN_PICTURE_WIDTH, Math.round(width * 0.88));
      height = Math.max(MIN_PICTURE_HEIGHT, Math.round(height * 0.88));
    }

    attempts += 1;
  }

  const fallbackDataUrl = exportCanvas.toDataURL('image/jpeg', MIN_PICTURE_QUALITY);
  const fallbackBase64 = extractBase64Payload(fallbackDataUrl);

  if (fallbackBase64.length > MAX_PICTURE_BASE64_LENGTH) {
    throw new Error('Image is still too large after compression. Please retake with better lighting.');
  }

  return fallbackBase64;
};

// One-shot helper for a simple "pick a file -> compressed base64" flow (no
// manual crop-position UI) — used by the admin records edit tool, where a
// staff member is just backfilling a missing photo, not framing a fresh one.
export const fileToCompressedJpegBase64 = async (
  file: File,
  verticalBias = 0.18
): Promise<string> => {
  const readyFile = await prepareImageFile(file);
  const image = await loadImageElement(readyFile);
  const canvas = document.createElement('canvas');
  canvas.width = PICTURE_TARGET_WIDTH;
  canvas.height = PICTURE_TARGET_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Image processing is not supported in this browser.');
  }
  drawCenteredCrop(
    context,
    image,
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
    PICTURE_TARGET_WIDTH,
    PICTURE_TARGET_HEIGHT,
    verticalBias
  );
  return compressCanvasToJpegBase64(canvas);
};

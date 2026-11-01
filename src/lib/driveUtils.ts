/**
 * Utility functions for formatting and normalizing APK download links,
 * especially transforming Google Drive sharing links into direct-download endpoints.
 */

/**
 * Extracts a Google Drive File ID from common sharing and viewing URLs.
 * Handles formats:
 * - https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
 * - https://drive.google.com/open?id={FILE_ID}
 * - https://drive.google.com/uc?id={FILE_ID}
 * - Raw Google Drive file IDs
 */
export function extractGoogleDriveFileId(urlOrId: string): string | null {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = urlOrId.trim();

  // Pattern 1: /file/d/{FILE_ID}
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Pattern 2: id={FILE_ID}
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // Pattern 3: If trimmed string itself looks like a raw Google Drive ID (alphanumeric, dashes, underscores, length >= 25)
  if (/^[a-zA-Z0-9_-]{25,60}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Converts a URL into an optimal direct APK download URL.
 * If it's a Google Drive URL, returns the direct uc?export=download link.
 * Otherwise returns the normalized original URL.
 */
export function getDirectDownloadUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  
  const driveId = extractGoogleDriveFileId(trimmed);
  if (driveId) {
    return `https://drive.google.com/uc?export=download&id=${driveId}`;
  }

  return trimmed;
}

/**
 * Checks if the given URL is a Google Drive link.
 */
export function isGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  return /drive\.google\.com/.test(url) || Boolean(extractGoogleDriveFileId(url));
}

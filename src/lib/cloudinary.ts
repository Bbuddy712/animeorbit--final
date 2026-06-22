/**
 * Cloudinary Helper
 * 
 * Generates Cloudinary URLs for videos and thumbnails.
 * Does not handle uploads yet.
 * Database stores only the final URLs.
 */

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!cloudName) {
  console.warn("[Cloudinary] VITE_CLOUDINARY_CLOUD_NAME is not defined");
}

if (!uploadPreset) {
  console.warn("[Cloudinary] VITE_CLOUDINARY_UPLOAD_PRESET is not defined");
}

/**
 * Generate Cloudinary video URL
 */
export function getVideoUrl(publicId: string): string {
  if (!cloudName || !publicId) return "";
  return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}.mp4`;
}

/**
 * Generate Cloudinary thumbnail URL
 */
export function getThumbnailUrl(publicId: string, width: number = 600): string {
  if (!cloudName || !publicId) return "";
  return `https://res.cloudinary.com/${cloudName}/video/upload/w_${width},c_scale/${publicId}.jpg`;
}

/**
 * Get upload preset (for future upload functionality)
 */
export function getUploadPreset(): string | undefined {
  return uploadPreset;
}

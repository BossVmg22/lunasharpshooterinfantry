/**
 * Upload a file to Cloudinary via unsigned upload preset.
 * Returns the secure_url of the uploaded image.
 */
export async function uploadToCloudinary(file) {
  const cloudName    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET in .env')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', 'lsi')

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message ?? 'Cloudinary upload failed')
  }

  const data = await res.json()
  return data.secure_url
}

/**
 * Optimize a Cloudinary URL for web delivery.
 * Adds auto format, auto quality, and max width transforms.
 * Falls back to original URL for non-Cloudinary images.
 *
 * @param {string} url    - Original image URL
 * @param {number} width  - Max display width in px (default 800)
 * @returns {string}      - Optimized URL
 */
export function optimizeCloudinaryUrl(url, width = 800) {
  if (!url || !url.includes('res.cloudinary.com')) return url
  // Insert transform params before the version or file segment
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`)
}

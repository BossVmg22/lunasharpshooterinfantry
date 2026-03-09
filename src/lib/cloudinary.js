/**
 * Upload a file to Cloudinary via unsigned upload preset.
 * Returns the secure_url of the uploaded image.
 *
 * Setup in Cloudinary dashboard:
 *   Settings → Upload → Upload Presets → Add unsigned preset
 *   Name it exactly: lsi_unsigned  (or whatever you set in VITE_CLOUDINARY_UPLOAD_PRESET)
 */
export async function uploadToCloudinary(file) {
  const cloudName   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET in .env')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', 'lsi')   // organise uploads in a folder

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message ?? 'Cloudinary upload failed')
  }

  const data = await res.json()
  return data.secure_url   // https://res.cloudinary.com/...
}

// Resizes a user-picked image client-side and returns it as a data URL. Settings
// (including the avatar and custom background) are stored in this browser's
// localStorage, so photos need to be kept small or they'll eat the storage quota.
export function fileToResizedDataUrl(file, maxDim, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Could not read that file."))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error("Could not read that image."))
      img.onload = () => {
        let width = img.naturalWidth
        let height = img.naturalHeight
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL("image/jpeg", quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

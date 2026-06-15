export const encodeFileToBase64 = async (file: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '')
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

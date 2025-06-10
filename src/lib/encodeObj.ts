export function encodeObj(obj: unknown) {
  const jsonString = JSON.stringify(obj)

  let base64String = btoa(jsonString)

  base64String = base64String
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return base64String
}

export function decodeObj(string: string) {
  const paddedString =
    string.replace(/-/g, '+').replace(/_/g, '/') +
    '==='.slice(0, (4 - (string.length % 4)) % 4)

  try {
    const jsonString = atob(paddedString)
    const obj = JSON.parse(jsonString)

    return obj
  } catch (error) {
    return false
  }
}

import { uploadFile } from './_cruds'

type FileWithPreview = File & {
  preview?: string
}

export interface SimulateProgressParams {
  files: FileWithPreview[]
  setProgresses: (progresses: Record<string, number>) => void
}

export interface UploadResult {
  url: string
}

export async function uploadFiles({
  files,
  setProgresses,
}: SimulateProgressParams) {
  const file = files[0]!
  const formData = new FormData()
  formData.append('file', file)

  let progress = 0
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

  while (progress < 100) {
    setProgresses({ [file.name]: progress })
    await sleep(Math.floor(Math.random() * 100))
    progress += Math.floor(Math.random() * 7)
  }
  setProgresses({ [file.name]: 100 })

  return await uploadFile('/file/upload-file', formData)
}

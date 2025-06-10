import { useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/handle-error'
import { uploadFiles } from '@/actions/uploadFiles'
// import { createItem } from '@/actions/_cruds'

export function useUploadFile() {
  const [uploadedFiles, setUploadedFiles] = useState<string>()
  const [progresses, setProgresses] = useState<Record<string, number>>({})
  const [isUploading, setIsUploading] = useState(false)

  async function handleUpload(files: File[]) {
    setIsUploading(true)
    try {
      const res = await uploadFiles({ files, setProgresses })
      setUploadedFiles(res)
      // setUploadedFiles((prev) => (prev ? [...prev, ...res] : res))
      return res
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setProgresses({})
      setIsUploading(false)
    }
  }

  return {
    handleUpload,
    uploadedFiles,
    progresses,
    isUploading,
    setUploadedFiles,
  }
}

'use client'

import React, { useState } from 'react'
import { FileUploader, UploadedFileState } from '@/components/ui/file-uploader'

export const dynamic = 'force-dynamic'

export default function FileUploadSandboxPage() {
  // Dummy file factory
  const createMockFile = (name: string, size: number, type: string) => {
    // Note: Creating a mock file without real content just for UI purposes
    const file = new File([new ArrayBuffer(size)], name, { type })
    return file
  }

  const mockPdfFile = createMockFile(
    'Tech design requirements.pdf',
    200 * 1024,
    'application/pdf',
  )
  const mockImageFile = createMockFile(
    'Dashboard_screenshot.jpg',
    4 * 1024 * 1024,
    'image/jpeg',
  )

  const [interactiveFiles, setInteractiveFiles] = useState<UploadedFileState[]>(
    [],
  )

  const handleSimulateInteractiveUpload = async (files: File[]) => {
    // Simulate an upload progressing over 2 seconds
    const newFiles: UploadedFileState[] = files.map((f) => ({
      file: f,
      progress: 0,
      status: 'uploading',
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }))

    setInteractiveFiles((prev) => [...prev, ...newFiles])

    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setInteractiveFiles((prev) =>
        prev.map((p) => {
          if (progress >= 100)
            return { ...p, progress: 100, status: 'completed' }
          return { ...p, progress }
        }),
      )
      if (progress >= 100) clearInterval(interval)
    }, 200)
  }

  // Static Mock States for demonstration
  const mockUploadingState: UploadedFileState[] = [
    { file: mockPdfFile, progress: 40, status: 'uploading' },
  ]

  const mockCompletedState: UploadedFileState[] = [
    { file: mockPdfFile, progress: 100, status: 'completed' },
  ]

  const mockErrorState: UploadedFileState[] = [
    { file: mockPdfFile, progress: 0, status: 'error' },
  ]

  const mockImageUploadingState: UploadedFileState[] = [
    {
      file: mockImageFile,
      progress: 65,
      status: 'uploading',
      preview:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200&h=150',
    },
  ]
  const mockImageCompletedState: UploadedFileState[] = [
    {
      file: mockImageFile,
      progress: 100,
      status: 'completed',
      preview:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200&h=150',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 pb-32">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            File Uploader — Sandbox
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Catálogo completo de variações do Dropzone e File Cards.
          </p>
        </div>

        {/* INTERACTIVE */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
            Componente Interativo (Real-time Simulation)
          </h2>
          <div className="w-full max-w-[500px]">
            <FileUploader
              onUpload={handleSimulateInteractiveUpload}
              multiple={true}
              maxFileCount={4}
              controlledFiles={interactiveFiles}
              onRemove={(file) =>
                setInteractiveFiles((prev) =>
                  prev.filter((f) => f.file.name !== file.name),
                )
              }
            />
          </div>
        </section>

        {/* STATIC STATES - NORMAL */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2 mb-6">
            Estados Estáticos Fixos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2 w-full max-w-[400px]">
              <span className="text-xs font-semibold text-gray-500">
                1. Estado Vazio (Default)
              </span>
              <FileUploader onUpload={async () => {}} controlledFiles={[]} />
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[400px]">
              <span className="text-xs font-semibold text-gray-500">
                2. Dropzone Hovered/Drag (Forced Focus via Component)
              </span>
              {/* Using a wrapping div to demo the drag styles but it's hard to force without exposing a prop.
                  Wait, FileUploader doesn't expose forceDragActive. But we have standard empty. */}
              <FileUploader onUpload={async () => {}} controlledFiles={[]} />
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[400px]">
              <span className="text-xs font-semibold text-gray-500">
                3. Dropzone Error
              </span>
              <FileUploader
                onUpload={async () => {}}
                controlledFiles={[]}
                errorStatus={true}
              />
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[400px]">
              <span className="text-xs font-semibold text-gray-500">
                4. Estado Vazio (Apenas Imagem)
              </span>
              <FileUploader
                onUpload={async () => {}}
                controlledFiles={[]}
                imageOnly={true}
              />
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[400px]">
              <span className="text-xs font-semibold text-gray-500">
                5. Uploading (Documento)
              </span>
              <FileUploader
                onUpload={async () => {}}
                controlledFiles={mockUploadingState}
              />
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[400px]">
              <span className="text-xs font-semibold text-gray-500">
                6. Success (Documento concluído)
              </span>
              <FileUploader
                onUpload={async () => {}}
                controlledFiles={mockCompletedState}
              />
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[400px]">
              <span className="text-xs font-semibold text-gray-500">
                7. Error (Falha no Upload)
              </span>
              <FileUploader
                onUpload={async () => {}}
                controlledFiles={mockErrorState}
              />
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[400px]">
              <span className="text-xs font-semibold text-gray-500">
                8. Uploading (Imagem com Thumbnail)
              </span>
              <FileUploader
                onUpload={async () => {}}
                controlledFiles={mockImageUploadingState}
              />
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[400px]">
              <span className="text-xs font-semibold text-gray-500">
                9. Success (Imagem concluída)
              </span>
              <FileUploader
                onUpload={async () => {}}
                controlledFiles={mockImageCompletedState}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

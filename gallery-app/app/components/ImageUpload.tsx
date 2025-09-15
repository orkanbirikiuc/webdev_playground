'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function ImageUpload({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [preview, setPreview] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const uploadImage = async () => {
    if (!file || !title) return

    setUploading(true)

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      setUploading(false)
      return
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    // Save to database
    const { error: dbError } = await supabase
      .from('gallery')
      .insert([{
        image_url: publicUrl,
        title,
        user_id: null
      }])

    if (!dbError) {
      setFile(null)
      setTitle('')
      setPreview('')
      onUploadComplete()
    }

    setUploading(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14 text-2xl">
          +
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          
          {preview && (
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded"
            />
          )}
          
          <Input
            placeholder="Image title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
          />
          
          <Button 
            onClick={uploadImage} 
            disabled={!file || !title || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

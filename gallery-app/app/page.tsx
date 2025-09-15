'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import ImageUpload from './components/ImageUpload'
import { Input } from '@/components/ui/input'

export default function Gallery() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const BATCH_SIZE = 8

  const loadImages = async (startIndex = 0) => {
    if (startIndex === 0) setLoading(true)
    else setLoadingMore(true)

    let query = supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })
      .range(startIndex, startIndex + BATCH_SIZE - 1)

    // Add search filter if there's a search term
    if (searchTerm) {
      query = query.ilike('title', `%${searchTerm}%`)
    }

    const { data } = await query
    
    if (data) {
      if (startIndex === 0) {
        setImages(data)
      } else {
        setImages(prev => [...prev, ...data])
      }
      setHasMore(data.length === BATCH_SIZE)
    }
    
    setLoading(false)
    setLoadingMore(false)
  }

  // Detect scroll to bottom
  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
      if (!loadingMore && hasMore) {
        loadImages(images.length)
      }
    }
  }, [images.length, loadingMore, hasMore])

  useEffect(() => {
    loadImages()

    // Real-time updates
    const channel = supabase
      .channel('gallery')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'gallery' },
        (payload) => {
          setImages(prev => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Image Gallery</h1>
          <div className="mb-6">
            <Input
              type="search"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setImages([])
                loadImages(0)
              }}
              className="max-w-md"
            />
          </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <Card 
              key={img.id} 
              className="overflow-hidden hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
            >
              <div className="aspect-square">
                <img 
                  src={img.image_url} 
                  alt={img.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold truncate">{img.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(img.created_at).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {loadingMore && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        <ImageUpload onUploadComplete={() => loadImages(0)} />
      </div>
    </div>
  )
}
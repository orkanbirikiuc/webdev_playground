'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Home() {
  const [username, setUsername] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const channelRef = useRef<any>(null)
  const [contextMenu, setContextMenu] = useState<{
  messageId: string | null
  x: number
  y: number
}>({ messageId: null, x: 0, y: 0 })

  // Simple login (no password for demo)
  const handleLogin = async () => {
    if (!username.trim()) return

    // Check if user exists or create new
    const { data: existingUser } = await supabase
      .from('profiles')
      .select()
      .eq('username', username)
      .single()

    if (existingUser) {
      setUserId(existingUser.id)
      // Update online status
      await supabase
        .from('profiles')
        .update({ is_online: true, last_seen: new Date().toISOString() })
        .eq('id', existingUser.id)
    } else {
      // Create new user
      const { data: newUser } = await supabase
        .from('profiles')
        .insert([{ username, is_online: true }])
        .select()
        .single()
      
      if (newUser) setUserId(newUser.id)
    }

    setIsLoggedIn(true)
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    console.log(`Reacted ${emoji} to message ${messageId}`)
    setContextMenu({ messageId: null, x: 0, y: 0 }) // Close menu
  }
  const handleContextMenu = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault()
    setContextMenu({
      messageId,
      x: e.clientX,
      y: e.clientY
    })
  }

  const handleTyping = () => {
    if (!channelRef.current) return
    
    // Broadcast that you're typing
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { username }
    })

    // Clear previous timeout
    if (typingTimeout) clearTimeout(typingTimeout)

    // Stop showing "typing" after 2 seconds
    const timeout = setTimeout(() => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'stop_typing',
        payload: { username }
      })
    }, 2000)

    setTypingTimeout(timeout)
  }

  // Load messages
  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(username)')
      .order('created_at', { ascending: true })
      .limit(50)
    
    if (error) {
      console.error('Error loading messages:', error)
    } else if (data) {
      setMessages(data)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return

    const { error } = await supabase
      .from('messages')
      .insert([{ user_id: userId, content: newMessage }])

    if (error) {
      console.error('Error sending message:', error)
    } else {
      setNewMessage('')
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    if (!isLoggedIn || !username) return

    loadMessages()

    const channel = supabase
      .channel('room1')  // Give it a specific room name
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('New message received:', payload)
          // Fetch the complete message with user info
          supabase
            .from('messages')
            .select('*, profiles(username)')
            .eq('id', payload.new.id)
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.error('Error fetching message details:', error)
              } else if (data) {
                setMessages(prev => [...prev, data])
              }
            })
        }
      )
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        console.log('Typing event:', payload)
        if (payload.username !== username) {
          setTypingUsers(prev => 
            prev.includes(payload.username) 
              ? prev 
              : [...prev, payload.username]
          )
        }
      })
      .on('broadcast', { event: 'stop_typing' }, ({ payload }) => {
        console.log('Stop typing event:', payload)
        setTypingUsers(prev => prev.filter(u => u !== payload.username))
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.keys(state)
          .map(key => state[key])
          .flat()
          .map((presence: any) => presence.username)
          .filter(Boolean)
        
        setOnlineUsers([...new Set(users)])
      })
      .subscribe(async (status) => {
        console.log('Channel status:', status)
        if (status === 'SUBSCRIBED') {
          // Track this user's presence
          await channel.track({ 
            username,
            online_at: new Date().toISOString() 
          })
        }
      })

    channelRef.current = channel

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [isLoggedIn, userId, username])

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-96 p-6">
          <h1 className="text-2xl font-bold mb-4">Join Chat</h1>
          <Input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="mb-4"
          />
          <Button onClick={handleLogin} className="w-full">
            Join
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Online Users Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-700">Online Users ({onlineUsers.length})</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-60px)]">
          <div className="p-4 space-y-2">
            {onlineUsers.map((user) => (
              <div key={user} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">
                  {user} {user === username && '(you)'}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b p-4">
          <h1 className="text-xl font-bold">Chat Room - {username}</h1>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.user_id === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs ${
                    msg.user_id === userId
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border'
                  }`}
                  onContextMenu={(e) => handleContextMenu(e, msg.id)}
                >
                  <p className="text-xs opacity-75 mb-1">
                    {msg.profiles?.username || 'Unknown'}
                  </p>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Reaction Menu */}
          {contextMenu.messageId && (
            <div
              className="fixed bg-white rounded-lg shadow-lg p-2 flex gap-2 z-50 border"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onClick={() => setContextMenu({ messageId: null, x: 0, y: 0 })}
            >
              {['👍', '❤️', '😂', '🔥', '😮'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(contextMenu.messageId!, emoji)}
                  className="hover:scale-125 transition-transform text-xl"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input Area with Typing Indicator */}
        <div className="border-t bg-white">
          {typingUsers.length > 0 && (
            <div className="px-4 py-2 text-sm text-gray-500 italic border-b bg-gray-50">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}
          <div className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  handleTyping()
                }}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
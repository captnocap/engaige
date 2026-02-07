/**
 * MyFaceMessenger
 *
 * Root component for the MyFace instant messenger desktop app.
 * Routes between buddy list and chat views.
 * Accepts an initialNPCId to open directly to a specific conversation.
 */

import { useState, useEffect, useCallback } from 'react'
import { BuddyList } from './BuddyList.js'
import { ChatView } from './ChatView.js'

interface MyFaceMessengerProps {
  initialNPCId?: string | null
}

export function MyFaceMessenger({ initialNPCId }: MyFaceMessengerProps) {
  const [view, setView] = useState<'buddy-list' | 'chat'>('buddy-list')
  const [selectedNPCId, setSelectedNPCId] = useState<string | null>(null)

  // If initialNPCId provided, jump directly to chat
  useEffect(() => {
    if (initialNPCId) {
      setSelectedNPCId(initialNPCId)
      setView('chat')
    }
  }, [initialNPCId])

  const handleSelectNPC = useCallback((npcId: string) => {
    setSelectedNPCId(npcId)
    setView('chat')
  }, [])

  const handleBack = useCallback(() => {
    setView('buddy-list')
    setSelectedNPCId(null)
  }, [])

  // Escape key returns to buddy list
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && view === 'chat') {
        handleBack()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, handleBack])

  if (view === 'chat' && selectedNPCId) {
    return <ChatView npcId={selectedNPCId} onBack={handleBack} />
  }

  return <BuddyList onSelectNPC={handleSelectNPC} />
}

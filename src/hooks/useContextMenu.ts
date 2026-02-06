/**
 * Hook for managing context menu state and positioning
 */

import { useState, useCallback } from 'react'

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  data?: unknown
}

export function useContextMenu<T = unknown>() {
  const [state, setState] = useState<ContextMenuState & { data?: T }>({
    visible: false,
    x: 0,
    y: 0,
  })

  const show = useCallback((e: React.MouseEvent, data?: T) => {
    e.preventDefault()
    e.stopPropagation()
    setState({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      data,
    })
  }, [])

  const hide = useCallback(() => {
    setState(prev => ({ ...prev, visible: false }))
  }, [])

  return {
    visible: state.visible,
    x: state.x,
    y: state.y,
    data: state.data as T | undefined,
    show,
    hide,
  }
}

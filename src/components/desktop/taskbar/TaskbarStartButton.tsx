/**
 * TaskbarStartButton
 *
 * Corn cob icon + "Start" text. Clicks open the Start Menu popup.
 */

import { useState, useRef } from 'react'
import { Tooltip } from '../../ui/Tooltip.js'
import { TaskbarStartMenu } from './TaskbarStartMenu.js'
import type { StartMenuApp } from './types.js'
import cornCobIcon from '../../../assets/thecorncobb-icon.png'

interface TaskbarStartButtonProps {
  apps?: StartMenuApp[]
  onAppClick?: (appId: string) => void
}

export function TaskbarStartButton({ apps = [], onAppClick }: TaskbarStartButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    setMenuOpen(prev => !prev)
  }

  return (
    <>
      <Tooltip content="Start Menu" placement="top">
        <button
          ref={buttonRef}
          onClick={handleClick}
          className={`
            h-9 px-3 rounded-lg flex items-center gap-2
            transition-colors duration-150
            ${menuOpen
              ? 'bg-white/12'
              : 'hover:bg-white/10 active:bg-white/15'
            }
          `}
        >
          <img src={cornCobIcon} alt="" className="w-5 h-5" />
          <span className="text-sm font-medium text-white/90">Start</span>
        </button>
      </Tooltip>

      {menuOpen && buttonRef.current && (
        <TaskbarStartMenu
          anchorRect={buttonRef.current.getBoundingClientRect()}
          apps={apps}
          onAppClick={(appId) => {
            onAppClick?.(appId)
            setMenuOpen(false)
          }}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}

/**
 * TaskbarStartButton
 *
 * Corn cob icon + "Start" text. Opens the start menu (future).
 */

import { Tooltip } from '../../ui/Tooltip.js'
import cornCobIcon from '../../../assets/thecorncobb-icon.png'

interface TaskbarStartButtonProps {
  onClick?: () => void
}

export function TaskbarStartButton({ onClick }: TaskbarStartButtonProps) {
  return (
    <Tooltip content="Start Menu" placement="top">
      <button
        onClick={onClick}
        className="
          h-9 px-3 rounded-lg flex items-center gap-2
          hover:bg-white/10 active:bg-white/15
          transition-colors duration-150
        "
      >
        <img src={cornCobIcon} alt="" className="w-5 h-5" />
        <span className="text-sm font-medium text-white/90">Start</span>
      </button>
    </Tooltip>
  )
}

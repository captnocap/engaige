/**
 * CobCalc - Calculator
 *
 * Standard desktop calculator with display + 4x5 button grid.
 * Supports keyboard input (0-9, operators, Enter, Escape).
 * Right-click context menu for copy/clear.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ContextMenu } from '../ui/ContextMenu.js'
import { useContextMenu } from '../../hooks/useContextMenu.js'
import { calculatorPreset } from '../../hooks/useContextMenuPresets.js'

type Operation = '+' | '-' | '×' | '÷' | null

export function CobCalc() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<Operation>(null)
  const [newNumber, setNewNumber] = useState(true)
  const [memory, setMemory] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const ctx = useContextMenu()

  const calculate = useCallback((a: number, op: Operation, b: number): number => {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '×': return a * b
      case '÷': return b === 0 ? NaN : a / b
      default: return b
    }
  }, [])

  const formatDisplay = (num: number): string => {
    if (isNaN(num)) return 'Error'
    if (!isFinite(num)) return 'Error'
    const str = num.toString()
    if (str.length > 14) return num.toExponential(8)
    return str
  }

  const handleNumber = useCallback((digit: string) => {
    if (newNumber) {
      setDisplay(digit === '.' ? '0.' : digit)
      setNewNumber(false)
    } else {
      if (digit === '.' && display.includes('.')) return
      if (display.length >= 14) return
      setDisplay(prev => prev === '0' && digit !== '.' ? digit : prev + digit)
    }
  }, [newNumber, display])

  const handleOperator = useCallback((op: Operation) => {
    const current = parseFloat(display)
    if (previousValue !== null && operation && !newNumber) {
      const result = calculate(previousValue, operation, current)
      setDisplay(formatDisplay(result))
      setPreviousValue(result)
    } else {
      setPreviousValue(current)
    }
    setOperation(op)
    setNewNumber(true)
  }, [display, previousValue, operation, newNumber, calculate])

  const handleEquals = useCallback(() => {
    if (previousValue === null || !operation) return
    const current = parseFloat(display)
    const result = calculate(previousValue, operation, current)
    setDisplay(formatDisplay(result))
    setPreviousValue(null)
    setOperation(null)
    setNewNumber(true)
  }, [display, previousValue, operation, calculate])

  const handleClear = useCallback(() => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setNewNumber(true)
  }, [])

  const handleClearEntry = useCallback(() => {
    setDisplay('0')
    setNewNumber(true)
  }, [])

  const handleBackspace = useCallback(() => {
    if (newNumber) return
    setDisplay(prev => prev.length <= 1 ? '0' : prev.slice(0, -1))
  }, [newNumber])

  const handlePercent = useCallback(() => {
    const current = parseFloat(display)
    if (previousValue !== null && operation) {
      setDisplay(formatDisplay(previousValue * current / 100))
    } else {
      setDisplay(formatDisplay(current / 100))
    }
    setNewNumber(true)
  }, [display, previousValue, operation])

  const handleNegate = useCallback(() => {
    if (display === '0') return
    setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev)
  }, [display])

  const handleCopyResult = useCallback(() => {
    navigator.clipboard.writeText(display).catch(() => {})
  }, [display])

  // Keyboard support
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation()
      if (e.key >= '0' && e.key <= '9') handleNumber(e.key)
      else if (e.key === '.') handleNumber('.')
      else if (e.key === '+') handleOperator('+')
      else if (e.key === '-') handleOperator('-')
      else if (e.key === '*') handleOperator('×')
      else if (e.key === '/') { e.preventDefault(); handleOperator('÷') }
      else if (e.key === 'Enter' || e.key === '=') handleEquals()
      else if (e.key === 'Escape') handleClear()
      else if (e.key === 'Backspace') handleBackspace()
      else if (e.key === '%') handlePercent()
    }

    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [handleNumber, handleOperator, handleEquals, handleClear, handleBackspace, handlePercent])

  const Button = ({ label, onClick, className = '', span = 1 }: {
    label: string
    onClick: () => void
    className?: string
    span?: number
  }) => (
    <button
      onClick={onClick}
      className={`h-12 rounded-md text-lg font-medium transition-colors active:scale-95 ${
        span === 2 ? 'col-span-2' : ''
      } ${className}`}
    >
      {label}
    </button>
  )

  const opBtnClass = (op: Operation) => {
    const isActive = operation === op && newNumber
    return isActive
      ? 'bg-[#00ff88] text-[#0a0a0a] font-bold hover:bg-[#00dd77]'
      : 'bg-[#1a3a2a] text-[#00ff88] hover:bg-[#1a4a2a]'
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="flex flex-col h-full bg-[var(--color-bg)] p-3 outline-none"
      onContextMenu={(e) => ctx.show(e)}
    >
      {/* Display */}
      <div className="bg-[var(--color-bgSecondary)] rounded-lg p-4 mb-3 border border-[var(--color-border)]">
        <div className="text-right text-xs text-[var(--color-textSecondary)] h-4 mb-1">
          {previousValue !== null && operation ? `${previousValue} ${operation}` : ''}
        </div>
        <div className="text-right text-3xl font-mono text-[var(--color-text)] truncate">
          {display}
        </div>
      </div>

      {/* Memory row */}
      <div className="grid grid-cols-4 gap-1.5 mb-1.5">
        <Button label="MC" onClick={() => setMemory(0)}
          className={`text-sm hover:bg-[var(--color-border)] ${memory !== 0 ? 'bg-[var(--color-border)] text-[var(--color-text)]' : 'bg-[var(--color-bgSecondary)] text-[var(--color-textSecondary)]'}`} />
        <Button label="MR" onClick={() => { setDisplay(formatDisplay(memory)); setNewNumber(true) }}
          className={`text-sm hover:bg-[var(--color-border)] ${memory !== 0 ? 'bg-[var(--color-bgSecondary)] text-[var(--color-text)]' : 'bg-[var(--color-bgSecondary)] text-[var(--color-textSecondary)]'}`} />
        <Button label="M+" onClick={() => setMemory(prev => prev + parseFloat(display))}
          className="text-sm bg-[var(--color-bgSecondary)] text-[var(--color-textSecondary)] hover:bg-[var(--color-border)]" />
        <Button label="M-" onClick={() => setMemory(prev => prev - parseFloat(display))}
          className="text-sm bg-[var(--color-bgSecondary)] text-[var(--color-textSecondary)] hover:bg-[var(--color-border)]" />
      </div>

      {/* Button grid */}
      <div className="grid grid-cols-4 gap-1.5 flex-1">
        <Button label="%" onClick={handlePercent}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-textSecondary)] hover:bg-[var(--color-border)]" />
        <Button label="CE" onClick={handleClearEntry}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-textSecondary)] hover:bg-[var(--color-border)]" />
        <Button label="C" onClick={handleClear}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-textSecondary)] hover:bg-[var(--color-border)]" />
        <Button label="⌫" onClick={handleBackspace}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-textSecondary)] hover:bg-[var(--color-border)]" />

        <Button label="7" onClick={() => handleNumber('7')}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]" />
        <Button label="8" onClick={() => handleNumber('8')}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]" />
        <Button label="9" onClick={() => handleNumber('9')}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]" />
        <Button label="÷" onClick={() => handleOperator('÷')}
          className={opBtnClass('÷')} />

        <Button label="4" onClick={() => handleNumber('4')}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]" />
        <Button label="5" onClick={() => handleNumber('5')}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]" />
        <Button label="6" onClick={() => handleNumber('6')}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]" />
        <Button label="×" onClick={() => handleOperator('×')}
          className={opBtnClass('×')} />

        <Button label="1" onClick={() => handleNumber('1')}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]" />
        <Button label="2" onClick={() => handleNumber('2')}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]" />
        <Button label="3" onClick={() => handleNumber('3')}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]" />
        <Button label="-" onClick={() => handleOperator('-')}
          className={opBtnClass('-')} />

        <Button label="±" onClick={handleNegate}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]" />
        <Button label="0" onClick={() => handleNumber('0')}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]" />
        <Button label="." onClick={() => handleNumber('.')}
          className="bg-[var(--color-bgSecondary)] text-[var(--color-text)] hover:bg-[var(--color-border)]" />
        <Button label="+" onClick={() => handleOperator('+')}
          className={opBtnClass('+')} />

        <Button label="=" onClick={handleEquals} span={2}
          className="col-span-4 bg-[#00ff88] text-[#0a0a0a] font-bold hover:bg-[#00dd77]" />
      </div>

      {/* Context Menu */}
      {ctx.visible && (
        <ContextMenu
          items={calculatorPreset({
            displayValue: display,
            onCopyResult: handleCopyResult,
            onClear: handleClear,
            onClearHistory: () => setMemory(0),
          })}
          x={ctx.x}
          y={ctx.y}
          onClose={ctx.hide}
        />
      )}
    </div>
  )
}

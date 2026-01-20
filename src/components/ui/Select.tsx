import { useState, useRef, useEffect } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)
  const displayLabel = selectedOption?.label || placeholder

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        setIsOpen(!isOpen)
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          const currentIndex = options.findIndex(opt => opt.value === value)
          if (currentIndex < options.length - 1) {
            handleSelect(options[currentIndex + 1].value)
          }
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (isOpen) {
          const currentIndex = options.findIndex(opt => opt.value === value)
          if (currentIndex > 0) {
            handleSelect(options[currentIndex - 1].value)
          }
        }
        break
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="w-full px-4 py-2 rounded text-left flex items-center justify-between transition-all"
        style={{
          background: 'var(--color-bg, #0f0f0f)',
          color: 'var(--color-text, #ffffff)',
          border: '1px solid var(--color-border, #333)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span>{displayLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded shadow-lg z-50 max-h-48 overflow-y-auto"
          style={{
            background: 'var(--color-bgSecondary, #1a1a1a)',
            border: '1px solid var(--color-border, #333)',
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className="w-full px-4 py-2 text-left transition-colors"
              style={{
                background:
                  value === option.value
                    ? 'var(--color-primary, #cba6f7)'
                    : 'transparent',
                color:
                  value === option.value
                    ? '#ffffff'
                    : 'var(--color-text, #ffffff)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

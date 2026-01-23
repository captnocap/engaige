export const fontFamilies = [
  { name: 'System Default', value: 'system-ui', category: 'System' },
  { name: 'Inter', value: 'Inter, sans-serif', category: 'Sans-Serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif', category: 'Sans-Serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif', category: 'Sans-Serif' },
  { name: 'Lato', value: 'Lato, sans-serif', category: 'Sans-Serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif', category: 'Sans-Serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif', category: 'Sans-Serif' },
  { name: 'Merriweather', value: 'Merriweather, serif', category: 'Serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif', category: 'Serif' },
  { name: 'Lora', value: 'Lora, serif', category: 'Serif' },
  { name: 'Crimson Text', value: 'Crimson Text, serif', category: 'Serif' },
  { name: 'Fira Code', value: 'Fira Code, monospace', category: 'Monospace' },
  { name: 'JetBrains Mono', value: 'JetBrains Mono, monospace', category: 'Monospace' },
  { name: 'Source Code Pro', value: 'Source Code Pro, monospace', category: 'Monospace' },
  { name: 'IBM Plex Mono', value: 'IBM Plex Mono, monospace', category: 'Monospace' },
  { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive', category: 'Playful' },
  { name: 'Papyrus', value: 'Papyrus, fantasy', category: 'Playful' },
  { name: 'Pacifico', value: 'Pacifico, cursive', category: 'Playful' },
  { name: 'Caveat', value: 'Caveat, cursive', category: 'Playful' },
  { name: 'Press Start 2P', value: 'Press Start 2P, cursive', category: 'Playful' },
]

export const groupedFonts = fontFamilies.reduce(
  (acc, font) => {
    if (!acc[font.category]) acc[font.category] = []
    acc[font.category].push(font)
    return acc
  },
  {} as Record<string, typeof fontFamilies>
)

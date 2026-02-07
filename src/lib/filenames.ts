/**
 * Phrase-based filename generator
 *
 * Generates human-friendly filenames like "amber-sketch-bloom.png"
 * instead of timestamp-based names. Used across the game's virtual
 * filesystem so saved files feel like they belong in-world.
 *
 * Pattern: <adjective>-<noun>-<noun>.ext
 */

const ADJECTIVES = [
  'amber', 'azure', 'bold', 'bright', 'calm', 'cobalt', 'cool', 'coral',
  'cosmic', 'crisp', 'crystal', 'cyan', 'dark', 'dawn', 'deep', 'dreamy',
  'dusk', 'dusty', 'ember', 'faded', 'fierce', 'foggy', 'fresh', 'frost',
  'gentle', 'ghost', 'glass', 'golden', 'grand', 'green', 'hazy', 'hidden',
  'hollow', 'hushed', 'idle', 'iron', 'jade', 'keen', 'kind', 'last',
  'light', 'lilac', 'lime', 'little', 'lone', 'lost', 'loud', 'lucky',
  'lunar', 'lush', 'maple', 'mellow', 'mild', 'misty', 'moody', 'moss',
  'muted', 'neon', 'nimble', 'noble', 'odd', 'olive', 'opal', 'pale',
  'pastel', 'peach', 'pine', 'plum', 'polar', 'proud', 'pure', 'quiet',
  'rapid', 'rare', 'rosy', 'rouge', 'royal', 'ruby', 'rusty', 'sage',
  'sharp', 'shy', 'silver', 'sleek', 'slim', 'slow', 'smoky', 'snowy',
  'soft', 'solar', 'stark', 'still', 'stone', 'storm', 'sunny', 'sweet',
  'swift', 'teal', 'thin', 'tidy', 'tiny', 'vivid', 'warm', 'weary',
  'wild', 'wise', 'woven', 'young', 'zinc',
]

const NOUNS = [
  'arc', 'ash', 'bark', 'beam', 'bell', 'bird', 'blade', 'bloom',
  'bolt', 'bone', 'book', 'braid', 'branch', 'breeze', 'brick', 'brook',
  'brush', 'cairn', 'cape', 'cave', 'chain', 'chalk', 'charm', 'cliff',
  'cloud', 'coast', 'coil', 'coin', 'cove', 'crane', 'creek', 'crest',
  'crown', 'curl', 'dew', 'dock', 'dome', 'drift', 'drum', 'dune',
  'dust', 'echo', 'edge', 'elm', 'fern', 'field', 'film', 'fin',
  'flame', 'flint', 'flora', 'foam', 'fold', 'forge', 'fox', 'frost',
  'gate', 'gem', 'glade', 'glen', 'glow', 'grain', 'grove', 'gust',
  'harbor', 'haze', 'heap', 'hedge', 'heron', 'hill', 'hive', 'hollow',
  'hook', 'horn', 'isle', 'ivy', 'jade', 'jar', 'jet', 'jewel',
  'kelp', 'knot', 'lake', 'lamp', 'lane', 'lark', 'latch', 'leaf',
  'ledge', 'lens', 'lily', 'link', 'loft', 'loom', 'loop', 'marsh',
  'mask', 'maze', 'mesa', 'mint', 'mist', 'moon', 'moss', 'moth',
  'nest', 'node', 'oak', 'oar', 'ore', 'orb', 'owl', 'path',
  'peak', 'pearl', 'petal', 'pier', 'pine', 'plank', 'plume', 'pond',
  'port', 'prism', 'pulse', 'quill', 'rain', 'reed', 'reef', 'ridge',
  'rift', 'rim', 'ring', 'rise', 'river', 'rock', 'root', 'rose',
  'rune', 'sage', 'sail', 'sand', 'sash', 'seed', 'shade', 'shell',
  'shore', 'silk', 'silo', 'sketch', 'slate', 'slope', 'snow', 'song',
  'spark', 'spire', 'spoke', 'spray', 'spring', 'spur', 'star', 'stem',
  'stone', 'storm', 'strand', 'stream', 'sun', 'surge', 'swirl', 'thorn',
  'tide', 'torch', 'tower', 'trail', 'tree', 'vale', 'vault', 'veil',
  'vine', 'wave', 'weave', 'well', 'wick', 'wind', 'wing', 'wisp',
  'wood', 'wren', 'yarn', 'yew',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Generate a phrase-based filename.
 *
 * @param ext - file extension (without dot), e.g. "png", "json"
 * @returns e.g. "amber-sketch-bloom.png"
 */
export function generateFilename(ext?: string): string {
  const name = `${pick(ADJECTIVES)}-${pick(NOUNS)}-${pick(NOUNS)}`
  return ext ? `${name}.${ext}` : name
}

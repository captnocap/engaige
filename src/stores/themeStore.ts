import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Theme {
  name: string;
  displayName: string;
  colors: {
    // Base colors
    bg: string;
    bgSecondary: string;
    bgTertiary: string;
    border: string;

    // Text colors
    text: string;
    textSecondary: string;
    textMuted: string;

    // Accent colors
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;

    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;

    // UI specific
    windowBg: string;
    taskbarBg: string;

    // Gradients
    gradient: string;
  };
}

// Catppuccin Mocha (dark, purple-ish)
export const catppuccinMocha: Theme = {
  name: 'catppuccin-mocha',
  displayName: 'Catppuccin Mocha',
  colors: {
    bg: '#1e1e2e',
    bgSecondary: '#181825',
    bgTertiary: '#313244',
    border: '#45475a',

    text: '#cdd6f4',
    textSecondary: '#bac2de',
    textMuted: '#6c7086',

    primary: '#cba6f7',
    primaryHover: '#b490de',
    secondary: '#89b4fa',
    accent: '#f5c2e7',

    success: '#a6e3a1',
    warning: '#f9e2af',
    error: '#f38ba8',
    info: '#89dceb',

    windowBg: '#1e1e2e',
    taskbarBg: '#181825',

    gradient: 'linear-gradient(135deg, #1e1e2e 0%, #313244 50%, #45475a 100%)',
  },
};

// Catppuccin Macchiato (dark, warm)
export const catppuccinMacchiato: Theme = {
  name: 'catppuccin-macchiato',
  displayName: 'Catppuccin Macchiato',
  colors: {
    bg: '#24273a',
    bgSecondary: '#1e2030',
    bgTertiary: '#363a4f',
    border: '#494d64',

    text: '#cad3f5',
    textSecondary: '#b8c0e0',
    textMuted: '#6e738d',

    primary: '#c6a0f6',
    primaryHover: '#ae87de',
    secondary: '#8aadf4',
    accent: '#f5bde6',

    success: '#a6da95',
    warning: '#eed49f',
    error: '#ed8796',
    info: '#91d7e3',

    windowBg: '#24273a',
    taskbarBg: '#1e2030',

    gradient: 'linear-gradient(135deg, #24273a 0%, #363a4f 50%, #494d64 100%)',
  },
};

// Catppuccin Latte (light)
export const catppuccinLatte: Theme = {
  name: 'catppuccin-latte',
  displayName: 'Catppuccin Latte',
  colors: {
    bg: '#eff1f5',
    bgSecondary: '#e6e9ef',
    bgTertiary: '#ccd0da',
    border: '#acb0be',

    text: '#4c4f69',
    textSecondary: '#5c5f77',
    textMuted: '#6c6f85',

    primary: '#8839ef',
    primaryHover: '#7028c9',
    secondary: '#1e66f5',
    accent: '#ea76cb',

    success: '#40a02b',
    warning: '#df8e1d',
    error: '#d20f39',
    info: '#209fb5',

    windowBg: '#eff1f5',
    taskbarBg: '#e6e9ef',

    gradient: 'linear-gradient(135deg, #eff1f5 0%, #ccd0da 50%, #bcc0cc 100%)',
  },
};

// Dracula
export const dracula: Theme = {
  name: 'dracula',
  displayName: 'Dracula',
  colors: {
    bg: '#282a36',
    bgSecondary: '#21222c',
    bgTertiary: '#44475a',
    border: '#6272a4',

    text: '#f8f8f2',
    textSecondary: '#e6e6e6',
    textMuted: '#6272a4',

    primary: '#bd93f9',
    primaryHover: '#a57dd6',
    secondary: '#8be9fd',
    accent: '#ff79c6',

    success: '#50fa7b',
    warning: '#f1fa8c',
    error: '#ff5555',
    info: '#8be9fd',

    windowBg: '#282a36',
    taskbarBg: '#21222c',

    gradient: 'linear-gradient(135deg, #282a36 0%, #44475a 50%, #6272a4 100%)',
  },
};

// Nord
export const nord: Theme = {
  name: 'nord',
  displayName: 'Nord',
  colors: {
    bg: '#2e3440',
    bgSecondary: '#3b4252',
    bgTertiary: '#434c5e',
    border: '#4c566a',

    text: '#eceff4',
    textSecondary: '#e5e9f0',
    textMuted: '#d8dee9',

    primary: '#88c0d0',
    primaryHover: '#6fa8b8',
    secondary: '#81a1c1',
    accent: '#b48ead',

    success: '#a3be8c',
    warning: '#ebcb8b',
    error: '#bf616a',
    info: '#5e81ac',

    windowBg: '#2e3440',
    taskbarBg: '#3b4252',

    gradient: 'linear-gradient(135deg, #2e3440 0%, #434c5e 50%, #4c566a 100%)',
  },
};

// Tokyo Night
export const tokyoNight: Theme = {
  name: 'tokyo-night',
  displayName: 'Tokyo Night',
  colors: {
    bg: '#1a1b26',
    bgSecondary: '#16161e',
    bgTertiary: '#24283b',
    border: '#414868',

    text: '#c0caf5',
    textSecondary: '#a9b1d6',
    textMuted: '#565f89',

    primary: '#bb9af7',
    primaryHover: '#9d7cd8',
    secondary: '#7aa2f7',
    accent: '#f7768e',

    success: '#9ece6a',
    warning: '#e0af68',
    error: '#f7768e',
    info: '#7dcfff',

    windowBg: '#1a1b26',
    taskbarBg: '#16161e',

    gradient: 'linear-gradient(135deg, #1a1b26 0%, #24283b 50%, #414868 100%)',
  },
};

// Gruvbox Dark
export const gruvbox: Theme = {
  name: 'gruvbox',
  displayName: 'Gruvbox',
  colors: {
    bg: '#282828',
    bgSecondary: '#1d2021',
    bgTertiary: '#3c3836',
    border: '#504945',

    text: '#ebdbb2',
    textSecondary: '#d5c4a1',
    textMuted: '#a89984',

    primary: '#d3869b',
    primaryHover: '#b16286',
    secondary: '#83a598',
    accent: '#fe8019',

    success: '#b8bb26',
    warning: '#fabd2f',
    error: '#fb4934',
    info: '#8ec07c',

    windowBg: '#282828',
    taskbarBg: '#1d2021',

    gradient: 'linear-gradient(135deg, #282828 0%, #3c3836 50%, #504945 100%)',
  },
};

// Rose Pine
export const rosePine: Theme = {
  name: 'rose-pine',
  displayName: 'Rosé Pine',
  colors: {
    bg: '#191724',
    bgSecondary: '#1f1d2e',
    bgTertiary: '#26233a',
    border: '#403d52',

    text: '#e0def4',
    textSecondary: '#c4a7e7',
    textMuted: '#6e6a86',

    primary: '#c4a7e7',
    primaryHover: '#ab8fc9',
    secondary: '#9ccfd8',
    accent: '#ebbcba',

    success: '#9ccfd8',
    warning: '#f6c177',
    error: '#eb6f92',
    info: '#31748f',

    windowBg: '#191724',
    taskbarBg: '#1f1d2e',

    gradient: 'linear-gradient(135deg, #191724 0%, #26233a 50%, #403d52 100%)',
  },
};

// Cyberpunk (bonus neon theme)
export const cyberpunk: Theme = {
  name: 'cyberpunk',
  displayName: 'Cyberpunk',
  colors: {
    bg: '#0a0e27',
    bgSecondary: '#0d1117',
    bgTertiary: '#1a1f3a',
    border: '#2d3561',

    text: '#e2e8f0',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',

    primary: '#ff00ff',
    primaryHover: '#cc00cc',
    secondary: '#00ffff',
    accent: '#ffff00',

    success: '#00ff9f',
    warning: '#ffd700',
    error: '#ff006e',
    info: '#00d9ff',

    windowBg: '#0a0e27',
    taskbarBg: '#0d1117',

    gradient: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2d3561 100%)',
  },
};

export const themes: Theme[] = [
  catppuccinMocha,
  catppuccinMacchiato,
  catppuccinLatte,
  dracula,
  nord,
  tokyoNight,
  gruvbox,
  rosePine,
  cyberpunk,
];

interface ThemeState {
  currentTheme: Theme;
  setTheme: (themeName: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: catppuccinMocha,
      setTheme: (themeName: string) => {
        const theme = themes.find((t) => t.name === themeName);
        if (theme) {
          set({ currentTheme: theme });
          applyTheme(theme);
        }
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.currentTheme);
        }
      },
    }
  )
);

// Apply theme CSS variables to document
function applyTheme(theme: Theme) {
  const root = document.documentElement;

  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
}

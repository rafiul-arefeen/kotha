import { usePreferences } from '@/state/PreferencesContext';
import {
  categoryColors,
  highContrastPalette,
  highContrastTile,
  palette,
  registerColors,
  type Palette,
  type RegisterColors,
  type TileColors,
} from '@/theme';
import type { CategoryId, RegisterId } from '@/types';

const HC_REGISTER: RegisterColors = {
  bg: '#ffffff',
  fg: '#000000',
  border: '#000000',
  selBg: '#000000',
  selFg: '#ffffff',
  selSub: '#dddddd',
  selBorder: '#000000',
};

export interface Theme {
  c: Palette;
  highContrast: boolean;
  textScale: number;
  /** Scale a font size by the user's text-size preference. */
  fs: (size: number) => number;
  tile: (category: CategoryId | 'frequent') => TileColors;
  register: (id: RegisterId) => RegisterColors;
}

export function useTheme(): Theme {
  const { preferences } = usePreferences();
  const hc = preferences.highContrast;
  const scale = preferences.textScale;
  return {
    c: hc ? highContrastPalette : palette,
    highContrast: hc,
    textScale: scale,
    fs: (size) => Math.round(size * scale),
    tile: (category) => (hc ? highContrastTile : categoryColors[category]),
    register: (id) => (hc ? HC_REGISTER : registerColors[id]),
  };
}

/**
 * Kotha design tokens, translated from mockup/kotha-ui.html.
 * The mockup uses OKLCH colours; React Native cannot parse OKLCH, so the
 * values below are the sRGB conversions of the mockup's colours.
 */
import type { CategoryId, RegisterId } from '@/types';

export interface TileColors {
  bg: string;
  fg: string;
  border: string;
  active: string;
}

export const categoryColors: Record<CategoryId | 'frequent', TileColors> = {
  needs: { bg: '#d3f2ff', fg: '#155276', border: '#bbddf6', active: '#338fc7' },
  actions: { bg: '#eef0ce', fg: '#50510d', border: '#d9dbb5', active: '#8b8c27' },
  feelings: { bg: '#ffe9cc', fg: '#684507', border: '#ebd3b4', active: '#b07a20' },
  people: { bg: '#d9f6dd', fg: '#255a33', border: '#c1e1c6', active: '#4a9a5e' },
  food: { bg: '#ffe6d1', fg: '#703f19', border: '#f3d0b9', active: '#bd7138' },
  places: { bg: '#f1e7ff', fg: '#544174', border: '#dcd1f4', active: '#9274c3' },
  health: { bg: '#ffe2de', fg: '#753935', border: '#f7cbc7', active: '#c46761' },
  phrases: { bg: '#cbf7f6', fg: '#005b5b', border: '#b2e2e2', active: '#009c9c' },
  emergency: { bg: '#ffe2de', fg: '#be222a', border: '#ff958d', active: '#e24947' },
  frequent: { bg: '#e9e9ff', fg: '#494579', border: '#d3d4f8', active: '#7f7bcb' },
};

export interface RegisterColors {
  bg: string;
  fg: string;
  border: string;
  selBg: string;
  selFg: string;
  selSub: string;
  selBorder: string;
}

export const registerColors: Record<RegisterId, RegisterColors> = {
  family: { bg: '#dcf7e1', fg: '#225a31', border: '#b3d9b9', selBg: '#d5f5da', selFg: '#115629', selSub: '#587c5f', selBorder: '#69ba7c' },
  friend: { bg: '#ffebd2', fg: '#694500', border: '#e5c9a3', selBg: '#ffe7c7', selFg: '#663e00', selSub: '#866d49', selBorder: '#d09945' },
  teacher: { bg: '#d7f3ff', fg: '#0d5279', border: '#abd4f2', selBg: '#cef1ff', selFg: '#004d77', selSub: '#517791', selBorder: '#55aee8' },
  doctor: { bg: '#ffe5e1', fg: '#773733', border: '#f3bfba', selBg: '#ffdfda', selFg: '#742e2b', selSub: '#926460', selBorder: '#e6857e' },
  stranger: { bg: '#f2e9ff', fg: '#554077', border: '#d3c6f0', selBg: '#f0e4ff', selFg: '#503975', selSub: '#776a90', selBorder: '#b093e5' },
  caregiver: { bg: '#d1f7f7', fg: '#005b5c', border: '#a0dbda', selBg: '#c5f6f5', selFg: '#005758', selSub: '#447d7c', selBorder: '#16bbbc' },
};

export const palette = {
  canvas: '#fdfaf4',
  surface: '#ffffff',
  surfaceWarm: '#faf6ef',
  ink: '#2c2823',
  inkSoft: '#3c352c',
  body: '#2b2620',
  muted: '#6f655a',
  faint: '#9a9082',
  fainter: '#b1a596',
  placeholder: '#b3a797',
  line: '#e4ddd0',
  lineSoft: '#ece3d3',
  lineWarm: '#efe7d8',
  dangerBg: '#fdf2ef',
  dangerLine: '#f3dcd6',
  dangerFg: '#b5572e',

  logoA: '#62bb78',
  logoB: '#00aaab',

  // AI / sentence (violet family)
  aiA: '#9a7de3',
  aiB: '#9763cc',
  aiInk: '#3a3348',
  aiMuted: '#5a5168',
  aiFaint: '#a99fbb',
  aiLine: '#e2dcec',
  aiCardLine: '#ebe5f3',
  aiCanvas: '#faf9ff',
  candBorder: '#e0dff2',
  labelBg: '#edebff',
  labelFg: '#564692',
  predBorder: '#d4d4f5',
  predBg: '#f6f5ff',
  predFg: '#4d4084',
  predSub: '#797791',
  modActive: '#8d67d2',
  modFg: '#5c4785',
  modBorder: '#dad2ef',

  // Speak / output (green family)
  speakA: '#48b06c',
  speakB: '#009f6c',
  outCanvas: '#f2fbf6',
  outInk: '#33433a',
  outFaint: '#9bb09f',
  outLine: '#d8e4d8',
  outCardBorder: '#cee4d7',
  bar: '#22a56a',
  optBg: '#ccf3dd',
  optFg: '#00522f',
  optBorder: '#50b584',
  dwellTrack: '#35aa76',

  // Warning (amber)
  warnBg: '#fff0cc',
  warnBorder: '#edc889',
  warnFg: '#7a4702',

  // Favourite
  favBg: '#fdf6ee',
  favLine: '#f3e2d0',
  favFg: '#9a6a3a',

  toast: '#26231f',
  scrim: 'rgba(40,30,18,0.32)',
} as const;

export type Palette = { [K in keyof typeof palette]: string };

/** High-contrast palette: black on white, no pastel fills. */
export const highContrastPalette: Palette = {
  ...palette,
  canvas: '#ffffff',
  surfaceWarm: '#ffffff',
  ink: '#000000',
  inkSoft: '#000000',
  body: '#000000',
  muted: '#1b1b1b',
  faint: '#333333',
  fainter: '#444444',
  placeholder: '#555555',
  line: '#0d0d0d',
  lineSoft: '#0d0d0d',
  lineWarm: '#0d0d0d',
  aiInk: '#000000',
  aiMuted: '#000000',
  aiFaint: '#333333',
  aiLine: '#0d0d0d',
  aiCardLine: '#0d0d0d',
  aiCanvas: '#ffffff',
  candBorder: '#0d0d0d',
  predBorder: '#0d0d0d',
  predBg: '#ffffff',
  predFg: '#000000',
  predSub: '#333333',
  modBorder: '#0d0d0d',
  modFg: '#000000',
  modActive: '#000000',
  outCanvas: '#ffffff',
  outInk: '#000000',
  outFaint: '#333333',
  outLine: '#0d0d0d',
  outCardBorder: '#0d0d0d',
  warnBg: '#ffffff',
  warnBorder: '#000000',
  warnFg: '#000000',
};

export const highContrastTile: TileColors = { bg: '#ffffff', fg: '#0d0d0d', border: '#0d0d0d', active: '#1b1b1b' };

/** Loaded in app/_layout.tsx via @expo-google-fonts. */
export const fontFamilies = {
  bn: {
    400: 'BalooDa2_400Regular',
    500: 'BalooDa2_500Medium',
    600: 'BalooDa2_600SemiBold',
    700: 'BalooDa2_700Bold',
    800: 'BalooDa2_800ExtraBold',
  },
  en: {
    400: 'Nunito_400Regular',
    500: 'Nunito_600SemiBold',
    600: 'Nunito_600SemiBold',
    700: 'Nunito_700Bold',
    800: 'Nunito_800ExtraBold',
  },
} as const;

export type FontWeight = 400 | 500 | 600 | 700 | 800;

export const radius = {
  sm: 11,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 26,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

/**
 * Minimum touch target. Android recommends 48dp; the mockup's 36–38px buttons
 * are enlarged for users with limited fine motor control.
 */
export const TOUCH = 48;
export const TOUCH_LARGE = 56;

export const shadows = {
  tile: '0px 2px 5px -3px rgba(60,40,20,0.25)',
  card: '0px 3px 10px -5px rgba(90,70,140,0.35)',
  sheet: '0px -8px 24px -16px rgba(60,40,20,0.3)',
  ai: '0px 6px 16px -6px rgba(151,99,204,0.6)',
  speak: '0px 6px 16px -6px rgba(0,159,108,0.55)',
  logo: '0px 4px 12px -3px rgba(59,182,147,0.5)',
  toast: '0px 10px 28px -10px rgba(0,0,0,0.5)',
} as const;

export const gradients = {
  ai: `linear-gradient(150deg, ${palette.aiA}, ${palette.aiB})`,
  speak: `linear-gradient(150deg, ${palette.speakA}, ${palette.speakB})`,
  logo: `linear-gradient(150deg, ${palette.logoA}, ${palette.logoB})`,
  prediction: 'linear-gradient(160deg, #f6f5ff, #f5eeff)',
  output: 'linear-gradient(180deg, #f2fbf6, #eef8f0)',
  home: 'linear-gradient(180deg, #fdf8ef, #fdfaf4)',
} as const;

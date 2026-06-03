export const Colors = {
  primary: '#1E88E5',
  primaryVariant: '#1565C0',
  primaryContainer: '#E3F2FD',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#0D47A1',

  accentFab: '#F57C00',
  onAccentFab: '#FFFFFF',
  brandTeal: '#00ACC1',

  background: '#F0F4F8',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',

  inkPrimary: '#1A1A2E',
  inkSecondary: '#546E7A',
  inkDisabled: '#B0BEC5',
  border: '#CFD8DC',

  success: '#2E7D32',
  successBg: '#E8F5E9',
  warning: '#E65100',
  warningBg: '#FFF3E0',
  error: '#C62828',
  errorBg: '#FFEBEE',
  scrim: 'rgba(0, 0, 0, 0.4)',

  tagCash: '#E8F5E9',
  tagCashInk: '#1B5E20',
  tagCard: '#E3F2FD',
  tagCardInk: '#0D47A1',
  tagTransfer: '#F3E5F5',
  tagTransferInk: '#4A148C',
  tagCancelled: '#ECEFF1',
  tagCancelledInk: '#546E7A',
} as const;

export const Typography = {
  fontFamily: 'Roboto',
  sizeXs: 12,
  sizeSm: 14,
  sizeBase: 16,
  sizeLg: 18,
  sizeXl: 22,
  size2xl: 28,
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightBold: '700' as const,
  lineHeightTight: 1.2,
  lineHeightBase: 1.5,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  touchMin: 48,
  touchPreferred: 56,
} as const;

export const Rounded = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Elevation = {
  flat: 0,
  raised: 2,
  header: 4,
  fab: 6,
} as const;

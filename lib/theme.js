export const LIGHT = {
  bg: '#F7F6F3', surface: '#FFFFFF', surfaceAlt: '#F0EDE8', surfaceHover: '#E8E4DF',
  border: '#E8E4DF', borderStrong: '#D4CFC9',
  text: '#1A1814', textSub: '#6B6560', textMuted: '#A09890',
  accent: '#4F6AF0', accentSub: '#EEF0FD', accentHover: '#3D58DE',
  green: '#2D9E6B', greenSub: '#E8F5EE', red: '#D45F4A', redSub: '#FBF0EE',
  headerBg: 'rgba(247,246,243,0.92)',
  shadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
  shadowMd: '0 4px 24px rgba(0,0,0,0.08)',
};

export const DARK = {
  bg: '#111110', surface: '#1A1A18', surfaceAlt: '#222220', surfaceHover: '#2A2A28',
  border: '#2E2E2C', borderStrong: '#3A3A38',
  text: '#ECEAE6', textSub: '#9E9A94', textMuted: '#5E5A54',
  accent: '#6B82F5', accentSub: '#1A1F3A', accentHover: '#7D92F7',
  green: '#3BBF80', greenSub: '#0F2218', red: '#E0705A', redSub: '#221410',
  headerBg: 'rgba(17,17,16,0.92)',
  shadow: '0 1px 3px rgba(0,0,0,0.3)',
  shadowMd: '0 4px 24px rgba(0,0,0,0.4)',
};

export const CAT_COLORS = {
  Makan: '#E07A5F', Transport: '#3D7EA6', Belanja: '#C4A35A',
  Tagihan: '#5B8C6E', Hiburan: '#A06090', Kesehatan: '#4A90A4', Lainnya: '#8B8FA8',
};

// Default built-in categories (cannot be fully deleted if user prefers)
export const DEFAULT_CATEGORIES = ['Makan', 'Transport', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya'];

// Kept for backward compat
export const CATEGORIES = DEFAULT_CATEGORIES;

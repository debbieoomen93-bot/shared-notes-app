// Generate a deterministic, readable color from a username
// Uses HSL to ensure good contrast: fixed saturation + lightness, hue varies by hash

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export function getUserColor(username) {
  if (!username) return { bg: '#6c5ce7', text: '#fff' };
  const hash = hashString(username);
  const hue = hash % 360;
  return {
    bg: `hsl(${hue}, 65%, 45%)`,
    text: '#fff',
    light: `hsl(${hue}, 65%, 92%)`,
    dark: `hsl(${hue}, 50%, 25%)`,
    accent: `hsl(${hue}, 70%, 55%)`,
  };
}

export function getUserInitial(username) {
  if (!username) return '?';
  return username.charAt(0).toUpperCase();
}

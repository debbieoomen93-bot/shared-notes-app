// Extract a display title from HTML content
// Takes the first line of text, up to 50 characters

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return tmp.textContent || tmp.innerText || '';
}

export function getAutoTitle(htmlContent) {
  if (!htmlContent) return '';
  const text = stripHtml(htmlContent).trim();
  if (!text) return '';
  // Take first line
  const firstLine = text.split('\n')[0].trim();
  if (firstLine.length <= 50) return firstLine;
  // Truncate at word boundary
  const truncated = firstLine.substring(0, 50);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 30) {
    return truncated.substring(0, lastSpace) + '...';
  }
  return truncated + '...';
}

export function getDisplayTitle(note) {
  if (note.manualTitle && note.title) {
    return note.title;
  }
  const auto = getAutoTitle(note.content);
  return auto || 'Untitled Note';
}

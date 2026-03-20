// Generates an image via Pollinations.ai (free, no API key required).
// Fetches the image, compresses it to an 800x450 JPEG data URL (~40-80 KB),
// and returns it ready for storage in Firebase.

export async function generateNoteImage(title, content) {
  const raw = (content || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);
  // Truncate at last word boundary to avoid mid-word cuts
  const plainText = raw.includes(' ') ? raw.substring(0, raw.lastIndexOf(' ')) : raw;

  const noteTitle = (title || 'Untitled').substring(0, 50);

  const prompt = [
    `atmospheric painterly illustration for a note titled "${noteTitle}"`,
    plainText ? `about: ${plainText}` : '',
    'cinematic mood, dramatic lighting, rich deep tones, highly detailed, no text, no letters, no words',
  ].filter(Boolean).join(', ');

  const seed = Math.floor(Math.random() * 1_000_000);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=450&nologo=true&seed=${seed}`;

  let response;
  for (let attempt = 1; attempt <= 4; attempt++) {
    response = await fetch(url);
    if (response.ok) break;
    if (response.status < 500 || attempt === 4) throw new Error(`Pollinations returned ${response.status}`);
    await new Promise(r => setTimeout(r, attempt * 3000));
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 450;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#0b0b14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cover-fit: scale and centre-crop
      const srcRatio = img.width / img.height;
      const dstRatio = canvas.width / canvas.height;
      let sx, sy, sw, sh;
      if (srcRatio > dstRatio) {
        sh = img.height;
        sw = sh * dstRatio;
        sx = (img.width - sw) / 2;
        sy = 0;
      } else {
        sw = img.width;
        sh = sw / dstRatio;
        sx = 0;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load generated image'));
    };

    img.src = objectUrl;
  });
}

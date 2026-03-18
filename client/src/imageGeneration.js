// Calls the server's /api/generate-image endpoint, then compresses the
// returned image to an 800x450 JPEG data URL (~40-80 KB) using a canvas.
// The compressed data URL is safe to store directly in Firebase.

export async function generateNoteImage(title, content) {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server returned ${response.status}`);
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

      // Fill with a dark fallback in case the image has transparency
      ctx.fillStyle = '#0b0b14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cover-fit: scale and centre-crop the source image
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

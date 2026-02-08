const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgPath = path.join(__dirname, 'client', 'public', 'icon.svg');
const outDir = path.join(__dirname, 'client', 'public');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  const svg = fs.readFileSync(svgPath);

  for (const size of sizes) {
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Apple touch icon (180x180)
  await sharp(svg)
    .resize(180, 180)
    .png()
    .toFile(path.join(outDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Favicon (32x32)
  await sharp(svg)
    .resize(32, 32)
    .png()
    .toFile(path.join(outDir, 'favicon-32x32.png'));
  console.log('Generated favicon-32x32.png');

  // Favicon (16x16)
  await sharp(svg)
    .resize(16, 16)
    .png()
    .toFile(path.join(outDir, 'favicon-16x16.png'));
  console.log('Generated favicon-16x16.png');

  console.log('All icons generated!');
}

generate().catch(console.error);

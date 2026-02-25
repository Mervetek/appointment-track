import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, 'public', 'icons', 'icon.svg');
const outDir = join(__dirname, 'public', 'icons');

// SVG ikon 512x512 viewBox ile emoji kullanıyor, sharp emoji render edemez.
// Bu yüzden temiz bir PNG ikon oluşturuyoruz.
const sizes = [48, 72, 96, 128, 144, 152, 192, 384, 512];

// Emoji yerine SVG ile temiz ikon
function createSvgIcon(size) {
    return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#5C6BC0"/>
  <circle cx="256" cy="180" r="80" fill="none" stroke="white" stroke-width="24"/>
  <path d="M 256 180 L 256 130 M 256 180 L 296 180" fill="none" stroke="white" stroke-width="20" stroke-linecap="round"/>
  <text x="256" y="400" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">PT</text>
</svg>`);
}

async function generate() {
    mkdirSync(outDir, { recursive: true });

    for (const size of sizes) {
        const svgBuf = createSvgIcon(size);
        await sharp(svgBuf)
            .resize(size, size)
            .png()
            .toFile(join(outDir, `icon-${size}x${size}.png`));
        console.log(`✅ icon-${size}x${size}.png`);
    }

    // Maskable ikon (padding ile)
    const maskableSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#5C6BC0"/>
  <circle cx="256" cy="195" r="65" fill="none" stroke="white" stroke-width="20"/>
  <path d="M 256 195 L 256 150 M 256 195 L 290 195" fill="none" stroke="white" stroke-width="16" stroke-linecap="round"/>
  <text x="256" y="370" font-family="Arial, sans-serif" font-size="96" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">PT</text>
</svg>`);

    await sharp(maskableSvg)
        .resize(512, 512)
        .png()
        .toFile(join(outDir, 'maskable-512x512.png'));
    console.log('✅ maskable-512x512.png');

    console.log('\n🎉 Tüm ikonlar oluşturuldu!');
}

generate().catch(console.error);

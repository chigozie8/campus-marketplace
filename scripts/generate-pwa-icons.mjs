/**
 * Generates PWA icons (192x192 and 512x512 PNG) from an inline SVG
 * using the `sharp` package which is already installed in the project.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from 'sharp'
import { writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')

// SVG source — black rounded square, white V + green X wordmark
const svgSource = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#0a0a0a"/>
  <text
    x="145"
    y="355"
    font-family="Arial Black, Arial, sans-serif"
    font-size="260"
    font-weight="900"
    fill="white"
  >V</text>
  <text
    x="285"
    y="355"
    font-family="Arial Black, Arial, sans-serif"
    font-size="260"
    font-weight="900"
    fill="#16a34a"
  >X</text>
</svg>
`

const svgBuffer = Buffer.from(svgSource)

async function generateIcon(size, filename) {
  const outputPath = path.join(publicDir, filename)
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outputPath)
  console.log(`Generated ${outputPath} (${size}x${size})`)
}

async function main() {
  await generateIcon(192, 'icon-192.png')
  await generateIcon(512, 'icon-512.png')
  await generateIcon(180, 'apple-touch-icon.png')
  console.log('All PWA icons generated successfully.')
}

main().catch((err) => {
  console.error('Icon generation failed:', err)
  process.exit(1)
})

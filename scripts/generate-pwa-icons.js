const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const publicDir = '/vercel/share/v0-project/public'

// Ensure public dir exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

// SVG — black rounded square, white V + green X
const svgSource = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#0a0a0a"/>
  <text
    x="70"
    y="370"
    font-family="Arial Black, Arial, sans-serif"
    font-size="310"
    font-weight="900"
    fill="white"
  >V</text>
  <text
    x="268"
    y="370"
    font-family="Arial Black, Arial, sans-serif"
    font-size="310"
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
  console.log('Generated: ' + outputPath + ' (' + size + 'x' + size + ')')
}

async function main() {
  await generateIcon(192, 'icon-192.png')
  await generateIcon(512, 'icon-512.png')
  await generateIcon(180, 'apple-touch-icon.png')
  console.log('All PWA icons generated successfully.')
}

main().catch(function(err) {
  console.error('Icon generation failed:', err)
  process.exit(1)
})

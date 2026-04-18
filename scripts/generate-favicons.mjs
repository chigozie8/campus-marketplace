import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const ROOT = process.cwd()
const SIZE = 512

const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" rx="96" fill="#ffffff"/>
  <rect x="80"  y="80"  width="280" height="280" rx="64" fill="#0a0a0a"/>
  <rect x="152" y="152" width="280" height="280" rx="64" fill="#16a34a"/>
</svg>
`.trim()

async function main() {
  const master = await sharp(Buffer.from(SVG)).resize(SIZE, SIZE).png().toBuffer()

  const sizes = [16, 32, 48, 180, 192, 256, 512]
  const buf = {}
  for (const s of sizes) {
    buf[s] = await sharp(master).resize(s, s, { fit: 'contain' }).png().toBuffer()
  }

  await mkdir(path.join(ROOT, 'app'), { recursive: true })
  await writeFile(path.join(ROOT, 'app/icon.png'), buf[512])
  await writeFile(path.join(ROOT, 'app/apple-icon.png'), buf[180])

  await writeFile(path.join(ROOT, 'public/icon-192.png'), buf[192])
  await writeFile(path.join(ROOT, 'public/icon-512.png'), buf[512])
  await writeFile(path.join(ROOT, 'public/apple-icon.png'), buf[180])
  await writeFile(path.join(ROOT, 'public/icon-light-32x32.png'), buf[32])
  await writeFile(path.join(ROOT, 'public/icon-dark-32x32.png'), buf[32])
  await writeFile(path.join(ROOT, 'public/icon.svg'), SVG)

  const ico = await pngToIco([buf[16], buf[32], buf[48]])
  await writeFile(path.join(ROOT, 'public/favicon.ico'), ico)

  console.log('✅ two-square favicons generated')
}

main().catch(e => { console.error(e); process.exit(1) })

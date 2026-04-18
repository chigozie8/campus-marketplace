import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const SRC = 'public/logo.png'
const ROOT = process.cwd()

async function main() {
  const trimmed = await sharp(SRC).trim().toBuffer()
  const meta = await sharp(trimmed).metadata()
  const { width = 0, height = 0 } = meta
  console.log('trimmed logo:', width, 'x', height)

  const cropW = Math.min(height, Math.round(width * 0.27))
  const bag = await sharp(trimmed)
    .extract({ left: 0, top: 0, width: cropW, height })
    .trim()
    .toBuffer()

  const bagMeta = await sharp(bag).metadata()
  const side = Math.max(bagMeta.width ?? 0, bagMeta.height ?? 0)
  const padding = Math.round(side * 0.12)
  const canvas = side + padding * 2

  const square = await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: bag, gravity: 'center' }])
    .png()
    .toBuffer()

  console.log('square master:', canvas, 'x', canvas)

  const sizes = [16, 32, 48, 180, 192, 256, 512]
  const buffers = {}
  for (const s of sizes) {
    buffers[s] = await sharp(square).resize(s, s, { fit: 'contain' }).png().toBuffer()
  }

  await mkdir(path.join(ROOT, 'app'), { recursive: true })
  await writeFile(path.join(ROOT, 'app/icon.png'), buffers[512])
  await writeFile(path.join(ROOT, 'app/apple-icon.png'), buffers[180])

  await writeFile(path.join(ROOT, 'public/icon-192.png'), buffers[192])
  await writeFile(path.join(ROOT, 'public/icon-512.png'), buffers[512])
  await writeFile(path.join(ROOT, 'public/apple-icon.png'), buffers[180])
  await writeFile(path.join(ROOT, 'public/icon-light-32x32.png'), buffers[32])
  await writeFile(path.join(ROOT, 'public/icon-dark-32x32.png'), buffers[32])

  const icoBuf = await pngToIco([buffers[16], buffers[32], buffers[48]])
  await writeFile(path.join(ROOT, 'public/favicon.ico'), icoBuf)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas} ${canvas}"><image href="data:image/png;base64,${square.toString('base64')}" width="${canvas}" height="${canvas}"/></svg>`
  await writeFile(path.join(ROOT, 'public/icon.svg'), svg)

  console.log('✅ favicons generated')
}

main().catch(e => { console.error(e); process.exit(1) })

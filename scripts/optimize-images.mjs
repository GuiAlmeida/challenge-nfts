import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SRC = path.resolve('scripts/raw-images')
const OUT = path.resolve('public/images/nfts')
const SIZES = [250, 450, 650, 900]

const files = (await readdir(SRC)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
await mkdir(OUT, { recursive: true })
for (const file of files) {
  const slug = path
    .parse(file)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  for (const size of SIZES) {
    const target = path.join(OUT, `${slug}-${size}.webp`)
    await sharp(path.join(SRC, file)).resize(size, size, { fit: 'cover' }).webp({ quality: 78 }).toFile(target)
    console.log('ok', path.relative(process.cwd(), target))
  }
}

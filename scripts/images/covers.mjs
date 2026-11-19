// Home's „Нашите обекти“ covers (polish spec §2): one master each, enlarged
// and graded alike, written to src/assets/home/covers/cover-<id>.jpg, which
// scripts/images/sources.json (group `home`, `cover-<id>`) then encodes.
//
//   node scripts/images/covers.mjs [--x4 <dir>]
//
// The sources are the works' own photographs (src/assets/projects), most of
// them 960 px wide, which the panel shows a screen tall. Enlarging:
// - with --x4 <dir>, where <dir>/<id>.png is that source enlarged four times
//   by an AI upscaler (Real-ESRGAN, realesrgan-x4plus), that file is the
//   source, cropped as the photograph is and brought down to the master's
//   width, which hides what the upscaler invented in the fine detail;
// - without it, Lanczos to the master's width and a light unsharp mask.
// Then the one grade every cover shares: a little less saturation, a little
// warmer, the blacks lifted a touch, so six photographs from six cameras sit
// together on the onyx.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

sharp.cache(false)
const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '..', '..')
const OUT = path.join(repo, 'src/assets/home/covers')
const WIDTH = 1920
const P = 'src/assets/projects'

// Each cover: its source, and the window of it the cover keeps, in the
// source's pixels (Панорама's leaves out the bins in front of the frame).
export const COVERS = [
  { id: 'green-life', src: `${P}/Green Life - Paradise Gardens and Town House - гр.Созопол/45288292_104924173847447_4815299079217086464_n.jpg` },
  { id: 'aivazovski', src: `${P}/Айвазовски Парк - гр.Поморие/45652633_108252286847969_7426443512180113408_n.jpg` },
  { id: 'panorama', src: `${P}/Панорама Резидънс - гр.Созопол/50580441_141025683570629_8796329576121761792_n.jpg`, crop: { left: 0, top: 0, width: 960, height: 560 } },
  { id: 'sunny-hill', src: `${P}/Сънни Хил блок 9 - кв. Меден Рудник гр. Бургас/57124599_162614491411748_7529170866383355904_n.jpg` },
  { id: 'hotel-paradise', src: `${P}/Хотел Парадайс - с.Огняново/45359157_104656047207593_2634777009472929792_n.jpg` },
  { id: 'chitalishte', src: `${P}/ЧИТАЛИЩЕ АСЕН ЗЛАТАРОВ-1924 ОГНЯНОВО/viber__2025-07-07_12-36-13-125.jpg` },
]

/** The grade every cover shares, on a sharp pipeline. */
export const grade = (pipeline) => pipeline
  .modulate({ saturation: 0.92 })
  .linear([1.02, 1, 0.96], [4, 3, 3])

async function master({ id, src, crop }, x4dir) {
  const ai = x4dir ? path.join(x4dir, `${id}.png`) : null
  let pipeline
  if (ai && fs.existsSync(ai)) {
    pipeline = sharp(ai)
    if (crop) pipeline = pipeline.extract({ left: crop.left * 4, top: crop.top * 4, width: crop.width * 4, height: crop.height * 4 })
    pipeline = pipeline.resize({ width: WIDTH, kernel: 'lanczos3' })
  } else {
    pipeline = sharp(path.join(repo, src))
    if (crop) pipeline = pipeline.extract(crop)
    pipeline = pipeline.resize({ width: WIDTH, kernel: 'lanczos3' }).sharpen({ sigma: 0.9, m1: 0.6, m2: 2 })
  }
  const file = path.join(OUT, `cover-${id}.jpg`)
  await grade(pipeline).jpeg({ quality: 90, mozjpeg: true }).toFile(file)
  const { width, height } = await sharp(file).metadata()
  return { id, file: path.relative(repo, file).replace(/\\/g, '/'), width, height, ai: Boolean(ai && fs.existsSync(ai)) }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const at = process.argv.indexOf('--x4')
  const x4dir = at > -1 ? process.argv[at + 1] : null
  fs.mkdirSync(OUT, { recursive: true })
  for (const cover of COVERS) {
    const made = await master(cover, x4dir)
    console.log(`covers: ${made.file} ${made.width} × ${made.height}${made.ai ? ' (AI ×4)' : ' (Lanczos)'}`)
  }
}

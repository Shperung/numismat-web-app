import sharp from "sharp";
import { locateCoin } from "./ai";

const SIZE = 1024;
const COIN = 940;
const PAD = (SIZE - COIN) / 2;
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

export async function enhanceCoinPhoto(input: Buffer) {
  // EXIF-поворот і зменшення до спільних пікселів: рамка від Gemini рахується саме для них
  const source = await sharp(input)
    .rotate()
    .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 95 })
    .toBuffer({ resolveWithObject: true });
  const { width, height } = source.info;
  const { box_2d, round } = await locateCoin(source.data);

  const [ymin, xmin, ymax, xmax] = box_2d.map((v) => Math.min(Math.max(v, 0), 1000) / 1000);
  const left = Math.round(xmin * width);
  const top = Math.round(ymin * height);
  const area = {
    left,
    top,
    width: Math.max(1, Math.min(Math.round((xmax - xmin) * width), width - left)),
    height: Math.max(1, Math.min(Math.round((ymax - ymin) * height), height - top)),
  };

  let coin = await sharp(source.data).extract(area).toBuffer();

  if (round) {
    // еліпс, вписаний у рамку: на фото під кутом монета — овал, маска повторює її форму, не спотворюючи
    const { width: w, height: h } = area;
    const mask = Buffer.from(
      `<svg width="${w}" height="${h}"><ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}"/></svg>`,
    );
    // flatten в одному ланцюжку з composite виконується ДО нього → окремий крок, інакше фон чорний
    const masked = await sharp(coin).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
    coin = await sharp(masked).flatten({ background: WHITE }).toBuffer();
  }

  return sharp(coin)
    .resize(COIN, COIN, { fit: "contain", background: WHITE })
    .extend({ top: PAD, bottom: PAD, left: PAD, right: PAD, background: WHITE })
    .jpeg({ quality: 90 })
    .toBuffer();
}

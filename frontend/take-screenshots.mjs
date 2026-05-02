import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'playstore', 'screenshots');

const PHONE_WIDTH = 1080;
const PHONE_HEIGHT = 2340;
const DEVICE_SCALE = 1;

const pages = [
  { name: '01-home', path: '/' },
  { name: '02-tuner', path: '/tuner' },
  { name: '03-guitar-chords', path: '/guitar-chords' },
  { name: '04-ideas', path: '/ideas' },
  { name: '05-piano-chords', path: '/piano-chords' },
  { name: '06-circle-of-fifths', path: '/circle-of-fifths' },
  { name: '07-song-structure', path: '/song-structure' },
  { name: '08-settings', path: '/settings' },
];

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.setViewport({
    width: PHONE_WIDTH,
    height: PHONE_HEIGHT,
    deviceScaleFactor: DEVICE_SCALE,
  });

  const { mkdir } = await import('fs/promises');
  await mkdir(OUT, { recursive: true });

  for (const pg of pages) {
    const url = `http://localhost:5173${pg.path}`;
    console.log(`Capturing ${pg.name} -> ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(OUT, `${pg.name}.png`),
      type: 'png',
      clip: { x: 0, y: 0, width: PHONE_WIDTH, height: PHONE_HEIGHT },
    });
  }

  await browser.close();
  console.log(`Done! ${pages.length} screenshots saved to ${OUT}`);
}

run().catch(err => { console.error(err); process.exit(1); });

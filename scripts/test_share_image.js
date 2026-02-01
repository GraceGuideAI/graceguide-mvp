const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const distDir = path.join(__dirname, '../graceguide-ui/dist');
  const assetsDir = path.join(distDir, 'assets');

  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    if (url.startsWith('file://')) {
      return req.continue();
    }
    if (url.includes('/static/assets/')) {
      const name = path.basename(url);
      const filePath = path.join(assetsDir, name);
      const body = fs.readFileSync(filePath);
      return req.respond({
        status: 200,
        headers: { 'Content-Type': 'application/javascript' },
        body
      });
    } else if (url.includes('html2canvas')) {
      const filePath = require.resolve('html2canvas/dist/html2canvas.min.js');
      const body = fs.readFileSync(filePath);
      return req.respond({
        status: 200,
        headers: { 'Content-Type': 'application/javascript' },
        body
      });
    }
    req.abort();
  });

  const file = path.join(distDir, 'index.html');
  await page.goto('file://' + file);
  await page.addScriptTag({ path: path.join(__dirname, '../graceguide-ui/src/main.js') });

  const question = 'Why do Catholics believe in the Real Presence of Christ in the Eucharist and how is this teaching rooted in both Scripture and Tradition?';
  const answer = 'Catholic theology holds that Christ becomes truly present under the appearances of bread and wine when the priest pronounces the words of consecration at Mass. This belief is grounded in Jesus\' words at the Last Supper, \'This is my body\', as well as in the consistent witness of the early Church. Many Fathers, such as St. Ignatius of Antioch and St. Augustine, affirmed that the Eucharist is no mere symbol but the very Body and Blood of the Lord.';

  const dataUrl = await page.evaluate(async (q, a) => {
    if (typeof generateShareImage !== 'function') {
      throw new Error('generateShareImage not found');
    }
    return await generateShareImage(q, a);
  }, question, answer);

  const base64 = dataUrl.split(',')[1];
  const buf = Buffer.from(base64, 'base64');
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  console.log(`Image size: ${width}x${height}`);
  await browser.close();
  if (width / 2 !== 540 || height / 2 !== 960) {
    throw new Error(`Unexpected canvas size ${width}x${height}`);
  }
  console.log('Success: generated share image');
})();

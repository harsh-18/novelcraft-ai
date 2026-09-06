import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    const content = await page.content();
    console.log('CONTENT START\n', content, '\nCONTENT END');
  } catch (err) {
    console.error('Error loading page:', err);
  }
  
  await browser.close();
})();

const puppeteer = require('puppeteer');

async function fetchSudoku(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('iframe#ASSudoku', { timeout: 15000 });

    // 获取 iframe 元素
    const elementHandle = await page.$('iframe#ASSudoku');
    const frame = await elementHandle.contentFrame();

    if (!frame) {
      throw new Error('找不到 ASSudoku iframe 的内容');
    }

    // 等待 boardtable 渲染
    await frame.waitForSelector('#boardtable', { timeout: 15000 });

    const puzzle = await frame.evaluate(() => {
      const result = [];
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const cell = document.querySelector(`#C${row}${col}`);
          let value = cell ? cell.textContent.trim() : '';
          if (!value || value === '\u00A0' || value === '&nbsp;') value = '0';
          result.push(value);
        }
      }
      return result;
    });

    if (puzzle.length !== 81) {
      throw new Error('boardtable 结构不完整，未能提取到 81 个格子');
    }

    console.log(puzzle.join(''));
  } catch (err) {
    console.error('❌ Error fetching sudoku:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

const url = process.argv[2];
if (!url) {
  console.error('Usage: node fetch-sudoku.js <url>');
  process.exit(1);
}

fetchSudoku(url);

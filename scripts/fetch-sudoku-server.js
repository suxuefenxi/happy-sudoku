// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors()); // 允许跨域，Svelte 可以调用

app.get('/api/sudoku', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.goto(url, { waitUntil: 'networkidle2' });

    // 如果在 iframe 中，切换进去
    const frame = await page.frames().find(f => f.name() === 'ASSudoku');
    if (!frame) throw new Error('未找到 iframe');

    const puzzle = await frame.evaluate(() => {
      let result = [];
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
      throw new Error('无法提取到 81 个格子');
    }

    res.json({ puzzle: puzzle.join('') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await browser.close();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🧩 Sudoku API running at http://localhost:${PORT}`);
});

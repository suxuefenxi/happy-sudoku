// server.js
import express from 'express';
import { chromium } from 'playwright';
import cors from 'cors';

const app = express();
app.use(cors()); // 允许跨域，Svelte 可以调用

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    playwright: 'available'
  });
});

app.get('/api/sudoku', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  console.log(`🔍 正在获取数独: ${url}`);
  
  let browser;
  let retryCount = 0;
  const maxRetries = 2;
  
  while (retryCount <= maxRetries) {
    try {
      browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
  const page = await browser.newPage();
      
      // 设置用户代理
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      console.log(`📄 正在加载页面... (尝试 ${retryCount + 1}/${maxRetries + 1})`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // 等待页面完全加载
      console.log('⏳ 等待页面稳定...');
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
        console.log('⚠️ 网络未完全稳定，继续处理...');
      });

      // 检查页面内容
      console.log('🔍 检查页面内容...');
      const pageContent = await page.content();
      console.log('📄 页面标题:', await page.title());
      
      // 查找所有iframe
      const iframes = await page.$$('iframe');
      console.log(`🔍 找到 ${iframes.length} 个iframe`);
      
      for (let i = 0; i < iframes.length; i++) {
        const iframe = iframes[i];
        const name = await iframe.getAttribute('name');
        const id = await iframe.getAttribute('id');
        console.log(`  iframe ${i + 1}: name="${name}", id="${id}"`);
      }
      
      // 尝试不同的iframe选择器
      let frameHandle = await page.$('iframe[name="ASSudoku"]');
      if (!frameHandle) {
        console.log('🔍 尝试通过id查找...');
        frameHandle = await page.$('iframe#ASSudoku');
      }
      if (!frameHandle) {
        console.log('🔍 尝试查找任何iframe...');
        frameHandle = await page.$('iframe');
      }
      
      if (!frameHandle) {
        console.log('❌ 未找到任何iframe');
        throw new Error('未找到任何iframe');
      }
      
      const frame = await frameHandle.contentFrame();
      if (!frame) {
        console.log('❌ 无法访问 iframe 内容');
        throw new Error('无法访问 iframe 内容');
      }

      console.log('📊 提取数独数据...');
      
      // 先检查iframe内的内容
      const frameContent = await frame.content();
      console.log('📄 iframe内容长度:', frameContent.length);

    const puzzle = await frame.evaluate(() => {
      let result = [];
        console.log('🔍 在iframe内查找数独格子...');
        
        // 尝试不同的选择器
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            let cell = document.querySelector(`#C${row}${col}`);
            if (!cell) {
              // 尝试其他可能的选择器
              cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            }
            if (!cell) {
              // 尝试通过位置查找
              const cells = document.querySelectorAll('td, .cell');
              const index = row * 9 + col;
              if (cells[index]) {
                cell = cells[index];
              }
            }
            
          let value = cell ? cell.textContent.trim() : '';
            if (!value || value === '\u00A0' || value === '&nbsp;' || value === '') {
              value = '0';
            }
          result.push(value);
        }
      }
      return result;
    });

    if (puzzle.length !== 81) {
        console.log(`❌ 提取的数据长度不正确: ${puzzle.length}`);
        console.log('📊 提取的数据:', puzzle);
      throw new Error('无法提取到 81 个格子');
    }

      console.log('✅ 成功提取数独数据');
      console.log('📊 数独数据:', puzzle.join(''));
    res.json({ puzzle: puzzle.join('') });
      return; // 成功，退出重试循环
      
  } catch (err) {
      console.error(`❌ 尝试 ${retryCount + 1} 失败:`, err.message);
      
      if (browser) {
        await browser.close();
        browser = null;
      }
      
      if (retryCount >= maxRetries) {
        console.error('❌ 所有重试都失败了');
    res.status(500).json({ error: err.message });
        return;
      }
      
      retryCount++;
      console.log(`🔄 等待 2 秒后重试...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🧩 Sudoku API running at http://localhost:${PORT}`);
});

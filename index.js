
const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

async function buscarProdutos(termo) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://bestshop.com.py/departamentos/smartphonesetablets');
  await page.waitForSelector('.product-box', { timeout: 15000 });

  const produtos = await page.$$eval('.product-box', (elements, termoBusca) => {
    return elements
      .map(el => {
        const nome = el.querySelector('.product-name')?.innerText || '';
        const preco = el.querySelector('.price')?.innerText || '';
        const estoque = el.querySelector('.out-of-stock') ? false : true;
        const obs = el.querySelector('.product-info')?.innerText || '';
        const categoria = nome.toLowerCase().includes('swap') ? 'Swap' : 'Novo';

        return {
          produto: nome,
          preco,
          estoque,
          observacoes: obs,
          categoria
        };
      })
      .filter(p => p.produto.toLowerCase().includes(termoBusca.toLowerCase()));
  }, termo);

  await browser.close();
  return produtos;
}

app.get('/buscar', async (req, res) => {
  const termo = req.query.produto || '';
  try {
    const resultado = await buscarProdutos(termo);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar produtos', detalhes: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

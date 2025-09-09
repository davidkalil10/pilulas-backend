// app/index.js
const express = require('express');
const fs = require('fs').promises; // Usando a versão baseada em Promises do fs
const path = require('path');
const cors = require('cors');

// --- Configuração ---
const app = express();
const PORT = 80; // Porta dentro do contêiner
const DATA_FILE = path.join(__dirname, '..', 'data', 'pilulas.json');

// Chave de API lida da variável de ambiente, com um valor padrão para testes
const API_KEY = process.env.API_KEY || 'SUA_CHAVE_SECRETA_MUITO_FORTE';

// --- Middlewares ---
app.use(cors()); // Habilita o CORS para todas as rotas
app.use(express.json()); // Permite que o servidor entenda JSON no corpo das requisições

// Middleware de segurança para verificar a chave de API
const checkApiKey = (req, res, next) => {
  const providedApiKey = req.get('X-API-KEY');
  if (providedApiKey && providedApiKey === API_KEY) {
    next(); // Chave correta, pode prosseguir
  } else {
    // Chave incorreta ou ausente, retorna erro de acesso negado
    res.status(403).json({ error: 'Acesso negado: Chave de API inválida ou ausente.' });
  }
};

// --- Endpoints da API ---

// Endpoint PÚBLICO para o app Flutter consumir
app.get('/conteudo', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    // Se o arquivo não existir ou der erro, retorna o padrão
    res.json({ record: {} });
  }
});

// Endpoint PROTEGIDO para o painel de admin
app.post('/conteudo', checkApiKey, async (req, res) => {
  console.log("-----------------------------------------");
  console.log("Recebida requisição para atualizar conteúdo...");

  try {
    const newContent = req.body;
    if (!newContent || !newContent.record) {
      console.error("Erro: Formato do JSON recebido é inválido.");
      return res.status(400).json({ error: 'Formato do JSON inválido. Esperado: {"record": {...}}' });
    }

    console.log(`Caminho do arquivo de dados: ${DATA_FILE}`);

    // Salva o novo conteúdo no arquivo, formatado
    await fs.writeFile(DATA_FILE, JSON.stringify(newContent, null, 2), 'utf8');

    console.log("Arquivo salvo com sucesso no disco do contêiner.");

    res.status(200).json({ message: 'Conteúdo atualizado com sucesso!' });

  } catch (error) {
    console.error('ERRO CRÍTICO AO SALVAR O CONTEÚDO:', error);
    res.status(500).json({ error: 'Erro interno ao salvar o arquivo.' });
  }
  console.log("-----------------------------------------");
});

// --- Iniciar o Servidor ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
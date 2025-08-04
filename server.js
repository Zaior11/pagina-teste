const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // versão 2.x, import certo
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const apiKey = "AIzaSyAtAYe730RXuhRVh_CHRhyedZoiYEcVmvY";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
  console.log('>>> Requisição POST /api/chat recebida');
  console.log('Corpo:', JSON.stringify(req.body));

  try {
    const { question, context } = req.body;

    if (!question) {
      console.warn('Requisição sem question');
      return res.status(400).json({ error: 'Pergunta é obrigatória' });
    }

    const promptText = context ? `${context}\n\nPergunta do usuário: ${question}` : question;

    const payload = {
      prompt: {
        messages: [{ role: 'user', content: { text: promptText } }],
      },
      max_tokens: 300,
      temperature: 0.7,
    };

    console.log('Payload enviado para API:', JSON.stringify(payload));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('Status da resposta da API:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const result = await response.json();

    console.log('Resposta da API (parcial):', JSON.stringify(result).slice(0, 500));

    let answer = "Desculpe, não consegui processar sua pergunta.";

    if (
      result.candidates &&
      Array.isArray(result.candidates) &&
      result.candidates.length > 0 &&
      result.candidates[0].content &&
      result.candidates[0].content.text
    ) {
      answer = result.candidates[0].content.text;
    }

    console.log('Resposta enviada ao cliente:', answer);

    res.json({ answer });
  } catch (error) {
    console.error('Erro no backend:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

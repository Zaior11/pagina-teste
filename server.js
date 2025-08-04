const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Sua chave da API Gemini Pro
const apiKey = "AIzaSyAtAYe730RXuhRVh_CHRhyedZoiYEcVmvY";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) return res.status(400).json({ error: 'Pergunta é obrigatória' });

    const promptText = context ? `${context}\n\nPergunta do usuário: ${question}` : question;

    const payload = {
      model: "gemini-2.5-flash-preview-05-20",
      prompt: {
        messages: [
          {
            author: "user",
            content: {
              contentType: "text",
              text: promptText
            }
          }
        ]
      },
      temperature: 0.7,
      candidateCount: 1,
      maxOutputTokens: 300,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const result = await response.json();

    let answer = "Desculpe, não consegui processar sua pergunta.";

    if (
      result.candidates &&
      Array.isArray(result.candidates) &&
      result.candidates.length > 0 &&
      result.candidates[0].message &&
      result.candidates[0].message.content &&
      result.candidates[0].message.content.text
    ) {
      answer = result.candidates[0].message.content.text;
    }

    res.json({ answer });

  } catch (err) {
    console.error('Erro no backend:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});


// Para todas as outras rotas, serve o index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});

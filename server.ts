import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Helper function to handle exponential backoff for transient API errors (503 / 429)
async function generateContentWithRetry(ai: GoogleGenAI, params: any, maxRetries = 1) {
  let retries = 0;
  while (true) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      const errStr = error?.toString() || '';
      const isTransient = 
        error?.status === 503 || errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand') ||
        error?.status === 504 || errStr.includes('504') ||
        error?.status === 502 || errStr.includes('502') ||
        error?.status === 429 || errStr.includes('429') || errStr.toLowerCase().includes('quota') || errStr.toLowerCase().includes('rate') ||
        errStr.includes("Unexpected token '<'") || errStr.includes('is not valid JSON') || errStr.includes('JSON');
      
      if (isTransient && retries < maxRetries) {
        retries++;
        // Short backoff to prevent Cloud Run 30s timeout
        const delay = 1000 + Math.random() * 500;
        console.log(`Gemini API busy (attempt ${retries}/${maxRetries}). Retrying in ${Math.round(delay)}ms...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for Gemini generation
  app.post('/api/generate', async (req, res) => {
    try {
      const { theme, uid } = req.body;
      if (!theme || !uid) {
        return res.status(400).json({ error: 'Missing theme or uid' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert web novel creator.
Based on the following theme or genre: "${theme}", generate:
1. A catchy novel title.
2. A detailed 2-3 paragraph synopsis.
3. World-building elements (setting, magic system/technology, lore).
4. Initial character profiles (protagonist and 1-2 important secondary characters).

Format your output in clean Markdown.`;

      const response = await generateContentWithRetry(ai, {
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      res.json({ content: response.text });
    } catch (error: any) {
      const errStr = error?.toString() || '';
      const isTransient = 
        error?.status === 503 || errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand') ||
        error?.status === 504 || errStr.includes('504') ||
        error?.status === 502 || errStr.includes('502') ||
        error?.status === 429 || errStr.includes('429') || errStr.toLowerCase().includes('quota') || errStr.toLowerCase().includes('rate') ||
        errStr.includes("Unexpected token '<'") || errStr.includes('is not valid JSON') || errStr.includes('JSON');
      
      if (!isTransient) {
        console.error('Error generating content:', error);
      }
      
      if (error?.status === 503 || errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand')) {
        res.status(503).json({ error: 'The AI model is currently experiencing high demand. Please try again later.' });
      } else if (error?.status === 429 || errStr.includes('429') || errStr.toLowerCase().includes('quota') || errStr.toLowerCase().includes('rate')) {
        res.status(429).json({ error: 'Rate limit exceeded for the free tier API. Please wait a minute before trying again.' });
      } else {
        
        if (errStr.includes("Unexpected token '<'") || errStr.includes("is not valid JSON") || errStr.includes("504") || errStr.includes("502")) {
          res.status(503).json({ error: 'The AI model is temporarily unavailable due to a network gateway error. Please try again later.' });
        } else {
          res.status(500).json({ error: `Failed to generate content: ${errStr}` });
        }

      }
    }
  });

  app.post('/api/generate-twists', async (req, res) => {
    try {
      const { concept, uid } = req.body;
      if (!concept || !uid) {
        return res.status(400).json({ error: 'Missing concept or uid' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Based on the following web novel concept, provide three unexpected, high-stakes plot twists. Format your output in clean Markdown.\n\nConcept:\n${concept}`;

      const response = await generateContentWithRetry(ai, {
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      res.json({ content: response.text });
    } catch (error: any) {
      const errStr = error?.toString() || '';
      const isTransient = 
        error?.status === 503 || errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand') ||
        error?.status === 504 || errStr.includes('504') ||
        error?.status === 502 || errStr.includes('502') ||
        error?.status === 429 || errStr.includes('429') || errStr.toLowerCase().includes('quota') || errStr.toLowerCase().includes('rate') ||
        errStr.includes("Unexpected token '<'") || errStr.includes('is not valid JSON') || errStr.includes('JSON');
      
      if (!isTransient) {
        console.error('Error generating plot twists:', error);
      }

      if (error?.status === 503 || errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand')) {
        res.status(503).json({ error: 'The AI model is currently experiencing high demand. Please try again later.' });
      } else if (error?.status === 429 || errStr.includes('429') || errStr.toLowerCase().includes('quota') || errStr.toLowerCase().includes('rate')) {
        res.status(429).json({ error: 'Rate limit exceeded for the free tier API. Please wait a minute before trying again.' });
      } else {
        
        if (errStr.includes("Unexpected token '<'") || errStr.includes("is not valid JSON") || errStr.includes("504") || errStr.includes("502")) {
          res.status(503).json({ error: 'The AI model is temporarily unavailable due to a network gateway error. Please try again later.' });
        } else {
          res.status(500).json({ error: `Failed to generate plot twists: ${errStr}` });
        }

      }
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { concept, history, message, uid } = req.body;
      if (!concept || !message || !uid) {
        return res.status(400).json({ error: 'Missing concept, message, or uid' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
      }

      const ai = new GoogleGenAI({ apiKey });

      const contents = [
        ...(history || []),
        { role: 'user', parts: [{ text: message }] }
      ];

      const response = await generateContentWithRetry(ai, {
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: `You are an expert web novel co-writer and creative assistant. You are helping the user refine, brainstorm, and expand upon their novel concept. Be encouraging, creative, and concise in your responses. Use Markdown for formatting. \n\nHere is the core concept you are working with:\n\n${concept}`
        }
      });

      res.json({ content: response.text });
    } catch (error: any) {
      const errStr = error?.toString() || '';
      const isTransient = 
        error?.status === 503 || errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand') ||
        error?.status === 504 || errStr.includes('504') ||
        error?.status === 502 || errStr.includes('502') ||
        error?.status === 429 || errStr.includes('429') || errStr.toLowerCase().includes('quota') || errStr.toLowerCase().includes('rate') ||
        errStr.includes("Unexpected token '<'") || errStr.includes('is not valid JSON') || errStr.includes('JSON');
      
      if (!isTransient) {
        console.error('Error generating chat response:', error);
      }

      if (error?.status === 503 || errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('high demand')) {
        res.status(503).json({ error: 'The AI model is currently experiencing high demand. Please try again later.' });
      } else if (error?.status === 429 || errStr.includes('429') || errStr.toLowerCase().includes('quota') || errStr.toLowerCase().includes('rate')) {
        res.status(429).json({ error: 'Rate limit exceeded for the free tier API. Please wait a minute before trying again.' });
      } else {
        
        if (errStr.includes("Unexpected token '<'") || errStr.includes("is not valid JSON") || errStr.includes("504") || errStr.includes("502")) {
          res.status(503).json({ error: 'The AI model is temporarily unavailable due to a network gateway error. Please try again later.' });
        } else {
          res.status(500).json({ error: `Failed to generate chat response: ${errStr}` });
        }

      }
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

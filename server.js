const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("AIzaSyDvF9RBIvtbHDCSgGZ7G_s-av5gxHn3CgQ");

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString('base64'),
      mimeType
    }
  };
}

const app = express();
app.use(express.json());
app.use(require("cors")())

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    const result = await model.generateContent([prompt]);
    const response = await result.response();
    const text = response.text();
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Image endpoint
app.post('/image', async (req, res) => {
  try {
    const { prompt } = req.body;
    const imageParts = [
      fileToGenerativePart('image1.png', 'image/png'),
      fileToGenerativePart('image2.jpeg', 'image/jpeg')
    ];

    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

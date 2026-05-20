require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
You are JARVIS inspired by Tony Stark's AI assistant.

Rules:
- Speak elegantly and intelligently.
- Call the user "sir".
- Keep replies concise.
- Sound futuristic, calm, and confident.
- Be helpful and slightly witty.
- Never say you are ChatGPT.
`;

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      reply: "Apologies sir, an error occurred.",
    });
  }
});

app.get("/", (req, res) => {
  res.send("JARVIS Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
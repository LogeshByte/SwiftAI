import express from "express";
import cors from "cors";
import axios from "axios";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

// Simple article generation endpoint
app.post("/generate-article", async (req, res) => {
  try {
    const { prompt, length } = req.body;

    if (!prompt) {
      return res.json({ success: false, message: "Prompt is required" });
    }

    console.log("Generating article with prompt:", prompt);

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Write a comprehensive article about: ${prompt}. The article should be approximately ${
                  length || 800
                } words long and well-structured with proper headings and paragraphs. Make it engaging and informative.`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: length || 800,
          temperature: 0.7,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (
      response.data.candidates &&
      response.data.candidates[0]?.content?.parts[0]?.text
    ) {
      const content = response.data.candidates[0].content.parts[0].text;
      console.log("Article generated successfully");
      res.json({ success: true, content });
    } else {
      throw new Error("No content generated from Gemini API");
    }
  } catch (error) {
    console.error(
      "Error generating article:",
      error.response?.data || error.message
    );

    if (error.response?.data?.error?.code === 429) {
      res.json({
        success: false,
        message:
          "API quota exceeded. Please wait a moment and try again, or upgrade your Gemini API plan.",
      });
    } else {
      res.json({
        success: false,
        message: `Failed to generate article: ${
          error.response?.data?.error?.message || error.message
        }`,
      });
    }
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Simple article generator is running!" });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Simple article server running on port ${PORT}`);
});

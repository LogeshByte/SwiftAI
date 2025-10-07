import axios from "axios";
import "dotenv/config";

async function testGemini() {
  try {
    console.log("Testing Gemini API...");
    console.log("API Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: "Say hello world" }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 50,
          temperature: 0.7,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Success!");
    console.log(
      "Response:",
      response.data.candidates[0]?.content?.parts[0]?.text
    );
  } catch (error) {
    console.log("❌ Error:", error.response?.data || error.message);
  }
}

testGemini();

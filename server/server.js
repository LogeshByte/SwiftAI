import express from "express";
import cors from "cors";
import "dotenv/config";
import axios from "axios";

const app = express();

app.use(cors());
app.use(express.json());

// Dummy data for demo (in production, use a real database)
const getDummyCreations = () => [
  {
    id: 1,
    user_id: "current_user",
    prompt: "The Future of Artificial Intelligence in Healthcare",
    content:
      "# The Future of Artificial Intelligence in Healthcare\n\nArtificial Intelligence (AI) is revolutionizing healthcare by improving diagnostic accuracy, personalizing treatment plans, and streamlining administrative processes. From early disease detection to robotic surgery, AI is transforming how we approach medical care.\n\n## Key Applications\n\n**Diagnostic Imaging**: AI algorithms can analyze medical images with remarkable precision, often detecting abnormalities that human eyes might miss.\n\n**Drug Discovery**: Machine learning accelerates the identification of potential therapeutic compounds, reducing development time from years to months.\n\n**Personalized Treatment**: AI analyzes patient data to recommend tailored treatment plans based on individual genetic profiles and medical history.\n\n## The Road Ahead\n\nAs AI continues to evolve, we can expect even more groundbreaking applications in healthcare, ultimately leading to better patient outcomes and more efficient medical systems.",
    type: "article",
    publish: false,
    likes: [],
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 2,
    user_id: "current_user",
    prompt: "Creative Blog Titles for Digital Marketing",
    content:
      "1. **Digital Marketing Mastery: Unlock Your Brand's Potential**\n2. **The Ultimate Guide to Social Media Success in 2024**\n3. **Content Marketing Secrets That Drive Real Results**\n4. **SEO Strategies That Actually Work (Proven Methods)**\n5. **Email Marketing: From Zero to Hero in 30 Days**\n6. **The Psychology Behind Viral Marketing Campaigns**\n7. **Data-Driven Marketing: Turn Analytics into Action**\n8. **Mobile-First Marketing: Reaching Customers on the Go**\n9. **Influencer Marketing: Building Authentic Partnerships**\n10. **Marketing Automation: Scale Your Business Effortlessly**",
    type: "blog-title",
    publish: false,
    likes: [],
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

// Health check
app.get("/", (req, res) => {
  res.json({ message: "AI SaaS Platform API is running!" });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is healthy!" });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API is working!" });
});

// Helper function for Gemini API
async function callGeminiAPI(prompt, maxTokens = 1000) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7,
        },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("No content generated from Gemini API");
    }
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || error.message);
  }
}

// Generate Article Endpoint
app.post("/api/ai/generate-article", async (req, res) => {
  try {
    const { prompt, length = 800, userId } = req.body;

    if (!prompt) {
      return res.json({ success: false, message: "Article topic is required" });
    }

    console.log("🤖 Generating article for:", prompt);

    const fullPrompt = `Write a comprehensive, well-structured article about: "${prompt}". 
    
    Requirements:
    - Approximately ${length} words
    - Include engaging headings and subheadings
    - Use proper paragraphs and formatting
    - Make it informative and engaging
    - Include relevant examples where appropriate
    - Write in a professional but accessible tone`;

    const content = await callGeminiAPI(fullPrompt, length);

    console.log("✅ Article generated successfully");
    res.json({ success: true, content });
  } catch (error) {
    console.error("❌ Article generation error:", error.message);
    res.json({ success: false, message: error.message });
  }
});

// Generate Blog Titles Endpoint
app.post("/api/ai/generate-blog-title", async (req, res) => {
  try {
    const { prompt, userId } = req.body;

    if (!prompt) {
      return res.json({ success: false, message: "Topic is required" });
    }

    console.log("📝 Generating blog titles for:", prompt);

    const fullPrompt = `Generate 10 creative, engaging, and SEO-friendly blog titles for the topic: "${prompt}".

    Requirements:
    - Make them catchy and click-worthy
    - Include power words and emotional triggers
    - Vary the length and style
    - Make them search engine optimized
    - Format as a numbered list (1. Title, 2. Title, etc.)
    - Each title should be unique and compelling

    Topic: ${prompt}`;

    const content = await callGeminiAPI(fullPrompt, 500);

    console.log("✅ Blog titles generated successfully");
    res.json({ success: true, content });
  } catch (error) {
    console.error("❌ Blog title generation error:", error.message);
    res.json({ success: false, message: error.message });
  }
});

// Generate Image Endpoint
app.post("/api/ai/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.json({ success: false, message: "Image prompt is required" });
    }

    console.log("🎨 Generating image for:", prompt);

    // Create form data for ClipDrop API
    const FormData = (await import("form-data")).default;
    const formData = new FormData();
    formData.append("prompt", prompt);

    const response = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API_KEY,
          ...formData.getHeaders(),
        },
        responseType: "arraybuffer",
      }
    );

    // Convert to base64
    const base64Image = `data:image/png;base64,${Buffer.from(
      response.data,
      "binary"
    ).toString("base64")}`;

    console.log("✅ Image generated successfully");
    res.json({ success: true, content: base64Image });
  } catch (error) {
    console.error(
      "❌ Image generation error:",
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      res.json({ success: false, message: "Invalid ClipDrop API key" });
    } else if (error.response?.status === 429) {
      res.json({
        success: false,
        message: "API rate limit exceeded. Please try again later.",
      });
    } else {
      res.json({
        success: false,
        message: "Failed to generate image. Please try again.",
      });
    }
  }
});

// Remove Image Background Endpoint (Serverless compatible)
app.post("/api/ai/remove-image-background", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.json({
        success: false,
        message: "Base64 image data is required",
      });
    }

    console.log("🖼️ Removing background from image...");

    // For serverless deployment, this would need a different approach
    // Currently returning a placeholder response
    res.json({
      success: false,
      message:
        "Background removal requires file upload - not available in serverless deployment",
    });
  } catch (error) {
    console.error("❌ Background removal error:", error.message);
    res.json({
      success: false,
      message: "Failed to remove background. Please try again.",
    });
  }
});

// Remove Object from Image Endpoint (Serverless compatible)
app.post("/api/ai/remove-image-object", async (req, res) => {
  try {
    const { imageBase64, object } = req.body;

    if (!imageBase64 || !object) {
      return res.json({
        success: false,
        message: "Base64 image data and object description are required",
      });
    }

    console.log(`🎯 Removing ${object} from image...`);

    // For serverless deployment, this would need a different approach
    res.json({
      success: false,
      message:
        "Object removal requires file upload - not available in serverless deployment",
    });
  } catch (error) {
    console.error("❌ Object removal error:", error.message);
    res.json({
      success: false,
      message: "Failed to remove object. Please try again.",
    });
  }
});

// Resume Review Endpoint (Serverless compatible)
app.post("/api/ai/resume-review", async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.json({ success: false, message: "Resume text is required" });
    }

    console.log("📄 Reviewing resume...");

    const prompt = `As an expert HR professional and career coach, provide a comprehensive review of this resume:

    RESUME CONTENT:
    ${resumeText}

    Please provide a detailed analysis with the following sections:

    1. **Overall Assessment** - Rate this resume out of 10 and provide a brief summary of strengths and weaknesses
    2. **Content Analysis** - Evaluate the actual content, experience, and skills presented
    3. **Strengths** - What works well in this specific resume
    4. **Areas for Improvement** - Specific issues that need attention in this resume
    5. **Content Suggestions** - What to add, remove, or modify based on the actual content
    6. **Formatting & Structure** - Layout and organization feedback for this resume
    7. **ATS Optimization** - Specific recommendations to make this resume more ATS-friendly
    8. **Action Items** - 5 specific, actionable steps to improve this particular resume

    Make your feedback constructive, specific to this resume's content, and actionable.`;

    const content = await callGeminiAPI(prompt, 2000);

    console.log("✅ Resume review generated successfully");
    res.json({ success: true, content });
  } catch (error) {
    console.error("❌ Resume review error:", error.message);
    res.json({
      success: false,
      message: `Failed to review resume: ${error.message}`,
    });
  }
});

// Community Endpoints

// Get all published creations
app.get("/api/community/creations", async (req, res) => {
  try {
    console.log("📱 Fetching community creations...");

    // For now, return dummy data - in a real app, this would query the database
    const dummyCreations = [
      {
        id: 1,
        user_id: "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
        prompt: "A boy fishing on a boat in anime style",
        content:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
        type: "image",
        publish: true,
        likes: [
          "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
          "user_2yaW5EHzeDfQbXdAJWYFnZo2bje",
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        user_id: "user_2yMX02PRbyMtQK6PebpjnxvRNIA",
        prompt: "Futuristic bicycle in anime style",
        content:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        type: "image",
        publish: true,
        likes: ["user_2yMX02PRbyMtQK6PebpjnxvRNIA"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 3,
        user_id: "user_2yaW5EHzeDfQbXdAJWYFnZo2bje",
        prompt: "Flying car in realistic style",
        content:
          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400",
        type: "image",
        publish: true,
        likes: ["user_2yaW5EHzeDfQbXdAJWYFnZo2bje"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    res.json({ success: true, creations: dummyCreations });
  } catch (error) {
    console.error("❌ Error fetching creations:", error.message);
    res.json({ success: false, message: error.message });
  }
});

// Like/Unlike a creation
app.post("/api/community/like/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, action } = req.body; // action: 'like' or 'unlike'

    if (!userId || !action) {
      return res.json({
        success: false,
        message: "User ID and action are required",
      });
    }

    console.log(
      `${
        action === "like" ? "❤️" : "💔"
      } ${action}ing creation ${id} by user ${userId}`
    );

    // In a real app, this would update the database
    // For now, just return success
    res.json({
      success: true,
      message: `Creation ${action}d successfully`,
      action,
      creationId: id,
      userId,
    });
  } catch (error) {
    console.error("❌ Error updating like:", error.message);
    res.json({ success: false, message: error.message });
  }
});

// Get user's creations
app.get("/api/user/creations", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    console.log("👤 Fetching user creations for:", userId);

    // Return dummy data for demo
    const userCreations = getDummyCreations();

    console.log(
      `📊 Found ${userCreations.length} creations for user ${userId}`
    );

    res.json({ success: true, creations: userCreations });
  } catch (error) {
    console.error("❌ Error fetching user creations:", error.message);
    res.json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API Base URL: http://localhost:${PORT}`);
    console.log(
      `🔑 Gemini API Key: ${
        process.env.GEMINI_API_KEY ? "Configured ✅" : "Missing ❌"
      }`
    );
    console.log(
      `🔑 ClipDrop API Key: ${
        process.env.CLIPDROP_API_KEY ? "Configured ✅" : "Missing ❌"
      }`
    );
  });
}

// Export for Vercel
export default app;

import axios from "axios";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { createRequire } from "module";

// Create require function for CommonJS modules
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to call Gemini API
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

// Helper function to extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } catch (error) {
    console.error("❌ PDF parsing failed:", error.message);
    throw error;
  }
}

// 1. Generate Article
export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length = 800 } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (!prompt) {
      return res.json({ success: false, message: "Article topic is required" });
    }

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free usage limit exceeded. Please upgrade to premium plan.",
      });
    }

    console.log("🤖 Generating article...");

    const fullPrompt = `Write a comprehensive, well-structured article about: "${prompt}". 
    
    Requirements:
    - Approximately ${length} words
    - Include engaging headings and subheadings
    - Use proper paragraphs and formatting
    - Make it informative and engaging
    - Include relevant examples where appropriate`;

    const content = await callGeminiAPI(fullPrompt, length);

    await sql`INSERT INTO creation (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("❌ Article generation error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// 2. Generate Blog Titles
export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (!prompt) {
      return res.json({ success: false, message: "Topic is required" });
    }

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Free usage limit exceeded. Please upgrade to premium plan.",
      });
    }

    console.log("📝 Generating blog titles...");

    const fullPrompt = `Generate 10 creative, engaging, and SEO-friendly blog titles for the topic: "${prompt}".

    Requirements:
    - Make them catchy and click-worthy
    - Include power words and emotional triggers
    - Vary the length and style
    - Make them search engine optimized
    - Format as a numbered list

    Topic: ${prompt}`;

    const content = await callGeminiAPI(fullPrompt, 300);

    await sql`INSERT INTO creation (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("❌ Blog title generation error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

// 3. Generate Images
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish = false } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "Image generation is only available for premium subscribers",
      });
    }

    if (!prompt) {
      return res.json({ success: false, message: "Image prompt is required" });
    }

    console.log("🎨 Generating image...");

    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;
    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`INSERT INTO creation (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish})`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("❌ Image generation error:", error.message);
    res.json({
      success: false,
      message: `Failed to generate image: ${error.message}`,
    });
  }
};

// 4. Remove Image Background
export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "Background removal is only available for premium subscribers",
      });
    }

    if (!image) {
      return res.json({ success: false, message: "Image file is required" });
    }

    console.log("🖼️ Removing background...");

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });

    await sql`INSERT INTO creation (user_id, prompt, content, type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("❌ Background removal error:", error.message);
    res.json({
      success: false,
      message: `Failed to remove background: ${error.message}`,
    });
  }
};

// 5. Remove Object from Image
export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "Object removal is only available for premium subscribers",
      });
    }

    if (!image || !object) {
      return res.json({
        success: false,
        message: "Image file and object description are required",
      });
    }

    console.log(`🎯 Removing ${object} from image...`);

    const { public_id } = await cloudinary.uploader.upload(image.path);
    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await sql`INSERT INTO creation (user_id, prompt, content, type) VALUES (${userId}, ${`Remove ${object} from image`}, ${imageUrl}, 'image')`;

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.error("❌ Object removal error:", error.message);
    res.json({
      success: false,
      message: `Failed to remove object: ${error.message}`,
    });
  }
};

// 6. Get User Creations
export const getUserCreations = async (req, res) => {
  try {
    const { userId } = req.auth();

    console.log("📊 Fetching user creations...");

    const creations = await sql`
      SELECT id, prompt, content, type, publish, created_at, updated_at 
      FROM creation 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 20
    `;

    res.json({ success: true, creations });
  } catch (error) {
    console.error("❌ Get creations error:", error.message);
    res.json({
      success: false,
      message: `Failed to fetch creations: ${error.message}`,
    });
  }
};

// 7. Review Resume
export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "Resume review is only available for premium subscribers",
      });
    }

    if (!resume) {
      return res.json({ success: false, message: "Resume file is required" });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "File size should be less than 5MB",
      });
    }

    console.log("📄 Reviewing resume...");

    let resumeText = "";

    try {
      resumeText = await extractTextFromPDF(resume.path);
      console.log("✅ PDF parsed successfully");
      console.log("📝 Extracted text length:", resumeText.length, "characters");
    } catch (pdfError) {
      console.error("❌ PDF parsing failed:", pdfError.message);
      resumeText = `I received your resume file "${resume.originalname}" (${(
        resume.size / 1024
      ).toFixed(
        1
      )}KB). While I cannot parse the PDF content directly, I can provide you with comprehensive resume improvement guidance based on current industry standards and best practices.`;
    }

    const prompt = resumeText.includes("cannot parse the PDF content")
      ? `As an expert HR professional and career coach, I've received a resume file but cannot parse its content directly. Please provide a comprehensive resume improvement guide with the following sections:

    ${resumeText}

    Please provide detailed guidance with these sections:

    1. **Overall Assessment Guidelines** - How to evaluate resume effectiveness (scoring criteria out of 10)
    2. **Content Best Practices** - What makes resume content compelling and relevant
    3. **Common Strengths to Highlight** - Key elements that make resumes stand out
    4. **Areas Often Needing Improvement** - Most common resume weaknesses to avoid
    5. **Content Optimization** - How to improve descriptions, achievements, and skills presentation
    6. **Formatting & Structure** - Professional layout and organization principles
    7. **ATS Optimization** - Making resumes applicant tracking system friendly
    8. **Action Items** - 5 specific steps anyone can take to improve their resume

    Make this guidance actionable and specific, focusing on current industry standards and best practices.`
      : `As an expert HR professional and career coach, provide a comprehensive review of this resume:

    RESUME CONTENT:
    ${resumeText}

    Please provide:
    1. **Overall Assessment** - Rate the resume out of 10 and give a brief summary
    2. **Strengths** - What works well in this resume
    3. **Areas for Improvement** - Specific issues that need attention
    4. **Content Suggestions** - What to add, remove, or modify
    5. **Formatting & Structure** - Layout and organization feedback
    6. **ATS Optimization** - How to make it more ATS-friendly
    7. **Action Items** - 5 specific steps to improve the resume

    Make your feedback constructive, specific, and actionable.`;

    const content = await callGeminiAPI(prompt, 2000);

    await sql`INSERT INTO creation (user_id, prompt, content, type) VALUES (${userId}, 'Resume review and feedback', ${content}, 'resume-review')`;

    res.json({ success: true, content });
  } catch (error) {
    console.error("❌ Resume review error:", error.message);
    res.json({
      success: false,
      message: `Failed to review resume: ${error.message}`,
    });
  }
};

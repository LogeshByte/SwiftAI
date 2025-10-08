import sql from "../configs/db.js";

// In-memory storage for demo purposes (replace with database in production)
let creationsStorage = [
  {
    id: 1,
    user_id: "current_user",
    prompt: "The Future of Artificial Intelligence in Healthcare",
    content:
      "# The Future of Artificial Intelligence in Healthcare\n\nArtificial Intelligence (AI) is revolutionizing healthcare...",
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
      "1. **Digital Marketing Mastery: Unlock Your Brand's Potential**\n2. **The Ultimate Guide to Social Media Success in 2024**...",
    type: "blog-title",
    publish: false,
    likes: [],
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

export const getUserCreations = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.json({ success: false, message: "User ID is required" });
    }

    console.log("👤 Fetching user creations for:", userId);

    // For demo purposes, show ALL creations for any user (in production, filter by actual user)
    const userCreations = creationsStorage.slice(0, 20);

    console.log(
      `📊 Found ${userCreations.length} creations for user ${userId}`
    );

    res.json({ success: true, creations: userCreations });
  } catch (error) {
    console.error("❌ Error fetching user creations:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getPublishedCreations = async (req, res) => {
  try {
    console.log("📱 Fetching published creations...");

    const publishedCreations = creationsStorage.filter(
      (creation) => creation.publish
    );

    res.json({ success: true, creations: publishedCreations });
  } catch (error) {
    console.error("❌ Error fetching published creations:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const toggleLikeCreations = async (req, res) => {
  try {
    const { creationId, userId, action } = req.body;

    if (!creationId || !userId || !action) {
      return res.json({
        success: false,
        message: "Creation ID, User ID, and action are required",
      });
    }

    console.log(
      `${
        action === "like" ? "❤️" : "💔"
      } ${action}ing creation ${creationId} by user ${userId}`
    );

    // In a real app, this would update the database
    res.json({
      success: true,
      message: `Creation ${action}d successfully`,
      action,
      creationId,
      userId,
    });
  } catch (error) {
    console.error("❌ Error toggling like:", error.message);
    res.json({ success: false, message: error.message });
  }
};

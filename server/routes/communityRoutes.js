import express from "express";

const communityRouter = express.Router();

// Get all published creations
communityRouter.get("/creations", async (req, res) => {
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
communityRouter.post("/like/:id", async (req, res) => {
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

export default communityRouter;

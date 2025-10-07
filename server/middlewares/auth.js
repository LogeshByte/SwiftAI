import { clerkClient } from "@clerk/express";

// Middleware to get userId and plan information
export const auth = async (req, res, next) => {
  try {
    const { userId, has } = req.auth();

    if (!userId) {
      return res.json({ success: false, message: "User not authenticated" });
    }

    const hasPremiumPlan = await has({ plan: "premium" });
    const user = await clerkClient.users.getUser(userId);

    // Get current usage from user metadata
    const currentUsage = user.privateMetadata?.free_usage || 0;

    req.plan = hasPremiumPlan ? "premium" : "free";
    req.free_usage = currentUsage;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.json({ success: false, message: "Authentication failed" });
  }
};

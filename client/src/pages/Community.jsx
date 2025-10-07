import React, { useEffect } from "react";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Heart, Users, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchCreations = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/community/creations");

      if (response.data.success) {
        setCreations(response.data.creations);
      } else {
        toast.error("Failed to load community creations");
      }
    } catch (error) {
      console.error("Error fetching creations:", error);
      toast.error("Failed to load community creations");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (creationId, isLiked) => {
    if (!user) {
      toast.error("Please sign in to like posts");
      return;
    }

    try {
      const action = isLiked ? "unlike" : "like";

      const response = await axios.post(`/api/community/like/${creationId}`, {
        userId: user.id,
        action,
      });

      if (response.data.success) {
        // Update the local state
        setCreations((prevCreations) =>
          prevCreations.map((creation) => {
            if (creation.id === creationId) {
              const updatedLikes = isLiked
                ? creation.likes.filter((id) => id !== user.id)
                : [...creation.likes, user.id];

              return { ...creation, likes: updatedLikes };
            }
            return creation;
          })
        );

        toast.success(isLiked ? "Unliked!" : "Liked!");
      } else {
        toast.error("Failed to update like");
      }
    } catch (error) {
      console.error("Error updating like:", error);
      toast.error("Failed to update like");
    }
  };

  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community creations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Users className="w-6 h-6 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Community Gallery</h1>
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
          {creations.length} creations
        </span>
      </div>

      <div className="bg-white h-full w-full rounded-xl overflow-y-auto p-4">
        {creations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium mb-2">
              No community creations yet
            </p>
            <p className="text-sm text-center">
              Be the first to share your AI-generated content with the
              community!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {creations.map((creation) => (
              <div
                key={creation.id}
                className="relative group bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-square">
                  <img
                    src={creation.content}
                    alt={creation.prompt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400";
                    }}
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-sm mb-3 line-clamp-2">
                      {creation.prompt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                          {creation.type}
                        </span>
                      </div>

                      <div
                        className="flex gap-1 items-center cursor-pointer hover:scale-110 transition-transform"
                        onClick={() =>
                          handleLike(
                            creation.id,
                            creation.likes.includes(user?.id)
                          )
                        }
                      >
                        <span className="text-white text-sm font-medium">
                          {creation.likes.length}
                        </span>
                        <Heart
                          className={`w-5 h-5 transition-colors ${
                            creation.likes.includes(user?.id)
                              ? "fill-red-500 text-red-500"
                              : "text-white hover:text-red-300"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Always visible like counter */}
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                  <span className="text-white text-xs font-medium">
                    {creation.likes.length}
                  </span>
                  <Heart
                    className={`w-3 h-3 ${
                      creation.likes.includes(user?.id)
                        ? "fill-red-500 text-red-500"
                        : "text-white"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;

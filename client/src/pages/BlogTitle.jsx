import { Hash, Sparkle } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BlogTitle = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [titles, setTitles] = useState("");

  const { getToken, userId } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!input.trim()) {
      toast.error("Please enter a blog topic");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        "/api/ai/generate-blog-title",
        {
          prompt: input,
          userId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        setTitles(data.content);
        toast.success("🎉 Blog titles generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate blog titles");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate blog titles"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Hash className="w-6 h-6 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Blog Titles</h1>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Topic
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="e.g., Digital marketing strategies for small businesses, sustainable living tips, productivity hacks for remote workers..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkle className="w-5 h-5" />
                    Generate Titles
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Hash className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Generated Titles
              </h2>
            </div>

            <div className="h-[500px] overflow-y-auto">
              {!titles ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Hash className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Ready to create catchy titles?
                  </p>
                  <p className="text-sm text-center">
                    Enter your blog topic and get 10 SEO-optimized, engaging
                    titles
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {titles
                    .split("\n")
                    .filter((line) => line.trim())
                    .map((title, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => {
                          const cleanTitle = title
                            .replace(/^\d+\.\s*/, "")
                            .replace(/\*\*/g, "");
                          navigator.clipboard.writeText(cleanTitle);
                          toast.success("Title copied to clipboard!");
                        }}
                      >
                        <div
                          className="text-gray-700 font-medium"
                          dangerouslySetInnerHTML={{
                            __html: title.replace(
                              /\*\*(.*?)\*\*/g,
                              "<strong>$1</strong>"
                            ),
                          }}
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogTitle;

import { Edit, Sparkle } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { renderMarkdown } from "../utils/markdownRenderer";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: "Short (500-800 words)" },
    { length: 1200, text: "Medium (800-1200 words)" },
    { length: 1600, text: "Long (1200+ words)" },
  ];

  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken, userId } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!input.trim()) {
      toast.error("Please enter an article topic");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        "/api/ai/generate-article",
        {
          prompt: input,
          length: selectedLength.length,
          userId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("🎉 Article generated successfully!");

        // The article is automatically saved to the database by the backend
        // No need for additional API call since the backend already handles this
      } else {
        toast.error(data.message || "Failed to generate article");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate article"
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkle className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Write Article
              </h1>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article Topic
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., The future of artificial intelligence..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Article Length
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {articleLength.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedLength(item)}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        selectedLength.text === item.text
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {item.text}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Edit className="w-5 h-5" />
                    Generate Article
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Edit className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Generated Article
              </h2>
            </div>

            <div className="h-[600px] overflow-y-auto">
              {!content ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Edit className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Ready to create amazing content?
                  </p>
                  <p className="text-sm text-center">
                    Enter your topic and click "Generate Article" to get started
                  </p>
                </div>
              ) : (
                <div className="prose prose-gray max-w-none">
                  <div
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(content),
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteArticle;

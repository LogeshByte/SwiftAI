import { Image, Sparkle, Download, Share2 } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [publish, setPublish] = useState(false);

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!input.trim()) {
      toast.error("Please enter an image description");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        "/api/ai/generate-image",
        {
          prompt: input,
          publish,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        setImageUrl(data.content);
        toast.success("🎨 Image generated successfully!");
      } else {
        toast.error(data.message || "Failed to generate image");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate image"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Image className="w-6 h-6 text-pink-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Generate Images
              </h1>
            </div>

            <form onSubmit={onSubmitHandler} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Description
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="e.g., A futuristic city with flying cars at sunset, digital art style..."
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="publish"
                  checked={publish}
                  onChange={(e) => setPublish(e.target.checked)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="publish" className="text-sm text-gray-700">
                  Make this image public in community gallery
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Premium Feature:</strong> Image generation is
                  available for premium subscribers only.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white py-3 px-6 rounded-lg font-medium hover:from-pink-700 hover:to-pink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkle className="w-5 h-5" />
                    Generate Image
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Image className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Generated Image
              </h2>
            </div>

            <div className="h-[500px] flex items-center justify-center">
              {!imageUrl ? (
                <div className="text-center text-gray-400">
                  <Image className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Ready to create stunning visuals?
                  </p>
                  <p className="text-sm">
                    Describe your image and let AI bring it to life
                  </p>
                </div>
              ) : (
                <div className="w-full">
                  <img
                    src={imageUrl}
                    alt="Generated"
                    className="w-full h-auto max-h-[400px] object-contain rounded-lg shadow-lg"
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={downloadImage}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(imageUrl);
                        toast.success("Image URL copied!");
                      }}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateImages;

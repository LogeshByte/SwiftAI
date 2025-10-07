import { Scissors, Upload, Download, Image as ImageIcon } from "lucide-react";
import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState("");
  const [objectToRemove, setObjectToRemove] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const { getToken } = useAuth();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      setOriginalImage(file);
      setProcessedImage("");
    }
  };

  const removeObject = async () => {
    if (!originalImage) {
      toast.error("Please select an image first");
      return;
    }

    if (!objectToRemove.trim()) {
      toast.error("Please describe what object to remove");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", originalImage);
      formData.append("object", objectToRemove);

      const { data } = await axios.post(
        "/api/ai/remove-image-object",
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        setProcessedImage(data.content);
        toast.success("🎉 Object removed successfully!");
      } else {
        toast.error(data.message || "Failed to remove object");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to remove object"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    try {
      const response = await fetch(processedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `object-removed-${Date.now()}.png`;
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <Scissors className="w-6 h-6 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Remove Object</h1>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Premium Feature:</strong> Object removal is available for
              premium subscribers only.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Original Image
              </h3>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors"
              >
                {originalImage ? (
                  <img
                    src={URL.createObjectURL(originalImage)}
                    alt="Original"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="text-gray-400">
                    <Upload className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Upload an image</p>
                    <p className="text-sm">Click to select or drag and drop</p>
                    <p className="text-xs mt-2">
                      Supports: JPG, PNG, WebP (Max 10MB)
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Object to Remove
                </label>
                <input
                  type="text"
                  value={objectToRemove}
                  onChange={(e) => setObjectToRemove(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., person, car, tree, watermark, text..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe the object you want to remove from the image
                </p>
              </div>

              <button
                onClick={removeObject}
                disabled={!originalImage || !objectToRemove.trim() || loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg font-medium hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Scissors className="w-5 h-5" />
                    Remove Object
                  </>
                )}
              </button>
            </div>

            {/* Result Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Processed Image
              </h3>

              <div className="border border-gray-200 rounded-lg p-8 min-h-[300px] flex items-center justify-center bg-gray-50">
                {processedImage ? (
                  <div className="w-full text-center">
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
                    />
                    <button
                      onClick={downloadImage}
                      className="mt-4 bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">
                      Processed image will appear here
                    </p>
                    <p className="text-sm">
                      Upload an image, describe the object, and click "Remove
                      Object"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveObject;

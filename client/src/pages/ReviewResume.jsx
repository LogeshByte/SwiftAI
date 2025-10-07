import { FileText, Upload, Download, Star } from "lucide-react";
import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { renderMarkdown } from "../utils/markdownRenderer";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const { getToken } = useAuth();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }

      setResumeFile(file);
      setReview("");
    }
  };

  const reviewResume = async () => {
    if (!resumeFile) {
      toast.error("Please select a resume file first");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", resumeFile);

      const { data } = await axios.post("/api/ai/resume-review", formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        setReview(data.content);
        toast.success("🎉 Resume reviewed successfully!");
      } else {
        toast.error(data.message || "Failed to review resume");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to review resume"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadReview = () => {
    const element = document.createElement("a");
    const file = new Blob([review], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `resume-review-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Review downloaded!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Review Resume
              </h1>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Premium Feature:</strong> Resume review is available for
                premium subscribers only.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Resume (PDF only)
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  {resumeFile ? (
                    <div className="text-indigo-600">
                      <FileText className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">
                        {resumeFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <Upload className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">
                        Upload your resume
                      </p>
                      <p className="text-sm">
                        Click to select or drag and drop
                      </p>
                      <p className="text-xs mt-2">PDF files only (Max 5MB)</p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">
                  What you'll get:
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Overall assessment and rating</li>
                  <li>• Strengths and weaknesses analysis</li>
                  <li>• Content and formatting suggestions</li>
                  <li>• ATS optimization tips</li>
                  <li>• Specific action items for improvement</li>
                </ul>
              </div>

              <button
                onClick={reviewResume}
                disabled={!resumeFile || loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-6 rounded-lg font-medium hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5" />
                    Review Resume
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Review Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Review Results
                </h2>
              </div>

              {review && (
                <button
                  onClick={downloadReview}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>

            <div className="h-[600px] overflow-y-auto">
              {!review ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <FileText className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Ready for professional feedback?
                  </p>
                  <p className="text-sm text-center">
                    Upload your resume and get expert analysis to improve your
                    job prospects
                  </p>
                </div>
              ) : (
                <div className="prose prose-gray max-w-none">
                  <div
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(review) }}
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

export default ReviewResume;

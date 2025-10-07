import React, { useState } from "react";
import { Gem, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { Protect, useAuth } from "@clerk/clerk-react";
import CreationItem from "../components/CreationItem";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  const getDashboardData = async () => {
    try {
      setLoading(true);

      if (!userId) {
        console.log("No user ID available");
        return;
      }

      console.log("🔍 Fetching creations for user:", userId);
      const { data } = await axios.get(`/api/user/creations?userId=${userId}`);
      console.log("📊 API Response:", data);

      if (data.success) {
        setCreations(data.creations);
        console.log("✅ Creations loaded:", data.creations.length);
      } else {
        toast.error(data.message || "Failed to fetch creations");
      }
    } catch (error) {
      console.error("Error fetching creations:", error);
      toast.error("Failed to fetch your creations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      getDashboardData();
    }
  }, [userId]);

  return (
    <div className="h-full overflow-y-scroll p-6">
      <div className="flex justify-start gap-4 flex-wrap">
        {/* Total Creation Card */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200 ">
          <div className="text-slate-600">
            <p className="text-sm">Total Creations</p>
            <h2 className="text-xl font-semibold">{creations.length}</h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center">
            <Sparkles className="w-5 text-white" />
          </div>
        </div>
        {/* Active Plan Card */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200 ">
          <div className="text-slate-600">
            <p className="text-sm">Active Plan</p>
            <h2 className="text-xl font-semibold">
              <Protect plan="premium" fallback="Free">
                Premium
              </Protect>
            </h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center">
            <Gem className="w-5 text-white" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between mt-6 mb-4">
          <p>Recent Creations</p>
          <button
            onClick={getDashboardData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">
              Loading your creations...
            </span>
          </div>
        ) : creations.length > 0 ? (
          creations.map((item) => <CreationItem key={item.id} item={item} />)
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No creations yet</p>
            <p className="text-sm">
              Start creating amazing content with our AI tools!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

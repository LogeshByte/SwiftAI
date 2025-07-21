import React from "react";
import { useUser } from "@clerk/clerk-react";
import { assets } from "../assets/assets";
import {
  Eraser,
  FileText,
  Hash,
  Home,
  Scissors,
  SquarePen,
  UsersRound,
  Image,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/ai", label: "Dashboard", Icon: Home },
  { to: "/ai/write-article", label: "Write Article", Icon: SquarePen },
  { to: "/ai/blog-titles", label: "Blog Titles", Icon: Hash },
  { to: "/ai/generate-images", label: "Generate Images", Icon: Image },
  { to: "/ai/remove-background", label: "Remove Background", Icon: Eraser },
  { to: "/ai/remove-object", label: "Remove Object", Icon: Scissors },
  { to: "/ai/review-resume", label: "Review Resume", Icon: FileText },
  { to: "/ai/community", label: "Community", Icon: UsersRound },
];

const Sidebar = ({ sidebar, setSideBar }) => {
  const { user, isLoaded } = useUser();
  return (
    <div
      className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-14 bottom-0 ${
        sidebar ? "translate-x-0" : "max-sm:-translate-x-full"
      }`}
    >
      <div className="my-7 w-full">
        {user && (
          <>
            <img
              src={user.imageUrl}
              alt=""
              className="w-13 rounded-full mx-auto"
            />
            <h1 className="mt-1 text-center">{user.fullName}</h1>

            <div>
              {navItems.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/ai"}
                  onClick={() => setSideBar(false)}
                  className={({ isActive }) =>
                    `px-3.5 py-2.5 flex items-center gap-3 rounded ${
                      isActive
                        ? "bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white"
                        : ""
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 ${isActive ? "text-white" : ""}`}
                      />
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

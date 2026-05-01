import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import memberData from "../../data/members.json";

import { CardStack } from "./components/CardStack";
import { BrowseGrid } from "./components/BrowseGrid";
import { Hash, LayoutGrid, Layers } from "lucide-react";
import { shuffleArray } from "../utils/shuffleArray";

type ViewMode = "stack" | "grid";

function useAutoDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  // Live-follow system preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("stack");
  useAutoDarkMode();
  const members = memberData.members;

  const membersById = useMemo(() => {
    return new Map(members.map((m) => [m.id, m]));
  }, [members]);

  const vouchCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of members) {
      if (m.vouchedBy && m.vouchedBy !== "og-member") {
        counts.set(m.vouchedBy, (counts.get(m.vouchedBy) ?? 0) + 1);
      }
    }
    return counts;
  }, [members]);

  const shuffledMembers = useMemo(() => {
    return shuffleArray(members);
  }, [members]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Background funky text */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03] dark:opacity-[0.06]">
        <div className="absolute text-[20rem] font-black text-[#1b66f3] -top-20 -left-20 transform -rotate-12">
          OFF
        </div>
        <div className="absolute text-[15rem] font-black text-[#1b66f3] top-1/3 -right-10 transform rotate-12">
          TOPIC
        </div>
        <div className="absolute text-[18rem] font-black text-[#1b66f3] bottom-0 left-1/4 transform -rotate-6">
          #
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 px-4 pt-8 pb-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Hash className="w-10 h-10 text-[#1b66f3]" />
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
                off-topic
              </h1>
            </div>
          </motion.div>

          {/* View toggle */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <div className="flex gap-3 bg-white dark:bg-gray-800 p-1.5 rounded-2xl border-2 border-[#1b66f3]/20 shadow-lg">
              <motion.button
                onClick={() => setViewMode("stack")}
                className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                  viewMode === "stack"
                    ? "bg-[#1b66f3] text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Layers className="w-4 h-4" />
                Stack
              </motion.button>
              <motion.button
                onClick={() => setViewMode("grid")}
                className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                  viewMode === "grid"
                    ? "bg-[#1b66f3] text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LayoutGrid className="w-4 h-4" />
                Browse
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        {viewMode === "stack" ? (
          <CardStack members={shuffledMembers} membersById={membersById} vouchCounts={vouchCounts} />
        ) : (
          <BrowseGrid members={shuffledMembers} membersById={membersById} vouchCounts={vouchCounts} />
        )}
      </main>
    </div>
  );
}

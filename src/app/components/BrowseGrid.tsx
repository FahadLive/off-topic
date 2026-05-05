import { motion, AnimatePresence } from "motion/react";
import { Github, Linkedin, Instagram, Search } from "lucide-react";
import { MemberCard } from "../components/MemberCard";
import { MemberDetailDialog } from "../components/MemberDetailDialog";
import { useState } from "react";
import { Member } from "../../types/data";

// Twitter/X icon component
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface BrowseGridProps {
  members: Member[];
  membersById: Map<string, Member>;
  vouchCounts: Map<string, number>;
}

export function BrowseGrid({ members, membersById, vouchCounts }: BrowseGridProps) {
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [dialogState, setDialogState] = useState<{ member: Member; index: number } | null>(null);

  const uniqueRoles = Array.from(new Set(members.map((m) => m.role)));

  const filteredRoles = uniqueRoles.filter((role) =>
    role.toLowerCase().includes(roleSearch.toLowerCase()),
  );

  const uniqueYears = Array.from(
    new Set(members.map((m) => m.passoutYear)),
  ).sort();

  const filteredMembers = members.filter((m) => {
    const matchesYear =
      selectedYear === "all" || m.passoutYear === selectedYear;

    const memberRole = m.role;
    const matchesRole = selectedRole === "all" || memberRole === selectedRole;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      m.name.toLowerCase().includes(searchLower) ||
      m.role.toLowerCase().includes(searchLower) ||
      m.major.toLowerCase().includes(searchLower) ||
      m.interests.toLowerCase().includes(searchLower);

    return matchesYear && matchesRole && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#1b66f3]/30 focus:border-[#1b66f3] focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-100 shadow-md font-semibold"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2 overflow-x-auto">
            <motion.button
              onClick={() => setSelectedYear("all")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                selectedYear === "all"
                  ? "bg-[#1b66f3] text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              All Years
            </motion.button>
            {uniqueYears.map((year) => (
              <motion.button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  selectedYear === year
                    ? "bg-[#1b66f3] text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {year}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-2">
            <motion.button
              onClick={() => setSelectedRole("all")}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                selectedRole === "all"
                  ? "bg-yellow-400 text-gray-900 shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              All Roles
            </motion.button>
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search role..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100"
              />

              {roleSearch && (
                <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg max-h-40 overflow-y-auto z-50">
                  {filteredRoles.map((role) => (
                    <div
                      key={role}
                      onClick={() => {
                        setSelectedRole(role);
                        setRoleSearch("");
                      }}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-gray-100"
                    >
                      {role}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Showing{" "}
        <span className="font-bold text-[#1b66f3]">
          {filteredMembers.length}
        </span>{" "}
        member{filteredMembers.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
              whileHover={{
                scale: 1.02,
                zIndex: 10,
              }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("a,button")) return;
                setDialogState({ member, index });
              }}
              className="cursor-pointer"
            >
              {/* ID Card - Compact version */}
              <MemberCard member={member} index={index} membersById={membersById} vouchCounts={vouchCounts} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <MemberDetailDialog
        member={dialogState?.member ?? null}
        index={dialogState?.index ?? 0}
        membersById={membersById}
        vouchCounts={vouchCounts}
        open={dialogState !== null}
        onOpenChange={(open) => !open && setDialogState(null)}
      />

      {filteredMembers.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 dark:text-gray-400">No members found 🤷</p>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "motion/react";
import { MemberCard } from "./MemberCard";
import {
  Github,
  Linkedin,
  Instagram,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Member } from "../../types/data";

interface CardStackProps {
  members: Member[];
}

// Twitter/X icon component
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function CardStack({ members }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const currentMember = members[currentIndex];

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % members.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + members.length) % members.length);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      handlePrev();
    } else if (info.offset.x < -100) {
      handleNext();
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 400 : -400,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -400 : 400,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <div className="relative h-full flex flex-col items-center justify-center px-4 py-8">
      {/* Counter */}
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-600">
          <span className="font-bold text-[#1b66f3]">{currentIndex + 1}</span> /{" "}
          <span className="font-bold">{members.length}</span>
        </p>
      </div>

      {/* Card Stack Container */}
      <div className="relative w-full max-w-4xl mb-8">
        {/* Main animated card */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing"
          >
            {/* ID Card */}
            <MemberCard member={members[currentIndex]} index={currentIndex} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6">
        <motion.button
          onClick={handlePrev}
          className="p-4 rounded-xl bg-white shadow-lg hover:shadow-xl border-2 border-[#1b66f3]/30 hover:border-[#1b66f3]"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="w-6 h-6 text-[#1b66f3]" />
        </motion.button>

        <p className="text-sm text-gray-500 italic">
          Swipe or click to navigate
        </p>

        <motion.button
          onClick={handleNext}
          className="p-4 rounded-xl bg-white shadow-lg hover:shadow-xl border-2 border-[#1b66f3]/30 hover:border-[#1b66f3]"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="w-6 h-6 text-[#1b66f3]" />
        </motion.button>
      </div>
    </div>
  );
}

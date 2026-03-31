import { useState, useRef, useEffect } from "react";
import { Github, Linkedin, Instagram } from "lucide-react";
import { Member } from "../../types/data";

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const BARCODE_HEIGHTS = [
  16, 10, 22, 14, 18, 12, 20, 10, 16, 22, 14, 18, 20, 10, 16, 14, 22, 12, 18,
  10, 20, 16, 14, 22, 10, 18, 12, 20, 16, 14, 10, 22, 18, 14, 20, 12, 16, 10,
  22, 14,
];

interface MemberCardProps {
  member: Member;
  index: number;
  membersById?: Map<string, Member>;
  vouchCounts?: Map<string, number>;
}

export function MemberCard({ member, index, membersById, vouchCounts }: MemberCardProps) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const bioRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = bioRef.current;
    if (el) {
      setIsClamped(el.scrollHeight > el.clientHeight);
    }
  }, [member.bio]);

  const idNum = `#${String(index + 1).padStart(3, "0")}`;
  const yearShort = `'${String(member.passoutYear).slice(-2)}`;
  const interests = member.interests.split(",").slice(0, 3);

  return (
    <div className="flex flex-col items-center font-mono">
      {/* Lanyard hole */}
      <div className="w-[18px] h-[18px] rounded-full bg-gray-100 border-[2.5px] border-[#1b66f3] -mb-[9px] z-10" />

      {/* Card */}
      <div className="w-[360px] bg-white rounded-xl border-2 border-[#1b66f3] overflow-hidden shadow-lg shadow-blue-100">
        {/* Header */}
        <div className="bg-[#1b66f3] px-[18px] pt-[18px] pb-[14px] relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-[90px] font-bold text-white/[0.06] leading-none select-none pointer-events-none tracking-tighter">
            ID CARD
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-bold text-white/60 tracking-[3px] uppercase">
              OFF-TOPIC · GECP
            </span>
            <span className="ml-auto text-[11px] font-bold text-yellow-400 tracking-wide">
              {idNum}
            </span>
          </div>
          <h2 className="text-[22px] font-bold text-white leading-tight mt-1 mb-2">
            {member.name}
          </h2>
          <span className="inline-block bg-yellow-400 text-gray-900 text-[9px] font-bold tracking-[2px] uppercase px-2 py-[3px] rounded-[3px]">
            {member.role}
          </span>
        </div>

        {/* Body */}
        <div className="flex relative">
          {/* Photo column */}
          <div className="w-[110px] flex-shrink-0 relative min-h-[160px]">
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover mix-blend-luminosity opacity-85 block"
            />
            <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-[10px] font-bold px-[6px] py-[2px] rounded-[3px] -rotate-2">
              {yearShort}
            </div>
          </div>

          {/* Info column */}
          <div className="flex-1 px-[14px] py-[14px] relative">
            {/* Ghost background number */}
            <div className="absolute -top-2 -right-4 text-[80px] font-bold text-[#1b66f3]/[0.04] leading-none select-none pointer-events-none -rotate-[15deg]">
              {String(index + 1).padStart(2, "0")}
            </div>

            <div className="flex flex-col mb-[10px]">
              <span className="text-[9px] font-bold text-[#1b66f3] tracking-[2px] uppercase mb-[1px]">
                [major]
              </span>
              <span className="text-[11px] text-gray-900 leading-snug">
                {member.major}
              </span>
            </div>

            <div className="flex flex-col mb-[10px]">
              <span className="text-[9px] font-bold text-[#1b66f3] tracking-[2px] uppercase mb-[1px]">
                [about]
              </span>
              <span
                ref={bioRef}
                className={`text-[10px] text-gray-900 leading-relaxed ${bioExpanded ? "" : "line-clamp-3"}`}
              >
                {member.bio}
              </span>
              {(isClamped || bioExpanded) && (
                <button
                  onClick={() => setBioExpanded(!bioExpanded)}
                  className="text-[9px] font-bold text-[#1b66f3] mt-[2px] text-left hover:underline cursor-pointer"
                >
                  {bioExpanded ? "show less" : "show more"}
                </button>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-[#1b66f3] tracking-[2px] uppercase mb-[4px]">
                [interests]
              </span>
              <div className="flex flex-wrap gap-1">
                {interests.map((interest, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-bold bg-yellow-400 text-gray-900 px-[6px] py-[2px] rounded-[3px]"
                  >
                    {interest.trim()}
                  </span>
                ))}
              </div>
            </div>

            {member.vouchedBy && (
              <div className="flex flex-col mt-[10px]">
                <span className="text-[9px] font-bold text-[#1b66f3] tracking-[2px] uppercase mb-[1px]">
                  [vouched by]
                </span>
                <span className="text-[10px] text-gray-900 leading-snug">
                  {member.vouchedBy === "og-member"
                    ? "OG Member"
                    : membersById?.get(member.vouchedBy)?.name ?? member.vouchedBy}
                </span>
              </div>
            )}

            {(vouchCounts?.get(member.id) ?? 0) > 0 && (
              <div className="flex flex-col mt-[10px]">
                <span className="text-[9px] font-bold text-[#1b66f3] tracking-[2px] uppercase mb-[1px]">
                  [vouched for]
                </span>
                <span className="text-[10px] text-gray-900 leading-snug">
                  {vouchCounts!.get(member.id)} member{vouchCounts!.get(member.id)! > 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Right accent bar */}
          </div>
        </div>

        {/* Social links */}
        <div className="border-t border-dashed border-[#1b66f3] px-[14px] pt-[10px] pb-[10px]">
          <div className="flex flex-wrap gap-[6px]">
            {member.github && (
              <a
                href={`https://github.com/${member.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[9px] font-bold text-[#1b66f3] border border-[#1b66f3] px-[7px] py-[3px] rounded tracking-wide hover:bg-blue-50 transition-colors"
              >
                <Github className="w-[10px] h-[10px]" />
                GitHub
              </a>
            )}
            {member.linkedin && (
              <a
                href={`https://linkedin.com/in/${member.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[9px] font-bold text-[#1b66f3] border border-[#1b66f3] px-[7px] py-[3px] rounded tracking-wide hover:bg-blue-50 transition-colors"
              >
                <Linkedin className="w-[10px] h-[10px]" />
                LinkedIn
              </a>
            )}
            {member.twitter && (
              <a
                href={`https://twitter.com/${member.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[9px] font-bold text-[#1b66f3] border border-[#1b66f3] px-[7px] py-[3px] rounded tracking-wide hover:bg-blue-50 transition-colors"
              >
                <XIcon />
                Twitter
              </a>
            )}
            {member.instagram && (
              <a
                href={`https://instagram.com/${member.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[9px] font-bold text-[#1b66f3] border border-[#1b66f3] px-[7px] py-[3px] rounded tracking-wide hover:bg-blue-50 transition-colors"
              >
                <Instagram className="w-[10px] h-[10px]" />
                Instagram
              </a>
            )}
          </div>
        </div>

        {/* Barcode footer */}
        <div className="bg-[#1b66f3] px-[14px] py-[10px] flex items-center justify-between">
          <div className="flex items-end gap-[2px] h-[22px]">
            {BARCODE_HEIGHTS.map((h, i) => (
              <span
                key={i}
                className="bg-white block w-[2px]"
                style={{ height: h }}
              />
            ))}
          </div>
          <div className="text-[8px] text-white/70 font-bold tracking-wide text-right">
            <div>[issued] 03/2026</div>
            <div>[updated] 03/2026</div>
          </div>
        </div>
      </div>
    </div>
  );
}

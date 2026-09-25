import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  HeartPulse,
  Laptop2,
  Megaphone,
  Palette,
  Scale,
  Search,
  Settings2,
  Stethoscope,
  Atom,
  ArrowRight,
} from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";

const streamIconMap = {
  management: BriefcaseBusiness,
  engineering: Settings2,
  technology: Laptop2,
  health: HeartPulse,
  medical: Stethoscope,
  media: Megaphone,
  communication: Megaphone,
  science: Atom,
  law: Scale,
  education: GraduationCap,
  commerce: Building2,
  design: Palette,
};

const streamDefaults = [
  { title: "Management", subtitle: "Business, finance, leadership", count: "2800 colleges", icon: "management" },
  { title: "Engineering", subtitle: "Mechanical, civil, AI, robotics", count: "2537 colleges", icon: "engineering" },
  { title: "IT and Software", subtitle: "Data, cyber, cloud, coding", count: "1991 colleges", icon: "technology" },
  { title: "Science", subtitle: "Pure science and research pathways", count: "1682 colleges", icon: "science" },
  { title: "Medical", subtitle: "MBBS, dentistry, nursing", count: "1677 colleges", icon: "medical" },
  { title: "Commerce", subtitle: "Accounts, trade, economics", count: "1304 colleges", icon: "commerce" },
  { title: "Social Sciences", subtitle: "Psychology, policy, sociology", count: "1286 colleges", icon: "education" },
  { title: "Education", subtitle: "Teaching and pedagogy tracks", count: "825 colleges", icon: "education" },
  { title: "Hotel Management", subtitle: "Hospitality and tourism", count: "732 colleges", icon: "management" },
  { title: "Mass Communication", subtitle: "Journalism, PR, digital media", count: "730 colleges", icon: "communication" },
  { title: "Design", subtitle: "Interior, fashion, creative practice", count: "691 colleges", icon: "media" },
  { title: "Law", subtitle: "LLB, legal studies, policy", count: "657 colleges", icon: "law" },
];

const courseDefaults = [
  { title: "BBA", subtitle: "Business administration", count: "420+ programs", icon: "management" },
  { title: "B.Tech", subtitle: "Engineering and technology", count: "380+ programs", icon: "engineering" },
  { title: "MBBS", subtitle: "Medicine and surgery", count: "95+ programs", icon: "medical" },
  { title: "MCA", subtitle: "Advanced computing pathways", count: "140+ programs", icon: "technology" },
  { title: "B.Com", subtitle: "Accounting and commerce", count: "260+ programs", icon: "commerce" },
  { title: "LLB", subtitle: "Legal studies and advocacy", count: "80+ programs", icon: "law" },
  { title: "B.Arch", subtitle: "Architecture and planning", count: "60+ programs", icon: "design" },
  { title: "B.Pharm", subtitle: "Pharmacy and allied health", count: "120+ programs", icon: "health" },
];

function resolveIcon(keyOrTitle = "") {
  const lookup = keyOrTitle.toLowerCase();
  const matchedKey = Object.keys(streamIconMap).find((key) => lookup.includes(key));
  const Icon = matchedKey ? streamIconMap[matchedKey] : GraduationCap;
  return Icon;
}

function toStreamCards(items = []) {
  return items.map((item, index) => ({
    title: item.title,
    subtitle: item.copy,
    count: `${1200 - index * 137}+ colleges`,
    icon: item.title,
  }));
}

function toCourseCards(items = []) {
  return items.map((item, index) => ({
    title: item.title.split(" ").slice(0, 2).join(" "),
    subtitle: item.meta,
    count: `${180 - index * 22}+ programs`,
    icon: item.title,
  }));
}

export function ProgramsSection({ programs: publishedPrograms }) {
  const programs = usePreviewData("programs", publishedPrograms);
  const [activeView, setActiveView] = useState("streams");
  const [localQuery, setLocalQuery] = useState("");

  const streamCards = useMemo(() => {
    return streamDefaults;
  }, []);

  const courseCards = useMemo(() => {
    return courseDefaults;
  }, []);

  const activeCards = activeView === "streams" ? streamCards : courseCards;
  const effectiveQuery = (localQuery || "").trim().toLowerCase();
  const filteredCards = activeCards.filter((item) => {
    if (!effectiveQuery) return true;
    return (
      item.title.toLowerCase().includes(effectiveQuery) ||
      item.subtitle.toLowerCase().includes(effectiveQuery) ||
      item.count.toLowerCase().includes(effectiveQuery)
    );
  });

  return (
    <section
      id="programs"
      className="section-defer bg-[#eef3f7] py-18 sm:py-24"
    >
      <div className="section-shell">
        <div className="mx-auto max-w-[1640px] rounded-[2.25rem] border border-[#d9e3ec] bg-[linear-gradient(180deg,#f9fbfd_0%,#edf3f8_100%)] px-6 py-10 shadow-[0_18px_44px_rgba(16,35,63,0.06)] sm:px-10 sm:py-12 lg:px-12">
          <div className="mx-auto max-w-[920px] text-center">
            <p className="eyebrow" style={programs.eyebrowColor ? { color: programs.eyebrowColor } : {}}>
              {programs.eyebrow || "Top Study Programs"}
            </p>
            <h2 className="mt-3 font-heading text-[2.35rem] font-bold tracking-tight text-night sm:text-[3.1rem]">
              {programs.title || "Find Your Perfect Stream & Course"}
            </h2>
            <p className="mt-4 text-base leading-8 text-tide sm:text-[1.1rem]">
              {programs.copy || "Search from hundreds of streams and courses across top scholarship-friendly colleges and universities."}
            </p>
          </div>

          <div className="mx-auto mt-9 max-w-6xl">
            <label className="flex items-center gap-4 rounded-[1.2rem] border border-[#cfdaE6] bg-white px-6 py-4 shadow-[0_10px_24px_rgba(16,35,63,0.06)]">
              <Search className="h-5 w-5 text-[#6f84a3]" />
              <input
                type="text"
                value={localQuery}
                onChange={(event) => setLocalQuery(event.target.value)}
                placeholder="Search courses, streams, or programs..."
                className="w-full border-0 bg-transparent text-[1.05rem] font-semibold text-night outline-none placeholder:text-[#94a3b8]"
              />
            </label>

            <div className="mt-7 flex justify-center">
              <div className="inline-grid min-w-[360px] grid-cols-2 rounded-[1.25rem] border border-[#cfdaE6] bg-[#e8f0f7] p-1.5 shadow-[0_10px_22px_rgba(16,35,63,0.08)]">
                {[
                  { id: "streams", label: "Streams" },
                  { id: "courses", label: "Courses" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setActiveView(option.id)}
                    className={`min-w-[170px] rounded-[1rem] px-6 py-3 text-base font-bold transition ${activeView === option.id
                      ? "text-night shadow-[0_10px_22px_rgba(212,160,23,0.28)]" 
                      : "bg-transparent text-[#4d617f] hover:bg-[#f8fbfe]"
                      }`}
                    style={activeView === option.id ? {backgroundColor: '#FACC15'} : {}}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredCards.length === 0 ? (
            <div className="mx-auto mt-8 max-w-5xl rounded-[1.4rem] border border-[#dce5ee] bg-white px-6 py-10 text-center text-sm font-medium text-tide shadow-[0_10px_24px_rgba(16,35,63,0.06)]">
              No results found for this search.
            </div>
          ) : (
            <div className="mx-auto mt-8 max-w-[1520px] grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {filteredCards.map((item) => {
                const Icon = resolveIcon(item.icon || item.title);

                return (
                  <Link
                    key={`${activeView}-${item.title}`}
                    to={`/program/${encodeURIComponent(item.title)}`}
                    className="group flex min-h-[132px] items-center gap-4 rounded-[1.6rem] border border-[#dbe5ef] bg-white px-5 py-5 shadow-[0_6px_18px_rgba(16,35,63,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#bdd0e3] hover:shadow-[0_14px_28px_rgba(16,35,63,0.10)]"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.15rem] border border-[#dde6f0] bg-[#f7fbff] text-[#173f73]">
                      <Icon size={22} strokeWidth={1.9} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[1.06rem] font-bold leading-tight text-night">
                        {item.title}
                      </h3>
                      <p className="mt-1 truncate text-[14px] text-[#6f84a3]">{item.count}</p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3f7fb] text-[#8aa0bc] transition group-hover:translate-x-0.5 group-hover:bg-[#173f73] group-hover:text-white">
                      <ArrowRight size={18} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          <div className="mt-7 text-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#17305d] transition hover:text-[#f97362]"
            >
              View More
              <span className="text-base leading-none">⌄</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

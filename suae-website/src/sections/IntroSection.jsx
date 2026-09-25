import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePreviewData } from "../context/PreviewContext";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function UniversityLogo({ university }) {
  const fallback = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=120&q=80";
  const [imgSrc, setImgSrc] = useState(university.logo || university.image || fallback);

  useEffect(() => {
    setImgSrc(university.logo || university.image || fallback);
  }, [university.logo, university.image]);

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#edf2f8] ring-1 ring-[#174a8b]/10 overflow-hidden">
      <img
        src={imgSrc}
        alt={`${university.name} logo`}
        loading="lazy"
        onError={() => {
          if (imgSrc !== fallback) {
            setImgSrc(fallback);
          }
        }}
        className="h-full w-full rounded-full object-cover"
      />
    </div>
  );
}

export function IntroSection({ intro: publishedIntro, universities: publishedUniversities }) {
  const intro = usePreviewData("intro", publishedIntro);
  const universitiesData = usePreviewData("universities", publishedUniversities || {});

  // Use dynamic universities cards from settings database if present, otherwise fallback to static leaders
  const universities = Array.isArray(universitiesData?.cards) && universitiesData.cards.length > 0
    ? universitiesData.cards
    : (intro.universities || []);

  const marqueeItems = [...universities, ...universities];

  return (
    <section id="intro" className="section-defer bg-pearl py-18 sm:py-20">
      <div className="section-shell">
        <div className="mx-auto max-w-5xl text-center">
          <p
            className="eyebrow text-black"
            style={intro.eyebrowColor ? { color: intro.eyebrowColor } : { color: '#000000' }}
          >
            {intro.eyebrow}
          </p>
          <h2
            className="mt-4 section-title text-black uppercase font-heading font-extrabold tracking-tight"
            style={intro.titleColor && intro.titleColor !== '#816565' ? { color: intro.titleColor } : { color: '#000000' }}
          >
            {intro.title}
          </h2>
        </div>

        <div className="mt-10 overflow-hidden">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#fdfcf8] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#fdfcf8] to-transparent" />

            <div className="intro-marquee flex w-max gap-4 px-6 py-6">
              {marqueeItems.map((university, index) => (
                <Link
                  key={`${university.name}-${index}`}
                  to={`/university/${encodeURIComponent(university.name)}`}
                  className="flex min-w-[320px] items-center gap-4 border border-[#d8e4ec] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(16,35,63,0.05)] hover:border-[#174a8b]/35 hover:shadow-[0_12px_28px_rgba(23,74,139,0.10)] transition-all duration-300 cursor-pointer"
                >
                  <UniversityLogo university={university} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lagoon/80">
                      UAE Rank {university.rank || (index % universities.length) + 1}
                    </p>
                    <h3 className="mt-1 truncate text-base font-semibold text-night">
                      {university.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";

const fallbackCities = [
  {
    name: "Dubai",
    universitiesCount: 63,
    programsCount: "855+",
    tagline: "Dubai is one of the most popular cities to study in UAE for Indian students.",
    sliqScore: "4.5",
    costOfEducation: "High",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Abu Dhabi",
    universitiesCount: 24,
    programsCount: "310+",
    tagline: "The capital city offers prestigious research universities and a secure, career-focused environment.",
    sliqScore: "4.3",
    costOfEducation: "High",
    image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "RAK",
    universitiesCount: 12,
    programsCount: "130+",
    tagline: "RAK hosts international branch campuses with flexible visa options and lower tuition costs.",
    sliqScore: "4.0",
    costOfEducation: "Low",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Sharjah",
    universitiesCount: 18,
    programsCount: "240+",
    tagline: "Known as the cultural capital, Sharjah offers historic academic cities and affordable living.",
    sliqScore: "4.2",
    costOfEducation: "Medium",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Ajman",
    universitiesCount: 8,
    programsCount: "95+",
    tagline: "Ajman provides student-focused campuses with affordable tuition fees and a relaxed coastal lifestyle.",
    sliqScore: "3.9",
    costOfEducation: "Low",
    image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Fujairah",
    universitiesCount: 5,
    programsCount: "45+",
    tagline: "Fujairah offers specialized medical and engineering programs surrounded by beautiful mountains.",
    sliqScore: "3.7",
    costOfEducation: "Low",
    image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "UAQ",
    universitiesCount: 3,
    programsCount: "25+",
    tagline: "UAQ offers specialized vocational schools and a peaceful, coastal learning environment.",
    sliqScore: "3.5",
    costOfEducation: "Low",
    image: "https://images.unsplash.com/photo-1504297050568-910d24c426d3?auto=format&fit=crop&w=800&q=80"
  }
];

export function CitiesSection({ cities: publishedCities, universities: publishedUniversities }) {
  const citiesData = usePreviewData("cities", publishedCities || []);
  const universitiesData = usePreviewData("universities", publishedUniversities);
  const trackRef = useRef(null);

  const getCityNameKey = (name) => {
    if (!name) return "";
    const n = name.toLowerCase();
    if (n === "ras al khaimah" || n === "rak") return "rak";
    if (n === "umm al-quwain" || n === "uaq") return "uaq";
    return n;
  };

  // Merge dynamic database data with static fallbacks
  const mergedCities = fallbackCities.map((fbCity) => {
    const key = getCityNameKey(fbCity.name);
    // Find matching city in CMS data
    const dbCity = citiesData.find(c => getCityNameKey(c.name) === key);

    // Calculate university count dynamically from universitiesData
    const dynamicUniCount = universitiesData?.cards?.filter(
      (uni) => uni.city.toLowerCase() === (dbCity?.name || fbCity.name).toLowerCase() ||
        (getCityNameKey(uni.city) === key)
    ).length || fbCity.universitiesCount;

    return {
      name: dbCity?.name || fbCity.name,
      displayName: fbCity.name,
      universitiesCount: dynamicUniCount,
      programsCount: dbCity?.programsCount || fbCity.programsCount,
      tagline: dbCity?.tagline || fbCity.tagline,
      sliqScore: dbCity?.sliqScore || fbCity.sliqScore,
      costOfEducation: dbCity?.costOfEducation || fbCity.costOfEducation,
      image: dbCity?.image || fbCity.image
    };
  });

  const scrollTrack = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("article");
    const step = card ? card.offsetWidth + 24 : 340;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section id="cities" className="section-defer bg-pearl py-20 sm:py-24 overflow-hidden">
      <div className="section-shell">

        {/* Header */}
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <p className="eyebrow text-black uppercase tracking-[0.16em]">Destinations</p>
          <h2 className="mt-4 section-title text-black uppercase font-heading font-extrabold tracking-tight">
            EXPLORE TOP STUDY PLACES IN THE UAE
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-black leading-relaxed font-body">
            If you plan to study in UAE, start by choosing your city - from Dubai and Abu Dhabi to Sharjah, Ajman, Fujairah, RAK and UAQ.
          </p>
        </div>

        {/* Horizontal Card Slider with Premium Animations */}
        <div className="relative mt-12">

          {/* Scroll Buttons */}
          <button
            type="button"
            onClick={() => scrollTrack(-1)}
            className="absolute -left-12 top-1/2 z-10 hidden h-40 w-11 -translate-y-1/2 items-center justify-center bg-transparent text-[#174a8b]/40 transition hover:text-[#174a8b] md:flex outline-none"
            aria-label="Scroll left"
          >
            <ChevronLeft size={50} />
          </button>

          <button
            type="button"
            onClick={() => scrollTrack(1)}
            className="absolute -right-12 top-1/2 z-10 hidden h-40 w-11 -translate-y-1/2 items-center justify-center bg-transparent text-[#174a8b]/40 transition hover:text-[#174a8b] md:flex outline-none"
            aria-label="Scroll right"
          >
            <ChevronRight size={50} />
          </button>

          <div
            ref={trackRef}
            className="flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory pb-8 pt-4 px-1"
          >
            {mergedCities.map((city) => (
              <article
                key={city.name}
                className="group relative w-[300px] sm:w-[340px] h-[460px] rounded-3xl overflow-hidden shrink-0 snap-start shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl bg-night"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={city.image}
                    alt={city.displayName}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* Smooth always-on overlay for title readability that clears before the bottom cards */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.62) 18%, rgba(0,0,0,0.42) 38%, rgba(0,0,0,0.16) 58%, rgba(0,0,0,0) 72%)",
                    }}
                  />
                  <div
                    className="absolute inset-x-0 top-0 h-[48%]"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 0%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0) 100%)",
                    }}
                  />
                </div>

                {/* Shimmer Shine Effect Sweep */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 z-20 pointer-events-none" />

                {/* Card content */}
                <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-between text-white">
                  <div className="w-full rounded-2xl bg-black/50 p-5 backdrop-blur-[2px]">
                    <h3 className="font-heading text-2xl font-extrabold tracking-tight">STUDY IN {city.displayName.toUpperCase()}</h3>

                    <div className="flex gap-4 mt-3 text-sm font-bold text-white">
                      <span>{city.universitiesCount} Universities</span>
                      <span>&bull;</span>
                      <span>{city.programsCount} Programs</span>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-white font-body line-clamp-3">
                      {city.tagline}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-lg bg-black/80 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white border border-white/20 backdrop-blur-sm shadow-md">
                        SLIQ {city.sliqScore}
                      </span>
                      <span className="rounded-lg bg-black/80 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white border border-white/20 backdrop-blur-sm shadow-md">
                        Cost: {city.costOfEducation}
                      </span>
                    </div>

                    <Link
                      to={`/city/${encodeURIComponent(city.name)}`}
                      className="inline-flex w-full items-center justify-center rounded-xl border px-5 py-3.5 text-sm font-extrabold uppercase tracking-wider text-night transition-all duration-300 shadow-md"
                      style={{backgroundColor: '#FACC15', borderColor: '#FACC15', boxShadow: '0 4px 16px rgba(250,204,21,0.40)'}}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor='#EAB308'; e.currentTarget.style.borderColor='#EAB308'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor='#FACC15'; e.currentTarget.style.borderColor='#FACC15'; }}
                    >
                      Explore {city.displayName} &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

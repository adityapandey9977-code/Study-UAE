import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { OptimizedImage } from "../components/common/OptimizedImage";
import { usePreviewData } from "../context/PreviewContext";
import { fetchFromNode } from "../utils/nodeApi";

export function UniversitiesSection({ universities: publishedUniversities, searchQuery = "", selectedCity = "All Cities", onClearFilters }) {
  const universities = usePreviewData("universities", publishedUniversities);
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [dbCards, setDbCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    fetchFromNode("/public/institutes")
      .then((res) => res.json())
      .then((resData) => {
        if (isMounted && resData && resData.success && Array.isArray(resData.data)) {
          setDbCards(resData.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load database featured universities:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);
  
  const scrollByCard = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(":scope > article");
    const step = card ? card.offsetWidth + 24 : 320;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const cards = dbCards.filter((uni) => uni.isFeatured === true || uni.featured === true);
  const filteredCards = cards.filter((uni) => {
    // 1. City Filter
    const matchesCity = selectedCity === "All Cities" || uni.city.toLowerCase() === selectedCity.toLowerCase();

    // 2. Search Query Filter (matches name, city, programs, or note)
    const matchesSearch = !searchQuery ||
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (uni.programs && uni.programs.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (uni.note && uni.note.toLowerCase().includes(searchQuery.toLowerCase()));

    // 3. Course Filter (from the horizontal tab bar)
    // Map "Business Administration" to match "Business" or "Administration"
    const isAll = selectedCourse === "All Courses";
    const cleanFilter = selectedCourse.toLowerCase().replace(" administration", "").replace(" engineering", "");
    const matchesCourse = isAll ||
      (uni.programs && uni.programs.toLowerCase().includes(cleanFilter)) ||
      uni.name.toLowerCase().includes(cleanFilter);

    return matchesCity && matchesSearch && matchesCourse;
  });

  const handleClearAll = () => {
    setSelectedCourse("All Courses");
    if (onClearFilters) onClearFilters();
  };

  return (
    <section id="universities" className="section-defer bg-white py-20 sm:py-24">
      <div className="section-shell">
        <div className="grid gap-8">
          <div className="mx-auto max-w-5xl text-center">
            <p
              className="eyebrow text-black"
              style={universities.eyebrowColor ? { color: universities.eyebrowColor } : { color: '#000000' }}
            >
              {universities.eyebrow}
            </p>
            <h2
              className="mt-4 section-title text-black uppercase font-heading font-extrabold tracking-tight"
              style={universities.titleColor && universities.titleColor !== '#594545' ? { color: universities.titleColor } : { color: '#000000' }}
            >
              Featured Universities
              {/* {universities.title} */}
            </h2>
          </div>
        </div>

        {/* <div className="mt-10 flex gap-px overflow-x-auto bg-[#d8e4ec] pb-px">
          {universities.filters?.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedCourse(filter)}
              className={`shrink-0 px-5 py-4 text-sm font-bold transition outline-none ${selectedCourse === filter
                  ? "bg-lagoon text-white animate-fade-in"
                  : "bg-white text-tide hover:bg-lagoon hover:text-white"
                }`}
            >
              {filter}
            </button>
          ))}
        </div> */}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-lagoon border-t-transparent"></div>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-16 bg-[#f7f9fc] rounded-xl border border-[#d8e4ec] mt-8">
            <p className="text-tide/70 font-medium text-sm">No universities found matching your criteria.</p>
            <button
              onClick={handleClearAll}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#FACC15] px-5 py-2.5 text-xs font-bold text-night shadow-md transition hover:bg-[#EAB308] shadow-[0_4px_14px_rgba(250,204,21,0.20)]"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="relative mt-8">
            <button
              type="button"
              aria-label="Previous universities"
              onClick={() => scrollByCard(-1)}
              className="absolute -left-12 top-1/2 z-10 hidden h-60 w-11 -translate-y-1/2 items-center justify-center bg-transparent text-tide transition hover:text-night md:flex outline-none"
            >
              <ChevronLeft size={60} />
            </button>

            <button
              type="button"
              aria-label="Next universities"
              onClick={() => scrollByCard(1)}
              className="absolute -right-12 top-1/2 z-10 hidden h-60 w-11 -translate-y-1/2 items-center justify-center bg-transparent text-tide transition hover:text-night md:flex outline-none"
            >
              <ChevronRight size={60} />
            </button>

            <div
              ref={trackRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
            >
              {filteredCards.map((item) => (
                <article
                  key={item.name}
                  className="group w-[280px] shrink-0 snap-start border border-night/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:w-[320px]"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-night/10">
                    <OptimizedImage
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full"
                      imgClassName="transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-lagoon">
                      <MapPin size={14} />
                      {item.city}
                    </p>
                    <h3 className="mt-4 min-h-16 font-heading text-2xl font-semibold leading-tight text-night">{item.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-tide/74">{item.note}</p>
                    <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-night/10 py-4 text-sm">
                      <div>
                        <dt className="text-tide/55">{universities.labels?.courses}</dt>
                        <dd className="mt-1 font-bold text-night">{item.courses}</dd>
                      </div>
                      <div>
                        <dt className="text-tide/55">{universities.labels?.type}</dt>
                        <dd className="mt-1 font-bold text-night">{item.type}</dd>
                      </div>
                      <div>
                        <dt className="text-tide/55">{universities.labels?.intake}</dt>
                        <dd className="mt-1 font-bold text-night">{item.intake}</dd>
                      </div>
                      <div>
                        <dt className="text-tide/55">{universities.labels?.scholarship}</dt>
                        <dd className="mt-1 font-bold text-night">{item.scholarship}</dd>
                      </div>
                    </dl>
                    <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.12em] text-lagoon">{universities.labels?.programs}</p>
                    <p className="mt-2 text-sm leading-6 text-night">{item.programs}</p>
                    <Link to={`/university/${encodeURIComponent(item.name)}`} className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#174a8b]">
                      {universities.labels?.cta}
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

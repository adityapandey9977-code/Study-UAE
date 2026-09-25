import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";
import { OptimizedImage } from "../components/common/OptimizedImage";
import { fetchFromNode } from "../utils/nodeApi";

export function AllUniversitiesPage({ content, compared = [], onToggleCompare }) {
  const universitiesData = usePreviewData("universities", content?.universities);
  const [dbCards, setDbCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchFromNode("/public/institutes")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((resData) => {
        if (isMounted && resData && resData.success && resData.data && resData.data.length > 0) {
          setDbCards(resData.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load database institutes:", err);
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

  const cards = dbCards;

  const [searchParams, setSearchParams] = useSearchParams();
  const initialProgram = searchParams.get("program") || searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(initialProgram);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedType, setSelectedType] = useState("All Types");
  const [currentPage, setCurrentPage] = useState(1);
  const CARDS_PER_PAGE = 6;

  // Sync state with URL parameter updates (e.g. from footer click)
  useEffect(() => {
    const program = searchParams.get("program") || searchParams.get("search") || "";
    setSearchQuery(program);
  }, [searchParams]);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, selectedType]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pearl py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-lagoon border-t-transparent"></div>
      </div>
    );
  }

  const filteredCards = cards.filter((uni) => {
    const matchesCity = selectedCity === "All Cities" || uni.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesType = selectedType === "All Types" || uni.type.toLowerCase() === selectedType.toLowerCase();
    const matchesSearch = !searchQuery ||
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (uni.programs && uni.programs.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (uni.note && uni.note.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCity && matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filteredCards.length / CARDS_PER_PAGE);
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const paginatedCards = filteredCards.slice(startIndex, startIndex + CARDS_PER_PAGE);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCity("All Cities");
    setSelectedType("All Types");
    setCurrentPage(1);
    setSearchParams({});
  };

  const citiesList = ["All Cities", ...new Set(cards.map((uni) => uni.city))];
  const typesList = ["All Types", "Public", "Private"];

  return (
    <div className="min-h-screen bg-pearl pt-28 pb-20">
      <div className="section-shell">

        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-tide/70 transition hover:text-night mb-8 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lagoon/10 px-3 py-1 text-xs font-semibold text-lagoon uppercase tracking-wider">
            Campuses
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold text-night sm:text-5xl">
            Explore All Universities
          </h1>
          <p className="mt-4 text-base leading-relaxed text-black">
            Compare campuses across Dubai, Abu Dhabi, Sharjah, and other emirates by courses offered, tuition types, intake periods, and scholarship opportunities.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-2xl border border-night/5 p-6 shadow-sm mb-12 flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tide/50" size={18} />
            <input
              type="text"
              placeholder="Search by university name, programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-night/10 bg-white pl-11 pr-4 py-3 text-sm text-black placeholder:text-black outline-none transition focus:border-lagoon"
            />
          </div>

          {/* City Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full rounded-xl border border-night/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-lagoon"
            >
              {citiesList.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-xl border border-night/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-lagoon"
            >
              {typesList.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Universities Grid */}
        {paginatedCards.length > 0 ? (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedCards.map((item) => (
                <article
                  key={item.name}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-night/5 bg-white shadow-sm transition hover:shadow-md hover:border-night/10"
                >
                  <div>
                    <div className="aspect-[16/10] overflow-hidden bg-night/5 relative">
                      <OptimizedImage
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        imgClassName="transition duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-4 left-4 rounded-md bg-lagoon px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                        {item.city}
                      </span>
                      {onToggleCompare && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleCompare(item);
                          }}
                          className={`absolute top-4 right-4 z-10 rounded-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-sm transition border ${compared.some((u) => u.name === item.name)
                            ? "bg-[#FACC15] text-night border-[#FACC15] hover:bg-[#EAB308]"
                            : "bg-white/90 text-night border-night/5 hover:bg-white backdrop-blur-sm"
                            }`}
                        >
                          {compared.some((u) => u.name === item.name) ? "✓ Comparing" : "+ Compare"}
                        </button>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-heading text-xl font-bold text-night leading-snug group-hover:text-lagoon transition-colors min-h-[56px]">
                        {item.name}
                      </h3>
                      <p className="mt-3 text-xs leading-relaxed text-tide/75 line-clamp-3">
                        {item.note}
                      </p>
                      {item.isDbInstitute && item.website && (
                        <div className="mt-2">
                          <a
                            href={item.website.startsWith('http') ? item.website : `http://${item.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-lagoon hover:underline inline-flex items-center gap-1 normal-case tracking-normal"
                          >
                            Visit Website →
                          </a>
                        </div>
                      )}
                      {item.isDbInstitute ? (
                        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-night/5 pt-4 text-xs">
                          <div>
                            <dt className="text-tide/50 uppercase font-bold tracking-wider text-[9px]">NAAC Rating</dt>
                            <dd className="mt-1 font-bold text-night text-sm">{item.naac || "N/A"}</dd>
                          </div>
                          <div>
                            <dt className="text-tide/50 uppercase font-bold tracking-wider text-[9px]">NIRF Rank</dt>
                            <dd className="mt-1 font-bold text-night text-sm">{item.nirf && item.nirf !== "N/A" ? `#${item.nirf}` : "N/A"}</dd>
                          </div>
                          <div>
                            <dt className="text-tide/50 uppercase font-bold tracking-wider text-[9px]">Approval / Accr.</dt>
                            <dd className="mt-1 font-bold text-night text-xs truncate">
                              {item.aicte ? "AICTE Approved" : (item.nba ? "NBA Accredited" : "Approved")}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-tide/50 uppercase font-bold tracking-wider text-[9px]">Institute Type</dt>
                            <dd className="mt-1 font-bold text-night text-sm">{item.type}</dd>
                          </div>
                        </dl>
                      ) : (
                        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-night/5 pt-4 text-xs">
                          <div>
                            <dt className="text-tide/50 uppercase font-bold tracking-wider text-[9px]">{universitiesData?.labels?.courses || "Courses Offered"}</dt>
                            <dd className="mt-1 font-bold text-night text-sm">{item.courses}</dd>
                          </div>
                          <div>
                            <dt className="text-tide/50 uppercase font-bold tracking-wider text-[9px]">{universitiesData?.labels?.type || "Institute Type"}</dt>
                            <dd className="mt-1 font-bold text-night text-sm">{item.type}</dd>
                          </div>
                          <div>
                            <dt className="text-tide/50 uppercase font-bold tracking-wider text-[9px]">{universitiesData?.labels?.intake || "Intake"}</dt>
                            <dd className="mt-1 font-bold text-night text-sm">{item.intake}</dd>
                          </div>
                          <div>
                            <dt className="text-tide/50 uppercase font-bold tracking-wider text-[9px]">{universitiesData?.labels?.scholarship || "Scholarship"}</dt>
                            <dd className="mt-1 font-bold text-night text-sm">{item.scholarship}</dd>
                          </div>
                        </dl>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-4 border-t border-night/5 bg-pearl/10 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-tide/50 truncate max-w-[150px]">
                      {item.programs}
                    </span>
                    <Link
                      to={`/university/${encodeURIComponent(item.name)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-lagoon group-hover:text-night transition-colors"
                    >
                      Explore
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-night/10 bg-white text-tide transition hover:bg-night/5 hover:text-night disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-tide"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-10 w-10 rounded-lg text-sm font-bold transition ${isActive
                        ? "bg-[#FACC15] text-night shadow-md shadow-[#FACC15]/20"
                        : "border border-night/10 bg-white text-tide hover:bg-night/5 hover:text-night"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-night/10 bg-white text-tide transition hover:bg-night/5 hover:text-night disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-tide"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-night/5">
            <p className="text-sm text-tide/60 italic">No universities found matching your criteria.</p>
            <button
              onClick={handleReset}
              className="btn-yellow mt-4 px-5 py-2.5 text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Floating Compare Tray */}
      {compared.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl bg-night/95 backdrop-blur-md text-white rounded-2xl border border-white/10 p-4 shadow-xl flex items-center justify-between animate-fade-in gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-lagoon text-xs font-bold text-white">
              {compared.length}
            </span>
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-none">Compare Campuses</p>
              <p className="text-[10px] text-white/60 mt-1">Select up to 3 universities</p>
            </div>
          </div>

          {/* Selected Thumbnails */}
          <div className="flex gap-2 items-center flex-1 justify-center sm:justify-start overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {compared.map((uni) => (
              <div key={uni.name} className="relative group shrink-0 h-10 w-10 rounded-lg overflow-hidden border border-white/10 bg-white/5">
                <OptimizedImage src={uni.image} alt={uni.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onToggleCompare(uni)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => compared.forEach((uni) => onToggleCompare(uni))}
              className="text-[10px] font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors"
            >
              Reset
            </button>
            <Link
              to="/compare"
              className="btn-yellow rounded-lg px-4 py-2 text-xs"
            >
              Compare Now &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

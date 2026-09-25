import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";
import { fetchFromNode } from "../utils/nodeApi";

export function AllProgramsPage({ content }) {
  const programsData = usePreviewData("programs", content?.programs);
  
  const [dbCards, setDbCards] = useState([]);
  const [careersList, setCareersList] = useState([]);
  const [disciplinesList, setDisciplinesList] = useState([]);

  useEffect(() => {
    fetchFromNode("/public/institutes")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((resData) => {
        if (resData && resData.success && resData.data && resData.data.length > 0) {
          setDbCards(resData.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load database institutes on all programs page:", err);
      });

    fetchFromNode("/public/careers")
      .then(res => res.json())
      .then(payload => {
        if (payload && payload.success && Array.isArray(payload.data)) {
          setCareersList(payload.data);
        }
      })
      .catch(err => console.error("Error loading careers dropdown:", err));

    fetchFromNode("/public/disciplines")
      .then(res => res.json())
      .then(payload => {
        if (payload && payload.success && Array.isArray(payload.data)) {
          setDisciplinesList(payload.data);
        }
      })
      .catch(err => console.error("Error loading disciplines dropdown:", err));
  }, []);

  const cardsList = dbCards.length > 0 ? dbCards : (content?.universities?.cards || []);

  const allDbPrograms = useMemo(() => {
    const progMap = new Map();

    for (const uni of cardsList) {
      if (Array.isArray(uni.fullProgramsList)) {
        for (const prog of uni.fullProgramsList) {
          const title = prog.title || prog.spec_name;
          if (!title) continue;

          const key = title.trim().toLowerCase();
          if (!progMap.has(key)) {
            progMap.set(key, {
              title: title.trim(),
              meta: prog.career || "Undergraduate",
              copy: `Offered under the discipline of ${prog.discipline || "General"} as a ${prog.career || "Course"} program.`,
              career: prog.career || "",
              discipline: prog.discipline || ""
            });
          }
        }
      }
    }

    return Array.from(progMap.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [cardsList]);

  const items = allDbPrograms.length > 0 ? allDbPrograms : (programsData?.items || []);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCareer, setSelectedCareer] = useState("All");
  const [selectedDiscipline, setSelectedDiscipline] = useState(initialCategory);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Sync state with URL parameter updates (e.g. from header dropdown click)
  useEffect(() => {
    const cat = searchParams.get("category") || "All";
    const search = searchParams.get("search") || "";
    setSelectedDiscipline(cat);
    setSearchQuery(search);
  }, [searchParams]);

  // Reset to first page when search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCareer, selectedDiscipline]);

  const filteredItems = items.filter((item) => {
    // Apply Academic Career filter in sync
    if (selectedCareer !== "All") {
      const matchCareer = item.career && item.career.toLowerCase() === selectedCareer.toLowerCase();
      if (!matchCareer) return false;
    }

    // Apply Discipline filter in sync
    if (selectedDiscipline !== "All") {
      const matchDiscipline = item.discipline && item.discipline.toLowerCase() === selectedDiscipline.toLowerCase();
      if (!matchDiscipline) return false;
    }
      
    // Apply search filter
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.meta && item.meta.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.copy && item.copy.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pageNumbers.push("...");
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (end < totalPages - 1) {
        pageNumbers.push("...");
      }

      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCareer("All");
    setSelectedDiscipline("All");
    setSearchParams({});
    setCurrentPage(1);
  };

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
            Programs
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold text-night sm:text-5xl">
            Explore All Programs
          </h1>
          <p className="mt-4 text-base text-tide/75 leading-relaxed">
            Discover and compare academic disciplines, including business management, engineering and technology, health sciences, and media.
          </p>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-2xl border border-night/5 p-6 shadow-sm mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tide/50" size={16} />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-night/10 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-lagoon"
              />
            </div>

            {/* Academic Career Dropdown */}
            <div className="flex flex-col w-full sm:w-48">
              <select
                value={selectedCareer}
                onChange={(e) => setSelectedCareer(e.target.value)}
                className="w-full rounded-xl border border-night/10 bg-pearl px-4 py-2.5 text-xs font-semibold text-night outline-none focus:border-lagoon transition cursor-pointer"
              >
                <option value="All">All Academic Careers</option>
                {careersList.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Discipline Dropdown */}
            <div className="flex flex-col w-full sm:w-48">
              <select
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
                className="w-full rounded-xl border border-night/10 bg-pearl px-4 py-2.5 text-xs font-semibold text-night outline-none focus:border-lagoon transition cursor-pointer"
              >
                <option value="All">All Disciplines</option>
                {disciplinesList.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filters Button */}
          {(selectedCareer !== "All" || selectedDiscipline !== "All" || searchQuery) && (
            <button
              onClick={handleReset}
              className="text-xs font-bold text-lagoon hover:text-night transition underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Programs Grid */}
        {paginatedItems.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedItems.map((item) => (
                <article
                  key={item.title}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-night/5 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-night/10"
                >
                  <div>
                    <span className="inline-flex items-center gap-1 rounded bg-lagoon/10 px-2 py-0.5 text-[10px] font-bold text-lagoon border border-lagoon/10">
                      {item.meta}
                    </span>
                    <h3 className="mt-4 font-heading text-2xl font-semibold leading-tight text-night group-hover:text-lagoon transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-xs sm:text-sm leading-relaxed text-tide/75">
                      {item.copy}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-night/5">
                    <Link
                      to={`/program/${encodeURIComponent(item.title)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-lagoon group-hover:text-night transition-colors"
                    >
                      Explore Program
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-wrap justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-night/10 bg-white px-3 py-2 text-xs font-bold text-night transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {getPageNumbers().map((pageNum, idx) => {
                  if (pageNum === "...") {
                    return (
                      <span key={`dots-${idx}`} className="px-2 py-2 text-xs font-bold text-tide/50 select-none">
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                        currentPage === pageNum
                          ? "bg-[#FACC15] text-night shadow-md shadow-[#FACC15]/20 font-black border border-[#FACC15]"
                          : "border border-night/10 bg-white text-tide hover:bg-gray-50 hover:border-night/20"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-night/10 bg-white px-3 py-2 text-xs font-bold text-night transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-night/5">
            <p className="text-sm text-tide/60 italic">No programs found matching your criteria.</p>
            <button
              onClick={handleReset}
              className="btn-yellow mt-4 px-5 py-2.5 text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

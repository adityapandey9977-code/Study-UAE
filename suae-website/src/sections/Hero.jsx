import React from "react";
import { Search, GraduationCap, BookOpen, Award, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePreviewData } from "../context/PreviewContext";
import { fetchFromNode } from "../utils/nodeApi";

export function Hero({ hero: publishedHero, onSearch, selectedCity = "All Cities", onCitySelect }) {
  const hero = usePreviewData("hero", publishedHero);
  // const badgeText = (hero.badge && hero.badge.trim()) ? hero.badge : "#1 Study Destination in the Middle East";
  const searchPlaceholder = hero.search?.placeholder || "Search your favourite university...";
  const searchButton = hero.search?.button || "Search";
  const popularCities = hero.popularCities?.length
    ? hero.popularCities
    : ['All Cities', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'];
  const socialProofTitle = hero.socialProof?.title || "12,000+ Students";
  const socialProofCopy = hero.socialProof?.copy || "Enrolled through our platform";
  const layout = hero.layout || "full-width";
  const alignment = hero.alignment || "center";
  const overlayOpacity = typeof hero.overlayOpacity === "number" ? hero.overlayOpacity : 70;
  const accentColor = hero.accentColor || "#7fb2e5";
  const heroBackground = hero.background || "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2200&q=85";
  const isSidebarLayout = layout === "sidebar";
  const alignmentClass = alignment === "left"
    ? "items-start text-left"
    : alignment === "right"
      ? "items-end text-right"
      : "items-center text-center";
  const searchAlignmentClass = alignment === "left" ? "mr-auto" : alignment === "right" ? "ml-auto" : "mx-auto";
  // const contentWrapperClass = isSidebarLayout
  //   ? "flex-col lg:flex-row lg:items-center lg:gap-10"
  //   : "flex-col justify-center";
  const contentWrapperClass = isSidebarLayout
  ? "flex-col lg:flex-row lg:items-center lg:gap-10"
  : "flex-col justify-start";
  const heroContentClass = isSidebarLayout
    ? "w-full lg:w-[58%]"
    : "w-full max-w-[1120px] mx-auto";
  const chipsWrapperClass = alignment === "left"
    ? "justify-start"
    : alignment === "right"
      ? "justify-end"
      : "justify-center";
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState({ universities: [], programs: [], courses: [] });
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
  const suggestionsRef = React.useRef(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  React.useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions({ universities: [], programs: [], courses: [] });
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const delayDebounceFn = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetchFromNode(`/public/search/suggestions?q=${encodeURIComponent(trimmed)}`, { signal });
        const resJson = await response.json();
        if (resJson.success && resJson.data) {
          setSuggestions(resJson.data);
          const hasSuggestions =
            resJson.data.universities.length > 0 ||
            resJson.data.programs.length > 0 ||
            resJson.data.courses.length > 0;
          setShowSuggestions(hasSuggestions);
        } else {
          setSuggestions({ universities: [], programs: [], courses: [] });
          setShowSuggestions(false);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Error loading suggestions:", err);
        }
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 250);

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
  }, [query]);

  const handleSelect = (type, value) => {
    setQuery(value);
    setShowSuggestions(false);

    if (type === 'university') {
      navigate(`/university/${encodeURIComponent(value)}`);
    } else if (type === 'program') {
      navigate(`/programs?search=${encodeURIComponent(value)}`);
    } else if (type === 'course') {
      navigate(`/universities?search=${encodeURIComponent(value)}`);
    }
  };

  const performSearchRedirect = (val) => {
    const trimmed = val.trim();
    if (!trimmed) {
      navigate('/universities');
      return;
    }

    const lower = trimmed.toLowerCase();
    const programKeywords = [
      'business', 'engineering', 'health', 'media', 'science', 'arts', 'design',
      'humanities', 'computing', 'it', 'technology', 'management', 'law',
      'program', 'discipline', 'course'
    ];

    const isProgram = programKeywords.some(keyword => lower.includes(keyword));
    if (isProgram) {
      navigate(`/programs?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate(`/universities?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearchRedirect(query);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performSearchRedirect(query);
    }
  };

  const renderTitle = (titleText) => {
    if (!titleText) return <>Find Your Dream University in <span className="bg-gradient-to-r from-[#c9e1ff] via-[#eef6ff] to-[#9fd0ff] bg-clip-text text-transparent font-black">UAE</span></>;
    if (titleText.includes("UAE")) {
      const parts = titleText.split("UAE");
      return (
        <>
          {parts[0]}
          <span className="bg-gradient-to-r from-[#c9e1ff] via-[#eef6ff] to-[#9fd0ff] bg-clip-text text-transparent font-black">UAE</span>
          {parts[1]}
        </>
      );
    }
    return titleText;
  };

  return (
    <section
      id="hero"
      // className={`relative z-20 isolate min-h-[100svh] bg-[#12345b] text-white pt-20 lg:pt-24 pb-8 flex flex-col ${isSidebarLayout ? "lg:pt-28" : ""}`}
      className={`relative z-20 isolate min-h-[calc(100svh-92px)] bg-[#12345b] text-white pt-10 lg:pt-12 pb-8 flex flex-col ${isSidebarLayout ? "lg:pt-16" : ""}`}
      style={{
        backgroundImage: `linear-gradient(120deg, rgba(7, 18, 34, 0.78) 0%, rgba(7, 18, 34, ${Math.max(0.2, overlayOpacity / 100)} ) 100%), url(${heroBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,#2c5d94_0%,#173e6a_42%,#102d4c_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_82%,rgba(103,160,220,0.30)_0%,transparent_38%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_24%,rgba(143,192,235,0.18)_0%,transparent_34%)]" />

        <div className="absolute top-[12%] right-[10%] h-[320px] w-[320px] rounded-full bg-[#6f9fd3]/14 blur-[120px]" />
        <div className="absolute bottom-[18%] left-[14%] h-[360px] w-[360px] rounded-full bg-[#8cb8e3]/10 blur-[140px]" />

        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage: 'radial-gradient(rgba(214, 231, 248, 0.38) 1px, transparent 1px)',
            backgroundSize: '22px 22px'
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "110px 110px",
          }}
        />

        <div
          className="absolute inset-x-0 bottom-0 h-12"
          style={{ background: "linear-gradient(to bottom, rgba(3, 8, 18, 0) 0%, rgba(3, 8, 18, 0.18) 100%)" }}
        />
      </div>

      <div className={`relative z-10 w-full max-w-[1680px] mx-auto px-6 sm:px-8 lg:px-12 flex-grow flex ${contentWrapperClass}`}>
        <div className={`flex ${heroContentClass} flex-col py-3 ${alignmentClass}`}>
          {/* {badgeText ? (
            <span
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/8 px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#d8eaff] backdrop-blur-sm shadow-sm"
              style={{ borderColor: `${accentColor}55`, color: `${accentColor}ff` }}
            >
              ✨ {badgeText}
            </span>
          ) : null} */}

          <div className="hero-title-wrapper mb-5 max-w-5xl">
            <h1
              className="hero-title font-heading text-4xl sm:text-5xl lg:text-[5.15rem] leading-[0.94]"
              style={hero.titleColor ? { color: hero.titleColor } : {}}
            >
              {renderTitle(hero.title)}
            </h1>
          </div>

          <p
            className="hero-subtitle font-body mb-8 max-w-4xl text-base leading-relaxed text-white/86 sm:text-lg lg:text-[1.6rem]"
            style={hero.copyColor ? { color: hero.copyColor } : {}}
          >
            {hero.copy || "Discover top programs across Dubai, Abu Dhabi, Sharjah and beyond. Compare options and apply seamlessly."}
          </p>

          <div ref={suggestionsRef} className={`relative w-full max-w-[900px] mb-6 ${searchAlignmentClass}`}>
            <div className="flex w-full overflow-hidden rounded-[1.15rem] border border-white/12 bg-white shadow-[0_18px_50px_rgba(3,20,39,0.26)] p-1.5 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#7fb2e5]">
              <div className="flex items-center px-4 flex-grow bg-white">
                {isLoadingSuggestions ? (
                  <Loader2 className="text-[#6c87a3] w-5 h-5 shrink-0 animate-spin" />
                ) : (
                  <Search className="text-[#6c87a3] w-5 h-5 shrink-0" />
                )}
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none text-night focus:ring-0 py-3 sm:py-3.5 px-3 outline-none text-sm sm:text-base font-semibold"
                />
              </div>
              <button
                onClick={handleSubmit}
                className="text-black px-7 sm:px-9 py-3 sm:py-3.5 rounded-[0.9rem] font-bold transition-all duration-300 hover:shadow-lg flex-shrink-0 text-sm sm:text-base"
                style={{ backgroundColor: hero.search?.buttonBgColor || " #FACC15" }}
              >
                {searchButton}
              </button>
            </div>

            {/* Suggestions Dropdown Card */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-[999] text-left text-night max-h-[450px] overflow-y-auto">
                {/* Universities Section */}
                {suggestions.universities && suggestions.universities.length > 0 && (
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#6c87a3] uppercase tracking-wider">
                      <GraduationCap className="w-4 h-4 text-[#174a8b]" />
                      Universities
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {suggestions.universities.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleSelect('university', item.name)}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 flex items-center justify-between text-sm font-semibold text-night transition-colors"
                        >
                          <span>{item.name} {item.abbreviation ? `(${item.abbreviation})` : ''}</span>
                          <span className="text-xs text-gray-400">View Page</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Programs Section */}
                {suggestions.programs && suggestions.programs.length > 0 && (
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#6c87a3] uppercase tracking-wider">
                      <BookOpen className="w-4 h-4 text-[#174a8b]" />
                      Programs
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {suggestions.programs.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleSelect('program', item.name)}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 flex items-center justify-between text-sm font-semibold text-night transition-colors"
                        >
                          <span>{item.name}</span>
                          <span className="text-xs text-gray-400">View Courses</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Courses Section */}
                {suggestions.courses && suggestions.courses.length > 0 && (
                  <div className="p-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-[#6c87a3] uppercase tracking-wider">
                      <Award className="w-4 h-4 text-[#174a8b]" />
                      Courses
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {suggestions.courses.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleSelect('course', item.name)}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 flex items-center justify-between text-sm font-semibold text-night transition-colors"
                        >
                          <span className="truncate pr-4">{item.name}</span>
                          <span className="text-xs text-gray-400 shrink-0">Find Offering Unis</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className={`mb-8 flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-3 ${chipsWrapperClass}`}
          >
            <span className="inline-flex h-[42px] items-center text-[13px] font-extrabold uppercase leading-none tracking-[0.12em] text-[#cfe0f3]">
              {hero.popularLabel || "Popular:"}
            </span>

            {popularCities.map((city) => {
              const isActive = selectedCity === city;

              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => onCitySelect && onCitySelect(city)}
                  className={`inline-flex h-[42px] items-center justify-center rounded-full border px-6 text-sm font-extrabold uppercase leading-none tracking-[0.06em] transition-all duration-300 ${isActive
                      ? "border-[#e9f3ff] bg-[#e9f3ff] text-[#123f6b] shadow-[0_10px_24px_rgba(8,28,52,0.22)]"
                      : "border-white/70 bg-white/5 text-white hover:border-white hover:bg-white/12"
                    }`}
                >
                  {city}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 rounded-[1rem] border border-white/10 bg-white/6 px-4 py-3 shadow-sm backdrop-blur-md">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#051020] object-cover"
                  src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${30 + i}.jpg`}
                  alt="Student avatar"
                />
              ))}
            </div>
            <div className="text-[11px] sm:text-xs font-medium text-white/90 leading-tight">
              <strong className="block text-white font-extrabold text-xs sm:text-sm">{socialProofTitle}</strong>
              {socialProofCopy}
            </div>
          </div>
        </div>

        {isSidebarLayout ? (
          <div className="mt-8 w-full lg:mt-0 lg:w-[42%]">
            <div className="h-full rounded-[1.4rem] border border-white/15 bg-white/12 p-6 shadow-[0_24px_70px_rgba(2,10,22,0.26)] backdrop-blur-xl sm:p-8">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#dcefff]">Why students pick us</p>
              <h2 className="text-2xl font-black text-white sm:text-3xl">Expert guidance for every step of your UAE journey</h2>
              <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base">
                From choosing the right university to planning your visa and arrival, this section adapts to a more editorial, high-conversion sidebar layout.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {['Personalized shortlist', 'Scholarship support', 'Fast application help'].map((item) => (
                  <span key={item} className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white/90">
                    {item}
                  </span>
                ))}
              </div>
              <button
                className="mt-7 inline-flex items-center rounded-full px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                Get Started
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

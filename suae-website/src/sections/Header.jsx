import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, Landmark, BookOpen, ArrowUpRight, BookText, FileText, BadgeHelp, Briefcase } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";
import { fetchFromNode } from "../utils/nodeApi";

const cities = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Fujairah",
  "Ras Al Khaimah",
  "Umm Al-Quwain"
];

const fallbackPrograms = [
  "Business and Management",
  "Engineering and Technology",
  "Health Sciences",
  "Law"
];

const studyInUaeItems = [
  { label: "Study in Dubai", href: "/city/Dubai" },
  { label: "Study in Abu Dhabi", href: "/city/Abu Dhabi" },
  { label: "Study in Sharjah", href: "/city/Sharjah" },
  { label: "Study in Ajman", href: "/city/Ajman" },
  { label: "Study in Fujairah", href: "/city/Fujairah" },
  { label: "Study in RAK", href: "/city/Ras Al Khaimah" },
  { label: "Study in UAQ", href: "/city/Umm Al-Quwain" }
];

const resourcesItems = [
  { label: "Blogs", href: "/resources/blogs", iconName: "FileText" },
  { label: "FAQs", href: "/resources/faqs", iconName: "BadgeHelp" },
  { label: "Testimonials", href: "/#testimonials", iconName: "Briefcase" }
];

const renderResourceIcon = (iconName) => {
  switch (iconName) {
    case "FileText":
      return <FileText size={14} strokeWidth={2} />;
    case "BadgeHelp":
      return <BadgeHelp size={14} strokeWidth={2} />;
    case "Briefcase":
      return <Briefcase size={14} strokeWidth={2} />;
    default:
      return <FileText size={14} strokeWidth={2} />;
  }
};

function NavItemWithDropdown({ item, universities, studyInUaeItems, disciplines }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const closeTimeout = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current);
      }
    };
  }, []);

  const isUniversities = item.label.toLowerCase() === "universities" || item.label.toLowerCase() === "university";
  const isPrograms = item.label.toLowerCase() === "programs" || item.label.toLowerCase() === "courses" || item.label.toLowerCase() === "disciplines" || item.label.toLowerCase() === "desciplines";
  const isStudyInUae = item.label.toLowerCase() === "study in uae";
  const isResources = item.label.toLowerCase() === "resources";

  if (isUniversities || isPrograms || isStudyInUae || isResources) {
    return (
      <div
        className="relative"
        ref={dropdownRef}
        onMouseEnter={() => {
          if (closeTimeout.current) { clearTimeout(closeTimeout.current); closeTimeout.current = null; }
          setIsOpen(true);
        }}
        onMouseLeave={() => {
          if (closeTimeout.current) clearTimeout(closeTimeout.current);
          closeTimeout.current = setTimeout(() => setIsOpen(false), 150);
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          onFocus={() => setIsOpen(true)}
          className="flex items-center gap-1 text-night/80 transition hover:text-lagoon outline-none"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          {item.label} <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 mt-6 w-72 rounded-md bg-white py-2 shadow-2xl normal-case tracking-normal text-night before:absolute before:-top-2 before:left-6 before:h-4 before:w-4 before:rotate-45 before:bg-white before:content-['']">
            <div className="relative z-10 bg-white rounded-md overflow-hidden">
              {isUniversities && universities.slice(0, 5).map((uni) => (
                <Link
                  key={uni.name}
                  to={`/university/${encodeURIComponent(uni.name)}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-[15px] font-medium text-gray-800 transition-colors hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <Landmark size={18} className="text-gray-900 shrink-0" />
                  {uni.name}
                </Link>
              ))}

              {isUniversities && (
                <Link
                  to="/universities"
                  className="flex items-center gap-2 px-4 py-3 text-[15px] font-medium text-gray-800 transition-colors hover:bg-gray-50 mt-1 border-t border-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <ArrowUpRight size={18} className="text-gray-900 shrink-0" />
                  View All Universities
                </Link>
              )}

              {isPrograms && (disciplines || []).slice(0, 5).map((prog) => (
                <Link
                  key={prog}
                  to={`/programs?category=${encodeURIComponent(prog)}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-[15px] font-medium text-gray-800 transition-colors hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <BookOpen size={18} className="text-gray-900 shrink-0" />
                  {prog}
                </Link>
              ))}

              {isPrograms && (
                <Link
                  to="/programs"
                  className="flex items-center gap-2 px-4 py-3 text-[15px] font-medium text-gray-800 transition-colors hover:bg-gray-50 mt-1 border-t border-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <ArrowUpRight size={18} className="text-gray-900 shrink-0" />
                  View All Disciplines
                </Link>
              )}

              {isStudyInUae && studyInUaeItems.map((subItem) => (
                <Link
                  key={subItem.label}
                  to={subItem.href}
                  className="flex items-center gap-3 px-4 py-2.5 text-[15px] font-medium text-gray-800 transition-colors hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-black text-white">
                    <BookText size={14} strokeWidth={2} />
                  </div>
                  {subItem.label}
                </Link>
              ))}

              {isResources && resourcesItems.map((subItem) => (
                <Link
                  key={subItem.label}
                  to={subItem.href}
                  className="flex items-center gap-3 px-4 py-2.5 text-[15px] font-medium text-gray-800 transition-colors hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-black text-white">
                    {renderResourceIcon(subItem.iconName)}
                  </div>
                  {subItem.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <a href={item.href} className="text-night/80 transition hover:text-lagoon">
      {item.label}
    </a>
  );
}

export function Header({
  brand: publishedBrand,
  header: publishedHeader,
  navigation: publishedNavigation,
  universities: publishedUniversities,
  cities: publishedCities,
  onOpenConsultation
}) {
  const brand = usePreviewData("brand", publishedBrand);
  const header = usePreviewData("header", publishedHeader);
  const navigation = usePreviewData("navigation", publishedNavigation);
  const universitiesData = usePreviewData("universities", publishedUniversities);
  const unisList = universitiesData?.cards || [];
  const cities = usePreviewData("cities", publishedCities || []);

  const [dbDisciplines, setDbDisciplines] = useState([]);

  useEffect(() => {
    fetchFromNode("/public/disciplines")
      .then(res => res.json())
      .then(payload => {
        if (payload && payload.success && Array.isArray(payload.data)) {
          setDbDisciplines(payload.data.map(d => d.name));
        }
      })
      .catch(err => {
        console.error("Failed to fetch disciplines for header:", err);
      });
  }, []);

  const disciplinesList = dbDisciplines.length > 0 ? dbDisciplines : fallbackPrograms;

  const mappedNavigation = (navigation || []).map(item => {
    if (item.label.toLowerCase() === "programs") {
      return { ...item, label: "Disciplines" };
    }
    return item;
  });

  const studyInUaeItems = cities.length > 0
    ? cities.map(c => ({ label: `Study in ${c.name}`, href: `/city/${c.name}` }))
    : [
      { label: "Study in Dubai", href: "/city/Dubai" },
      { label: "Study in Abu Dhabi", href: "/city/Abu Dhabi" },
      { label: "Study in Sharjah", href: "/city/Sharjah" },
      { label: "Study in Ajman", href: "/city/Ajman" },
      { label: "Study in Fujairah", href: "/city/Fujairah" },
      { label: "Study in RAK", href: "/city/Ras Al Khaimah" },
      { label: "Study in UAQ", href: "/city/Umm Al-Quwain" }
    ];

  const studentLoginHref = import.meta.env.VITE_STUDENT_LOGIN_URL || header.loginStudent?.href || "/student-login";
  const instituteLoginHref = import.meta.env.VITE_INSTITUTE_LOGIN_URL || header.loginInstitution?.href || "/institute-login";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleExpand = (label) => {
    setExpandedItem(expandedItem === label ? null : label);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#d7e1ec] bg-white text-night shadow-[0_8px_24px_rgba(16,35,63,0.06)]">
      <div className="section-shell">
        <div className="flex min-h-16 items-center justify-between gap-4 sm:min-h-20 sm:gap-6">
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Study in UAE Logo"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-[0.08em] text-night lg:flex">
            {mappedNavigation?.map((item) => (
              <NavItemWithDropdown
                key={item.label}
                item={item}
                universities={unisList}
                studyInUaeItems={studyInUaeItems}
                disciplines={disciplinesList}
              />
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href={studentLoginHref} className="hidden rounded-md border border-[#d2dce8] bg-white px-3 py-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-night transition hover:border-[#bdd0e3] hover:bg-[#f7fafd] hover:text-lagoon lg:inline-flex xl:px-4 xl:text-xs">
              {header.loginStudent?.label}
            </a>
            <a href={instituteLoginHref} className="hidden rounded-md border border-[#d2dce8] bg-white px-3 py-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-night transition hover:border-[#bdd0e3] hover:bg-[#f7fafd] hover:text-lagoon lg:inline-flex xl:px-4 xl:text-xs">
              {header.loginInstitution?.label}
            </a>
            <button
              type="button"
              onClick={onOpenConsultation}
              className="hidden rounded-md px-4 py-3 text-xs font-extrabold uppercase tracking-[0.1em] text-night transition sm:inline-flex"
              style={{ backgroundColor: '#FACC15', boxShadow: '0 3px 14px rgba(250,204,21,0.45)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EAB308'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FACC15'}
            >
              {header.applyCta?.label}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d2dce8] bg-white text-night lg:hidden outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#d7e1ec] bg-white px-6 py-6 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto">
          <nav className="flex flex-col gap-5 text-sm font-semibold uppercase tracking-[0.08em] text-night">
            {mappedNavigation?.map((item) => {
              const labelLower = item.label.toLowerCase();
              const isUniversities = labelLower === "universities" || labelLower === "university";
              const isPrograms = labelLower === "programs" || labelLower === "courses" || labelLower === "disciplines" || labelLower === "desciplines";
              const isStudyInUae = labelLower === "study in uae";
              const isResources = labelLower === "resources";
              const hasDropdown = isUniversities || isPrograms || isStudyInUae || isResources;

              return (
                <div key={item.label} className="flex flex-col">
                  {hasDropdown ? (
                    <>
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className="flex items-center justify-between w-full py-1 text-night/80 hover:text-lagoon outline-none text-left font-semibold uppercase tracking-[0.08em] text-sm"
                      >
                        {item.label}
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-300 ${expandedItem === item.label ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      {expandedItem === item.label && (
                        <div className="flex flex-col pl-4 gap-2.5 mt-2 border-l border-[#f0f4f8] py-1 normal-case tracking-normal">
                          {isUniversities && unisList.slice(0, 5).map((uni) => (
                            <Link
                              key={uni.name}
                              to={`/university/${encodeURIComponent(uni.name)}`}
                              className="flex items-center gap-2 py-1 text-tide hover:text-lagoon font-medium"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Landmark size={14} className="text-tide shrink-0" />
                              {uni.name}
                            </Link>
                          ))}
                          {isUniversities && (
                            <Link
                              to="/universities"
                              className="flex items-center gap-1.5 py-2 text-night hover:text-lagoon border-t border-[#f0f4f8] font-bold"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              View All Universities
                            </Link>
                          )}

                          {isPrograms && disciplinesList.slice(0, 5).map((prog) => (
                            <Link
                              key={prog}
                              to={`/programs?category=${encodeURIComponent(prog)}`}
                              className="flex items-center gap-2 py-1 text-tide hover:text-lagoon font-medium"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <BookOpen size={14} className="text-tide shrink-0" />
                              {prog}
                            </Link>
                          ))}
                          {isPrograms && (
                            <Link
                              to="/programs"
                              className="flex items-center gap-1.5 py-2 text-night hover:text-lagoon border-t border-[#f0f4f8] font-bold"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              View All Disciplines
                            </Link>
                          )}

                          {isStudyInUae && studyInUaeItems.map((subItem) => (
                            <Link
                              key={subItem.label}
                              to={subItem.href}
                              className="flex items-center gap-2 py-1 text-tide hover:text-lagoon font-medium"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <BookText size={14} className="text-tide shrink-0" />
                              {subItem.label}
                            </Link>
                          ))}

                          {isResources && resourcesItems.map((subItem) => (
                            <Link
                              key={subItem.label}
                              to={subItem.href}
                              className="flex items-center gap-2 py-1 text-tide hover:text-lagoon font-medium"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-black/5 text-[#333]">
                                {renderResourceIcon(subItem.iconName)}
                              </div>
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-night/80 hover:text-lagoon block py-1 font-semibold uppercase tracking-[0.08em] text-sm"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              );
            })}

            {/* Mobile Auth & Consultation CTAs */}
            <div className="mt-4 pt-5 border-t border-[#d7e1ec] flex flex-col gap-3">
              <a
                href={studentLoginHref}
                className="w-full text-center rounded-md border border-[#d2dce8] bg-white py-3.5 text-xs font-extrabold uppercase tracking-[0.1em] text-night transition hover:bg-[#f7fafd]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {header.loginStudent?.label}
              </a>
              <a
                href={instituteLoginHref}
                className="w-full text-center rounded-md border border-[#d2dce8] bg-white py-3.5 text-xs font-extrabold uppercase tracking-[0.1em] text-night transition hover:bg-[#f7fafd]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {header.loginInstitution?.label}
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConsultation();
                }}
                className="w-full text-center rounded-md py-3.5 text-xs font-extrabold uppercase tracking-[0.1em] text-night transition"
                style={{ backgroundColor: '#FACC15' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EAB308'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FACC15'}
              >
                {header.applyCta?.label}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

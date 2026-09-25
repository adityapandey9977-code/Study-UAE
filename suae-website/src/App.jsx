import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { getHomepageContent } from "./services/homepageService";
import { ConsultationModal } from "./sections/ConsultationModal";
import { SupportRails } from "./sections/SupportRails";
import { Header } from "./sections/Header";
import { Hero } from "./sections/Hero";
import { IntroSection } from "./sections/IntroSection";
import { CitiesSection } from "./sections/CitiesSection";
import { UniversitiesSection } from "./sections/UniversitiesSection";
import { ProgramsSection } from "./sections/ProgramsSection";
// import { CityLifeSection } from "./sections/CityLifeSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { Footer } from "./sections/Footer";
import { PreviewProvider, usePreviewData } from "./context/PreviewContext";
import { UniversityDetailsPage } from "./pages/UniversityDetailsPage";
import { ProgramDetailsPage } from "./pages/ProgramDetailsPage";
import { CityDetailsPage } from "./pages/CityDetailsPage";
import { BlogsPage } from "./pages/BlogsPage";
import { BlogDetailPage } from "./pages/BlogDetailPage";
import { EventsPage } from "./pages/EventsPage";
import { FaqsPage } from "./pages/FaqsPage";
import { CareersPage } from "./pages/CareersPage";
import { ScholarshipsPage } from "./pages/ScholarshipsPage";
import { AllUniversitiesPage } from "./pages/AllUniversitiesPage";
import { AllProgramsPage } from "./pages/AllProgramsPage";
import { ComparePage } from "./pages/ComparePage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { WriteReviewPage } from "./pages/WriteReviewPage";
import { ThankYouPage } from "./pages/ThankYouPage";
import { fetchFromNode } from "./utils/nodeApi";
import { applyPageSeo, getPageSettingsForPath } from "./utils/pageSeo";

function getConsultationStateFromUrl(search) {
  const params = new URLSearchParams(search);
  const consultationParam = params.get("consultation");
  if (consultationParam === "open") return true;
  return false;
}

// Scroll to top on route change & smooth scroll to target hash
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo(0, 0);
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function PreviewUiSync({ setIsConsultationOpen }) {
  const { search, pathname } = useLocation();

  useEffect(() => {
    if (pathname === "/") {
      const params = new URLSearchParams(search);
      const consultationParam = params.get("consultation");
      if (consultationParam === "close") {
        setIsConsultationOpen(false);
      } else {
        setIsConsultationOpen(true);
      }
    } else {
      setIsConsultationOpen(getConsultationStateFromUrl(search));
    }
  }, [search, pathname, setIsConsultationOpen]);

  return null;
}

function PageSeoManager({ content }) {
  const location = useLocation();
  const pageSettings = usePreviewData("pageSettings", content?.pageSettings);
  const activePageSettings = getPageSettingsForPath(location.pathname, pageSettings);

  useEffect(() => {
    applyPageSeo(activePageSettings?.seo || {});
  }, [activePageSettings]);

  return null;
}

// Global monitor for dynamically pasted iframe form widgets
function IframeFormMonitor({ content }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const handleMessage = (event) => {
      if (
        event.data &&
        (event.data.type === 'form-submitted' ||
          event.data.action === 'form-submitted' ||
          event.data === 'form-submitted' ||
          (typeof event.data === 'string' && event.data.includes('form-submitted')) ||
          (event.data.success === true && event.data.form_slug))
      ) {
        window.location.href = '/thank-you';
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    const iframes = document.querySelectorAll('iframe[src*="suae-php.questdigiflex.com/form/embed/"]');

    iframes.forEach(async (iframe) => {
      try {
        const src = iframe.getAttribute('src');
        if (!src) return;

        const matches = src.match(/\/form\/embed\/([a-zA-Z0-9_-]+)/);
        if (!matches || !matches[1]) return;

        const slug = matches[1];

        const response = await fetch(`https://suae-php.questdigiflex.com/api/form/slug/${slug}`);
        const data = await response.json();

        if (data && !data.status) {
          const alertContainer = document.createElement('div');
          alertContainer.className = "flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-2xl text-center my-6 shadow-sm";
          alertContainer.style.width = iframe.getAttribute('width') || '100%';
          alertContainer.innerHTML = `
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4 mx-auto">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-red-800 mb-2">Form is Inactive</h3>
            <p class="text-red-600 max-w-md mx-auto">Form is inactive please contact the admin.</p>
          `;

          if (iframe.parentNode) {
            iframe.parentNode.replaceChild(alertContainer, iframe);
          }
        }
      } catch (err) {
        console.error("Failed to check status for embedded form:", err);
      }
    });
  }, [pathname, content]);

  return null;
}

// Home Component containing all homepage sections
function Home({ content, onOpenConsultation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");

  useEffect(() => {
    const heroSeo = content?.hero?.seo || {};
    const title = heroSeo.title || "Study in UAE | Find Universities & Programs";
    const description = heroSeo.description || "Discover top universities, programs, scholarships, and guided admissions in the UAE.";
    document.title = title;

    const existingMetaDescription = document.querySelector('meta[name="description"]');
    if (existingMetaDescription) {
      existingMetaDescription.setAttribute("content", description);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = description;
      document.head.appendChild(meta);
    }

    const existingOgTitle = document.querySelector('meta[property="og:title"]');
    if (existingOgTitle) {
      existingOgTitle.setAttribute("content", title);
    } else {
      const meta = document.createElement("meta");
      meta.property = "og:title";
      meta.content = title;
      document.head.appendChild(meta);
    }

    const existingOgDescription = document.querySelector('meta[property="og:description"]');
    if (existingOgDescription) {
      existingOgDescription.setAttribute("content", description);
    } else {
      const meta = document.createElement("meta");
      meta.property = "og:description";
      meta.content = description;
      document.head.appendChild(meta);
    }

    if (heroSeo.image) {
      const existingOgImage = document.querySelector('meta[property="og:image"]');
      if (existingOgImage) {
        existingOgImage.setAttribute("content", heroSeo.image);
      } else {
        const meta = document.createElement("meta");
        meta.property = "og:image";
        meta.content = heroSeo.image;
        document.head.appendChild(meta);
      }
    }
  }, [content?.hero?.seo]);

  const scrollToUniversities = () => {
    const section = document.getElementById("universities");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    scrollToUniversities();
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    scrollToUniversities();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCity("All Cities");
  };

  return (
    <>
      <Hero
        hero={content.hero}
        onSearch={handleSearch}
        selectedCity={selectedCity}
        onCitySelect={handleCitySelect}
      />

      <IntroSection intro={content.intro} universities={content.universities} />
      <CitiesSection cities={content.cities} universities={content.universities} />
      <UniversitiesSection
        universities={content.universities}
        searchQuery={searchQuery}
        selectedCity={selectedCity}
        onClearFilters={handleClearFilters}
      />
      <ProgramsSection programs={content.programs} />
      {/* <CityLifeSection cityLife={content.cityLife} /> */}
      <TestimonialsSection testimonials={content.testimonials} />
    </>
  );
}

export default function App() {
  const [content, setContent] = useState(getHomepageContent());
  const [comparedUniversities, setComparedUniversities] = useState([]);
  const [isConsultationOpen, setIsConsultationOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const toggleCompare = (uni) => {
    setComparedUniversities((prev) => {
      const exists = prev.some((u) => u.name === uni.name);
      if (exists) {
        return prev.filter((u) => u.name !== uni.name);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 universities at a time.");
        return prev;
      }
      return [...prev, uni];
    });
  };

  const clearCompare = () => setComparedUniversities([]);

  useEffect(() => {
    // Load published website settings from database on mount, fallback to local file on error
    fetchFromNode("/public/website-settings")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        if (data && data.content) {
          setContent((prev) => ({
            ...prev,
            ...data.content
          }));
        }
      })
      .catch((err) => {
        console.warn("Failed to load published settings from database, using static fallback:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pearl">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-lagoon border-t-transparent"></div>
      </div>
    );
  }

  return (
    <PreviewProvider>
      {/* <div className="min-h-screen bg-pearl text-night">
        <ConsultationModal brand={content.brand} consultation={content.consultation} />
        <SupportRails supportRails={content.supportRails} />
        <Header brand={content.brand} header={content.header} navigation={content.navigation} />
        <main>
          <Hero hero={content.hero} />
          <IntroSection intro={content.intro} />
          <UniversitiesSection universities={content.universities} />
          <ProgramsSection programs={content.programs} />
          <CityLifeSection cityLife={content.cityLife} />
          <FeaturedCampus featured={content.featured} />
          <AdvisorForm advisors={content.advisors} />
        </main>
        <Footer brand={content.brand} footer={content.footer} />
      </div> */}
      <Router>
        <ScrollToTop />
        <PreviewUiSync setIsConsultationOpen={setIsConsultationOpen} />
        <PageSeoManager content={content} />
        <IframeFormMonitor content={content} />
        <div className="min-h-screen bg-pearl text-night">
          <ConsultationModal
            brand={content.brand}
            consultation={content.consultation}
            isOpen={isConsultationOpen}
            onClose={() => setIsConsultationOpen(false)}
          />
          <SupportRails
            supportRails={content.supportRails}
            onOpenConsultation={() => setIsConsultationOpen(true)}
          />
          <Header
            brand={content.brand}
            header={content.header}
            navigation={content.navigation}
            universities={content.universities}
            cities={content.cities}
            onOpenConsultation={() => setIsConsultationOpen(true)}
          />
          <main>
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    content={content}
                    onOpenConsultation={() => setIsConsultationOpen(true)}
                  />
                }
              />
              <Route path="/university/:name" element={<UniversityDetailsPage content={content} />} />
              <Route path="/program/:title" element={<ProgramDetailsPage content={content} />} />
              <Route path="/city/:name" element={<CityDetailsPage content={content} />} />
              <Route path="/resources/blogs" element={<BlogsPage content={content} />} />
              <Route path="/resources/blogs/:id" element={<BlogDetailPage content={content} />} />
              <Route path="/resources/events" element={<EventsPage content={content} />} />
              <Route path="/resources/faqs" element={<FaqsPage content={content} />} />
              <Route path="/resources/careers" element={<CareersPage content={content} />} />
              <Route path="/resources/scholarships" element={<ScholarshipsPage content={content} />} />
              <Route path="/universities" element={<AllUniversitiesPage content={content} compared={comparedUniversities} onToggleCompare={toggleCompare} />} />
              <Route path="/programs" element={<AllProgramsPage content={content} />} />
              <Route path="/about-study-in-uae" element={<AboutPage content={content} />} />
              <Route path="/contact-us" element={<ContactPage content={content} />} />
              <Route path="/compare" element={<ComparePage compared={comparedUniversities} onToggle={toggleCompare} onClear={clearCompare} />} />
               <Route path="/write-review" element={<WriteReviewPage />} />
              <Route path="/thank-you" element={<ThankYouPage />} />
            </Routes>
          </main>
          <Footer
            brand={content.brand}
            footer={content.footer}
            onOpenConsultation={() => setIsConsultationOpen(true)}
          />
        </div>
      </Router>
    </PreviewProvider>
  );
}

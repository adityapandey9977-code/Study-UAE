import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { MapPin, BookOpen, Calendar, Award, Building, ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { OptimizedImage } from "../components/common/OptimizedImage";
import { usePreviewData } from "../context/PreviewContext";
import { getPageSettingsForPath } from "../utils/pageSeo";
import { fetchFromNode } from "../utils/nodeApi";

export function UniversityDetailsPage({ content }) {
  const { name } = useParams();
  const location = useLocation();
  const decodedName = decodeURIComponent(name);

  // Hook into live preview data for universities and programs
  const universitiesData = usePreviewData("universities", content.universities);
  const programsData = usePreviewData("programs", content.programs);
  const pageSettings = usePreviewData("pageSettings", content?.pageSettings);
  const activePageSettings = getPageSettingsForPath(location.pathname, pageSettings);
  const layout = activePageSettings?.layout || "full-width";

  const [dbCards, setDbCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchFromNode("/public/institutes")
      .then((res) => res.json())
      .then((resData) => {
        if (
          isMounted &&
          resData?.success &&
          Array.isArray(resData?.data) &&
          resData.data.length > 0
        ) {
          setDbCards(resData.data);
        }
      })
      .catch((err) => {
        console.error(
          "Failed to load database institutes on details page:",
          err
        );
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

  const cardsList = dbCards;

  const courseTrackRef = useRef(null);

  // Find the university from the list
  const university = cardsList.find((c) => c.name.toLowerCase() === decodedName.toLowerCase());

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pearl py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-lagoon border-t-transparent"></div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-pearl p-6 text-center">
        <h2 className="text-3xl font-bold text-night">University Not Found</h2>
        <p className="mt-2 text-tide/70">The university you are looking for does not exist or has been removed.</p>
        <Link to="/" className="btn-yellow mt-6 px-6 py-3 text-sm rounded-md">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  // Split programs by comma or render directly
  const programList = university.programs
    ? university.programs.split(",").map((p) => p.trim())
    : [];

  const scrollCourses = (direction) => {
    const track = courseTrackRef.current;
    if (!track) return;
    const card = track.querySelector(":scope > article");
    const step = card ? card.offsetWidth + 24 : 300;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const courseCards = Array.isArray(university.fullProgramsList)
    ? university.fullProgramsList.map((courseObj) => ({
      title: courseObj.title,
      meta: `${courseObj.career} | ${courseObj.discipline}`,
      copy: `Course Category: ${courseObj.course}. Offered under the discipline of ${courseObj.discipline} as a ${courseObj.career} program.`
    }))
    : [];

  return (
    <div className="min-h-screen bg-pearl">
      {/* LinkedIn Style Profile Header */}
      <div className="section-shell pt-8 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-tide/75 transition hover:text-night mb-6 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Directory
        </Link>

        {/* Profile Card Wrapper */}
        <div className="bg-white rounded-2xl border border-night/5 overflow-hidden shadow-sm">
          {/* Cover Banner */}
          <div className="relative h-48 sm:h-64 md:h-80 w-full bg-night/5 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80" 
              alt="Campus Background Banner" 
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Details Section */}
          <div className="px-6 sm:px-8 pb-8 relative">
            {/* Overlapping circular avatar */}
            <div className="relative -mt-20 sm:-mt-24 mb-4 z-10 flex justify-center">
              <div className="h-40 w-40 sm:h-48 sm:w-48 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center">
                <OptimizedImage
                  src={university.image}
                  alt={`${university.name} Logo`}
                  className="h-full w-full object-contain p-2.5"
                />
              </div>
            </div>

            {/* Title, location, and info */}
            <div className="mt-4 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-lagoon/10 px-3 py-1 text-xs font-semibold text-lagoon border border-lagoon/20 uppercase tracking-wider">
                    {university.type} Institute
                  </span>
                  <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-night leading-tight">
                    {university.name}
                  </h1>
                </div>
                <p className="mt-1 flex items-center justify-center gap-2 text-base sm:text-lg text-tide/80">
                  <MapPin size={20} className="text-tide/60" />
                  {university.city}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="section-shell pb-12 pt-2">
        <div className={layout === "sidebar" ? "lg:grid lg:grid-cols-[1.3fr_0.7fr] lg:gap-8" : ""}>
          <div className="space-y-8">

            {/* Quick Stats Grid */}
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-night/5 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lagoon/10 text-lagoon">
                  <BookOpen size={20} />
                </div>
                <span className="mt-4 block text-xs font-semibold uppercase tracking-wider text-tide/60">Courses Offered</span>
                <span className="mt-1 block text-lg font-bold text-night">{university.courses || "N/A"}</span>
              </div>

              <div className="rounded-xl border border-night/5 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lagoon/10 text-lagoon">
                  <Building size={20} />
                </div>
                <span className="mt-4 block text-xs font-semibold uppercase tracking-wider text-tide/60">Institute Type</span>
                <span className="mt-1 block text-lg font-bold text-night">{university.type || "N/A"}</span>
              </div>

              <div className="rounded-xl border border-night/5 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lagoon/10 text-lagoon">
                  <Calendar size={20} />
                </div>
                <span className="mt-4 block text-xs font-semibold uppercase tracking-wider text-tide/60">Intake Period</span>
                <span className="mt-1 block text-lg font-bold text-night">{university.intake || "N/A"}</span>
              </div>

              <div className="rounded-xl border border-night/5 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lagoon/10 text-lagoon">
                  <Award size={20} />
                </div>
                <span className="mt-4 block text-xs font-semibold uppercase tracking-wider text-tide/60">Scholarship</span>
                <span className="mt-1 block text-lg font-bold text-night">{university.scholarship || "N/A"}</span>
              </div>
            </section>

            {/* About Section */}
            <section className="rounded-2xl border border-night/5 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="font-heading text-2xl font-bold text-night mb-4">About the University</h3>
              <p className="text-base leading-relaxed text-black">
                {university.note || "No overview available for this university at the moment. Please contact our advisors for detailed information regarding the campus, curriculum, and student facilities."}
              </p>

              <h4 className="mt-6 font-heading text-lg font-bold text-night mb-3">Key Highlights</h4>
              <ul className="grid gap-3 sm:grid-cols-2">
                <li className="flex items-start gap-2.5 text-sm text-black">
                  <CheckCircle size={18} className="text-lagoon shrink-0 mt-0.5" />
                  <span>{university.highlight1 || "Globally accredited and recognized degrees"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-black">
                  <CheckCircle size={18} className="text-lagoon shrink-0 mt-0.5" />
                  <span>{university.highlight2 || "State-of-the-art campus and research facilities"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-black">
                  <CheckCircle size={18} className="text-lagoon shrink-0 mt-0.5" />
                  <span>{university.highlight3 || "Strong industry partnerships and internship placement"}</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-black">
                  <CheckCircle size={18} className="text-lagoon shrink-0 mt-0.5" />
                  <span>{university.highlight4 || "Vibrant multicultural student community"}</span>
                </li>
              </ul>
            </section>

            {/* Programs Section with Horizontal Slider */}
            <section className="rounded-2xl border border-night/5 bg-white p-6 shadow-sm sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-night">Available Courses</h3>
                  <p className="text-sm text-black mt-1">Explore specialized programs and pathways at this campus.</p>
                </div>
                {courseCards.length > 1 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => scrollCourses(-1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-night/10 bg-white text-tide transition hover:bg-lagoon hover:text-white"
                      aria-label="Previous courses"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => scrollCourses(1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-night/10 bg-white text-tide transition hover:bg-lagoon hover:text-white"
                      aria-label="Next courses"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>

              {courseCards.length > 0 ? (
                <div
                  ref={courseTrackRef}
                  className="flex gap-6 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
                >
                  {courseCards.map((item) => (
                    <article
                      key={item.title}
                      className="group flex w-[260px] shrink-0 snap-start flex-col justify-between rounded-xl border border-night/5 bg-pearl p-5 transition hover:border-lagoon/20 hover:bg-white hover:shadow-md sm:w-[300px]"
                    >
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-lagoon">{item.meta}</span>
                        <h4 className="mt-3 font-heading text-lg font-bold text-night leading-snug">{item.title}</h4>
                        <p className="mt-3 text-xs leading-relaxed text-black line-clamp-3">{item.copy}</p>
                      </div>
                      <Link
                        to={`/program/${encodeURIComponent(item.title)}`}
                        className="mt-5 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-gold hover:text-night transition-colors self-start"
                      >
                        Explore Course
                        <ArrowRight size={14} />
                      </Link>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-tide/60">No specific courses listed. Please submit an inquiry for a complete list of courses.</p>
              )}
            </section>

            {/* Campus Life Section */}
            <section className="rounded-2xl border border-night/5 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="font-heading text-2xl font-bold text-night mb-4">Campus Experience</h3>
              <p className="text-base leading-relaxed text-black">
                {university.experience || `Studying in ${university.city} offers a unique blend of high-quality western education and unparalleled global exposure. The campus features student lounges, high-tech labs, and sports facilities, all connected to the city's vibrant business hubs.`}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="overflow-hidden rounded-xl bg-night/5 aspect-[4/3]">
                  <OptimizedImage
                    src={university.experienceImage1 || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80"}
                    fallbackSrc="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80"
                    alt="Library"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-xl bg-night/5 aspect-[4/3]">
                  <OptimizedImage
                    src={university.experienceImage2 || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=400&q=80"}
                    fallbackSrc="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=400&q=80"
                    alt="Classroom"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-xl bg-night/5 aspect-[4/3]">
                  <OptimizedImage
                    src={university.experienceImage3 || "https://images.unsplash.com/photo-1527891751199-7225231a68dd?auto=format&fit=crop&w=400&q=80"}
                    fallbackSrc="https://images.unsplash.com/photo-1527891751199-7225231a68dd?auto=format&fit=crop&w=400&q=80"
                    alt="Campus Life"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </section>
          </div>

          {layout === "sidebar" && (
            <aside className="mt-8 space-y-6 lg:mt-0">
              <div className="rounded-2xl border border-night/5 bg-white p-6 shadow-sm">
                <h3 className="font-heading text-xl font-bold text-night">Need personalised guidance?</h3>
                <p className="mt-3 text-sm leading-relaxed text-tide/80">
                  Our advisors can help compare campuses, admissions timelines, and tuition options for this university.
                </p>
                <Link to="/contact-us" className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-lagoon transition hover:text-night">
                  Contact an advisor
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="rounded-2xl border border-night/5 bg-lagoon/5 p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-lagoon">Layout mode</p>
                <p className="mt-2 text-sm text-tide/80">This page is currently using the CMS-selected sidebar layout for a more focused reading experience.</p>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

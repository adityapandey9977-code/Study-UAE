import React, { useState, useRef, useEffect } from "react";
import { fetchFromNode } from "../utils/nodeApi";
import { useParams, Link } from "react-router-dom";
import { MapPin, Building, ArrowLeft, ArrowRight, BookOpen, GraduationCap, ChevronLeft, ChevronRight, Compass, Shield, Users, Landmark } from "lucide-react";
import { OptimizedImage } from "../components/common/OptimizedImage";
import { usePreviewData } from "../context/PreviewContext";

const cityDataMap = {
  sharjah: {
    title: "Sharjah",
    eyebrow: "The Cultural & Education Capital",
    tagline: "Experience academic excellence in a city rich with heritage, art, and student-friendly communities.",
    overview: "Sharjah is widely recognized as the cultural and educational hub of the UAE. Home to the famous University City, it offers a serene, academic-focused environment with world-class campuses, beautiful Islamic architecture, and a wealth of museums and libraries. Its close proximity to Dubai makes it a perfect balance of focused study and urban access.",
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1920&q=80",
    whyStudy: [
      { title: "Academic Hub", desc: "University City Sharjah hosts top-tier international and local campuses.", icon: GraduationCap },
      { title: "Cultural Capital", desc: "Declared UNESCO's Cultural Capital of the Arab World, filled with art and museums.", icon: Landmark },
      { title: "Affordable Living", desc: "More budget-friendly student housing and living costs compared to neighboring cities.", icon: Building }
    ],
    dailyLife: "Student life in Sharjah revolves around the massive, self-contained University City, which features parks, sports complexes, and student residential areas. Transport is easy with dedicated student shuttle buses and taxis linking to neighboring Dubai.",
    culture: "Sharjah is home to over 20 museums, the Sharjah Art Foundation, and traditional souks. The city hosts the annual Sharjah International Book Fair, one of the largest in the world, alongside various heritage festivals.",
    socialLife: "Socializing in Sharjah is centered around cafes, cultural exhibitions, and waterfront dining at Al Qasba and Al Majaz. Students enjoy a safe, family-friendly atmosphere with strong community values.",
    livingCosts: [
      { category: "Accommodation", cost: "AED 2,200 - AED 3,500" },
      { category: "Food", cost: "AED 750 - AED 1,200" },
      { category: "Travel", cost: "AED 150 - AED 300" },
      { category: "Utilities", cost: "AED 450 - AED 700" }
    ],
    educationCosts: [
      { course: "Engineering", cost: "AED 45,000 - AED 140,000" },
      { course: "Business Studies", cost: "AED 25,000 - AED 100,000" },
      { course: "Arts & Humanities", cost: "AED 30,000 - AED 75,000" },
      { course: "Information Technology", cost: "AED 80,000 - AED 100,000" }
    ]
  },
  dubai: {
    title: "Dubai",
    eyebrow: "The Global Metropolis",
    tagline: "Study in a hyper-connected global business hub offering endless career energy and a cosmopolitan lifestyle.",
    overview: "Dubai is one of the world's most dynamic cities, attracting students from over 150 countries. With dedicated academic zones like Dubai International Academic City (DIAC) and Dubai Knowledge Park, the city hosts branch campuses of leading global universities. It offers an energetic, fast-paced environment with unmatched networking, internship, and career opportunities.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80",
    whyStudy: [
      { title: "Global Career Hub", desc: "Immediate access to multinational corporations, startups, and networking events.", icon: Compass },
      { title: "Cosmopolitan Life", desc: "An international student community with a diverse and exciting lifestyle.", icon: Users },
      { title: "World-Class Branch Campuses", desc: "Study at accredited branches of UK, US, Australian, and European universities.", icon: GraduationCap }
    ],
    dailyLife: "Dubai offers student accommodation in modern residential towers or dedicated student hubs like Myriad. The city is connected by a state-of-the-art Metro system, making commuting to classes and leisure spots seamless.",
    culture: "From the historic Al Fahidi district to the futuristic Museum of the Future, Dubai offers a blend of heritage and cutting-edge design. It is a hub for global concerts, sports events, and culinary experiences.",
    socialLife: "Student social life is extremely vibrant, with beaches, theme parks, shopping malls, and outdoor dining. Digital networking and professional meetups in areas like DIFC and Internet City are common.",
    livingCosts: [
      { category: "Accommodation", cost: "AED 3,000 - AED 5,500" },
      { category: "Food", cost: "AED 900 - AED 1,500" },
      { category: "Travel", cost: "AED 200 - AED 400" },
      { category: "Utilities", cost: "AED 500 - AED 850" }
    ],
    educationCosts: [
      { course: "Engineering", cost: "AED 55,000 - AED 160,000" },
      { course: "Business Studies", cost: "AED 35,000 - AED 120,000" },
      { course: "Arts & Humanities", cost: "AED 40,000 - AED 90,000" },
      { course: "Information Technology", cost: "AED 90,000 - AED 120,000" }
    ]
  },
  "abu dhabi": {
    title: "Abu Dhabi",
    eyebrow: "The UAE's Capital of Innovation",
    tagline: "Study in a secure, futuristic capital city that blends world-class research with rich Arabian hospitality.",
    overview: "Abu Dhabi, the capital of the UAE, is a major center for research, technology, and cultural landmarks. With campuses like NYU Abu Dhabi, Sorbonne Abu Dhabi, and Khalifa University, the city is focused on high-impact research, sustainability, and space tech. It offers a clean, safe, and highly prestigious environment for academic pursuits.",
    image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1920&q=80",
    whyStudy: [
      { title: "Research Excellence", desc: "Home to top-ranked research institutes focusing on AI, clean energy, and space.", icon: GraduationCap },
      { title: "Unmatched Safety", desc: "Consistently ranked among the safest cities in the world for residents and students.", icon: Shield },
      { title: "Cultural Landmarks", desc: "Surrounded by iconic sites like the Louvre Abu Dhabi and Sheikh Zayed Grand Mosque.", icon: Landmark }
    ],
    dailyLife: "Students live in modern campus residences or downtown apartments. The city features wide bike lanes, clean public parks, and a reliable public bus network, creating a pleasant daily environment.",
    culture: "Abu Dhabi is the cultural heart of the UAE, hosting the Saadiyat Cultural District. Students can explore world-class art exhibitions, traditional heritage villages, and international film and music festivals.",
    socialLife: "Social life includes kayaking in the Eastern Mangroves, visiting Yas Island's theme parks, or relaxing at Corniche Beach. It is a slightly more relaxed but highly sophisticated student lifestyle.",
    livingCosts: [
      { category: "Accommodation", cost: "AED 2,800 - AED 4,800" },
      { category: "Food", cost: "AED 850 - AED 1,400" },
      { category: "Travel", cost: "AED 180 - AED 350" },
      { category: "Utilities", cost: "AED 480 - AED 800" }
    ],
    educationCosts: [
      { course: "Engineering", cost: "AED 50,000 - AED 150,000" },
      { course: "Business Studies", cost: "AED 30,000 - AED 110,000" },
      { course: "Arts & Humanities", cost: "AED 35,000 - AED 85,000" },
      { course: "Information Technology", cost: "AED 85,000 - AED 110,000" }
    ]
  }
};

// Generic Fallback data for Ajman, RAK, Fujairah
const getFallbackCityData = (cityName) => ({
  title: cityName,
  eyebrow: `Study in ${cityName}`,
  tagline: `Discover affordable education and a peaceful coastal student lifestyle in ${cityName}.`,
  overview: `${cityName} offers a relaxed, community-focused environment for students. With lower living costs, scenic coastal views, and rapidly growing university campuses, it is an excellent choice for students seeking high-quality education in a peaceful setting close to nature.`,
  image: "https://images.unsplash.com/photo-1526495124232-a04e1849168c?auto=format&fit=crop&w=1920&q=80",
  whyStudy: [
    { title: "Highly Affordable", desc: "Significantly lower tuition fees and rent compared to Dubai or Abu Dhabi.", icon: Building },
    { title: "Scenic & Peaceful", desc: "Enjoy beautiful beaches, mountain landscapes, and a relaxed study environment.", icon: Compass },
    { title: "Close Community", desc: "Smaller class sizes and tight-knit student communities allow for personalized support.", icon: Users }
  ],
  dailyLife: `Daily life in ${cityName} is calm and student-focused. Campuses are close to residential areas, making commute times minimal. Basic amenities, cafes, and supermarkets are easily accessible.`,
  culture: `Explore local heritage sites, traditional markets, and scenic coastal pathways. ${cityName} offers a close look at traditional UAE culture and natural landscapes.`,
  socialLife: "Student social life is centered around beach outings, outdoor sports, local cafes, and campus events. It is a friendly, welcoming environment where students quickly feel at home.",
  livingCosts: [
    { category: "Accommodation", cost: "AED 1,800 - AED 2,800" },
    { category: "Food", cost: "AED 600 - AED 1,000" },
    { category: "Travel", cost: "AED 100 - AED 250" },
    { category: "Utilities", cost: "AED 350 - AED 600" }
  ],
  educationCosts: [
    { course: "Engineering", cost: "AED 35,000 - AED 95,000" },
    { course: "Business Studies", cost: "AED 20,000 - AED 75,000" },
    { course: "Arts & Humanities", cost: "AED 22,000 - AED 60,000" },
    { course: "Information Technology", cost: "AED 65,000 - AED 85,000" }
  ]
});

export function CityDetailsPage({ content }) {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const cityKey = decodedName.toLowerCase();

  // Hook into live preview data for cities and universities
  const citiesData = usePreviewData("cities", content.cities || []);
  const universitiesData = usePreviewData("universities", content.universities);

  // Find city in CMS content with stable index matching during live preview
  const originalIndex = Array.isArray(content.cities)
    ? content.cities.findIndex((c) => c && c.name && c.name.toLowerCase() === decodedName.toLowerCase())
    : -1;
  const cmsCity = originalIndex !== -1
    ? citiesData?.[originalIndex]
    : Array.isArray(citiesData)
      ? citiesData.find((c) => c && c.name && c.name.toLowerCase() === decodedName.toLowerCase())
      : null;

  // Get static fallback city data
  const fallbackCity = cityDataMap[cityKey] || getFallbackCityData(decodedName);

  const city = cmsCity ? {
    title: cmsCity.name,
    eyebrow: cmsCity.eyebrow || fallbackCity.eyebrow,
    tagline: cmsCity.tagline || fallbackCity.tagline,
    overview: cmsCity.overview || fallbackCity.overview,
    image: cmsCity.image || fallbackCity.image,
    whyStudy: fallbackCity.whyStudy, // keep static icons & layout
    dailyLife: cmsCity.dailyLife || fallbackCity.dailyLife,
    culture: cmsCity.culture || fallbackCity.culture,
    socialLife: cmsCity.socialLife || fallbackCity.socialLife,
    livingCosts: cmsCity.livingCosts && cmsCity.livingCosts.length > 0 ? cmsCity.livingCosts : fallbackCity.livingCosts,
    educationCosts: cmsCity.educationCosts && cmsCity.educationCosts.length > 0 ? cmsCity.educationCosts : fallbackCity.educationCosts
  } : fallbackCity;

  const [activeTab, setActiveTab] = useState("living"); // "living" or "education"
  const universityTrackRef = useRef(null);

  const [dbCards, setDbCards] = useState([]);
  const [loading, setLoading] = useState(true);

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
        console.error("Failed to load database featured universities for city page:", err);
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

  // Filter universities in this city
  const universities = dbCards.filter(
    (uni) => uni.city.toLowerCase() === decodedName.toLowerCase()
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pearl py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-lagoon border-t-transparent"></div>
      </div>
    );
  }

  const scrollUniversities = (direction) => {
    const track = universityTrackRef.current;
    if (!track) return;
    const card = track.querySelector(":scope > article");
    const step = card ? card.offsetWidth + 24 : 320;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-pearl">
      {/* Hero Section */}
      <div className="relative bg-night py-24 text-white lg:py-32 overflow-hidden">
        {/* Background Image with Dual Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={city.image}
            alt={`${city.title} skyline`}
            className="h-full w-full object-cover object-center"
          />
          {/* Horizontal gradient for text legibility on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-night/85 via-night/30 to-transparent" />
          {/* Subtle bottom edge gradient to blend layout without fading image */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#faf9f6] to-transparent" />
        </div>

        <div className="section-shell relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/75 transition hover:text-white mb-6 group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sand/20 px-3 py-1 text-xs font-semibold text-sand border border-sand/30 uppercase tracking-wider">
              {city.eyebrow}
            </span>
            <h1 className="mt-4 font-heading text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl text-white">
              Study in {city.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              {city.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="section-shell py-12 space-y-16">

        {/* Overview & Why Study Grid */}
        <section className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div className="rounded-2xl border border-night/5 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="font-heading text-2xl font-bold text-night mb-4">Overview</h3>
            <p className="text-base leading-relaxed text-black">{city.overview}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {city.whyStudy.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="rounded-xl border border-night/5 bg-white p-5 shadow-sm flex flex-col justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lagoon/10 text-lagoon">
                    <Icon size={20} />
                  </div>
                  <div className="mt-4">
                    <span className="block font-heading text-base font-bold text-night leading-snug">{item.title}</span>
                    <span className="mt-1.5 block text-xs text-black leading-relaxed">{item.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Student Experience Sections */}
        <section className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-night/5 bg-white p-6 shadow-sm">
            <h3 className="font-heading text-xl font-bold text-night mb-3">Daily Life</h3>
            <p className="text-sm leading-relaxed text-black">{city.dailyLife}</p>
          </div>

          <div className="rounded-2xl border border-night/5 bg-white p-6 shadow-sm">
            <h3 className="font-heading text-xl font-bold text-night mb-3">Culture & Entertainment</h3>
            <p className="text-sm leading-relaxed text-black">{city.culture}</p>
          </div>

          <div className="rounded-2xl border border-night/5 bg-white p-6 shadow-sm">
            <h3 className="font-heading text-xl font-bold text-night mb-3">Social Life</h3>
            <p className="text-sm leading-relaxed text-black">{city.socialLife}</p>
          </div>
        </section>

        {/* Universities Slider */}
        {universities.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-2xl font-bold text-night">Universities in {city.title}</h3>
                <p className="text-sm text-black mt-1">Explore campuses and find your fit in this city.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollUniversities(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-night/10 bg-white text-tide transition hover:bg-[#FACC15] hover:text-night hover:border-[#FACC15]"
                  aria-label="Previous universities"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scrollUniversities(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-night/10 bg-white text-tide transition hover:bg-[#FACC15] hover:text-night hover:border-[#FACC15]"
                  aria-label="Next universities"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div
              ref={universityTrackRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
            >
              {universities.map((item) => (
                <article
                  key={item.name}
                  className="group w-[280px] shrink-0 snap-start border border-night/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:w-[320px] rounded-xl overflow-hidden"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-night/5">
                    <OptimizedImage
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full"
                      imgClassName="transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h4 className="font-heading text-lg font-bold text-night leading-tight min-h-[44px]">{item.name}</h4>
                    <p className="mt-2 text-xs text-tide/60">{item.type} Institute</p>
                    <Link
                      to={`/university/${encodeURIComponent(item.name)}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#b27b00] hover:text-night transition-colors"
                    >
                      View University
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Cost of Living & Education Section */}
        <section className="space-y-8">
          <h2 className="font-heading text-3xl font-extrabold text-center text-night uppercase tracking-wider">
            Cost of Living
          </h2>

          <div className="relative">
            {/* Tabs Header */}
            <div className="flex justify-start sm:justify-center border-b border-night/10 relative z-10">
              <button
                onClick={() => setActiveTab("living")}
                className={`px-6 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all rounded-t-xl border-t border-x border-transparent ${activeTab === "living"
                  ? "bg-[#FACC15] text-night border-[#FACC15]"
                  : "text-tide hover:bg-[#FACC15]/10"
                  }`}
              >
                Cost of Living to Study in {city.title}
              </button>
              <button
                onClick={() => setActiveTab("education")}
                className={`px-6 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all rounded-t-xl border-t border-x border-transparent ${activeTab === "education"
                  ? "bg-[#FACC15] text-night border-[#FACC15]"
                  : "text-tide hover:bg-[#FACC15]/10"
                  }`}
              >
                Cost of Education to Study in {city.title}
              </button>
            </div>

            {/* Tab Content Box */}
            <div className="bg-white border border-[#FACC15] rounded-2xl rounded-tl-none p-6 sm:p-8 shadow-md relative z-0 -mt-px">
              {activeTab === "living" ? (
                <div className="space-y-6">
                  <p className="text-sm sm:text-base leading-relaxed text-black text-center max-w-2xl mx-auto">
                    Before you decide to study in {city.title}, it helps to know your monthly budget for accommodation, food, transport and utilities. {city.title} offers a comfortable student lifestyle with easy access to university campuses, diverse housing costs, and modern amenities.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-night/10">
                          <th className="py-3 text-sm font-extrabold text-night uppercase tracking-wider">Category</th>
                          <th className="py-3 text-sm font-extrabold text-night uppercase tracking-wider">Average Monthly Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-night/5">
                        {city.livingCosts.map((item, idx) => (
                          <tr key={idx} className="hover:bg-pearl/50">
                            <td className="py-4 text-sm font-bold text-night">{item.category}</td>
                            <td className="py-4 text-sm text-tide/80">{item.cost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm sm:text-base leading-relaxed text-black text-center max-w-2xl mx-auto">
                    Your decision to study in {city.title} will also depend on tuition fees, which change by university and course. {city.title} combines academic excellence with affordability, making it a preferred choice for international students seeking value and quality.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-night/10">
                          <th className="py-3 text-sm font-extrabold text-night uppercase tracking-wider">Course</th>
                          <th className="py-3 text-sm font-extrabold text-night uppercase tracking-wider">Annual Fee Range</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-night/5">
                        {city.educationCosts.map((item, idx) => (
                          <tr key={idx} className="hover:bg-pearl/50">
                            <td className="py-4 text-sm font-bold text-night">{item.course}</td>
                            <td className="py-4 text-sm text-tide/80">{item.cost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

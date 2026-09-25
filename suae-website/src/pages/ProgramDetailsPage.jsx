import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Clock, DollarSign, Award, Calendar, ArrowLeft, CheckCircle, ArrowRight, Building, GraduationCap } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";
import { fetchFromNode } from "../utils/nodeApi";
import { OptimizedImage } from "../components/common/OptimizedImage";

const programDetailsMap = {
  "business management": {
    duration: "3-4 Years (UG), 1-2 Years (PG)",
    fees: "AED 50,000 - 90,000 / Year",
    requirements: "High School (60%+) or Bachelor's (2.5 GPA), IELTS 6.0",
    intake: "September / January",
    disciplines: ["Finance & Banking", "International Business", "Digital Marketing", "Human Resource Management", "Entrepreneurship"],
    careers: [
      { role: "Business Consultant", salary: "AED 12,000 - 22,000 / Month" },
      { role: "Marketing Manager", salary: "AED 15,000 - 25,000 / Month" },
      { role: "Financial Analyst", salary: "AED 14,000 - 24,000 / Month" },
      { role: "Project Manager", salary: "AED 16,000 - 28,000 / Month" }
    ],
    overview: "Business Management programs in the UAE are designed to prepare the next generation of global leaders. With Dubai being a major international business hub, students get unparalleled exposure to global trade, financial markets, and entrepreneurial ecosystems. The curriculum blends theoretical knowledge with practical case studies, internships, and networking opportunities.",
    highlights: [
      "AACSB or EQUIS accredited options available",
      "Direct access to Dubai's financial and tech startup hubs",
      "Internship opportunities with Fortune 500 companies",
      "Dual degree pathways with UK, US, or European universities"
    ],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80"
  },
  "engineering and technology": {
    duration: "4 Years (UG), 2 Years (PG)",
    fees: "AED 55,000 - 95,000 / Year",
    requirements: "Math & Physics background (70%+), IELTS 6.0",
    intake: "September / January",
    disciplines: ["Computer Science & AI", "Mechanical Engineering", "Civil & Structural Engineering", "Cyber Security", "Electrical & Electronics"],
    careers: [
      { role: "Software Engineer", salary: "AED 14,000 - 26,000 / Month" },
      { role: "Civil Engineer", salary: "AED 12,000 - 22,000 / Month" },
      { role: "AI & Machine Learning Specialist", salary: "AED 18,000 - 32,000 / Month" },
      { role: "Data Scientist", salary: "AED 16,000 - 28,000 / Month" }
    ],
    overview: "Engineering and Technology programs in the UAE sit at the forefront of the region's massive infrastructure and digital transformation. Students learn in state-of-the-art labs, focusing on smart cities, artificial intelligence, renewable energy, and advanced construction technologies. Programs are heavily aligned with global engineering standards and professional accreditations.",
    highlights: [
      "ABET accredited engineering programs",
      "Hands-on training in robotics, AI, and IoT labs",
      "Strong placement records in UAE's mega-projects and tech firms",
      "Collaborative research projects with government entities"
    ],
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1920&q=80"
  },
  "health sciences": {
    duration: "3-5 Years (UG), 2 Years (PG)",
    fees: "AED 60,000 - 110,000 / Year",
    requirements: "Biology & Chemistry background (75%+), IELTS 6.5",
    intake: "September",
    disciplines: ["Biomedical Sciences", "Psychology", "Public Health", "Physiotherapy", "Nursing"],
    careers: [
      { role: "Clinical Psychologist", salary: "AED 15,000 - 25,000 / Month" },
      { role: "Biomedical Researcher", salary: "AED 14,000 - 23,000 / Month" },
      { role: "Healthcare Administrator", salary: "AED 16,000 - 28,000 / Month" },
      { role: "Physiotherapist", salary: "AED 11,000 - 20,000 / Month" }
    ],
    overview: "Health Sciences programs in the UAE provide comprehensive, clinical, and research-focused education. As the UAE expands its world-class healthcare sector (including Dubai Healthcare City), there is an increasing demand for skilled medical researchers, psychologists, and healthcare administrators. Students benefit from clinical placements in leading hospitals and research centers.",
    highlights: [
      "Clinical placements in accredited hospitals and clinics",
      "State-of-the-art simulation labs and research centers",
      "Curriculum aligned with international medical councils",
      "Opportunities for research publications and global conferences"
    ],
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1920&q=80"
  },
  "media and communications": {
    duration: "3 Years (UG), 1-2 Years (PG)",
    fees: "AED 45,000 - 80,000 / Year",
    requirements: "High School (60%+), Portfolio (for design/media), IELTS 6.0",
    intake: "September / January",
    disciplines: ["Digital Media & Journalism", "Graphic & Web Design", "Public Relations & Advertising", "Film & Television Production", "Corporate Communications"],
    careers: [
      { role: "Digital Content Producer", salary: "AED 10,000 - 18,000 / Month" },
      { role: "PR & Communications Manager", salary: "AED 14,000 - 24,000 / Month" },
      { role: "Creative Director", salary: "AED 20,000 - 35,000 / Month" },
      { role: "Graphic Designer", salary: "AED 9,000 - 16,000 / Month" }
    ],
    overview: "Media and Communications programs in the UAE are closely integrated with Dubai's thriving creative economy, including Dubai Media City and Dubai Design District. The curriculum focuses on digital-first storytelling, creative design, strategic public relations, and multimedia production, preparing students for dynamic careers in the global media landscape.",
    highlights: [
      "Industry-standard studios (TV, Radio, and Design)",
      "Direct networking with global advertising and media agencies",
      "Participation in regional film festivals and design exhibitions",
      "Focus on digital marketing, social media, and content creation"
    ],
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80"
  }
};

export function ProgramDetailsPage({ content }) {
  const { title } = useParams();
  const decodedTitle = decodeURIComponent(title);

  // Hook into live preview data for programs and universities
  const programsData = usePreviewData("programs", content.programs);
  const universitiesData = usePreviewData("universities", content.universities);

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
        console.error("Failed to load database institutes on program details page:", err);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pearl py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-lagoon border-t-transparent"></div>
      </div>
    );
  }

  // Find program in CMS content, or build a dynamic fallback representation
  let program = programsData?.items?.find(
    (item) => item.title.toLowerCase() === decodedTitle.toLowerCase()
  );

  if (!program) {
    program = {
      title: decodedTitle,
      meta: "Specialized Course",
      copy: `Explore dynamic pathways, admission criteria, and academic specializations for ${decodedTitle} offered by leading institutes.`
    };
  }

  // Get details from our rich map, or fallback to defaults
  const fallbackDetails = programDetailsMap[decodedTitle.toLowerCase()] || {
    duration: "3 Years (UG) / 2 Years (PG)",
    fees: "Refer to specific institute guidelines",
    requirements: "High School or Bachelor's Degree depending on course career path",
    intake: "September / January",
    disciplines: [decodedTitle],
    careers: [
      { role: "Academic Specialist", salary: "Varies by sector" },
      { role: "Industry Advisor", salary: "Varies by sector" }
    ],
    overview: `This specialized program in ${decodedTitle} is designed to provide comprehensive theoretical and practical skills aligned with professional industry standards.`,
    highlights: [
      "Aligned with national academic qualifications",
      "Hands-on project work and training opportunities",
      "Career advising and placement support",
      "Interactive laboratory and seminar learning"
    ],
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80"
  };

  // Combine DB program details with fallbacks
  const details = {
    duration: program?.duration || fallbackDetails.duration,
    fees: program?.fees || fallbackDetails.fees,
    requirements: program?.requirements || fallbackDetails.requirements,
    intake: program?.intake || fallbackDetails.intake,
    disciplines: program?.disciplines && typeof program.disciplines === 'string' && program.disciplines.trim().length > 0
      ? program.disciplines.split(',').map(d => d.trim()).filter(Boolean)
      : (Array.isArray(program?.disciplines) && program.disciplines.length > 0 ? program.disciplines : fallbackDetails.disciplines),
    careers: program?.careers && program.careers.length > 0
      ? program.careers
      : fallbackDetails.careers,
    overview: program?.overview || program?.copy || fallbackDetails.overview,
    highlights: program?.highlights
      ? (typeof program.highlights === 'string' ? program.highlights.split('\n').map(h => h.trim()) : program.highlights)
      : fallbackDetails.highlights,
    image: program?.image || fallbackDetails.image
  };

  // Find matching universities (dynamic matching based on university's fullProgramsList or programs field)
  const matchingUniversities = cardsList.filter((uni) => {
    // 1. For database universities: require an exact course title match in their fullProgramsList
    if (uni.isDbInstitute || Array.isArray(uni.fullProgramsList)) {
      return Array.isArray(uni.fullProgramsList) && uni.fullProgramsList.some(
        p => p.title.toLowerCase() === decodedTitle.toLowerCase()
      );
    }

    // 2. For static/mock universities: require an exact match in their comma-separated list
    if (!uni.programs) return false;
    const cleanPrograms = uni.programs.split(",").map(p => p.trim().toLowerCase());
    return cleanPrograms.includes(decodedTitle.toLowerCase());
  });

  if (!program) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-pearl p-6 text-center">
        <h2 className="text-3xl font-bold text-night">Program Not Found</h2>
        <p className="mt-2 text-tide/70">The program you are looking for does not exist or has been removed.</p>
        <Link to="/" className="btn-yellow mt-6 px-6 py-3 text-sm rounded-md">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl">
      {/* Hero Section */}
      <div className="relative bg-night py-24 text-white lg:py-32 overflow-hidden">
        {/* Background Image with Dual Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          {/* Horizontal gradient for text legibility on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-night/85 via-night/30 to-transparent" />
          {/* Subtle bottom edge gradient to blend layout without fading image */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#faf9f6] to-transparent" />
        </div>

        <div className="section-shell relative z-10">
          <Link
            to="/programs"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/75 transition hover:text-white mb-6 group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Programs
          </Link>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sand/20 px-3 py-1 text-xs font-semibold text-sand border border-sand/30 uppercase tracking-wider">
              <GraduationCap size={14} />
              {program.meta}
            </span>
            <h1 className="mt-4 font-heading text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl text-white">
              {program.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              {program.copy}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="section-shell py-12">
        <div className="space-y-8">

          {/* Stats Grid */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-night/5 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lagoon/10 text-lagoon">
                <Clock size={20} />
              </div>
              <span className="mt-4 block text-xs font-semibold uppercase tracking-wider text-tide/60">Duration</span>
              <span className="mt-1 block text-sm font-bold text-night leading-tight">{details.duration}</span>
            </div>

            <div className="rounded-xl border border-night/5 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lagoon/10 text-lagoon">
                <DollarSign size={20} />
              </div>
              <span className="mt-4 block text-xs font-semibold uppercase tracking-wider text-tide/60">Average Fees</span>
              <span className="mt-1 block text-sm font-bold text-night leading-tight">{details.fees}</span>
            </div>

            <div className="rounded-xl border border-night/5 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lagoon/10 text-lagoon">
                <Award size={20} />
              </div>
              <span className="mt-4 block text-xs font-semibold uppercase tracking-wider text-tide/60">Requirements</span>
              <span className="mt-1 block text-xs font-bold text-night leading-tight">{details.requirements}</span>
            </div>

            <div className="rounded-xl border border-night/5 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lagoon/10 text-lagoon">
                <Calendar size={20} />
              </div>
              <span className="mt-4 block text-xs font-semibold uppercase tracking-wider text-tide/60">Next Intake</span>
              <span className="mt-1 block text-sm font-bold text-night leading-tight">{details.intake}</span>
            </div>
          </section>

          {/* Overview Section */}
          <section className="rounded-2xl border border-night/5 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="font-heading text-2xl font-bold text-night mb-4">Program Overview</h3>
            <p className="text-base leading-relaxed text-tide/80">
              {details.overview}
            </p>

            <h4 className="mt-6 font-heading text-lg font-bold text-night mb-3">Key Features</h4>
            <ul className="grid gap-3 sm:grid-cols-2">
              {details.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-tide/80">
                  <CheckCircle size={18} className="text-lagoon shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Specializations / Modules */}
          <section className="rounded-2xl border border-night/5 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="font-heading text-2xl font-bold text-night mb-4">Core Specializations</h3>
            <p className="text-sm text-tide/70 mb-6">Choose from a variety of elective pathways and focus areas:</p>
            <div className="flex flex-wrap gap-2.5">
              {details.disciplines.map((disc, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-lg bg-pearl px-4 py-2.5 text-sm font-semibold text-night border border-night/5 shadow-sm transition hover:border-lagoon/30 hover:bg-lagoon/5"
                >
                  {disc}
                </span>
              ))}
            </div>
          </section>

          {/* Career Outcomes */}
          <section className="rounded-2xl border border-night/5 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="font-heading text-2xl font-bold text-night mb-4">Career Opportunities</h3>
            <p className="text-sm text-tide/70 mb-6">Graduates in this field have a high placement rate in the UAE and globally. Typical career paths include:</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {details.careers.map((career, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-night/5 bg-pearl p-4 shadow-sm">
                  <div>
                    <span className="block font-semibold text-night">{career.role}</span>
                    <span className="mt-1 block text-xs text-tide/60">Average Starting Salary</span>
                  </div>
                  <span className="text-sm font-bold text-lagoon">{career.salary}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Dynamic Where to Study Section */}
          <section className="rounded-2xl border border-night/5 bg-white p-6 shadow-sm sm:p-8">
            <h3 className="font-heading text-2xl font-bold text-night mb-2 flex items-center gap-2">
              <Building size={24} className="text-lagoon" />
              Where to Study
            </h3>
            <p className="text-sm text-tide/70 mb-6">The following universities offer programs or courses related to {decodedTitle}:</p>

            {matchingUniversities.length > 0 ? (
              <div className="divide-y divide-night/5">
                {matchingUniversities.map((uni) => (
                  <div key={uni.name} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-night/5 border border-night/5">
                        <OptimizedImage src={uni.image} alt={uni.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-night leading-tight">{uni.name}</h4>
                        <p className="mt-1 text-xs text-tide/60 flex items-center gap-1">
                          <GraduationCap size={12} />
                          {uni.type} Institute • {uni.city}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/university/${encodeURIComponent(uni.name)}`}
                      className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-lg border border-[#FACC15]/40 px-3 py-2 text-xs font-bold text-[#b27b00] transition hover:bg-[#FACC15] hover:text-night hover:border-[#FACC15]"
                    >
                      View University
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-pearl p-6 text-center">
                <p className="text-sm italic text-tide/60">No specific matching universities found in our directory. Please submit an inquiry and an advisor will help you shortlist options.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

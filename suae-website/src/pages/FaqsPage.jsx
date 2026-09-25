import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Minus, HelpCircle, Search, X } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";

const fallbackFaqs = [
  {
    id: 1,
    category: "Admissions",
    question: "What are the general admission requirements for UAE universities?",
    answer: "For undergraduate programs, students generally need a High School Certificate (Grade 12) with a minimum score of 60% or equivalent. For postgraduate programs, a recognized Bachelor's degree with a minimum GPA of 2.5 on a 4.0 scale is required. English proficiency (IELTS 6.0 or TOEFL equivalent) is mandatory for most programs taught in English."
  },
  {
    id: 2,
    category: "Admissions",
    question: "When are the academic intakes in the UAE?",
    answer: "The primary intake is the Fall Semester (starting in September), with applications closing around July/August. The secondary intake is the Spring Semester (starting in January), with applications closing in November. Some universities also offer a minor Summer intake in May."
  },
  {
    id: 3,
    category: "Visas",
    question: "How do I get a student visa for the UAE?",
    answer: "Student visas are sponsored by the university you are admitted to. Once you accept an offer and pay the initial deposit, the university's visa cell will apply for your Entry Permit. Upon arrival in the UAE, you will undergo a medical fitness test, biometric capturing, and receive your Emirates ID and residence visa stamping."
  },
  {
    id: 4,
    category: "Visas",
    question: "Can I work part-time while studying in the UAE?",
    answer: "Yes! International students in the UAE are legally permitted to work part-time. The UAE Ministry of Human Resources and Emiratisation (MOHRE) allows university students to take part-time jobs (both on-campus and off-campus) provided they obtain a part-time work permit and a No Objection Certificate (NOC) from their university."
  },
  {
    id: 5,
    category: "Scholarships",
    question: "What types of scholarships are available?",
    answer: "There are three main types: 1) Merit-based scholarships (offered by universities ranging from 10% to 50% waiver on tuition fees based on high school or bachelor grades). 2) Government scholarships (for specific nationalities or research scholars). 3) Early bird discounts or sibling discounts. Most scholarships cover tuition fees only, not living expenses."
  },
  {
    id: 6,
    category: "Accommodation",
    question: "Is student housing provided by universities?",
    answer: "Many universities offer on-campus or partner student housing. Additionally, there are dedicated student residences in hubs like Dubai Academic City and JLT (e.g. Myriad, KSK Homes). Monthly costs for shared student accommodation range from AED 1,800 to AED 3,500 depending on the city and room type."
  }
];

export function FaqsPage({ content }) {
  const faqsData = usePreviewData("faqs", content?.faqs || fallbackFaqs);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openFaqId, setOpenFaqId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const list = new Set(faqsData.map((faq) => faq.category).filter(Boolean));
    return ["All", ...list];
  }, [faqsData]);

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const filteredFaqs = faqsData.filter((faq) => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (faq.category && faq.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lagoon/10 px-3 py-1 text-xs font-semibold text-lagoon uppercase tracking-wider">
            Help Center
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold text-night sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-base text-black leading-relaxed">
            Find quick answers to common queries regarding admissions eligibility, student visa sponsorships, work permit rules, and scholarship applications in the UAE.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-tide/50" size={18} />
            <input
              type="text"
              placeholder="Search questions or keywords..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenFaqId(null);
              }}
              className="w-full pl-11 pr-10 py-3.5 bg-white border border-night/5 rounded-xl shadow-sm text-sm focus:outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon/15 transition-all text-night placeholder-tide/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-tide/50 hover:text-night transition"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setOpenFaqId(null);
              }}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                selectedCategory === cat
                  ? "bg-[#FACC15] text-night shadow-md shadow-[#FACC15]/20"
                  : "bg-white border border-night/5 text-tide hover:bg-night/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-xl border border-night/5 bg-white shadow-sm overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-night transition hover:text-lagoon outline-none"
                >
                  <span className="flex items-center gap-3 pr-4 text-sm sm:text-base">
                    <HelpCircle size={18} className="text-tide/50 shrink-0" />
                    {faq.question}
                  </span>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-night/5 text-tide">
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </div>
                </button>
                
                {/* Answer Panel */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-60 border-t border-night/5" : "max-h-0"
                  } overflow-hidden`}
                >
                  <p className="p-5 text-xs sm:text-sm leading-relaxed text-black bg-pearl/30">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, Calendar, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";

const fallbackBlogs = [
  {
    id: 1,
    title: "How to Apply for a UAE Student Visa: A Complete Guide",
    category: "Visas",
    readTime: "5 min read",
    date: "June 28, 2026",
    excerpt: "Navigating the student visa process in the UAE is straightforward if you have the right documents. Learn about sponsorships, medical checks, and costs.",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    title: "Cost of Living in Dubai for International Students",
    category: "Finance",
    readTime: "7 min read",
    date: "June 25, 2026",
    excerpt: "Planning your budget? From student housing in Academic City to dining and transport, here is a realistic breakdown of monthly expenses in Dubai.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    title: "Top 5 Emerging Careers in the UAE for Graduates",
    category: "Careers",
    readTime: "4 min read",
    date: "June 20, 2026",
    excerpt: "With the rise of smart cities and digital transformation, certain fields are booming. Discover which degrees offer the best job placement rates.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    title: "Campus Life: Public vs Private Universities in UAE",
    category: "Student Life",
    readTime: "6 min read",
    date: "June 15, 2026",
    excerpt: "Unsure which type of institution fits you? Compare campus cultures, facilities, student groups, and global accreditations.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    title: "A Guide to English Proficiency Tests for UAE Admissions",
    category: "Admissions",
    readTime: "4 min read",
    date: "June 10, 2026",
    excerpt: "Do you need IELTS, TOEFL, or EmSAT? Understand the score requirements for top colleges in Dubai and Abu Dhabi.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    title: "Why Sharjah is the Cultural & Education Capital of UAE",
    category: "Destinations",
    readTime: "5 min read",
    date: "June 05, 2026",
    excerpt: "Explore the historic University City, museum hubs, and affordable student-friendly lifestyle in the cultural heart of the Emirates.",
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=600&q=80"
  }
];

const categories = ["All", "Visas", "Finance", "Careers", "Student Life", "Admissions", "Destinations"];

export function BlogsPage({ content }) {
  const blogsData = usePreviewData("blogs", content?.blogs || fallbackBlogs);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredBlogs = blogsData.filter((blog) => {
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const blogsPerPage = 6;
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  
  const currentBlogs = filteredBlogs.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
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
            Resources & Insights
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold text-night sm:text-5xl">
            Student Blogs & News
          </h1>
          <p className="mt-4 text-base text-tide/75 leading-relaxed">
            Get the latest updates on admissions, visa policies, cost of living breakdowns, and student experiences directly from our advisors and alumni.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-6 border-b border-night/5">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
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

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tide/50" size={16} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-xl border border-night/10 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-lagoon"
            />
          </div>
        </div>

        {/* Blogs Grid */}
        {currentBlogs.length > 0 ? (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {currentBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-night/5 bg-white shadow-sm transition hover:shadow-md hover:border-night/10"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="aspect-[16/10] overflow-hidden bg-night/5 relative">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-4 left-4 rounded-md bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-lagoon shadow-sm">
                        {blog.category}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="px-6 pt-6">
                      <div className="flex items-center gap-4 text-xs text-tide/60">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {blog.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {blog.readTime}
                        </span>
                      </div>

                      {/* Title */}
                      <Link to={`/resources/blogs/${blog.id}`}>
                        <h3 className="mt-4 font-heading text-lg font-bold text-night leading-snug group-hover:text-lagoon transition-colors">
                          {blog.title}
                        </h3>
                      </Link>
                      
                      {/* Excerpt */}
                      <p className="mt-3 text-xs leading-relaxed text-tide/75 line-clamp-3">
                        {blog.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Read More Link */}
                  <div className="px-6 pb-6 pt-5">
                    <Link
                      to={`/resources/blogs/${blog.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-lagoon group-hover:text-night transition-colors cursor-pointer"
                    >
                      Read Article
                      <BookOpen size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-night/10 bg-white text-tide hover:text-night hover:border-night/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition ${
                      currentPage === page
                        ? "bg-[#FACC15] text-night shadow-md shadow-yellow-400/20"
                        : "bg-white border border-night/10 text-tide hover:text-night hover:border-night/30"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-night/10 bg-white text-tide hover:text-night hover:border-night/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-night/5">
            <p className="text-sm text-tide/60 italic">No articles found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

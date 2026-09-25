import React, { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";
import { OptimizedImage } from "../components/common/OptimizedImage";

const fallbackTestimonials = {
  eyebrow: "Testimonials",
  title: "What Our Students Say",
  copy: "Hear from international students who successfully started their academic journeys in the UAE.",
  items: [
    {
      name: "Aditi Sharma",
      program: "MBA",
      university: "Heriot-Watt University Dubai",
      country: "India",
      quote: "Comparing campuses on this platform was a breeze. I could filter by intake periods and scholarships easily, which saved me weeks of research.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150"
    },
    {
      name: "Farooq Al-Jamil",
      program: "B.Sc. Civil Engineering",
      university: "American University of Sharjah",
      country: "Nigeria",
      quote: "The side-by-side comparison page is a lifesaver. Being able to compare fees and scholarship options directly made it clear which university fit my budget.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150"
    },
    {
      name: "Elena Rostova",
      program: "Master of International Business",
      university: "Wollongong University Dubai",
      country: "Kazakhstan",
      quote: "I appreciated the comprehensive visa guides and the prompt advice from the counselors. Transitioning to study in Dubai was smooth and stress-free.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"
    },
    {
      name: "Liam Henderson",
      program: "B.Sc. Computer Science",
      university: "University of Birmingham Dubai",
      country: "United Kingdom",
      quote: "Starting my degree in Dubai was a major step, but the platform gave me clear insights into student visas and work permits. Truly a game-changer!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150"
    },
    {
      name: "Mariam Al-Mansoor",
      program: "M.Sc. Finance",
      university: "Zayed University Abu Dhabi",
      country: "Saudi Arabia",
      quote: "The counselor assistance was highly professional. They helped me shortlist universities offering full merit scholarships for postgraduates.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150"
    }
  ]
};

export function TestimonialsSection({ testimonials: publishedTestimonials }) {
  const testimonials = usePreviewData("testimonials", publishedTestimonials || fallbackTestimonials);
  const items = testimonials.items || fallbackTestimonials.items;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [items.length]);

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
      setIsAnimating(false);
    }, 200);
  };

  const handlePrev = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
      setIsAnimating(false);
    }, 200);
  };

  if (items.length === 0) return null;
  const currentItem = items[activeIndex];
  const nextItem = items[(activeIndex + 1) % items.length];
  const thirdItem = items[(activeIndex + 2) % items.length];

  return (
    <section id="testimonials" className="section-defer bg-[linear-gradient(180deg,#f7f9fc_0%,#e9eef5_100%)] py-20 sm:py-24 overflow-hidden">
      <div className="section-shell">

        {/* Section Header */}
        <div className="max-w-3xl mb-12 text-center mx-auto">
          <p
            className="eyebrow uppercase tracking-[0.16em]"
            style={testimonials.eyebrowColor ? { color: testimonials.eyebrowColor } : {}}
          >
            {testimonials.eyebrow || fallbackTestimonials.eyebrow}
          </p>
          <h2
            className="mt-4 section-title text-night uppercase font-heading font-extrabold tracking-tight"
            style={testimonials.titleColor ? { color: testimonials.titleColor } : {}}
          >
            {testimonials.title || fallbackTestimonials.title}
          </h2>
          <p 
            className="mt-4 text-base text-tide leading-relaxed font-body max-w-2xl mx-auto"
            style={testimonials.copyColor ? { color: testimonials.copyColor } : {}}
          >
            {testimonials.copy || fallbackTestimonials.copy}
          </p>
        </div>

        {/* Sliding Testimonial Carousel */}
        <div className="relative mt-12 w-full px-1">

          {/* Chevron Buttons */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute -left-14 top-1/2 -translate-y-1/2 z-10 hidden xl:flex h-12 w-12 items-center justify-center rounded-full bg-white border border-night/5 text-tide hover:bg-[#FACC15] hover:text-night hover:border-[#FACC15] transition shadow-sm outline-none"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute -right-14 top-1/2 -translate-y-1/2 z-10 hidden xl:flex h-12 w-12 items-center justify-center rounded-full bg-white border border-night/5 text-tide hover:bg-[#FACC15] hover:text-night hover:border-[#FACC15] transition shadow-sm outline-none"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>

          {/* Testimonial Spotlight Cards (3 cards side-by-side) */}
          <div className={`grid gap-8 md:grid-cols-2 lg:grid-cols-3 transition-all duration-300 transform ${isAnimating ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"
            }`}>
            {[currentItem, nextItem, thirdItem].map((item, idx) => (
              <article
                key={idx}
                className="rounded-3xl border border-night/5 bg-white p-8 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[340px] transition duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Decorative Quote Icon */}
                <Quote className="absolute right-6 top-6 text-[#174a8b]/5 h-16 w-16 -rotate-12 pointer-events-none" />

                <div>
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: item.rating || 5 }).map((_, starIdx) => (
                      <Star key={starIdx} size={15} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote Text */}
                  <p className="text-sm leading-relaxed text-night italic font-body">
                    "{item.quote}"
                  </p>
                </div>

                {/* Profile metadata */}
                <div className="mt-8 pt-6 border-t border-night/5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-night/10 shadow-sm shrink-0 bg-night/5">
                    <OptimizedImage
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading text-sm font-extrabold text-night leading-none truncate">{item.name}</h4>
                    <p className="text-[10px] text-tide/80 font-semibold mt-1.5 leading-tight truncate">
                      {item.program} &bull; <span className="text-night font-bold">{item.university}</span>
                    </p>
                    <span className="inline-block mt-1.5 rounded bg-[#174a8b]/5 px-2 py-0.5 text-[9px] font-bold text-[#174a8b] uppercase tracking-wide">
                      {item.country}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setActiveIndex(i);
                    setIsAnimating(false);
                  }, 200);
                }}
                className={`h-2.5 transition-all duration-300 rounded-full ${activeIndex === i ? "w-8 bg-[#FACC15]" : "w-2.5 bg-tide/20 hover:bg-tide/45"
                  }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

// import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
// import { Link } from "react-router-dom";
// import { usePreviewData } from "../context/PreviewContext";

// const footerDefaults = {
//   title: "Popular Study Tracks",
//   summary: "Browse through the most searched study options across the UAE, then jump into colleges, courses, admissions, and student resources.",
//   spotlightTracks: ["B.Tech", "MBBS", "MBA/PGDM", "B.Com", "BCA/MCA", "Law", "Pharmacy", "Nursing", "Architecture", "Study Abroad"],
//   columns: [
//     {
//       title: "Top Colleges",
//       items: ["Medical Colleges", "Engineering Colleges", "MBA Colleges", "Law Colleges", "Pharmacy Colleges", "All Colleges"]
//     },
//     {
//       title: "Courses",
//       items: ["All Courses", "Medical & Healthcare", "Management", "Computer Applications", "Commerce & Finance", "Humanities"]
//     },
//     {
//       title: "Admissions",
//       items: ["Apply Now", "Study Abroad", "Events & Webinars", "Admission Insights", "Student Reviews", "FAQs"]
//     },
//     {
//       title: "Quick Links",
//       items: ["About Study in UAE", "Contact Us", "Latest News", "Testimonials", "College Directory", "Write a Review"]
//     }
//   ],
//   legalLinks: ["Privacy Policy", "Legal Information", "Refund Policy"],
//   copyright: "Copyright 2026 Study in UAE Scholarship. Landing page concept."
// };

// export function Footer({ brand: publishedBrand, footer: publishedFooter, onOpenConsultation }) {
//   const brand = usePreviewData("brand", publishedBrand);
//   const footer = usePreviewData("footer", publishedFooter);

//   const footerData = {
//     ...footerDefaults,
//     ...footer,
//     spotlightTracks: footer?.spotlightTracks?.length ? footer.spotlightTracks : footerDefaults.spotlightTracks,
//     columns: footer?.columns?.length ? footer.columns : (footer?.groups?.length ? footer.groups : footerDefaults.columns),
//     legalLinks: footer?.legalLinks?.length ? footer.legalLinks : footerDefaults.legalLinks
//   };

//   const getLinkHref = (columnTitle, item) => {
//     const cleanItem = item.trim().toLowerCase();

//     // Top Colleges Column
//     if (columnTitle === "Top Colleges") {
//       if (cleanItem.includes("medical")) return "/universities?program=Medical";
//       if (cleanItem.includes("engineering")) return "/universities?program=Engineering";
//       if (cleanItem.includes("mba")) return "/universities?program=MBA";
//       if (cleanItem.includes("law")) return "/universities?program=Law";
//       if (cleanItem.includes("pharmacy")) return "/universities?program=Pharmacy";
//       return "/universities";
//     }

//     // Courses Column
//     if (columnTitle === "Courses") {
//       if (cleanItem.includes("all")) return "/programs";
//       if (cleanItem.includes("medical")) return "/programs?category=Health";
//       if (cleanItem.includes("management")) return "/programs?category=Business";
//       if (cleanItem.includes("computer")) return "/programs?search=computing";
//       if (cleanItem.includes("commerce") || cleanItem.includes("finance")) return "/programs?category=Business";
//       return "/programs";
//     }

//     // Admissions Column
//     if (columnTitle === "Admissions") {
//       if (cleanItem.includes("events")) return "/resources/events";
//       if (cleanItem.includes("insights")) return "/resources/blogs";
//       if (cleanItem.includes("faqs")) return "/resources/faqs";
//       if (cleanItem.includes("reviews")) return "/#testimonials";
//       return null; // triggers Consultation Modal popup
//     }

//     // Quick Links Column
//     if (columnTitle === "Quick Links") {
//       if (cleanItem.includes("about")) return "/about-study-in-uae";
//       if (cleanItem.includes("contact")) return "/contact-us";
//       if (cleanItem.includes("news")) return "/resources/blogs";
//       if (cleanItem.includes("directory")) return "/universities";
//       if (cleanItem.includes("testimonials")) return "/#testimonials";
//       return "/";
//     }

//     return "/";
//   };

//   const getTrackHref = (track) => {
//     const cleanTrack = track.trim().toLowerCase();
//     if (cleanTrack.includes("b.tech")) return "/universities?program=Engineering";
//     if (cleanTrack.includes("mbbs")) return "/universities?program=Medical";
//     if (cleanTrack.includes("mba")) return "/universities?program=MBA";
//     if (cleanTrack.includes("b.com")) return "/universities?program=Business";
//     if (cleanTrack.includes("bca") || cleanTrack.includes("mca")) return "/universities?program=computing";
//     if (cleanTrack.includes("law")) return "/universities?program=Law";
//     if (cleanTrack.includes("pharmacy")) return "/universities?program=Pharmacy";
//     if (cleanTrack.includes("nursing")) return "/universities?program=Nursing";
//     if (cleanTrack.includes("architecture")) return "/universities?program=Architecture";
//     return "/universities";
//   };

//   return (
//     <footer id="footer" className="bg-white pt-6 text-[#17305d] sm:pt-8">
//       <div className="w-full border-t border-[#d8e4ec]">
//         <div className="border-b border-[#d8e4ec] bg-[linear-gradient(180deg,#f8fafd_0%,#e9eef5_100%)]">
//           <div className="mx-auto max-w-[1680px] px-6 py-6 sm:px-8 lg:px-12 xl:px-16">
//             <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
//               <div className="max-w-3xl">
//                 <h2 className="mt-3 font-heading text-[2rem] font-semibold tracking-tight text-[#182b67] sm:text-[2.5rem]">
//                   {footerData.title}
//                 </h2>
//                 <p className="mt-3 max-w-2xl text-sm leading-7 text-[#627594] sm:text-base">
//                   {footerData.summary}
//                 </p>
//               </div>
//             </div>
//             <div className="mt-6 flex flex-wrap gap-3">
//               {footerData.spotlightTracks.map((track) => (
//                 <Link
//                   key={track}
//                   to={getTrackHref(track)}
//                   className="inline-flex items-center gap-3 rounded-full border border-[#d7e0e9] bg-white px-4 py-2.5 text-sm font-semibold text-[#172a6b] shadow-[0_1px_8px_rgba(23,42,107,0.04)] transition hover:-translate-y-0.5 hover:border-[#FACC15] hover:text-[#EAB308]"
//                 >
//                   <span>{track}</span>
//                   <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dff8ff] text-[#48c4e0]">
//                     &rarr;
//                   </span>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="border-t border-[#d8e4ec] bg-[#f3f7fb]">
//           <div className="mx-auto max-w-[1680px] px-6 py-8 sm:px-8 lg:px-12 xl:px-16">
//             <div className="grid gap-10 lg:grid-cols-4">
//               {footerData.columns.map((column) => (
//                 <div key={column.title} className="min-w-0">
//                   <p className="text-[15px] font-extrabold tracking-tight text-[#182b67]">
//                     {column.title}
//                   </p>
//                   <div className="mt-4 grid gap-0.5">
//                     {column.items?.map((item) => {
//                       const href = getLinkHref(column.title, item);
//                       const isConsultation = !href || item === "Apply Now" || item === "Study Abroad";

//                       return isConsultation ? (
//                         <button
//                           key={item}
//                           type="button"
//                           onClick={onOpenConsultation}
//                           className="py-1 text-left text-[15px] leading-8 text-[#61769a] transition hover:text-[#174a8b]"
//                         >
//                           {item}
//                         </button>
//                       ) : (
//                         <Link
//                           key={item}
//                           to={href}
//                           className="py-1 text-[15px] leading-8 text-[#61769a] transition hover:text-[#174a8b]"
//                         >
//                           {item}
//                         </Link>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="border-t border-[#d8e4ec] bg-white">
//           <div className="mx-auto flex max-w-[1680px] flex-col gap-5 px-6 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12 xl:px-16">
//             <div className="flex flex-wrap items-center gap-3 text-[#6a7e9e]">
//               <p className="font-heading text-lg font-semibold text-[#172a6b]">{brand.name}</p>
//               <p className="text-sm">{footerData.copyright}</p>
//             </div>
//             <div className="flex flex-wrap items-center gap-4 text-[#6a7e9e]">
//               <div className="flex items-center gap-3">
//                 {[
//                   { icon: Facebook, label: "Facebook" },
//                   { icon: Instagram, label: "Instagram" },
//                   { icon: Linkedin, label: "LinkedIn" },
//                   { icon: Youtube, label: "YouTube" }
//                 ].map(({ icon: Icon, label }) => (
//                   <Link
//                     key={label}
//                     to="/"
//                     aria-label={label}
//                     className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8e4ec] text-[#182b67] transition hover:border-[#79d4ea] hover:text-[#174a8b]"
//                   >
//                     <Icon size={16} />
//                   </Link>
//                 ))}
//               </div>
//               <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
//                 {footerData.legalLinks.map((item) => (
//                   <Link key={item} to="/" className="transition hover:text-[#174a8b]">
//                     {item}
//                   </Link>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }





import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { usePreviewData } from "../context/PreviewContext";
import "./Footer.css";

const footerDefaults = {
  title: "Popular Study Tracks",
  summary:
    "Browse through the most searched study options across the UAE, then jump into colleges, courses, admissions, and student resources.",
  spotlightTracks: [
    "B.Tech",
    "MBBS",
    "MBA/PGDM",
    "B.Com",
    "BCA/MCA",
    "Law",
    "Pharmacy",
    "Nursing",
    "Architecture",
    "Study Abroad"
  ],
  columns: [
    {
      title: "Top Colleges",
      items: [
        "Medical Colleges",
        "Engineering Colleges",
        "MBA Colleges",
        "Law Colleges",
        "Pharmacy Colleges",
        "All Colleges"
      ]
    },
    {
      title: "Courses",
      items: [
        "All Courses",
        "Medical & Healthcare",
        "Management",
        "Computer Applications",
        "Commerce & Finance",
        "Humanities"
      ]
    },
    {
      title: "Admissions",
      items: [
        "Apply Now",
        "Study Abroad",
        "Events & Webinars",
        "Admission Insights",
        "Student Reviews",
        "FAQs"
      ]
    },
    {
      title: "Quick Links",
      items: [
        "About Study in UAE",
        "Contact Us",
        "Latest News",
        "Testimonials",
        "College Directory",
        "Write a Review"
      ]
    }
  ],
  legalLinks: ["Privacy Policy", "Legal Information", "Refund Policy"],
  copyright: "Copyright 2026 Study in UAE Scholarship. Landing page concept."
};

export function Footer({ brand: publishedBrand, footer: publishedFooter, onOpenConsultation }) {
  const brand = usePreviewData("brand", publishedBrand);
  const footer = usePreviewData("footer", publishedFooter);

  const footerData = {
    ...footerDefaults,
    ...footer,
    spotlightTracks: footer?.spotlightTracks?.length
      ? footer.spotlightTracks
      : footerDefaults.spotlightTracks,
    columns: footer?.columns?.length
      ? footer.columns
      : footer?.groups?.length
        ? footer.groups
        : footerDefaults.columns,
    legalLinks: footer?.legalLinks?.length ? footer.legalLinks : footerDefaults.legalLinks
  };

  const getLinkHref = (columnTitle, item) => {
    const cleanItem = item.trim().toLowerCase();

    if (columnTitle === "Top Colleges") {
      if (cleanItem.includes("medical")) return "/universities?program=Medical";
      if (cleanItem.includes("engineering")) return "/universities?program=Engineering";
      if (cleanItem.includes("mba")) return "/universities?program=MBA";
      if (cleanItem.includes("law")) return "/universities?program=Law";
      if (cleanItem.includes("pharmacy")) return "/universities?program=Pharmacy";
      return "/universities";
    }

    if (columnTitle === "Courses") {
      if (cleanItem.includes("all")) return "/programs";

      if (cleanItem.includes("medical") || cleanItem.includes("health")) {
        return "/programs?search=medical";
      }

      if (cleanItem.includes("management")) {
        return "/programs?category=Business";
      }

      if (cleanItem.includes("computer") || cleanItem.includes("application")) {
        return "/programs?search=computer";
      }

      if (cleanItem.includes("commerce") || cleanItem.includes("finance")) {
        return "/programs?category=Business";
      }

      if (cleanItem.includes("humanities")) {
        return "/programs?search=humanities";
      }

      return `/programs?search=${encodeURIComponent(item)}`;
    }

    if (columnTitle === "Admissions") {
      if (cleanItem.includes("events")) return "/resources/events";
      if (cleanItem.includes("insights")) return "/resources/blogs";
      if (cleanItem.includes("faqs")) return "/resources/faqs";
      if (cleanItem.includes("reviews")) return "/#testimonials";
      return null;
    }

    if (columnTitle === "Quick Links") {
      if (cleanItem.includes("about")) return "/about-study-in-uae";
      if (cleanItem.includes("contact")) return "/contact-us";
      if (cleanItem.includes("news")) return "/resources/blogs";
      if (cleanItem.includes("directory")) return "/universities";
      if (cleanItem.includes("testimonials")) return "/#testimonials";
      if (cleanItem.includes("review")) return "/write-review";
      return "/";
    }

    return "/";
  };

  const getTrackHref = (track) => {
    const cleanTrack = track.trim().toLowerCase();

    if (cleanTrack.includes("b.tech")) return "/universities?program=Engineering";
    if (cleanTrack.includes("mbbs")) return "/universities?program=Medical";
    if (cleanTrack.includes("mba")) return "/universities?program=MBA";
    if (cleanTrack.includes("b.com")) return "/universities?program=Business";
    if (cleanTrack.includes("bca") || cleanTrack.includes("mca")) return "/universities?program=computing";
    if (cleanTrack.includes("law")) return "/universities?program=Law";
    if (cleanTrack.includes("pharmacy")) return "/universities?program=Pharmacy";
    if (cleanTrack.includes("nursing")) return "/universities?program=Nursing";
    if (cleanTrack.includes("architecture")) return "/universities?program=Architecture";

    return "/universities";
  };

  return (
    <footer id="footer" className="suae-footer">
      <div className="suae-footer-shell">
        <div className="suae-footer-hero">
          <div className="suae-footer-hero-content">
            <span className="suae-footer-eyebrow">Study in UAE Scholarship</span>

            <h2>{footerData.title}</h2>

            <p>{footerData.summary}</p>
          </div>

          <div className="suae-footer-hero-card">
            <span>Need expert guidance?</span>
            <strong>Find universities, programs, and admission options in one place.</strong>

            <button type="button" onClick={onOpenConsultation} className="suae-footer-main-cta">
              Apply Now
              <span>→</span>
            </button>
          </div>
        </div>

        <div className="suae-footer-tracks">
          {footerData.spotlightTracks.map((track) => (
            <Link key={track} to={getTrackHref(track)} className="suae-footer-track-pill">
              <span>{track}</span>
              <i>→</i>
            </Link>
          ))}
        </div>

        <div className="suae-footer-content">
          <div className="suae-footer-brand-card">
            {/* <div className="suae-footer-brand-mark">
              {(brand?.name || "Study in UAE").slice(0, 2).toUpperCase()}
            </div> */}
            <div className="suae-footer-socials">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Instagram, label: "Instagram" },
                { icon: Linkedin, label: "LinkedIn" },
                { icon: Youtube, label: "YouTube" }
              ].map(({ icon: Icon, label }) => (
                <Link key={label} to="/" aria-label={label}>
                  <Icon size={16} />
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-[#d8e4ec] bg-[#f3f7fb]">
            <div className="mx-auto max-w-[1680px] px-6 py-8 sm:px-8 lg:px-12 xl:px-16">
              <div className="grid gap-10 lg:grid-cols-4">
                {footerData.columns.map((column) => (
                  <div key={column.title} className="min-w-0">
                    <p className="text-[15px] font-extrabold tracking-tight text-[#182b67]">
                      {column.title}
                    </p>

                    <div className="mt-4 grid gap-0.5">
                      {column.items?.map((item) => {
                        const href = getLinkHref(column.title, item);

                        const isWriteReview = item
                          .trim()
                          .toLowerCase()
                          .includes("review");

                        const isConsultation =
                          !href ||
                          item === "Apply Now" ||
                          item === "Study Abroad";

                        if (isWriteReview) {
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                alert("Please login to write a review");
                                window.location.href =
                                  import.meta.env.VITE_STUDENT_LOGIN_URL || "/student-login";
                              }}
                              className="py-1 text-left text-[15px] leading-8 text-[#61769a] transition hover:text-[#174a8b]"
                            >
                              {item}
                            </button>
                          );
                        }

                        return isConsultation ? (
                          <button
                            key={item}
                            type="button"
                            onClick={onOpenConsultation}
                            className="py-1 text-left text-[15px] leading-8 text-[#61769a] transition hover:text-[#174a8b]"
                          >
                            {item}
                          </button>
                        ) : (
                          <Link
                            key={item}
                            to={href}
                            className="py-1 text-[15px] leading-8 text-[#61769a] transition hover:text-[#174a8b]"
                          >
                            {item}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="suae-footer-bottom">
          <p>{footerData.copyright}</p>

          <div className="suae-footer-legal">
            {footerData.legalLinks.map((item) => (
              <Link key={item} to="/">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div >
    </footer >
  );
}
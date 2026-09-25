export const homepageContent = {
  brand: {
    name: "Study in UAE Scholarship",
    strapline: "Find universities, programs, scholarships, and guided admissions across the UAE.",
    logoShort: "SIS",
    logoSub: "UAE admissions platform"
  },
  header: {
    loginStudent: { label: "Student Login", href: "http://localhost:3000/student-login" },
    loginInstitution: { label: "Institution Login", href: "http://localhost:3000/institute-login" },
    applyCta: { label: "Apply Now", href: "#advisors" }
  },
  navigation: [
    { label: "Universities", href: "#universities" },
    { label: "Programs", href: "#programs" },
    { label: "Study in UAE", href: "#intro" },
    { label: "Resources", href: "#" }
  ],
  hero: {
    background: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2200&q=85",
    eyebrow: "Study in UAE",
    badge: "#1 Study Destination in the Middle East",
    title: "Find Your Dream University in UAE",
    copy: "Discover top programs across Dubai, Abu Dhabi, Sharjah and beyond. Compare options and apply seamlessly.",
    layout: "full-width",
    showSearch: true,
    showPopularCities: true,
    showSocialProof: true,
    primaryCta: { label: "Start My Journey", href: "#advisors" },
    secondaryCta: { label: "Explore Universities", href: "#universities" },
    search: {
      title: "Find your best-fit UAE pathway",
      placeholder: "Search universities, programs, or courses...",
      fields: [
        { label: "I want to get a", value: "Under Graduate" },
        { label: "in", value: "Business and Management" },
        { label: "city", value: "Dubai" }
      ],
      button: "Search"
    },
    popularCities: ["All Cities", "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"],
    socialProof: {
      title: "12,000+ Students",
      copy: "Enrolled through our platform"
    },
    seo: {
      title: "Study in UAE | Find Universities & Programs",
      description: "Discover top universities, programs, scholarships, and guided admissions in the UAE.",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"
    },
    stats: [
      { value: "7", label: "UAE study cities" },
      { value: "500+", label: "future programs" },
      { value: "1:1", label: "advisor support" }
    ]
  },
  consultation: {
    title: "Apply Now to Your Dream University in the UAE",
    copy: "Share your details and our admissions team will help you shortlist universities, compare programs, and plan your next step.",
    logoLetter: "S",
    studyFromPrefix: "Study From",
    studyFromSuffix: "UAE",
    benefits: ["Compare Universities", "Apply Directly", "Expert Guidance"],
    form: {
      fields: [
        { name: "fullName", label: "Full Name", placeholder: "Enter full name", required: true, type: "text" },
        { name: "email", label: "Email ID", placeholder: "Enter email ID", required: true, type: "email" },
        { name: "mobile", label: "Mobile / WhatsApp Number", placeholder: "Enter country code and mobile number", required: true, type: "tel" },
        {
          name: "country",
          label: "Country of Residence",
          placeholder: "Select country",
          required: true,
          type: "select",
          options: ["India", "Pakistan", "Nepal", "Bangladesh", "Nigeria", "Kenya", "Ghana", "Egypt", "Saudi Arabia", "Other"]
        },
        {
          name: "studyLevel",
          label: "Preferred Study Level",
          placeholder: "Select study level",
          required: true,
          type: "select",
          options: ["Foundation", "Undergraduate", "Postgraduate", "MBA", "PhD"]
        },
        {
          name: "course",
          label: "Interested Course",
          placeholder: "Select course",
          required: true,
          type: "select",
          options: ["Business and Management", "Computer Science and AI", "Engineering and Technology", "Health Sciences", "Design and Architecture", "Law and Policy", "Hospitality and Tourism"]
        },
        {
          name: "reference",
          label: "Reference By",
          placeholder: "Friend, counsellor, campaign, etc.",
          required: false,
          type: "text"
        },
        {
          name: "message",
          label: "Applicant Message",
          placeholder: "Write your question, preferred university, budget, intake, or any important admission note.",
          required: true,
          type: "textarea",
          fullWidth: true
        }
      ],
      consentPrefix: "I authorize Study in UAE Scholarship to contact me via call, email, SMS, or WhatsApp and agree to the",
      termsLink: "Terms",
      andWord: "&",
      privacyLink: "Privacy Policy",
      consentSuffix: ".",
      submitButton: "Apply Now"
    },
    sidebar: {
      title: "What you get",
      badge: "Free",
      items: [
        { label: "University shortlist", value: "Dubai, Sharjah, Abu Dhabi" },
        { label: "Program fit review", value: "Career and budget based" },
        { label: "Scholarship overview", value: "Subject to university" }
      ]
    }
  },
  supportRails: {
    sideButtons: [
      { label: "Technical Support", href: "#advisors" },
      { label: "Free Consultation", href: "#advisors" }
    ],
    whatsappLink: "#advisors",
    whatsappColor: "#1ba39c",
    bottomPopup: {
      href: "#advisors",
      logoLetter: "S",
      title: "Study From UAE",
      copy: "Stop scrolling. Let me help you."
    }
  },
  universityStrip: {
    eyebrow: "Popular UAE campuses",
    copy: "Compare popular Dubai and UAE campuses before you shortlist.",
    items: [
      "Canadian University Dubai",
      "American University in Dubai",
      "University of Dubai",
      "Heriot-Watt University Dubai",
      "University of Birmingham Dubai"
    ]
  },
  intro: {
    eyebrow: "QS-ranked UAE leaders",
    title: "Top Universities in the UAE",
    universities: [
      {
        rank: 1,
        name: "Khalifa University",
        city: "Abu Dhabi",
        note: "Research-led flagship with strong engineering, AI, and health science depth.",
        logo: "https://www.timeshighereducation.com/sites/default/files/styles/medium/public/khalifa_logo.jpg?itok=8A0MFeNe"
      },
      {
        rank: 2,
        name: "United Arab Emirates University",
        city: "Al Ain",
        note: "The UAE's national university with broad academics and a large residential campus.",
        logo: "https://www.houbarafund.gov.ae/sites/default/files/2024-05/UAEU%20English_0.jpg"
      },
      {
        rank: 3,
        name: "American University of Sharjah",
        city: "Sharjah",
        note: "Internationally recognized for architecture, design, engineering, and business.",
        logo: "https://www.crystalpng.com/wp-content/uploads/2025/03/american-university-of-sharjah-logo.png"
      }
    ]
  },
  cities: [
    {
      name: "Dubai",
      eyebrow: "The Global Metropolis",
      tagline: "Study in a hyper-connected global business hub offering endless career energy and a cosmopolitan lifestyle.",
      overview: "Dubai is one of the world's most dynamic cities, attracting students from over 150 countries with dedicated academic zones and strong international campuses.",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
      programsCount: "855+",
      sliqScore: "4.5",
      costOfEducation: "High",
      dailyLife: "Dubai offers student accommodation in modern residential towers or dedicated student hubs like Myriad.",
      culture: "From the historic Al Fahidi district to the futuristic Museum of the Future, Dubai blends heritage with modern energy.",
      socialLife: "Students enjoy beaches, shopping malls, dining and networking hubs like DIFC and Internet City."
    },
    {
      name: "Abu Dhabi",
      eyebrow: "The UAE's Capital of Innovation",
      tagline: "Study in a secure, futuristic capital city that blends world-class research with rich Arabian hospitality.",
      overview: "Abu Dhabi is a major center for research, technology and cultural landmarks, with campuses like NYU Abu Dhabi and Khalifa University.",
      image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80",
      programsCount: "310+",
      sliqScore: "4.3",
      costOfEducation: "High",
      dailyLife: "Students live in modern residences with strong public infrastructure and safe urban planning.",
      culture: "The city hosts the Louvre Abu Dhabi and the Saadiyat Cultural District.",
      socialLife: "Social life includes Yas Island, Corniche Beach and a calmer but upscale student lifestyle."
    },
    {
      name: "Sharjah",
      eyebrow: "The Cultural & Education Capital",
      tagline: "Experience academic excellence in a city rich with heritage, art, and student-friendly communities.",
      overview: "Sharjah is widely recognized as the cultural and educational hub of the UAE, anchored by University City.",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      programsCount: "240+",
      sliqScore: "4.2",
      costOfEducation: "Medium",
      dailyLife: "Student life revolves around University City and connected districts.",
      culture: "Home to museums, art spaces and the Sharjah International Book Fair.",
      socialLife: "A safe, family-friendly atmosphere with cafes, waterfront spots and campus communities."
    }
  ],
  universities: {
    eyebrow: "Explore Top Universities",
    title: " Featured Universities",
    copy: "",
    filters: ["All Courses", "Business Administration", "Computer Engineering", "Mechanical Engineering", "Civil Engineering", "Law", "Health Science", "Media and Communication"],
    labels: {
      courses: "Courses Offered",
      type: "Institute Type",
      intake: "Intake",
      scholarship: "Scholarship",
      programs: "Popular programs",
      cta: "Know More"
    },
    cards: [
      {
        name: "Canadian University Dubai",
        city: "Dubai",
        courses: "34+",
        type: "Private",
        intake: "Sep / Jan",
        scholarship: "Merit-based support available",
        programs: "Business, computing, design",
        note: "Strong fit for globally mobile students who want a western-style campus in Dubai.",
        image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80",
        isFeatured: true
      },
      {
        name: "American University in Dubai",
        city: "Dubai",
        courses: "28+",
        type: "Private",
        intake: "Sep / Jan",
        scholarship: "Need-based and merit options",
        programs: "Media, business, architecture",
        note: "A good choice for students looking for a balance of academics and campus culture.",
        image: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=900&q=80",
        isFeatured: true
      },
      {
        name: "British University in Dubai",
        city: "Dubai",
        courses: "35+",
        type: "Private",
        intake: "Sep / Feb",
        scholarship: "Selected tuition discounts",
        programs: "Engineering, management, AI",
        note: "Ideal if the student wants UK-linked academic credibility and specialized pathways.",
        image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80",
        isFeatured: true
      },
      {
        name: "University of Dubai",
        city: "Dubai",
        courses: "19+",
        type: "Private",
        intake: "Fall / Spring",
        scholarship: "Fee support on selected programs",
        programs: "Law, business, IT",
        note: "Compact, career-focused, and easy to compare for students who want a sharper path.",
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80",
        isFeatured: true
      }
    ]
  },
  programs: {
    eyebrow: "Top Study Programs",
    title: "Find Your Perfect Stream & Course",
    copy: "Search from hundreds of streams and courses across top scholarship-friendly colleges and universities.",
    items: [
      {
        title: "Business Management",
        meta: "Undergraduate and postgraduate",
        copy: "For students targeting management, entrepreneurship, global trade, finance, and marketing careers."
      },
      {
        title: "Engineering and Technology",
        meta: "High-demand UAE pathways",
        copy: "Civil, mechanical, electrical, computer, and emerging technology programs tied to the region's infrastructure growth."
      },
      {
        title: "Health Sciences",
        meta: "Career-focused programs",
        copy: "Health, psychology, biomedical, and allied science options for students seeking stable global careers."
      }
    ]
  },
  featured: {
    eyebrow: "Featured Campus",
    title: "Premium institute showcases should feel like a decision page, not a brochure block.",
    copy: "When an institute pays for visibility, this area can show campus media, course strengths, application CTAs, counselor notes, and direct inquiry mapping.",
    cta: { label: "Start Your Application", href: "#advisors" },
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1400&q=85",
    highlights: [
      "Program cards connected to real institute courses",
      "Application CTA mapped to the correct widget form",
      "Scholarship and fee notes controlled from CMS",
      "City, ranking, intake, and document requirements visible upfront"
    ]
  },
  testimonials: {
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
      }
    ]
  },
  footer: {
    title: "Popular Study Tracks",
    summary: "Browse through the most searched study options across the UAE, then jump into colleges, courses, admissions, and student resources.",
    spotlightTracks: ["B.Tech", "MBBS", "MBA/PGDM", "B.Com", "BCA/MCA", "Law", "Pharmacy", "Nursing", "Architecture", "Study Abroad"],
    columns: [
      {
        title: "Top Colleges",
        items: ["Medical Colleges", "Engineering Colleges", "MBA Colleges", "Law Colleges", "Pharmacy Colleges", "All Colleges"]
      },
      {
        title: "Courses",
        items: ["All Courses", "Medical & Healthcare", "Management", "Computer Applications", "Commerce & Finance", "Humanities"]
      },
      {
        title: "Admissions",
        items: ["Apply Now", "Study Abroad", "Events & Webinars", "Admission Insights", "Student Reviews", "FAQs"]
      },
      {
        title: "Quick Links",
        items: ["About Study in UAE", "Contact Us", "Latest News", "Testimonials", "College Directory", "Write a Review"]
      }
    ],
    legalLinks: ["Privacy Policy", "Legal Information", "Refund Policy"],
    copyright: "Copyright 2026 Study in UAE Scholarship. Landing page concept."
  },
  about: {
    heroTitle: "About Study in UAE",
    heroSubtitle: "Discover the academic pathways, lifestyle, and scholarship options that make the UAE a global education hub.",
    heroImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    introTitle: "Why Choose the UAE for Higher Education?",
    introText: "The United Arab Emirates has rapidly established itself as a world-class educational hub, hosting international branch campuses of top-tier universities from the UK, USA, Canada, Australia, and beyond. This unique academic environment offers students the prestigious credentials of a Western degree combined with the dynamic career exposure of the Middle East's primary trade and technology centers.",
    highlights: [
      { title: "Western Degree Standards", description: "Graduate with certified degrees from UK, US, and Canadian institutions." },
      { title: "Early Career Hubs", description: "Gain internships and post-graduation placements in Dubai and Abu Dhabi." },
      { title: "Vibrant Campus Life", description: "Study in dedicated student communities like Academic City and JLT." }
    ],
    sections: [
      {
        title: "Intake & Application Cycles",
        content: "Most universities in the UAE operate on two main intake semesters: Fall (September) and Spring (January). Standard applications should be submitted at least 2-3 months prior to the start of the semester to allow sufficient time for document evaluation and student visa processing."
      },
      {
        title: "Student Visa & Sponsorship",
        content: "Student visa sponsorship is fully facilitated by the host university upon academic acceptance and payment of relevant registration fees. Visas are issued for 12 months at a time and are renewed annually subject to continued enrollment and satisfactory academic progress."
      }
    ]
  },
  contact: {
    heroTitle: "Contact Our Advisors",
    heroSubtitle: "Get direct answers about admission requirements, dynamic fee structures, document checklists, and local student sponsorships.",
    heroImage: "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=1200&q=80",
    email: "admissions@studyindiascholarship.com",
    phone: "+971 4 123 4567",
    address: "Dubai Knowledge Park, Block 10, Dubai, United Arab Emirates",
    workingHours: "Monday - Friday: 9:00 AM - 6:00 PM"
  }
};

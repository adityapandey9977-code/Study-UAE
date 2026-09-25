export const initialData = {
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
    layout: "full-width",
    alignment: "center",
    overlayOpacity: 70,
    accentColor: "#7fb2e5",
    eyebrow: "Study in UAE",
    badge: "#1 Study Destination in the Middle East",
    title: "Find Your Dream University in UAE",
    copy: "Discover top programs across Dubai, Abu Dhabi, Sharjah and beyond. Compare options and apply seamlessly.",
    primaryCta: { label: "Start My Journey", href: "#advisors" },
    secondaryCta: { label: "Explore Universities", href: "#universities" },
    popularLabel: "Popular:",
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
      copy: "Enrolled through our platform",
      avatars: [
        "https://randomuser.me/api/portraits/men/32.jpg",
        "https://randomuser.me/api/portraits/women/44.jpg",
        "https://randomuser.me/api/portraits/men/41.jpg",
        "https://randomuser.me/api/portraits/women/68.jpg"
      ]
    },
    sidebarContent: {
      eyebrow: "Why students pick us",
      title: "Expert guidance for every step of your UAE journey",
      copy: "From choosing the right university to planning your visa and arrival, this section adapts to a more editorial, high-conversion sidebar layout.",
      highlights: ["Personalized shortlist", "Scholarship support", "Fast application help"],
      ctaLabel: "Get Started",
      ctaHref: "#advisors"
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
        { 
          name: "fullName",  
          label: "Full Name", 
          placeholder: "Enter full name", 
          required: true, 
          type: "text" 
        },
        { 
          name: "email", 
          label: "Email ID", 
          placeholder: "Enter email ID", 
          required: true, 
          type: "email" 
        },
        {
          name: "country",
          label: "Country of Residence",
          placeholder: "Select country",
          required: true,
          type: "select",
          options: ["India", "Pakistan", "Nepal", "Bangladesh", "Nigeria", "Kenya", "Ghana", "Egypt", "Saudi Arabia", "Other"]
        },
        { 
          name: "mobile", 
          label: "Mobile / WhatsApp Number", 
          placeholder: "Enter country code and mobile number", 
          required: true, 
          type: "tel" 
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
  contact: {
    heroTitle: "Get in touch with Study in UAE",
    heroSubtitle: "Our advisors can guide you through university selection, scholarships and application steps.",
    heroImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80",
    badge: "Support Center",
    layout: "full-width",
    alignment: "left",
    accentColor: "#7fb2e5",
    overlayOpacity: 60,
    backgroundColor: "#10233f",
    sidebar: {
      title: "Need personalised guidance?",
      copy: "Our advisors can help compare campuses, admissions timelines, and tuition options.",
      highlights: ["University shortlist", "Scholarship help", "Application support"],
      ctaLabel: "Contact an advisor",
      ctaHref: "/contact-us",
      lockOnHover: true
    },
    email: "info@studyinuae.com",
    phone: "+971 4 000 0000",
    address: "Office 101, Knowledge Park, Dubai, UAE",
    workingHours: "Mon-Fri: 9am - 6pm"
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
      socialLife: "Students enjoy beaches, shopping malls, dining and networking hubs like DIFC and Internet City.",
      livingCosts: [
        { category: "Accommodation", cost: "AED 3,000 - AED 5,500" },
        { category: "Food", cost: "AED 900 - AED 1,500" }
      ],
      educationCosts: [
        { course: "Engineering", cost: "AED 55,000 - AED 160,000" },
        { course: "Business Studies", cost: "AED 35,000 - AED 120,000" }
      ]
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
      socialLife: "Social life includes Yas Island, Corniche Beach and a calmer but upscale student lifestyle.",
      livingCosts: [
        { category: "Accommodation", cost: "AED 2,800 - AED 4,800" },
        { category: "Food", cost: "AED 850 - AED 1,400" }
      ],
      educationCosts: [
        { course: "Engineering", cost: "AED 50,000 - AED 150,000" },
        { course: "Business Studies", cost: "AED 30,000 - AED 110,000" }
      ]
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
      socialLife: "A safe, family-friendly atmosphere with cafes, waterfront spots and campus communities.",
      livingCosts: [
        { category: "Accommodation", cost: "AED 2,200 - AED 3,500" },
        { category: "Food", cost: "AED 750 - AED 1,200" }
      ],
      educationCosts: [
        { course: "Engineering", cost: "AED 45,000 - AED 140,000" },
        { course: "Business Studies", cost: "AED 25,000 - AED 100,000" }
      ]
    }
  ],
  universities: {
    eyebrow: "Explore Top Universities",
    title: "Compare UAE campuses by city, courses offered, and institute type.",
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
        image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80"
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
        image: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=900&q=80"
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
  cityLife: {
    eyebrow: "Dubai Student Life",
    title: "A student day here is not only campus, it is city access.",
    copy: "Students compare the city almost as much as the course. This section is written for that decision: what they do after class, where they meet people, and how career exposure starts early.",
    image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1400&q=85",
    blocks: [
      {
        title: "Daily Life",
        copy: "Classes, metro-connected districts, evening study spots, student events, and weekend plans all sit close together."
      },
      {
        title: "Culture and Entertainment",
        copy: "Global Village, Al Seef, La Mer, exhibitions, concerts, food streets, and safe public spaces make settling in easier."
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
        quote: "Comparing campuses on this platform was a breeze. I could filter by intake periods and scholarships easily.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150"
      },
      {
        name: "Farooq Al-Jamil",
        program: "B.Sc. Civil Engineering",
        university: "American University of Sharjah",
        country: "Nigeria",
        quote: "The side-by-side comparison page made it clear which university fit my budget.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150"
      }
    ]
  },
  advisors: {
    eyebrow: "Find out more",
    title: "Fill in your details to contact one of our academic advisors.",
    copy: "The form is static for now, but the layout is ready to be replaced by generated widget code or CMS-controlled fields.",
    communicationTitle: "Preferred communication",
    communications: ["Email", "WhatsApp"],
    form: {
      fields: ["Full Name", "Email Address", "Phone / WhatsApp", "Preferred Degree", "Interested Course", "Preferred City"],
      messageLabel: "Message",
      messagePlaceholder: "Tell us your intake, budget, or preferred university.",
      submitButton: "Submit Inquiry"
    }
  },
  pageSettings: {
    landingPage: {
      label: "Landing Page",
      slug: "/",
      layout: "full-width",
      sidebarPosition: "right",
      seo: {
        title: "Study in UAE | Find Universities & Programs",
        description: "Discover top universities, programs, scholarships, and guided admissions in the UAE.",
        keywords: "study in UAE, universities in UAE, scholarships UAE",
        canonicalUrl: "https://studyinuae.com/",
        ogTitle: "Study in UAE | Find Universities & Programs",
        ogDescription: "Explore the best universities, scholarships, and admissions support in the UAE.",
        ogImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"
      }
    },
    aboutPage: {
      label: "About Page",
      slug: "/about-study-in-uae",
      layout: "full-width",
      sidebarPosition: "right",
      seo: {
        title: "About Study in UAE | Admissions Guidance",
        description: "Learn about Study in UAE and how we help students discover programs and universities across the UAE.",
        keywords: "about study in UAE, admissions guidance",
        canonicalUrl: "https://studyinuae.com/about-study-in-uae",
        ogTitle: "About Study in UAE",
        ogDescription: "Understand how Study in UAE helps students explore universities and admission pathways in the UAE.",
        ogImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80"
      }
    },
    contactPage: {
      label: "Contact Page",
      slug: "/contact-us",
      layout: "full-width",
      sidebarPosition: "right",
      seo: {
        title: "Contact Study in UAE",
        description: "Get in touch with Study in UAE for admissions support, university guidance, and scholarship guidance.",
        keywords: "contact study in UAE, admissions support",
        canonicalUrl: "https://studyinuae.com/contact-us",
        ogTitle: "Contact Study in UAE",
        ogDescription: "Reach out to Study in UAE for personalized support with your UAE study plans.",
        ogImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"
      }
    },
    universityDetailPage: {
      label: "University Detail",
      slug: "/university/:name",
      layout: "sidebar",
      sidebarPosition: "right",
      seo: {
        title: "University Details | Study in UAE",
        description: "View detailed information about UAE universities, programs, and admissions support.",
        keywords: "university details UAE, study in UAE university",
        canonicalUrl: "https://studyinuae.com/university/:name",
        ogTitle: "University Details | Study in UAE",
        ogDescription: "Explore campus details, courses, scholarships, and admissions guidance for UAE universities.",
        ogImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
      }
    }
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
  faqs: [
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
  ],
  blogs: [
    {
      id: 1,
      title: "How to Apply for a UAE Student Visa: A Complete Guide",
      category: "Visas",
      readTime: "5 min read",
      date: "June 28, 2026",
      excerpt: "Navigating the student visa process in the UAE is straightforward if you have the right documents. Learn about sponsorships, medical checks, and costs.",
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
      author: "Sara Al-Mansoori",
      content: `
        <p class="lead">Studying in the United Arab Emirates (UAE) is an exciting opportunity, but before you can begin your academic journey, you need to secure a student visa. Fortunately, the UAE has simplified the visa process, making it straightforward for international students who are sponsored by their universities.</p>
        
        <h3>Who Sponsors Your Student Visa?</h3>
        <p>Unlike some countries where visas are sponsored directly by the government or require separate local guarantors, student visas in the UAE are sponsored by the university you are admitted to. Once you accept your admission offer and pay the initial tuition deposit, the university's visa office will initiate the process on your behalf.</p>
        
        <h3>Required Documents Checklist</h3>
        <p>Before applying, ensure you have gathered all the necessary documents. Missing papers can delay your entry permit. You will generally need:</p>
        <ul>
          <li><strong>Passport:</strong> Valid for at least 6 months, with at least two blank pages.</li>
          <li><strong>Admission Offer Letter:</strong> An official acceptance letter from a licensed UAE university.</li>
          <li><strong>Visa Application Form:</strong> Completed form provided by your university.</li>
          <li><strong>Passport Photos:</strong> 4 to 6 recent color photographs with a white background.</li>
          <li><strong>Academic Certificates:</strong> Attested certificates of your high school or undergraduate degrees.</li>
          <li><strong>Proof of Funds:</strong> Bank statements proving you can afford tuition fees and living expenses.</li>
          <li><strong>Medical Fitness Certificate:</strong> Required upon entry to stamp the visa.</li>
          <li><strong>Health Insurance:</strong> Mandatory health coverage active in the UAE.</li>
        </ul>

        <h3>Step-by-Step Visa Stamping Process</h3>
        <p>Once your documents are submitted, the stamping process follows these phases:</p>
        <ol>
          <li><strong>Entry Permit:</strong> The university applies for your student entry permit. This allows you to legally enter the UAE. It usually takes 10 to 15 days to process.</li>
          <li><strong>Medical Fitness Test:</strong> Within 24-48 hours of arriving in the UAE, you will undergo a medical fitness test (blood test and chest X-ray) at an approved preventive medicine center.</li>
          <li><strong>Emirates ID Biometrics:</strong> You will visit a registration center to record your biometrics (fingerprints and photo) for your Emirates ID card.</li>
          <li><strong>Visa Stamping:</strong> Once medical results are clear, your passport is submitted to the immigration department for visa stamping. Your residency stamp is valid for 1 year and must be renewed annually during your studies.</li>
        </ol>

        <blockquote class="accent-quote">
          <strong>Tip:</strong> Always request your university's visa department to start the entry permit process at least 6-8 weeks before your course starts to account for any unexpected administrative delays.
        </blockquote>
      `
    },
    {
      id: 2,
      title: "Cost of Living in Dubai for International Students",
      category: "Finance",
      readTime: "7 min read",
      date: "June 25, 2026",
      excerpt: "Planning your budget? From student housing in Academic City to dining and transport, here is a realistic breakdown of monthly expenses in Dubai.",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
      author: "Rahul Sharma",
      content: `
        <p class="lead">Dubai is one of the world's most dynamic global student hubs, boasting top-tier universities, tax-free part-time earning options, and an incredible lifestyle. However, calculating the cost of living beforehand is essential to ensure a stress-free student experience.</p>
        
        <h3>Monthly Budget Breakdown (AED)</h3>
        <p>Depending on your lifestyle and housing choice, a realistic student budget in Dubai ranges from <strong>AED 3,000 to AED 6,500 per month</strong>. Here is the typical cost distribution:</p>
        
        <table class="cost-table">
          <thead>
            <tr>
              <th>Expense Category</th>
              <th>Average Cost (AED / Month)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Accommodation (Shared Room / Student Residence)</td>
              <td>AED 1,800 - 3,500</td>
            </tr>
            <tr>
              <td>Food & Groceries</td>
              <td>AED 800 - 1,200</td>
            </tr>
            <tr>
              <td>Public Transportation (Metro & Bus)</td>
              <td>AED 250 - 500</td>
            </tr>
            <tr>
              <td>Utilities, Water, & Electricity</td>
              <td>AED 200 - 400</td>
            </tr>
            <tr>
              <td>Mobile Data & Internet</td>
              <td>AED 150 - 300</td>
            </tr>
            <tr>
              <td>Entertainment & Socializing</td>
              <td>AED 500 - 1,000</td>
            </tr>
          </tbody>
        </table>

        <h3>Accommodation Options</h3>
        <p>Housing is your largest expense. International students in Dubai typically choose between:</p>
        <ul>
          <li><strong>On-Campus Housing:</strong> Many universities located in Dubai International Academic City (DIAC) or Dubai Knowledge Park (DKP) offer student dormitories.</li>
          <li><strong>Dedicated Student Hubs:</strong> Off-campus student residences like <em>Myriad</em> or <em>KSK Homes</em> offer fully furnished shared rooms, gyms, study zones, and shuttle buses to universities starting from AED 2,000/month.</li>
          <li><strong>Private Rentals:</strong> Renting a private studio or apartment in areas like Al Barsha or Silicon Oasis is ideal for groups of students sharing, though it requires security deposits and utility setups.</li>
        </ul>

        <h3>Transport: Navigating the City</h3>
        <p>Dubai's Roads and Transport Authority (RTA) offers students a <strong>50% discount</strong> on the Blue Nol Card. This halves the price of Metro, Tram, and public bus fares, making transportation extremely affordable (often under AED 250/month for daily travel).</p>
      `
    },
    {
      id: 3,
      title: "Top 5 Emerging Careers in the UAE for Graduates",
      category: "Careers",
      readTime: "4 min read",
      date: "June 20, 2026",
      excerpt: "With the rise of smart cities and digital transformation, certain fields are booming. Discover which degrees offer the best job placement rates.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      author: "Elena Petrova",
      content: `
        <p class="lead">The UAE's economic landscape is evolving rapidly. With national strategies focusing on artificial intelligence, digital economies, and green energy, the job market for fresh graduates is experiencing a major shift toward tech and specialized sectors.</p>
        
        <h3>1. Artificial Intelligence & Data Science</h3>
        <p>With the UAE appointing the world’s first Minister of State for Artificial Intelligence, data analysts, machine learning engineers, and software architects are in extremely high demand. Degrees in Computer Science, Data Science, and Robotics from UAE universities are highly sought after by local tech companies and government divisions alike.</p>
        
        <h3>2. Renewable Energy & Green Engineering</h3>
        <p>Following COP28 and the UAE's Net Zero 2050 strategic initiative, sustainability has become a core industry. Engineers specializing in solar technology, sustainable architecture, smart grids, and environmental sciences are finding extensive employment in companies like Masdar, DEWA, and engineering consultancy firms.</p>
        
        <h3>3. FinTech & Blockchain Development</h3>
        <p>Dubai and Abu Dhabi have established themselves as international financial hubs. The rise of digital banking, decentralized finance (DeFi), and online trading has sparked a high demand for FinTech graduates, blockchain programmers, and financial analysts with programming capabilities.</p>
        
        <h3>4. Digital Marketing & Content Strategy</h3>
        <p>As retail and tourism continue to dominate the UAE economy, brand optimization has moved fully online. E-commerce platforms, luxury brands, and global hospitality networks are hiring digital strategists, SEO experts, and social media content managers with creative and analytical backgrounds.</p>

        <h3>5. Cybersecurity & Cloud Computing</h3>
        <p>As organizations move their operations to cloud infrastructures, protecting data integrity is paramount. Cybersecurity analysts, cloud consultants, and network safety engineers are seeing some of the fastest-growing salary packages in the Emirates.</p>
      `
    },
    {
      id: 4,
      title: "Campus Life: Public vs Private Universities in UAE",
      category: "Student Life",
      readTime: "6 min read",
      date: "June 15, 2026",
      excerpt: "Unsure which type of institution fits you? Compare campus cultures, facilities, student groups, and global accreditations.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
      author: "Marcus Davis",
      content: `
        <p class="lead">When choosing a university in the UAE, students are faced with a choice: state-funded public universities or international private universities. Both models offer exceptional education, but the student experience, campus demographics, and cultural environments differ significantly.</p>
        
        <h3>1. Campus Demographics & Language</h3>
        <p>Public universities in the UAE, such as UAE University (UAEU) or Zayed University, have historically focused on serving local UAE national students, though they have recently opened admissions to international students. The primary language of instruction is English, but Arabic remains highly present in daily social interactions. Private universities, especially branch campuses like Heriot-Watt University or Canadian University Dubai, have a highly diverse international student body with students from over 100 countries.</p>
        
        <h3>2. Fees, Scholarships, & Costs</h3>
        <p>State universities typically have lower tuition structures for non-national students and offer research-based graduate assistantships. Private universities are generally more expensive but provide generous merit-based scholarships (ranging from 10% to 50% tuition waivers) based on high school grades.</p>
        
        <h3>3. Student Activities & Facilities</h3>
        <p>Many private universities operate within educational hubs like Dubai Academic City, offering modern vertical campuses with shared student lounges, gaming zones, and tech-driven classrooms. Public universities boast massive dedicated campuses featuring Olympic-sized swimming pools, extensive libraries, and large research laboratories.</p>
      `
    },
    {
      id: 5,
      title: "A Guide to English Proficiency Tests for UAE Admissions",
      category: "Admissions",
      readTime: "4 min read",
      date: "June 10, 2026",
      excerpt: "Do you need IELTS, TOEFL, or EmSAT? Understand the score requirements for top colleges in Dubai and Abu Dhabi.",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
      author: "Dr. Linda Sterling",
      content: `
        <p class="lead">Most degree programs in the UAE are taught in English. To secure direct admission without taking foundation English courses, universities require proof of English proficiency. Here is a guide to the accepted tests and required scores.</p>
        
        <h3>1. IELTS (International English Language Testing System)</h3>
        <p>IELTS Academic is the most widely accepted test across UAE universities. The standard requirements are:</p>
        <ul>
          <li><strong>Undergraduate Programs:</strong> A minimum overall band score of <strong>6.0</strong> (with some universities accepting 5.5 for specific streams).</li>
          <li><strong>Postgraduate Programs:</strong> A minimum overall band score of <strong>6.5</strong>.</li>
        </ul>
        
        <h3>2. TOEFL (Test of English as a Foreign Language)</h3>
        <p>TOEFL is also universally accepted. Universities accept both the internet-based test (iBT) and paper-delivered formats:</p>
        <ul>
          <li><strong>Undergraduate:</strong> Standard score requirement of <strong>79 - 80</strong> on the iBT.</li>
          <li><strong>Postgraduate:</strong> Standard score requirement of <strong>90 - 92</strong> on the iBT.</li>
        </ul>
        
        <h3>3. EmSAT English (Emirates Standardized Test)</h3>
        <p>The EmSAT is a local UAE standardized test required primarily by public universities and for students transitioning from the UAE national high school system. The typical minimum score required is <strong>1100 to 1250</strong> for undergraduates.</p>
      `
    },
    {
      id: 6,
      title: "Why Sharjah is the Cultural & Education Capital of UAE",
      category: "Destinations",
      readTime: "5 min read",
      date: "June 05, 2026",
      excerpt: "Explore the historic University City, museum hubs, and affordable student-friendly lifestyle in the cultural heart of the Emirates.",
      image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1200&q=80",
      author: "Ziad El-Amin",
      content: `
        <p class="lead">While Dubai is known for its skyscrapers and Abu Dhabi for its corporate hubs, the Emirate of Sharjah is recognized globally as the cultural, artistic, and educational capital of the United Arab Emirates. For students seeking a traditional, academic environment, Sharjah is the ultimate destination.</p>
        
        <h3>The Splendor of University City</h3>
        <p>Sharjah’s educational crown jewel is <strong>University City</strong>, a massive, dedicated district featuring stunning Islamic-architecture campuses. It houses world-class institutions like the University of Sharjah and the American University of Sharjah (AUS). The district features tree-lined avenues, state-of-the-art sports facilities, and massive libraries, creating a scholarly atmosphere that rivals top university towns globally.</p>
        
        <h3>Cultural Enrichment & Museum Hubs</h3>
        <p>Sharjah is home to more than 20 museums, art galleries, and historic heritage areas. From the Sharjah Museum of Islamic Civilization to the modern Sharjah Art Foundation, students have endless opportunities to enrich their historical and artistic knowledge outside of class.</p>
        
        <h3>Cost-Effective Student Living</h3>
        <p>Sharjah offers a much more affordable cost of living compared to Dubai. Renting apartments, dining out, and daily essentials are significantly cheaper, allowing students to enjoy a high-quality lifestyle on a student budget. Furthermore, Sharjah is located right next to Dubai, allowing students to commute easily for weekend activities.</p>
      `
    }
  ]
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const initialData = {
  brand: {
    name: "Study in UAE Scholarship",
    strapline: "Find universities, programs, scholarships, and guided admissions across the UAE.",
    logoShort: "SIS",
    logoSub: "UAE admissions platform"
  },
  header: {
    loginStudent: { label: "Student Login", href: "#" },
    loginInstitution: { label: "Institution Login", href: "#" },
    applyCta: { label: "Apply Now", href: "#advisors" }
  },
  navigation: [
    { label: "Universities", href: "#universities" },
    { label: "Programs", href: "#programs" },
    { label: "Study in UAE", href: "#intro" },
    { label: "Resources", href: "#" }
  ],
  hero: {
    background: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2200&q=85",
    eyebrow: "Study in UAE",
    title: "Study in UAE Scholarship",
    copy: "Explore top UAE universities, compare programs, and start your admission journey with advisor-led support for Dubai, Abu Dhabi, Sharjah, Ajman, and Ras Al Khaimah.",
    primaryCta: { label: "Start My Journey", href: "#advisors" },
    secondaryCta: { label: "Explore Universities", href: "#universities" },
    search: {
      title: "Find your best-fit UAE pathway",
      fields: [
        { label: "I want to get a", value: "Under Graduate" },
        { label: "in", value: "Business and Management" },
        { label: "city", value: "Dubai" }
      ],
      button: "Search Programs"
    },
    stats: [
      { value: "7", label: "UAE study cities" },
      { value: "500+", label: "future programs" },
      { value: "1:1", label: "advisor support" }
    ]
  },
  consultation: {
    title: "Get a Free Consultation",
    copy: "Get a short-list, compare universities, and understand fees, intake, and scholarship options before you apply.",
    logoLetter: "S",
    studyFromPrefix: "Study From",
    studyFromSuffix: "UAE",
    benefits: ["Compare Universities", "Apply Directly", "Expert Guidance"],
    form: {
      fields: [
        { name: "name", label: "Name", placeholder: "Enter your full name", required: true, type: "text" },
        { name: "email", label: "Email ID", placeholder: "you@example.com", required: true, type: "email" },
        { name: "mobile", label: "Mobile Number", placeholder: "Enter your mobile number", prefix: "IN +91", required: true, type: "tel" }
      ],
      consentPrefix: "I agree to the",
      termsLink: "Terms",
      andWord: "&",
      privacyLink: "Privacy",
      consentSuffix: ".",
      submitButton: "Get a Free Consultation"
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
    eyebrow: "Get everything you need",
    title: "Why Study in Dubai",
    copy: "Dubai is the UAE's most visible student destination: international campuses, quick access from India, career-led programs, and a lifestyle that parents and students already understand.",
    image: "https://images.unsplash.com/photo-1526495124232-a04e1849168c?auto=format&fit=crop&w=1400&q=85",
    tabs: ["Overview", "Daily Life", "Culture", "Careers", "Visa Guide"],
    highlights: [
      { label: "Global classrooms", value: "UK, US, Canadian and UAE campuses" },
      { label: "Student areas", value: "Academic City, JLT, Business Bay, Knowledge Park" },
      { label: "Useful for", value: "Business, Computing, Engineering, Media, Health" },
      { label: "Admissions", value: "Shortlist, apply, upload documents, track progress" }
    ],
    cityRoutesTitle: "Study in UAE",
    cityRoutes: [
      "Study in Dubai",
      "Study in Abu Dhabi",
      "Study in Sharjah",
      "Study in Ajman",
      "Study in RAK",
      "Study in Fujairah"
    ]
  },
  universities: {
    eyebrow: "Explore Top Universities",
    title: "Compare UAE campuses by city, courses offered, and institute type.",
    copy: "",
    filters: ["All Courses", "Business Administration", "Computer Engineering", "Mechanical Engineering", "Civil Engineering"],
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
      }
    ]
  },
  programs: {
    eyebrow: "Top Study Programs",
    title: "Program discovery aligned to SIS form logic.",
    copy: "The future widget and public search can follow Academic Career, Discipline, Course, and Specialization while still presenting programs in a student-friendly way.",
    items: [
      {
        title: "Business Management",
        meta: "Undergraduate and postgraduate",
        copy: "For students targeting management, entrepreneurship, global trade, finance, and marketing careers."
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
      "Program cards connected to real institute courses"
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
  footer: {
    destinationsTitle: "Destinations",
    legalTitle: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
    destinations: ["Study in Dubai", "Study in Abu Dhabi", "Study in Sharjah", "Study in RAK"],
    copyright: "Copyright 2026 Study in UAE Scholarship. Landing page concept."
  }
};

export default function HomepageSettings() {
  const [data, setData] = useState(initialData);
  const [activeSection, setActiveSection] = useState("dashboard");

  const sections = [
    { id: "hero", label: "Hero Section", status: "Active" },
    { id: "navigation", label: "Navigation & Brand", status: "Active" },
    { id: "consultation", label: "Consultation Modal", status: "Active" },
    { id: "universityStrip", label: "University Strip", status: "Active" },
    { id: "intro", label: "Intro Section", status: "Active" },
    { id: "universities", label: "Universities Section", status: "Active" },
    { id: "programs", label: "Programs Section", status: "Active" },
    { id: "cityLife", label: "City Life Section", status: "Active" },
    { id: "featured", label: "Featured Campus", status: "Active" },
    { id: "advisors", label: "Advisor Form", status: "Active" },
    { id: "footer", label: "Footer", status: "Active" }
  ];

  const handleSave = () => {
    alert("Settings saved successfully (Static UI Preview)");
    setActiveSection("dashboard");
  };

  return (
    <div className="page-content-wrapper">
      <div className="page-content">
        <div className="page-bar">
          <ul className="page-breadcrumb">
            <li>
              <span>Website Settings</span>
              <i className="fa fa-circle"></i>
            </li>
            <li>
              <span>Homepage Settings</span>
            </li>
          </ul>
        </div>

        <div className="page-head-gradient">
          <h2>Homepage Settings</h2>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: 14 }}>manage landing page content</span>
        </div>

        <div className="row">
          <div className="col-md-3">
            <div className="portlet light bordered">
              <div className="portlet-title">
                <div className="caption">
                  <span className="caption-subject font-blue bold uppercase">Sections</span>
                </div>
              </div>
              <div className="portlet-body">
                <ul className="nav nav-pills nav-stacked" style={{ display: "flex", flexDirection: "column" }}>
                  <li className={activeSection === "dashboard" ? "active" : ""}>
                    <a href="#!" onClick={(e) => { e.preventDefault(); setActiveSection("dashboard"); }}>
                      Dashboard Preview
                    </a>
                  </li>
                  {sections.map(s => (
                    <li key={s.id} className={activeSection === s.id ? "active" : ""}>
                      <a href="#!" onClick={(e) => { e.preventDefault(); setActiveSection(s.id); }}>
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            {activeSection === "dashboard" && (
              <div className="portlet light bordered">
                <div className="portlet-title">
                  <div className="caption">
                    <span className="caption-subject font-blue bold uppercase">Dashboard Preview</span>
                  </div>
                  <div className="actions">
                    <button className="btn btn-default btn-sm" onClick={() => window.open('http://localhost:5174', '_blank')}>
                      <i className="fa fa-external-link"></i> Preview Live Website
                    </button>
                  </div>
                </div>
                <div className="portlet-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered table-hover">
                      <thead>
                        <tr>
                          <th>Section Name</th>
                          <th>Status</th>
                          <th>Last Updated</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sections.map(s => (
                          <tr key={s.id}>
                            <td><strong>{s.label}</strong></td>
                            <td><span className="label label-success">{s.status}</span></td>
                            <td>Just now</td>
                            <td>
                              <button className="btn btn-xs btn-primary" onClick={() => setActiveSection(s.id)}>
                                <i className="fa fa-edit"></i> Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeSection !== "dashboard" && (
              <div className="portlet light bordered">
                <div className="portlet-title">
                  <div className="caption">
                    <span className="caption-subject font-blue bold uppercase">
                      Editing: {sections.find(s => s.id === activeSection)?.label}
                    </span>
                  </div>
                </div>
                <div className="portlet-body form">
                  <form role="form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="form-body">
                      
                      {activeSection === "hero" && (
                        <>
                          <div className="form-group">
                            <label>Eyebrow Text</label>
                            <input type="text" className="form-control" defaultValue={data.hero.eyebrow} />
                          </div>
                          <div className="form-group">
                            <label>Main Title</label>
                            <input type="text" className="form-control" defaultValue={data.hero.title} />
                          </div>
                          <div className="form-group">
                            <label>Subtitle / Copy</label>
                            <textarea className="form-control" rows="3" defaultValue={data.hero.copy}></textarea>
                          </div>
                          <div className="form-group">
                            <label>Background Image URL</label>
                            <input type="text" className="form-control" defaultValue={data.hero.background} />
                          </div>
                        </>
                      )}

                      {activeSection === "navigation" && (
                        <>
                          <h4 className="form-section">Navigation Links</h4>
                          {data.navigation.map((nav, i) => (
                            <div className="row" key={i}>
                              <div className="col-md-5">
                                <div className="form-group">
                                  <label>Label</label>
                                  <input type="text" className="form-control" defaultValue={nav.label} />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-group">
                                  <label>URL</label>
                                  <input type="text" className="form-control" defaultValue={nav.href} />
                                </div>
                              </div>
                              <div className="col-md-1">
                                <label>&nbsp;</label>
                                <button className="btn btn-danger btn-block"><i className="fa fa-trash"></i></button>
                              </div>
                            </div>
                          ))}
                          <button className="btn btn-sm btn-default mt-2">Add Link</button>
                        </>
                      )}

                      {activeSection === "consultation" && (
                        <>
                          <div className="form-group">
                            <label>Modal Title</label>
                            <input type="text" className="form-control" defaultValue={data.consultation.title} />
                          </div>
                          <div className="form-group">
                            <label>Modal Copy</label>
                            <textarea className="form-control" rows="2" defaultValue={data.consultation.copy}></textarea>
                          </div>
                          <div className="form-group">
                            <label>Submit Button Text</label>
                            <input type="text" className="form-control" defaultValue={data.consultation.form.submitButton} />
                          </div>
                        </>
                      )}

                      {activeSection === "universityStrip" && (
                        <>
                          <div className="form-group">
                            <label>Eyebrow</label>
                            <input type="text" className="form-control" defaultValue={data.universityStrip.eyebrow} />
                          </div>
                          <div className="form-group">
                            <label>Description</label>
                            <input type="text" className="form-control" defaultValue={data.universityStrip.copy} />
                          </div>
                        </>
                      )}

                      {activeSection === "intro" && (
                        <>
                          <div className="form-group">
                            <label>Eyebrow</label>
                            <input type="text" className="form-control" defaultValue={data.intro.eyebrow} />
                          </div>
                          <div className="form-group">
                            <label>Title</label>
                            <input type="text" className="form-control" defaultValue={data.intro.title} />
                          </div>
                          <div className="form-group">
                            <label>Copy</label>
                            <textarea className="form-control" rows="3" defaultValue={data.intro.copy}></textarea>
                          </div>
                        </>
                      )}

                      {activeSection === "universities" && (
                        <>
                          <div className="form-group">
                            <label>Title</label>
                            <input type="text" className="form-control" defaultValue={data.universities.title} />
                          </div>
                          <h4 className="form-section">University Cards</h4>
                          {data.universities.cards.map((card, i) => (
                            <div className="well" key={i}>
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label>University Name</label>
                                    <input type="text" className="form-control" defaultValue={card.name} />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group">
                                    <label>City</label>
                                    <input type="text" className="form-control" defaultValue={card.city} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {activeSection === "programs" && (
                        <>
                          <div className="form-group">
                            <label>Eyebrow</label>
                            <input type="text" className="form-control" defaultValue={data.programs.eyebrow} />
                          </div>
                          <div className="form-group">
                            <label>Title</label>
                            <input type="text" className="form-control" defaultValue={data.programs.title} />
                          </div>
                        </>
                      )}

                      {activeSection === "cityLife" && (
                        <>
                          <div className="form-group">
                            <label>Title</label>
                            <input type="text" className="form-control" defaultValue={data.cityLife.title} />
                          </div>
                          <div className="form-group">
                            <label>Copy</label>
                            <textarea className="form-control" rows="2" defaultValue={data.cityLife.copy}></textarea>
                          </div>
                        </>
                      )}

                      {activeSection === "featured" && (
                        <>
                          <div className="form-group">
                            <label>Title</label>
                            <input type="text" className="form-control" defaultValue={data.featured.title} />
                          </div>
                          <div className="form-group">
                            <label>Copy</label>
                            <textarea className="form-control" rows="2" defaultValue={data.featured.copy}></textarea>
                          </div>
                        </>
                      )}

                      {activeSection === "advisors" && (
                        <>
                          <div className="form-group">
                            <label>Title</label>
                            <input type="text" className="form-control" defaultValue={data.advisors.title} />
                          </div>
                          <div className="form-group">
                            <label>Submit Button</label>
                            <input type="text" className="form-control" defaultValue={data.advisors.form.submitButton} />
                          </div>
                        </>
                      )}

                      {activeSection === "footer" && (
                        <>
                          <div className="form-group">
                            <label>Copyright</label>
                            <input type="text" className="form-control" defaultValue={data.footer.copyright} />
                          </div>
                        </>
                      )}

                    </div>
                    <div className="form-actions right">
                      <button type="button" className="btn default" onClick={() => setActiveSection("dashboard")}>Cancel</button>
                      <button type="submit" className="btn btn-primary" style={{ marginLeft: '10px' }}>Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

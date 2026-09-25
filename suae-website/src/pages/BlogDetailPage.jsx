import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, BookOpen, User, ChevronRight } from "lucide-react";
import { usePreviewData } from "../context/PreviewContext";

const fallbackBlogs = [
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
];

export function BlogDetailPage({ content }) {
  const { id } = useParams();
  const blogsData = usePreviewData("blogs", content?.blogs || fallbackBlogs);

  // Find active blog
  const blog = useMemo(() => {
    return blogsData.find((b) => String(b.id) === String(id));
  }, [blogsData, id]);

  // Related articles (exclude current, take 5)
  const relatedBlogs = useMemo(() => {
    return blogsData.filter((b) => String(b.id) !== String(id)).slice(0, 5);
  }, [blogsData, id]);

  if (!blog) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-pearl p-6 text-center">
        <h2 className="text-3xl font-bold text-night">Article Not Found</h2>
        <p className="mt-2 text-tide/70">The article you are looking for does not exist or has been removed.</p>
        <Link to="/resources/blogs" className="btn-yellow mt-6 px-6 py-3 text-sm rounded-md">
          <ArrowLeft size={16} /> Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl pt-28 pb-20">
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-rich-content h3 { font-family: Outfit, sans-serif; font-size: 1.35rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #0f172a; }
        .blog-rich-content p { margin-bottom: 1.25rem; color: #334155; line-height: 1.8; font-size: 0.95rem; }
        .blog-rich-content .lead { font-size: 1.1rem; font-weight: 500; color: #1e293b; line-height: 1.75; }
        .blog-rich-content ul, .blog-rich-content ol { margin-left: 1.5rem; margin-bottom: 1.5rem; }
        .blog-rich-content ul { list-style-type: disc; }
        .blog-rich-content ol { list-style-type: decimal; }
        .blog-rich-content li { margin-bottom: 0.5rem; color: #334155; font-size: 0.95rem; }
        .blog-rich-content .accent-quote { border-left: 4px solid #008080; padding: 1rem 1.25rem; background-color: #f0fdfa; font-style: italic; color: #1e293b; margin: 2rem 0; border-radius: 0 8px 8px 0; }
        .blog-rich-content table { width: 100%; border-collapse: collapse; margin: 2rem 0; font-size: 0.9rem; }
        .blog-rich-content th, .blog-rich-content td { padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; text-align: left; }
        .blog-rich-content th { background-color: #f8fafc; font-weight: 700; color: #008080; }
      `}} />
      <div className="section-shell">
        
        {/* Back Link */}
        <Link
          to="/resources/blogs"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-tide/70 transition hover:text-night mb-8 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Blogs & News
        </Link>

        <div className="grid gap-12 lg:grid-cols-3">
          
          {/* Main content column */}
          <main className="lg:col-span-2">
            
            {/* Header info */}
            <div className="mb-8">
              <span className="inline-flex items-center rounded-md bg-lagoon/10 px-2.5 py-1 text-xs font-semibold text-lagoon uppercase tracking-wider mb-4">
                {blog.category}
              </span>
              <h1 className="font-heading text-3xl font-extrabold text-night sm:text-4xl leading-tight">
                {blog.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-tide/60 border-y border-night/5 py-4">
                {blog.author && (
                  <span className="flex items-center gap-1.5 font-semibold text-night">
                    <User size={14} className="text-tide/50" />
                    By {blog.author}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {blog.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {blog.readTime}
                </span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="aspect-[21/10] overflow-hidden rounded-2xl bg-night/5 mb-8 shadow-sm">
              <img
                src={blog.image}
                alt={blog.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Content Body */}
            <article 
              className="blog-rich-content text-black leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: blog.content || `<p class="lead">${blog.excerpt}</p><p>Full content draft is coming soon for this article. Please check back for updates.</p>` }}
            />

          </main>

          {/* Sidebar column */}
          <aside className="space-y-8 lg:sticky lg:top-28 self-start">
            
            {/* Related Articles Card */}
            <div className="rounded-2xl border border-night/5 bg-white p-6 shadow-sm">
              <h4 className="font-heading text-lg font-bold text-night mb-6 flex items-center gap-2">
                <BookOpen size={18} className="text-lagoon" />
                Related Articles
              </h4>
              <div className="space-y-6">
                {relatedBlogs.map((item) => (
                  <Link
                    key={item.id}
                    to={`/resources/blogs/${item.id}`}
                    className="group flex gap-4 items-start"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover bg-night/5"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-lagoon">
                        {item.category}
                      </span>
                      <h5 className="font-semibold text-xs text-night leading-snug group-hover:text-lagoon transition-colors line-clamp-2 mt-1">
                        {item.title}
                      </h5>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Advisor Inquiry CTA Card */}
            <div className="rounded-2xl bg-gradient-to-br from-lagoon to-night p-6 text-white shadow-lg text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10 blur-xl"></div>
              
              <h4 className="font-heading text-lg font-extrabold mb-3">
                Want to Study in UAE?
              </h4>
              <p className="text-xs text-white/95 leading-relaxed mb-6">
                Get free expert guidance on college applications, scholarship criteria, and visa sponsorship procedures.
              </p>
              
              <Link
                to="/contact-us"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-night hover:bg-pearl transition shadow-md"
              >
                Connect with Advisor
                <ChevronRight size={14} />
              </Link>
            </div>

          </aside>

        </div>

      </div>
    </div>
  );
}

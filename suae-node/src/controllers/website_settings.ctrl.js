const crypto = require('crypto');
const db = require("../libraries/db");

// In-memory cache for temporary preview tokens
const previewCache = new Map();
const TOKEN_TTL = 10 * 60 * 1000; // 10 minutes

class WebsiteSettingsController {
  static ensureCmsAdmin = (req, res) => {
    const { isClient, isAdmin, type, role_id } = req.currentUser || {};
    const isClientAdmin = type === "CLIENT" && Boolean(role_id);

    if (isClient || isAdmin || isClientAdmin) {
      return true;
    }

    res.status(403).json({ message: "Only admin users can manage website settings" });
    return false;
  };

  static getActualUniversities = async () => {
    try {
      const featuredRows = await db.knex("cms_featured_institute").select("institute_id");
      const featuredIds = new Set(featuredRows.map(r => r.institute_id));

      const list = await db.knex("institutes")
        .select("id", "name", "type", "city", "status", "logo_file_id", "address", "mask_status")
        .orderBy("name", "asc");

      const rawBase = (process.env.ENVIRONMENT === 'dev' ? (process.env.BASE_URL_LOCAL || process.env.BASE_URL) : process.env.BASE_URL) || '';
      const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

      const logoFileIds = list.map(inst => inst.logo_file_id).filter(Boolean);
      const files = logoFileIds.length > 0
        ? await db.knex('files').select('id', 'file_name').whereIn('id', logoFileIds)
        : [];
      const filesMap = new Map(files.map(f => [f.id, f.file_name]));

      const approvedIds = list
        .filter(inst => inst.status === "Approved" || inst.status === "1" || inst.status === 1 || String(inst.status).toLowerCase() === "approved")
        .map(inst => inst.id);

      const allCourses = approvedIds.length > 0
        ? await db.knex("institute_courses as ic")
          .join("master_specializations as ms", "ms.id", "ic.specialization_id")
          .select("ic.institute_id", "ms.name as spec_name")
          .whereIn("ic.institute_id", approvedIds)
          .andWhere("ic.status", "1")
        : [];

      const coursesByInst = {};
      for (const row of allCourses) {
        if (!coursesByInst[row.institute_id]) {
          coursesByInst[row.institute_id] = [];
        }
        coursesByInst[row.institute_id].push(row);
      }

      const mapped = [];
      for (const inst of list) {
        const isApproved = inst.status === "Approved" || inst.status === "1" || inst.status === 1 || String(inst.status).toLowerCase() === "approved";
        if (!isApproved) continue;
        if (inst.mask_status === 0) continue;

        const courseRows = coursesByInst[inst.id] || [];
        const courseCount = courseRows.length;
        const coursesDisplay = courseCount > 0 ? `${courseCount}+` : "12+";
        const programsDisplay = courseCount > 0
          ? courseRows.map(r => r.spec_name).slice(0, 3).join(", ")
          : "Business, Engineering, IT";

        let logoUrl = '';
        if (inst.logo_file_id && filesMap.has(inst.logo_file_id)) {
          logoUrl = `${baseUrl}uploads/files/${filesMap.get(inst.logo_file_id)}`;
        }

        const isFeatured = featuredIds.has(inst.id);
        mapped.push({
          id: inst.id,
          name: inst.name,
          city: inst.city || 'Dubai',
          courses: coursesDisplay,
          type: inst.type || 'Private',
          intake: "Sep / Jan",
          scholarship: "Merit-based support available",
          programs: programsDisplay,
          note: inst.address ? `${inst.name} is located at ${inst.address}, ${inst.city}.` : `Strong fit for globally mobile students who want to study in ${inst.city || 'UAE'}.`,
          image: logoUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80',
          isFeatured: isFeatured,
          featured: isFeatured,
          isDbInstitute: true
        });
      }
      return mapped;
    } catch (error) {
      console.error("Error fetching actual universities:", error);
      return [];
    }
  };

  /**
   * Helper to assemble settings object from all 15 individual tables
   */
  static assembleSettings = async () => {
    const [
      brand,
      header,
      hero,
      intro,
      cityLife,
      testimonials,
      consultation,
      footer,
      about,
      contact,
      faqs,
      blogs,
      events,
      careers,
      scholarships,
      cities
    ] = await Promise.all([
      db.knex('cms_brand_settings').first(),
      db.knex('cms_header_settings').first(),
      db.knex('cms_hero_settings').first(),
      db.knex('cms_intro_settings').first(),
      db.knex('cms_city_life_settings').first(),
      db.knex('cms_testimonials_settings').first(),
      db.knex('cms_consultation_settings').first(),
      db.knex('cms_footer_settings').first(),
      db.knex('cms_about_settings').first(),
      db.knex('cms_contact_settings').first(),
      db.knex('cms_faqs').select('*'),
      db.knex('cms_blogs').select('*'),
      db.knex('cms_events').select('*'),
      db.knex('cms_careers').first(),
      db.knex('cms_scholarships').first(),
      db.knex('cms_city_settings').select('*').orderBy('id', 'asc')
    ]);

    const parseJson = (val) => {
      if (!val) return undefined;
      return typeof val === 'string' ? JSON.parse(val) : val;
    };

    const content = {};

    if (brand) {
      content.brand = {
        name: brand.name,
        strapline: brand.strapline,
        logoShort: brand.logo_short,
        logoSub: brand.logo_sub
      };
    }

    if (header) {
      content.header = {
        loginStudent: parseJson(header.login_student),
        loginInstitution: parseJson(header.login_institution),
        applyCta: parseJson(header.apply_cta)
      };
      content.navigation = parseJson(header.navigation);
    }

    if (hero) {
      content.hero = {
        background: hero.background,
        badge: hero.badge,
        title: hero.title,
        copy: hero.copy,
        titleColor: hero.title_color,
        copyColor: hero.copy_color,
        search: parseJson(hero.search),
        popularCities: parseJson(hero.popular_cities),
        socialProof: parseJson(hero.social_proof),
        stats: parseJson(hero.stats)
      };
    }

    if (intro) {
      content.intro = {
        eyebrow: intro.eyebrow,
        title: intro.title
      };
    }

    if (cityLife) {
      content.cityLife = {
        eyebrow: cityLife.eyebrow,
        title: cityLife.title,
        copy: cityLife.copy,
        image: cityLife.image,
        blocks: parseJson(cityLife.blocks)
      };
    }

    if (testimonials) {
      content.testimonials = {
        eyebrow: testimonials.eyebrow,
        title: testimonials.title,
        copy: testimonials.copy,
        items: parseJson(testimonials.items)
      };
    }

    if (consultation) {
      content.consultation = {
        title: consultation.title,
        copy: consultation.copy,
        logoLetter: consultation.logo_letter,
        studyFromPrefix: consultation.study_from_prefix,
        studyFromSuffix: consultation.study_from_suffix,
        form: {
          consentPrefix: consultation.consent_prefix,
          termsLink: consultation.terms_link,
          andWord: consultation.and_word,
          privacyLink: consultation.privacy_link,
          consentSuffix: consultation.consent_suffix,
          submitButton: consultation.submit_button,
          fields: parseJson(consultation.fields)
        },
        sidebar: parseJson(consultation.sidebar),
        benefits: parseJson(consultation.benefits)
      };
    }

    if (footer) {
      content.footer = {
        title: footer.title,
        summary: footer.summary,
        spotlightTracks: parseJson(footer.spotlight_tracks),
        columns: parseJson(footer.columns),
        legalLinks: parseJson(footer.legal_links),
        copyright: footer.copyright
      };
    }

    if (about) {
      content.about = {
        heroTitle: about.hero_title,
        heroSubtitle: about.hero_subtitle,
        heroImage: about.hero_image,
        introTitle: about.intro_title,
        introText: about.intro_text,
        highlights: parseJson(about.highlights),
        sections: parseJson(about.sections)
      };
    }

    if (contact) {
      content.contact = {
        heroTitle: contact.hero_title,
        heroSubtitle: contact.hero_subtitle,
        heroImage: contact.hero_image,
        email: contact.email,
        phone: contact.phone,
        address: contact.address,
        workingHours: contact.working_hours
      };
    }

    // Map list fields
    content.faqs = faqs.map(f => ({
      id: f.id,
      category: f.category,
      question: f.question,
      answer: f.answer
    }));

    content.blogs = blogs.map(b => ({
      id: b.id,
      title: b.title,
      category: b.category,
      readTime: b.read_time,
      date: b.date,
      excerpt: b.excerpt,
      image: b.image,
      author: b.author,
      content: b.content
    }));

    content.events = events.map(e => ({
      id: e.id,
      title: e.title,
      type: e.type,
      date: e.date,
      time: e.time,
      location: e.location,
      description: e.description,
      organizer: e.organizer,
      badge: e.badge,
      isOnline: Boolean(e.is_online)
    }));

    if (careers) {
      content.careers = {
        title: careers.title,
        tagline: careers.tagline,
        permitInfo: careers.permit_info,
        sectors: parseJson(careers.sectors)
      };
    }

    if (scholarships) {
      content.scholarships = {
        title: scholarships.title,
        tagline: scholarships.tagline,
        items: parseJson(scholarships.items)
      };
    }

    if (Array.isArray(cities)) {
      content.cities = cities.map(c => ({
        name: c.name,
        eyebrow: c.eyebrow,
        tagline: c.tagline,
        overview: c.overview,
        image: c.image,
        dailyLife: c.daily_life,
        culture: c.culture,
        socialLife: c.social_life,
        livingCosts: parseJson(c.living_costs) || [],
        educationCosts: parseJson(c.education_costs) || []
      }));
    } else {
      content.cities = [];
    }

    const actualUnis = await WebsiteSettingsController.getActualUniversities();
    content.universities = {
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
      cards: actualUnis
    };

    return content;
  };

  /**
   * GET /public/website-settings
   * Fetches published website settings
   */
  static getPublishedSettings = async (req, res) => {
    try {
      const content = await WebsiteSettingsController.assembleSettings();
      return res.status(200).json({ content });
    } catch (error) {
      console.error("Error fetching published settings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  /**
   * GET /master/website-settings
   * Fetches draft website settings for editing
   */
  static getSettings = async (req, res) => {
    try {
      if (!WebsiteSettingsController.ensureCmsAdmin(req, res)) {
        return;
      }
      const content = await WebsiteSettingsController.assembleSettings();
      return res.status(200).json({ content });
    } catch (error) {
      console.error("Error fetching draft settings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  /**
   * POST /master/website-settings
   * Saves changes to a specific section.
   */
  static saveSectionSettings = async (req, res) => {
    try {
      if (!WebsiteSettingsController.ensureCmsAdmin(req, res)) {
        return;
      }

      const { section, data } = req.body;
      if (!section || !data) {
        return res.status(400).json({ message: "Section and data are required" });
      }

      const updated_at = new Date();

      if (section === 'brand') {
        await db.knex('cms_brand_settings').update({
          name: data.name,
          strapline: data.strapline,
          logo_short: data.logoShort,
          logo_sub: data.logoSub,
          updated_at
        });
      }
      else if (section === 'header') {
        await db.knex('cms_header_settings').update({
          login_student: JSON.stringify(data.loginStudent),
          login_institution: JSON.stringify(data.loginInstitution),
          apply_cta: JSON.stringify(data.applyCta),
          updated_at
        });
      }
      else if (section === 'navigation') {
        await db.knex('cms_header_settings').update({
          navigation: JSON.stringify(data),
          updated_at
        });
      }
      else if (section === 'hero') {
        await db.knex('cms_hero_settings').update({
          background: data.background,
          badge: data.badge,
          title: data.title,
          copy: data.copy,
          title_color: data.titleColor,
          copy_color: data.copyColor,
          search: JSON.stringify(data.search),
          popular_cities: JSON.stringify(data.popularCities),
          social_proof: JSON.stringify(data.socialProof),
          stats: JSON.stringify(data.stats),
          updated_at
        });
      }
      else if (section === 'intro') {
        await db.knex('cms_intro_settings').update({
          eyebrow: data.eyebrow,
          title: data.title,
          updated_at
        });
      }
      else if (section === 'cityLife') {
        await db.knex('cms_city_life_settings').update({
          eyebrow: data.eyebrow,
          title: data.title,
          copy: data.copy,
          image: data.image,
          blocks: JSON.stringify(data.blocks),
          updated_at
        });
      }
      else if (section === 'testimonials') {
        await db.knex('cms_testimonials_settings').update({
          eyebrow: data.eyebrow,
          title: data.title,
          copy: data.copy,
          items: JSON.stringify(data.items),
          updated_at
        });
      }
      else if (section === 'consultation') {
        await db.knex('cms_consultation_settings').update({
          title: data.title,
          copy: data.copy,
          logo_letter: data.logoLetter,
          study_from_prefix: data.studyFromPrefix,
          study_from_suffix: data.studyFromSuffix,
          consent_prefix: data.form?.consentPrefix,
          terms_link: data.form?.termsLink,
          and_word: data.form?.andWord,
          privacy_link: data.form?.privacyLink,
          consent_suffix: data.form?.consentSuffix,
          submit_button: data.form?.submitButton,
          sidebar: JSON.stringify(data.sidebar),
          benefits: JSON.stringify(data.benefits),
          fields: JSON.stringify(data.form?.fields || []),
          updated_at
        });
      }
      else if (section === 'footer') {
        await db.knex('cms_footer_settings').update({
          title: data.title,
          summary: data.summary,
          spotlight_tracks: JSON.stringify(data.spotlightTracks),
          columns: JSON.stringify(data.columns),
          legal_links: JSON.stringify(data.legalLinks),
          copyright: data.copyright,
          updated_at
        });
      }
      else if (section === 'about') {
        await db.knex('cms_about_settings').update({
          hero_title: data.heroTitle,
          hero_subtitle: data.heroSubtitle,
          hero_image: data.heroImage,
          intro_title: data.introTitle,
          intro_text: data.introText,
          highlights: JSON.stringify(data.highlights),
          sections: JSON.stringify(data.sections),
          updated_at
        });
      }
      else if (section === 'contact') {
        await db.knex('cms_contact_settings').update({
          hero_title: data.heroTitle,
          hero_subtitle: data.heroSubtitle,
          hero_image: data.heroImage,
          email: data.email,
          phone: data.phone,
          address: data.address,
          working_hours: data.workingHours,
          updated_at
        });
      }
      else if (section === 'faqs') {
        await db.knex('cms_faqs').del();
        if (Array.isArray(data)) {
          for (const item of data) {
            await db.knex('cms_faqs').insert({
              category: item.category,
              question: item.question,
              answer: item.answer,
              updated_at
            });
          }
        }
      }
      else if (section === 'blogs') {
        await db.knex('cms_blogs').del();
        if (Array.isArray(data)) {
          for (const item of data) {
            await db.knex('cms_blogs').insert({
              title: item.title,
              category: item.category,
              read_time: item.readTime,
              date: item.date,
              excerpt: item.excerpt,
              image: item.image,
              author: item.author || "Admissions Team",
              content: item.content || "",
              updated_at
            });
          }
        }
      }
      else if (section === 'events') {
        await db.knex('cms_events').del();
        if (Array.isArray(data)) {
          for (const item of data) {
            await db.knex('cms_events').insert({
              title: item.title,
              type: item.type,
              date: item.date,
              time: item.time,
              location: item.location || item.link,
              description: item.description,
              organizer: item.organizer,
              badge: item.badge,
              is_online: item.isOnline ? 1 : 0,
              image: item.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
              link: item.link || item.location,
              updated_at
            });
          }
        }
      }
      else if (section === 'careers') {
        await db.knex('cms_careers').update({
          title: data.title,
          tagline: data.tagline,
          permit_info: data.permitInfo || data.permit_info,
          sectors: JSON.stringify(data.sectors),
          updated_at
        });
      }
      else if (section === 'scholarships') {
        await db.knex('cms_scholarships').update({
          title: data.title,
          tagline: data.tagline,
          items: JSON.stringify(data.items),
          updated_at
        });
      }
      else if (section === 'cities') {
        await db.knex('cms_city_settings').del();
        if (Array.isArray(data)) {
          for (const item of data) {
            await db.knex('cms_city_settings').insert({
              name: item.name,
              eyebrow: item.eyebrow,
              tagline: item.tagline,
              overview: item.overview,
              image: item.image,
              daily_life: item.dailyLife,
              culture: item.culture,
              social_life: item.socialLife,
              living_costs: JSON.stringify(item.livingCosts || []),
              education_costs: JSON.stringify(item.educationCosts || []),
              updated_at
            });
          }
        }
      }

      const contentObj = await WebsiteSettingsController.assembleSettings();
      return res.status(200).json({ message: "Section settings saved successfully", content: contentObj });
    } catch (error) {
      console.error("Error saving section settings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  /**
   * POST /master/website-settings/preview-token
   * Generates a temporary preview token holding the current full draft content
   */
  static createPreviewToken = async (req, res) => {
    try {
      if (!WebsiteSettingsController.ensureCmsAdmin(req, res)) {
        return;
      }

      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Content payload is required" });
      }

      const token = crypto.randomUUID();
      previewCache.set(token, content);

      // Set TTL to delete token after 10 minutes
      setTimeout(() => {
        previewCache.delete(token);
      }, TOKEN_TTL);

      return res.status(200).json({ token });
    } catch (error) {
      console.error("Error creating preview token:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  /**
   * GET /public/preview-draft
   * Retrieves full draft content using the preview token (used by suae-website new tabs)
   */
  static getPreviewDraft = async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) {
        return res.status(400).json({ message: "Preview token is required" });
      }

      if (!previewCache.has(token)) {
        return res.status(404).json({ message: "Invalid or expired preview token" });
      }

      const content = previewCache.get(token);
      return res.status(200).json({ content });
    } catch (error) {
      console.error("Error retrieving preview draft:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  /**
   * POST /master/website-settings/feature-institute
   */
  static featureInstitute = async (req, res) => {
    try {
      const { instituteId, isFeatured } = req.body;
      if (!instituteId) {
        return res.status(400).json({ success: false, message: "instituteId is required" });
      }

      if (isFeatured) {
        const countRow = await db.knex('cms_featured_institute').count('* as count').first();
        const count = countRow ? parseInt(countRow.count) : 0;
        if (count >= 6) {
          return res.status(400).json({ success: false, message: "You can only feature up to 6 universities." });
        }

        const exists = await db.knex('cms_featured_institute')
          .where({ institute_id: instituteId })
          .first();
        if (!exists) {
          await db.knex('cms_featured_institute').insert({
            institute_id: instituteId
          });
        }
      } else {
        await db.knex('cms_featured_institute')
          .where({ institute_id: instituteId })
          .del();
      }

      try {
        const PublicCtrl = require('./public.ctrl');
        if (PublicCtrl && typeof PublicCtrl.clearCache === 'function') {
          PublicCtrl.clearCache();
        }
      } catch (err) {
        console.warn("Failed to clear public institutes cache:", err);
      }

      return res.status(200).json({ success: true, message: "Featured status updated successfully" });
    } catch (e) {
      console.error("Error updating featured status:", e);
      return res.status(500).json({ success: false, message: e.message || "Server error" });
    }
  };

  /**
   * POST /master/website-settings/toggle-list-institute
   */
  static toggleListInstitute = async (req, res) => {
    try {
      const { instituteId, isListed } = req.body;
      if (!instituteId) {
        return res.status(400).json({ success: false, message: "instituteId is required" });
      }

      const newMaskStatus = isListed ? 1 : 0;

      await db.knex('institutes')
        .where({ id: instituteId })
        .update({ mask_status: newMaskStatus });

      try {
        const PublicCtrl = require('./public.ctrl');
        if (PublicCtrl && typeof PublicCtrl.clearCache === 'function') {
          PublicCtrl.clearCache();
        }
      } catch (err) {
        console.warn("Failed to clear public institutes cache:", err);
      }

      return res.status(200).json({ success: true, message: `Institute ${isListed ? "listed" : "unlisted"} successfully` });
    } catch (e) {
      console.error("Error toggling institute listing status:", e);
      return res.status(500).json({ success: false, message: e.message || "Server error" });
    }
  };
}

module.exports = WebsiteSettingsController;

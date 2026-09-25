import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PreviewSettingsProvider,
  usePreviewSettings
} from '../../context/PreviewSettingsContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import util from '../../utils/util';

import HeroSection from './HeroSection';
import IntroSection from './IntroSection';
import FooterSettings from './FooterSettings';
// import UniversitiesSection from './UniversitiesSection';
import ProgramsSection from './ProgramsSection';
import ConsultationModal from './ConsultationModal';
import NavigationSettings from './NavigationSettings';
import DetailPagesSection from './DetailPagesSection';
import AboutSettings from './AboutSettings';
import CityDetailsForm from './CityDetailsForm';
import TestimonialsSection from './TestimonialsSection';
import ContactSettings from './ContactSettings';
import FaqSettingsForm from './FaqSettingsForm';
import BlogSettingsForm from './BlogSettingsForm';
import ManageReviewsPage from './ManageReviewsPage';
import FormWidgets from './FormWidgets';

import './css/web-settings.css';

const groups = [
  {
    title: 'Portal Content',
    summary: 'Landing page sections and discovery content.',
    modules: [
      {
        id: 'hero',
        label: 'Hero Section',
        desc: 'Homepage hero, search and city quick-filters',
        path: '/website-settings/hero',
        icon: 'fa-image',
        color: '#e74c3c',
        hash: 'hero',
        page: 'Landing Page'
      },
      {
        id: 'intro',
        label: 'Intro Section',
        desc: 'Top-university marquee and intro heading',
        path: '/website-settings/intro-section',
        icon: 'fa-info-circle',
        color: '#3498db',
        hash: 'intro',
        page: 'Landing Page'
      },
      {
        id: 'city-details',
        label: 'Cities Section',
        desc: 'Destination cards and city detail content',
        path: '/website-settings/city-details',
        icon: 'fa-map-marker',
        color: '#2ecc71',
        hash: 'cities',
        page: 'Landing Page'
      },
      // {
      //   id: 'universities',
      //   label: 'Universities Section',
      //   desc: 'University comparison cards',
      //   path: '/website-settings/universities',
      //   icon: 'fa-university',
      //   color: '#9b59b6',
      //   hash: 'universities',
      //   page: 'Landing Page'
      // },
      {
        id: 'programs',
        label: 'Programs Section',
        desc: 'Streams, courses and discovery cards',
        path: '/website-settings/programs',
        icon: 'fa-book',
        color: '#f39c12',
        hash: 'programs',
        page: 'Landing Page'
      },
      {
        id: 'testimonials',
        label: 'Testimonials',
        desc: 'Student stories and proof content',
        path: '/website-settings/testimonials',
        icon: 'fa-comments',
        color: '#1abc9c',
        hash: 'testimonials',
        page: 'Landing Page'
      },
    ]
  },
  {
    title: 'Lead Capture',
    summary: 'Inquiry flows, popups and conversion points.',
    modules: [
      {
        id: 'consultation-modal',
        label: 'Consultation Modal',
        desc: 'Popup, benefits and lead form',
        path: '/website-settings/consultation-modal',
        icon: 'fa-window-maximize',
        color: '#e67e22',
        hash: 'consultation',
        page: 'Lead Funnel'
      },
      {
        id: 'form-widgets',
        label: 'Form Widgets',
        desc: 'Manage custom forms list',
        path: '/website-settings/form-widgets',
        icon: 'fa-wpforms',
        color: '#8e44ad',
        hash: 'form-widgets',
        page: 'Lead Funnel'
      }
    ]
  },
  {
    title: 'Global Configuration',
    summary: 'Shared navigation, footer and detail page templates.',
    modules: [
      { id: 'navigation', label: 'Header & Navigation', desc: 'Brand, login CTAs and top navigation', path: '/website-settings/navigation', icon: 'fa-bars', color: '#2c3e50', hash: 'top', page: 'Global' },
      { id: 'detail-pages', label: 'Detail Pages', desc: 'University, course and city detail templates', path: '/website-settings/detail-pages', icon: 'fa-file-text', color: '#16a085', hash: 'top', page: 'Inner Pages' },
      { id: 'footer', label: 'Footer Settings', desc: 'Footer content and social links', path: '/website-settings/footer', icon: 'fa-shoe-prints', color: '#d35400', hash: 'footer', page: 'Global' },
      { id: 'about', label: 'About Page', desc: 'About Study in UAE page details', path: '/website-settings/about', icon: 'fa-info-circle', color: '#2980b9', hash: 'about', page: 'Global' },
      { id: 'contact', label: 'Contact Page', desc: 'Contact page details and info fields', path: '/website-settings/contact', icon: 'fa-envelope', color: '#c0392b', hash: '', page: 'Global' },
      { id: 'faqs', label: 'Manage FAQs', desc: 'Manage website FAQs', path: '/website-settings/faqs', icon: 'fa-question-circle', color: '#27ae60', hash: '', page: 'Global' },
      { id: 'blogs', label: 'Manage Blogs', desc: 'Manage website blogs', path: '/website-settings/blogs', icon: 'fa-rss', color: '#f1c40f', hash: '', page: 'Global' },
      { id: 'reviews', label: 'Manage Reviews', desc: 'Moderate student reviews', path: '/website-settings/reviews', icon: 'fa-comments', color: '#7f8c8d', hash: '', page: 'Global' }
    ]
  }
];

const pathToModuleMap = {
  '/website-settings/hero': 'hero',
  '/website-settings/intro-section': 'intro',
  '/website-settings/city-details': 'city-details',
  '/website-settings/detail-pages': 'detail-pages',
  '/website-settings/universities': 'universities',
  '/website-settings/programs': 'programs',
  '/website-settings/testimonials': 'testimonials',
  '/website-settings/blogs': 'blogs',
  '/website-settings/faqs': 'faqs',
  '/website-settings/consultation-modal': 'consultation-modal',
  '/website-settings/navigation': 'navigation',
  '/website-settings/footer': 'footer',
  '/website-settings/about': 'about',
  '/website-settings/contact': 'contact',
  '/website-settings/reviews': 'reviews',
  '/website-settings/form-widgets': 'form-widgets'
};

const allModules = groups.flatMap((group) => group.modules);

const previewConfigByModule = {
  hero: {
    path: '/',
    hash: 'hero',
    popupOpen: false,
    pageLabel: 'Landing Page'
  },
  intro: {
    path: '/',
    hash: 'intro',
    popupOpen: false,
    pageLabel: 'Landing Page'
  },
  'city-details': {
    path: '/city/Dubai',
    hash: '',
    popupOpen: false,
    pageLabel: 'City Details Page'
  },
  universities: {
    path: '/',
    hash: 'universities',
    popupOpen: false,
    pageLabel: 'Landing Page'
  },
  programs: {
    path: '/',
    hash: 'programs',
    popupOpen: false,
    pageLabel: 'Landing Page'
  },
  testimonials: {
    path: '/',
    hash: 'testimonials',
    popupOpen: false,
    pageLabel: 'Landing Page'
  },
  blogs: {
    path: '/',
    hash: 'blogs',
    popupOpen: false,
    pageLabel: 'Landing Page'
  },
  faqs: {
    path: '/',
    hash: 'faqs',
    popupOpen: false,
    pageLabel: 'Landing Page'
  },
  reviews: {
    path: '/',
    hash: 'testimonials',
    popupOpen: false,
    pageLabel: 'Landing Page'
  },
  'consultation-modal': {
    path: '/',
    hash: '',
    popupOpen: true,
    pageLabel: 'Landing Page'
  },
  navigation: {
    path: '/',
    hash: 'top',
    popupOpen: false,
    pageLabel: 'Landing Page'
  },
  'detail-pages': {
    path: '/university/Canadian%20University%20Dubai',
    hash: '',
    popupOpen: false,
    pageLabel: 'University Details Page'
  },
  footer: {
    path: '/',
    hash: 'footer',
    popupOpen: false,
    pageLabel: 'Landing Page'
  },
  about: {
    path: '/about-study-in-uae',
    hash: '',
    popupOpen: false,
    pageLabel: 'About Page'
  },
  contact: {
    path: '/contact-us',
    hash: '',
    popupOpen: false,
    pageLabel: 'Contact Page'
  },
  'form-widgets': {
    path: '/',
    hash: '',
    popupOpen: false,
    pageLabel: 'Landing Page'
  }
};

function getPreviewConfig(moduleId) {
  return (
    previewConfigByModule[moduleId] || {
      path: '/',
      hash: '',
      popupOpen: false,
      pageLabel: 'Landing Page'
    }
  );
}

export default function DashboardPreview() {
  const iframeRef = useRef(null);

  return (
    <PreviewSettingsProvider iframeRef={iframeRef}>
      <DashboardPreviewInner iframeRef={iframeRef} />
    </PreviewSettingsProvider>
  );
}

function DashboardPreviewInner({ iframeRef }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { generatePreviewToken, loading } = usePreviewSettings('hero');

  const [hoveredModule, setHoveredModule] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [viewMode, setViewMode] = useState('settings');
  const [previewPopupVisible, setPreviewPopupVisible] = useState(false);

  const [baseUrl, setBaseUrl] = useState('http://localhost:5173');

  useEffect(() => {
    const envUrl = process.env.REACT_APP_WEBSITE_URL;
    console.log("envurl---" + envUrl);

    // Check if the configured environment URL is a local address
    const isLocalUrl = envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'));

    if (envUrl && !isLocalUrl) {
      setBaseUrl(envUrl);
      return;
    }

    const checkWebsite = async (port) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 800);
        const res = await fetch(`http://localhost:${port}/`, { method: 'GET', signal: controller.signal });
        clearTimeout(timeoutId);
        const html = await res.text();
        return html.includes('Study in UAE') || html.includes('suae-website');
      } catch (e) {
        return false;
      }
    };

    const determineUrl = async () => {
      // 1. Try 5174 first
      const is5174 = await checkWebsite(5174);
      if (is5174) {
        setBaseUrl('http://localhost:5174');
        return;
      }

      // 2. Try 5173 next
      const is5173 = await checkWebsite(5173);
      if (is5173) {
        setBaseUrl('http://localhost:5173');
        return;
      }

      // 3. Fallback check with mode: 'no-cors' if HTML reading fails/CORS blocks it
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 800);
        await fetch('http://localhost:5173/', { method: 'GET', mode: 'no-cors', signal: controller.signal });
        clearTimeout(timeoutId);

        // 5173 is reachable, but let's see if 5174 is also reachable. If so, prefer 5174.
        try {
          const c2 = new AbortController();
          const t2 = setTimeout(() => c2.abort(), 800);
          await fetch('http://localhost:5174/', { method: 'GET', mode: 'no-cors', signal: c2.signal });
          clearTimeout(t2);
          setBaseUrl('http://localhost:5174');
        } catch {
          setBaseUrl('http://localhost:5173');
        }
      } catch {
        setBaseUrl('http://localhost:5174');
      }
    };

    determineUrl();
  }, []);

  const isSuperAdmin = util.isAdmin() === 1 || util.isClientAdmin() === 1;

  console.log("baseUrl--" + baseUrl);
  //console.log("envUrl--" + envUrl);
  console.log(process.env.REACT_APP_WEBSITE_URL);
  useEffect(() => {
    const moduleFromPath = pathToModuleMap[location.pathname] || null;
    setSelectedModule(moduleFromPath);
  }, [location.pathname]);

  useEffect(() => {
    const previewModule = hoveredModule || selectedModule;
    const activeConfig = getPreviewConfig(previewModule);

    const params = new URLSearchParams();
    params.set('consultation', previewPopupVisible ? 'open' : 'closed');

    const search = params.toString() ? `?${params.toString()}` : '';
    const hash = activeConfig.hash ? `#${activeConfig.hash}` : '';

    setPreviewUrl(`${baseUrl}${activeConfig.path}${search}${hash}`);
  }, [baseUrl, hoveredModule, selectedModule, previewPopupVisible]);

  useEffect(() => {
    const activeConfig = getPreviewConfig(selectedModule);
    setPreviewPopupVisible(activeConfig.popupOpen);
  }, [selectedModule]);

  const selectedModuleMeta = useMemo(() => {
    return allModules.find((module) => module.id === selectedModule) || null;
  }, [selectedModule]);

  const selectedPreviewConfig = useMemo(() => {
    return getPreviewConfig(selectedModule);
  }, [selectedModule]);

  const filteredGroups = useMemo(() => {
    return groups.map((group) => {
      const filteredModules = group.modules.filter((module) => {
        if (module.adminOnly && !isSuperAdmin) {
          return false;
        }

        return true;
      });

      return {
        ...group,
        modules: filteredModules
      };
    });
  }, [isSuperAdmin]);

  const refreshPreview = () => {
    if (!iframeRef.current) return;

    const currentSrc = iframeRef.current.src;
    iframeRef.current.src = 'about:blank';

    setTimeout(() => {
      iframeRef.current.src = currentSrc;
    }, 50);
  };

  const openFullPreview = async () => {
    try {
      const token = await generatePreviewToken();

      const params = new URLSearchParams();
      params.set('previewToken', token);
      params.set('consultation', previewPopupVisible ? 'open' : 'closed');

      const hash = selectedPreviewConfig.hash
        ? `#${selectedPreviewConfig.hash}`
        : '';

      window.open(
        `${baseUrl}${selectedPreviewConfig.path}?${params.toString()}${hash}`,
        '_blank'
      );
    } catch (err) {
      console.error('Failed to open full preview with token:', err);
      message.error('Failed to generate preview token. Opening default preview.');

      const params = new URLSearchParams();
      params.set('consultation', previewPopupVisible ? 'open' : 'closed');

      const hash = selectedPreviewConfig.hash
        ? `#${selectedPreviewConfig.hash}`
        : '';

      window.open(
        `${baseUrl}${selectedPreviewConfig.path}?${params.toString()}${hash}`,
        '_blank'
      );
    }
  };

  const goToModule = (module) => {
    setSelectedModule(module.id);
    setViewMode('settings');
    navigate(module.path);
  };

  const goHome = () => {
    setSelectedModule(null);
    navigate('/website-settings');
  };

  const renderForm = () => {
    switch (selectedModule) {
      case 'detail-pages':
        return <DetailPagesSection onBack={goHome} />;

      case 'hero':
        return <HeroSection onBack={goHome} />;

      case 'intro':
        return <IntroSection onBack={goHome} />;

      case 'city-details':
        return <CityDetailsForm onBack={goHome} />;

      // case 'universities':
      //   return <UniversitiesSection onBack={goHome} />;

      case 'programs':
        return <ProgramsSection onBack={goHome} />;

      case 'testimonials':
        return <TestimonialsSection onBack={goHome} />;

      case 'blogs':
        return <BlogSettingsForm onBack={goHome} />;

      case 'faqs':
        return <FaqSettingsForm onBack={goHome} />;

      case 'reviews':
        return <ManageReviewsPage onBack={goHome} />;

      case 'consultation-modal':
        return <ConsultationModal onBack={goHome} />;

      case 'form-widgets':
        return <FormWidgets onBack={goHome} />;

      case 'navigation':
        return <NavigationSettings onBack={goHome} />;

      case 'footer':
        return <FooterSettings onBack={goHome} />;

      case 'about':
        return <AboutSettings onBack={goHome} />;

      case 'contact':
        return <ContactSettings onBack={goHome} />;

      default:
        return <ConfigurationHome onSelect={goToModule} groups={filteredGroups} />;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#174a8b'
        }}
      >
        <i
          className="fa fa-spinner fa-spin"
          style={{ marginRight: '10px', fontSize: '24px' }}
        />
        Loading website configuration...
      </div>
    );
  }

  return (
    <div className="page-content cms-workspace-page">
      <div className="cms-shell">
        <aside className="cms-sidebar cms-sidebar-no-header">
          <button
            type="button"
            className={`cms-home-button ${selectedModule ? '' : 'active'}`}
            onClick={goHome}
          >
            <i className="fa fa-th-large" />
            <span>Configuration Overview</span>
          </button>

          <div className="cms-sidebar-scroll">
            {filteredGroups.map((group) => {
              if (!group.modules.length) return null;

              return (
                <div key={group.title} className="cms-nav-group">
                  <div className="cms-nav-group-title">{group.title}</div>
                  <div className="cms-nav-group-copy">{group.summary}</div>

                  <div className="cms-nav-list">
                    {group.modules.map((module) => {
                      const isActive = selectedModule === module.id;

                      return (
                        <button
                          key={module.id}
                          type="button"
                          className={`cms-nav-item ${isActive ? 'active' : ''}`}
                          onClick={() => goToModule(module)}
                          onMouseEnter={() => setHoveredModule(module.id)}
                          onMouseLeave={() => setHoveredModule(null)}
                        >
                          <div
                            className="cms-nav-icon"
                            style={{ '--icon-color': module.color }}
                          >
                            <i className={`fa ${module.icon}`} />
                          </div>

                          <div className="cms-nav-copy">
                            <div className="cms-nav-label">{module.label}</div>
                            <div className="cms-nav-desc">{module.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="cms-main">
          <div className="cms-toolbar">
            <div className="cms-toolbar-copy">
              <div className="cms-toolbar-title">
                {selectedModuleMeta
                  ? selectedModuleMeta.label
                  : 'Website Configuration'}
              </div>

              <div className="cms-toolbar-subtitle">
                {selectedModuleMeta
                  ? `${selectedModuleMeta.page} configuration${selectedPreviewConfig.pageLabel
                    ? ` · Previewing ${selectedPreviewConfig.pageLabel}`
                    : ''
                  }`
                  : 'Choose a page or component from the sidebar to edit its settings.'}
              </div>
            </div>


            <div className="cms-toolbar-actions">
              <div className="cms-view-toggle">
                {selectedModule && (
                  <button
                    type="button"
                    className="cms-common-back-btn"
                    onClick={goHome}
                  >
                    <i className="fa fa-arrow-left" />
                    Back
                  </button>
                )}

                <button
                  type="button"
                  className={viewMode === 'settings' ? 'active' : ''}
                  onClick={() => setViewMode('settings')}
                >
                  <i className="fa fa-sliders" />
                  Settings
                </button>

                <button
                  type="button"
                  className={viewMode === 'preview' ? 'active' : ''}
                  onClick={() => setViewMode('preview')}
                >
                  <i className="fa fa-eye" />
                  Live Preview
                </button>
              </div>

              {viewMode === 'preview' && (
                <div className="cms-preview-actions">
                  <button
                    type="button"
                    className={`btn btn-sm ${previewPopupVisible
                        ? 'cms-preview-open-btn'
                        : 'btn-default'
                      }`}
                    onClick={() =>
                      setPreviewPopupVisible((prev) => !prev)
                    }
                    title="Toggle consultation popup in preview"
                  >
                    <i
                      className={`fa ${previewPopupVisible
                          ? 'fa-window-close'
                          : 'fa-window-maximize'
                        }`}
                    />

                    {previewPopupVisible
                      ? 'Hide Popup'
                      : 'Show Popup'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-default btn-sm"
                    onClick={refreshPreview}
                    title="Refresh Preview"
                  >
                    <i className="fa fa-refresh" />
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm cms-preview-open-btn"
                    onClick={openFullPreview}
                  >
                    Open Full Preview

                    <i
                      className="fa fa-external-link"
                      style={{ marginLeft: '5px' }}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="cms-main-body">
            {viewMode === 'settings' ? (
              <div className="cms-panel-card cms-settings-panel">
                <div className="cms-panel-content">{renderForm()}</div>
              </div>
            ) : (
              <div className="cms-panel-card cms-preview-panel">
                <div className="cms-preview-frame">
                  <iframe
                    ref={iframeRef}
                    src={previewUrl}
                    title="Website Live Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ConfigurationHome({ onSelect, groups }) {
  return (
    <div className="cms-overview">
      <div className="cms-overview-header">
        <h3>Portal Configuration</h3>
        <p>
          Use this panel to manage the public-facing website as a set of pages,
          templates and shared content blocks.
        </p>
      </div>

      <div className="cms-overview-grid">
        {groups.map((group) => {
          if (!group.modules.length) return null;

          return (
            <div key={group.title} className="cms-overview-card">
              <div className="cms-overview-card-title">{group.title}</div>
              <div className="cms-overview-card-copy">{group.summary}</div>

              <div className="cms-overview-card-count">
                {group.modules.length} configurable items
              </div>

              <div className="cms-overview-links">
                {group.modules.map((module) => (
                  <button
                    key={module.id}
                    type="button"
                    className="cms-overview-link"
                    onClick={() => onSelect(module)}
                  >
                    <span>{module.label}</span>
                    <i className="fa fa-arrow-right" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
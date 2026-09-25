 // import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
// import axiosInstance from '../utils/axiosnode';
// import { message } from 'antd';
// import { initialData } from '../pages/website-settings/mockData';

// const PreviewSettingsContext = createContext(null);

// function mergeWithDefaults(defaultValue, incomingValue) {
//   if (Array.isArray(defaultValue)) {
//     return Array.isArray(incomingValue) ? incomingValue : defaultValue;
//   }

//   if (defaultValue && typeof defaultValue === 'object') {
//     const result = { ...defaultValue };
//     const source = incomingValue && typeof incomingValue === 'object' ? incomingValue : {};

//     Object.keys(source).forEach((key) => {
//       result[key] = key in defaultValue
//         ? mergeWithDefaults(defaultValue[key], source[key])
//         : source[key];
//     });

//     return result;
//   }

//   return incomingValue !== undefined ? incomingValue : defaultValue;
// }

// function isLegacyConsultationSection(consultation) {
//   const fields = consultation?.form?.fields;
//   if (!Array.isArray(fields) || fields.length === 0) {
//     return false;
//   }

//   const fieldNames = fields.map((field) => field?.name).filter(Boolean);
//   const legacyFieldSet = ['name', 'email', 'mobile'];
//   const isLegacyFieldShape =
//     fieldNames.length <= 3 &&
//     fieldNames.every((name) => legacyFieldSet.includes(name));

//   const isLegacyCopy =
//     consultation?.title === 'Get a Free Consultation' ||
//     consultation?.form?.submitButton === 'Get a Free Consultation';

//   return isLegacyFieldShape || isLegacyCopy;
// }

// function normalizeSettings(rawSettings) {
//   const merged = mergeWithDefaults(initialData, rawSettings || {});

//   if (isLegacyConsultationSection(rawSettings?.consultation)) {
//     merged.consultation = {
//       ...mergeWithDefaults(initialData.consultation, rawSettings?.consultation || {}),
//       title: initialData.consultation.title,
//       copy: initialData.consultation.copy,
//       form: {
//         ...mergeWithDefaults(initialData.consultation.form, rawSettings?.consultation?.form || {}),
//         fields: initialData.consultation.form.fields,
//         consentPrefix: initialData.consultation.form.consentPrefix,
//         termsLink: initialData.consultation.form.termsLink,
//         andWord: initialData.consultation.form.andWord,
//         privacyLink: initialData.consultation.form.privacyLink,
//         consentSuffix: initialData.consultation.form.consentSuffix,
//         submitButton: initialData.consultation.form.submitButton
//       }
//     };
//   }

//   return merged;
// }

// export function PreviewSettingsProvider({ children, iframeRef }) {
//   const [settings, setSettings] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(null); // stores the section name that is currently saving
//   const debounceTimers = useRef({});

//   // Fetch initial draft settings from backend
//   const fetchSettings = async () => {
//     setLoading(true);
//     try {
//       const response = await axiosInstance.get('/master/website-settings');
//       if (response.data && response.data.content) {
//         setSettings(normalizeSettings(response.data.content));
//       } else {
//         setSettings(initialData);
//       }
//     } catch (error) {
//       console.error('Error fetching website settings:', error);
//       setSettings(initialData);
//       message.error('Failed to load website settings, loaded local defaults');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSettings();
//   }, []);

//   // Listen for iframe readiness to send the full current snapshot
//   useEffect(() => {
//     const handleMessage = (event) => {
//       if (event.data && event.data.type === 'PREVIEW_READY') {
//         if (settings && iframeRef.current && iframeRef.current.contentWindow) {
//           iframeRef.current.contentWindow.postMessage({
//             type: 'PREVIEW_SNAPSHOT',
//             data: settings
//           }, '*');
//         }
//       }
//     };

//     window.addEventListener('message', handleMessage);
//     return () => window.removeEventListener('message', handleMessage);
//   }, [settings, iframeRef]);

//   // Debounced postMessage for preview sync
//   const debouncePostMessage = (section, sectionData) => {
//     if (debounceTimers.current[section]) {
//       clearTimeout(debounceTimers.current[section]);
//     }

//     debounceTimers.current[section] = setTimeout(() => {
//       if (iframeRef.current && iframeRef.current.contentWindow) {
//         iframeRef.current.contentWindow.postMessage({
//           type: 'PREVIEW_UPDATE',
//           section,
//           data: sectionData
//         }, '*');
//       }
//     }, 200); // 200ms debounce
//   };

//   // Update field generically, support nested fields (e.g. "primaryCta.label")
//   const updateField = (section, path, value) => {
//     setSettings((prev) => {
//       if (!prev) return prev;

//       const newSettings = { ...prev };

//       // Handle root-level replacement for the section if path is empty
//       if (path === '') {
//         newSettings[section] = value;
//         debouncePostMessage(section, value);
//         return newSettings;
//       }

//       const sectionData = Array.isArray(newSettings[section])
//         ? [...newSettings[section]]
//         : { ...newSettings[section] };

//       if (path.includes('.')) {
//         const parts = path.split('.');
//         let current = sectionData;
//         for (let i = 0; i < parts.length - 1; i++) {
//           current[parts[i]] = { ...current[parts[i]] };
//           current = current[parts[i]];
//         }
//         current[parts[parts.length - 1]] = value;
//       } else {
//         sectionData[path] = value;
//       }

//       newSettings[section] = sectionData;

//       // Trigger preview update
//       debouncePostMessage(section, sectionData);

//       return newSettings;
//     });
//   };

//   // Save specific section content to database
//   const saveSection = async (section) => {
//     setIsSaving(section);
//     try {
//       const sectionData = settings[section];
//       await axiosInstance.post('/master/website-settings', {
//         section,
//         data: sectionData
//       });
//       message.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`);
//     } catch (error) {
//       console.error(`Error saving ${section} settings:`, error);
//       message.error(`Failed to save ${section} settings`);
//     } finally {
//       setIsSaving(null);
//     }
//   };

//   // Generate preview token for full previews in a new tab
//   const generatePreviewToken = async () => {
//     try {
//       const response = await axiosInstance.post('/master/website-settings/preview-token', {
//         content: settings
//       });
//       return response.data.token;
//     } catch (error) {
//       console.error('Error generating preview token:', error);
//       throw error;
//     }
//   };

//   return (
//     <PreviewSettingsContext.Provider
//       value={{
//         settings,
//         loading,
//         isSaving,
//         updateField,
//         saveSection,
//         fetchSettings,
//         generatePreviewToken
//       }}
//     >
//       {children}
//     </PreviewSettingsContext.Provider>
//   );
// }

// // Hook helper for sections
// export function usePreviewSettings(section) {
//   const context = useContext(PreviewSettingsContext);
//   if (!context) {
//     throw new Error('usePreviewSettings must be used within a PreviewSettingsProvider');
//   }

//   const { settings, loading, isSaving, updateField, saveSection, generatePreviewToken } = context;

//   return {
//     data: settings ? settings[section] : null,
//     loading,
//     isSaving: isSaving === section,
//     updateField: (path, value) => updateField(section, path, value),
//     saveSection: () => saveSection(section),
//     updateSectionField: updateField,
//     saveNamedSection: saveSection,
//     fullSettings: settings,
//     generatePreviewToken
//   };
// }


import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axiosInstance from '../utils/axiosnode';
import { message } from 'antd';
import { initialData } from '../pages/website-settings/mockData';

const PreviewSettingsContext = createContext(null);

const requiredSectionDefaults = {
  about: {
    heroTitle: 'About Study in UAE',
    heroSubtitle: 'Your trusted guidance partner for studying in the UAE.',
    heroImage: '',
    introTitle: 'Helping students build their future in the UAE',
    introText:
      'We help students explore universities, courses, admissions, scholarships, and guidance for studying in the UAE.'
  },

  contact: {
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    badge: '',
    layout: 'full-width',
    alignment: 'left',
    accentColor: '#7fb2e5',
    backgroundColor: '#10233f',
    overlayOpacity: 60,
    sidebar: {
      title: '',
      copy: '',
      highlights: [],
      ctaLabel: '',
      ctaHref: '',
      lockOnHover: false
    },
    email: '',
    phone: '',
    address: '',
    workingHours: ''
  }
};

function mergeWithDefaults(defaultValue, incomingValue) {
  if (Array.isArray(defaultValue)) {
    return Array.isArray(incomingValue) && incomingValue.length > 0
      ? incomingValue
      : defaultValue;
  }

  if (defaultValue && typeof defaultValue === 'object') {
    const result = { ...defaultValue };
    const source =
      incomingValue && typeof incomingValue === 'object' && !Array.isArray(incomingValue)
        ? incomingValue
        : {};

    Object.keys(source).forEach((key) => {
      result[key] =
        key in defaultValue
          ? mergeWithDefaults(defaultValue[key], source[key])
          : source[key];
    });

    return result;
  }

  if (
    incomingValue === undefined ||
    incomingValue === null ||
    incomingValue === ''
  ) {
    return defaultValue;
  }

  return incomingValue;
}
const baseInitialData = mergeWithDefaults(requiredSectionDefaults, initialData || {});

function isLegacyConsultationSection(consultation) {
  const fields = consultation?.form?.fields;

  if (!Array.isArray(fields) || fields.length === 0) {
    return false;
  }

  const fieldNames = fields.map((field) => field?.name).filter(Boolean);
  const legacyFieldSet = ['name', 'email', 'mobile'];

  const isLegacyFieldShape =
    fieldNames.length <= 3 &&
    fieldNames.every((name) => legacyFieldSet.includes(name));

  const isLegacyCopy =
    consultation?.title === 'Get a Free Consultation' ||
    consultation?.form?.submitButton === 'Get a Free Consultation';

  return isLegacyFieldShape || isLegacyCopy;
}

function normalizeSettings(rawSettings) {
  const merged = mergeWithDefaults(baseInitialData, rawSettings || {});

  if (isLegacyConsultationSection(rawSettings?.consultation)) {
    merged.consultation = {
      ...mergeWithDefaults(baseInitialData.consultation, rawSettings?.consultation || {}),
      title: baseInitialData.consultation.title,
      copy: baseInitialData.consultation.copy,
      form: {
        ...mergeWithDefaults(
          baseInitialData.consultation.form,
          rawSettings?.consultation?.form || {}
        ),
        fields: baseInitialData.consultation.form.fields,
        consentPrefix: baseInitialData.consultation.form.consentPrefix,
        termsLink: baseInitialData.consultation.form.termsLink,
        andWord: baseInitialData.consultation.form.andWord,
        privacyLink: baseInitialData.consultation.form.privacyLink,
        consentSuffix: baseInitialData.consultation.form.consentSuffix,
        submitButton: baseInitialData.consultation.form.submitButton
      }
    };
  }

  return merged;
}

export function PreviewSettingsProvider({ children, iframeRef }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(null);
  const debounceTimers = useRef({});

  const fetchSettings = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.get('/master/website-settings');

      if (response.data && response.data.content) {
        setSettings(normalizeSettings(response.data.content));
      } else {
        setSettings(baseInitialData);
      }
    } catch (error) {
      console.error('Error fetching website settings:', error);
      setSettings(baseInitialData);
      message.error('Failed to load website settings, loaded local defaults');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'PREVIEW_READY') {
        if (settings && iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            {
              type: 'PREVIEW_SNAPSHOT',
              data: settings
            },
            '*'
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, [settings, iframeRef]);

  const debouncePostMessage = (section, sectionData) => {
    if (debounceTimers.current[section]) {
      clearTimeout(debounceTimers.current[section]);
    }

    debounceTimers.current[section] = setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'PREVIEW_UPDATE',
            section,
            data: sectionData
          },
          '*'
        );
      }
    }, 200);
  };

  const updateField = (section, path, value) => {
    setSettings((prev) => {
      if (!prev) return prev;

      const newSettings = { ...prev };

      if (path === '') {
        newSettings[section] = value;
        debouncePostMessage(section, value);
        return newSettings;
      }

      const existingSection =
        newSettings[section] !== undefined
          ? newSettings[section]
          : baseInitialData[section] || {};

      const sectionData = Array.isArray(existingSection)
        ? [...existingSection]
        : { ...existingSection };

      if (path.includes('.')) {
        const parts = path.split('.');
        let current = sectionData;

        for (let i = 0; i < parts.length - 1; i += 1) {
          const key = parts[i];

          current[key] =
            current[key] && typeof current[key] === 'object'
              ? { ...current[key] }
              : {};

          current = current[key];
        }

        current[parts[parts.length - 1]] = value;
      } else {
        sectionData[path] = value;
      }

      newSettings[section] = sectionData;
      debouncePostMessage(section, sectionData);

      return newSettings;
    });
  };

  const saveSection = async (section) => {
    setIsSaving(section);

    try {
      const sectionData =
        settings?.[section] !== undefined
          ? settings[section]
          : baseInitialData[section];

      await axiosInstance.post('/master/website-settings', {
        section,
        data: sectionData
      });

      message.success(
        `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`
      );
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error);
      message.error(`Failed to save ${section} settings`);
    } finally {
      setIsSaving(null);
    }
  };

  const generatePreviewToken = async () => {
    try {
      const response = await axiosInstance.post('/master/website-settings/preview-token', {
        content: settings
      });

      return response.data.token;
    } catch (error) {
      console.error('Error generating preview token:', error);
      throw error;
    }
  };

  return (
    <PreviewSettingsContext.Provider
      value={{
        settings,
        loading,
        isSaving,
        updateField,
        saveSection,
        fetchSettings,
        generatePreviewToken
      }}
    >
      {children}
    </PreviewSettingsContext.Provider>
  );
}

export function usePreviewSettings(section) {
  const context = useContext(PreviewSettingsContext);

  if (!context) {
    throw new Error('usePreviewSettings must be used within a PreviewSettingsProvider');
  }

  const {
    settings,
    loading,
    isSaving,
    updateField,
    saveSection,
    generatePreviewToken
  } = context;

  return {
    data: settings ? settings[section] : null,
    loading,
    isSaving: isSaving === section,
    updateField: (path, value) => updateField(section, path, value),
    saveSection: () => saveSection(section),
    updateSectionField: updateField,
    saveNamedSection: saveSection,
    fullSettings: settings,
    generatePreviewToken
  };
}

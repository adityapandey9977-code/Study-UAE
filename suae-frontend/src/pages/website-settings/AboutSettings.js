// import React from 'react';
// import { usePreviewSettings } from '../../context/PreviewSettingsContext';
// import './css/web-settings.css';

// export default function AboutSettings({ onBack }) {
//   const { data, updateField, saveSection, isSaving } = usePreviewSettings('about');

//   const handleSave = (e) => {
//     e.preventDefault();
//     saveSection();
//   };

//   if (!data) return null;

//   return (
//     <div className="hero-editor-card">
//       <div className="editor-header">
//         <div>
//           <h3>About Page Settings</h3>
//           <p>Manage About Study in UAE Page Details</p>
//         </div>
//         <button
//           type="button"
//           className="btn-back"
//           onClick={onBack}
//         >
//           <i className="fa fa-arrow-left" />
//           Back
//         </button>
//       </div>

//       <form onSubmit={handleSave}>
//         <div className="editor-body">
//           <div className="field">
//             <label>Hero Title</label>
//             <input
//               className="editor-input"
//               value={data.heroTitle || ''}
//               onChange={(e) => updateField('heroTitle', e.target.value)}
//             />
//           </div>

//           <div className="field">
//             <label>Hero Subtitle</label>
//             <textarea
//               rows={3}
//               className="editor-textarea"
//               value={data.heroSubtitle || ''}
//               onChange={(e) => updateField('heroSubtitle', e.target.value)}
//             />
//           </div>

//           <div className="field">
//             <label>Hero Image URL</label>
//             <input
//               className="editor-input"
//               value={data.heroImage || ''}
//               onChange={(e) => updateField('heroImage', e.target.value)}
//             />
//           </div>

//           <div className="field">
//             <label>Intro Title</label>
//             <input
//               className="editor-input"
//               value={data.introTitle || ''}
//               onChange={(e) => updateField('introTitle', e.target.value)}
//             />
//           </div>

//           <div className="field">
//             <label>Intro Description</label>
//             <textarea
//               rows={5}
//               className="editor-textarea"
//               value={data.introText || ''}
//               onChange={(e) => updateField('introText', e.target.value)}
//             />
//           </div>
//         </div>

//         <div className="editor-footer">
//           <button
//             type="button"
//             className="btn-cancel"
//             onClick={onBack}
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="btn-save"
//             disabled={isSaving}
//           >
//             {isSaving ? "Saving..." : "Save Changes"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }


import React from 'react';
import { usePreviewSettings } from '../../context/PreviewSettingsContext';
import './css/web-settings.css';

export default function AboutSettings({ onBack }) {
  const { data, updateField, saveSection, isSaving } =
    usePreviewSettings('about');

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSection();
  };

  if (!data) return null;

  return (
    <div className="about-editor-page">
      <form onSubmit={handleSave}>
        <div className="editor-body">
          <div className="about-two-panel-layout">
            <div className="about-left-panel">
              <div className="about-form-section">
                <h4 className="editor-section-title">
                  Hero Section
                </h4>

                <div className="field">
                  <label>Hero Title</label>

                  <input
                    className="editor-input"
                    value={data.heroTitle || ''}
                    onChange={(e) =>
                      updateField('heroTitle', e.target.value)
                    }
                    placeholder="Enter hero title"
                  />
                </div>

                <div className="field">
                  <label>Hero Subtitle</label>

                  <textarea
                    rows={4}
                    className="editor-textarea"
                    value={data.heroSubtitle || ''}
                    onChange={(e) =>
                      updateField('heroSubtitle', e.target.value)
                    }
                    placeholder="Enter hero subtitle"
                  />
                </div>

                <div className="field">
                  <label>Hero Image URL</label>

                  <input
                    className="editor-input"
                    value={data.heroImage || ''}
                    onChange={(e) =>
                      updateField('heroImage', e.target.value)
                    }
                    placeholder="Hero image URL"
                  />
                </div>
              </div>
            </div>

            <div className="about-right-panel">
              <div className="about-form-section">
                <h4 className="editor-section-title">
                  Intro Section
                </h4>

                <div className="field">
                  <label>Intro Title</label>

                  <input
                    className="editor-input"
                    value={data.introTitle || ''}
                    onChange={(e) =>
                      updateField('introTitle', e.target.value)
                    }
                    placeholder="Enter intro title"
                  />
                </div>

                <div className="field">
                  <label>Intro Description</label>

                  <textarea
                    rows={6}
                    className="editor-textarea"
                    value={data.introText || ''}
                    onChange={(e) =>
                      updateField('introText', e.target.value)
                    }
                    placeholder="Enter intro description"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="editor-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={onBack}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn-save"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}






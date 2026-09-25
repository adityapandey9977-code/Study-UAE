// import React from 'react';
// import { usePreviewSettings } from '../../context/PreviewSettingsContext';
// import './css/web-settings.css';

// export default function ContactSettings({ onBack }) {
//   const { data, updateField, saveSection, isSaving } = usePreviewSettings('contact');

//   const handleSave = (e) => {
//     e.preventDefault();
//     saveSection();
//   };

//   if (!data) return null;

//   return ( 
//     <div className="hero-editor-card">
//       <div className="editor-header">
//         <div>
//           <h3>Contact Page Settings</h3>
//           <p>Manage Contact Page details and info fields</p>
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
//             <label>Hero Badge</label>
//             <input
//               className="editor-input"
//               value={data.badge || ''}
//               onChange={(e) => updateField('badge', e.target.value)}
//             />
//           </div>

//           <div className="field">
//             <label>Hero Layout</label>
//             <select
//               className="editor-input"
//               value={data.layout || 'full-width'}
//               onChange={(e) => updateField('layout', e.target.value)}
//             >
//               <option value="full-width">Full Width</option>
//               <option value="sidebar">Sidebar</option>
//             </select>
//           </div>

//           <div className="field">
//             <label>Text Alignment</label>
//             <select
//               className="editor-input"
//               value={data.alignment || 'left'}
//               onChange={(e) => updateField('alignment', e.target.value)}
//             >
//               <option value="left">Left</option>
//               <option value="center">Center</option>
//               <option value="right">Right</option>
//             </select>
//           </div>

//           <div className="field">
//             <label>Accent Color (hex)</label>
//             <input
//               className="editor-input"
//               value={data.accentColor || '#7fb2e5'}
//               onChange={(e) => updateField('accentColor', e.target.value)}
//             />
//           </div>
//           <div className="field">
//             <label>Hero Background Color (hex)</label>
//             <input
//               className="editor-input"
//               value={data.backgroundColor || '#10233f'}
//               onChange={(e) => updateField('backgroundColor', e.target.value)}
//             />
//           </div>

//           <div className="field" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
//             <div style={{ flex: 1 }}>
//               <label>Accent Color (picker)</label>
//               <input
//                 type="color"
//                 className="editor-input"
//                 value={data.accentColor ? data.accentColor : '#7fb2e5'}
//                 onChange={(e) => updateField('accentColor', e.target.value)}
//                 style={{ width: 56, height: 36, padding: 0, border: 'none', background: 'transparent' }}
//               />
//           <div className="field">
//             <label>Sidebar Section (title)</label>
//             <input
//               className="editor-input"
//               value={(data.sidebar && data.sidebar.title) || ''}
//               onChange={(e) => updateField('sidebar.title', e.target.value)}
//             />
//           </div>

//           <div className="field">
//             <label>Sidebar Copy</label>
//             <textarea
//               rows={2}
//               className="editor-textarea"
//               value={(data.sidebar && data.sidebar.copy) || ''}
//               onChange={(e) => updateField('sidebar.copy', e.target.value)}
//             />
//           </div>

//           <div className="field">
//             <label>Sidebar Highlights (comma separated)</label>
//             <input
//               className="editor-input"
//               value={(data.sidebar && (data.sidebar.highlights || []).join(', ')) || ''}
//               onChange={(e) => updateField('sidebar.highlights', e.target.value.split(',').map(s=>s.trim()))}
//             />
//           </div>

//           <div className="field" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
//             <div style={{ flex: 1 }}>
//               <label>Sidebar CTA Label</label>
//               <input className="editor-input" value={(data.sidebar && data.sidebar.ctaLabel) || ''} onChange={(e) => updateField('sidebar.ctaLabel', e.target.value)} />
//             </div>
//             <div style={{ flex: 1 }}>
//               <label>Sidebar CTA Href</label>
//               <input className="editor-input" value={(data.sidebar && data.sidebar.ctaHref) || ''} onChange={(e) => updateField('sidebar.ctaHref', e.target.value)} />
//             </div>
//           </div>

//           <div className="field">
//             <label>Lock Sidebar On Hover</label>
//             <select className="editor-input" value={data.sidebar?.lockOnHover ? 'yes' : 'no'} onChange={(e) => updateField('sidebar.lockOnHover', e.target.value === 'yes')}>
//               <option value="no">No</option>
//               <option value="yes">Yes</option>
//             </select>
//           </div>
//             </div>
//             <div style={{ width: 48, height: 36, borderRadius: 6, border: '1px solid #e6eef7', background: data.accentColor || '#7fb2e5' }} aria-hidden="true" />
//           </div>

//           <div className="field">
//             <label>Overlay Opacity (0-100)</label>
//             <input
//               type="number"
//               min="0"
//               max="100"
//               className="editor-input"
//               value={data.overlayOpacity || 60}
//               onChange={(e) => updateField('overlayOpacity', Number(e.target.value))}
//             />
//           </div>

//           <div className="field">
//             <label>Email Address</label>
//             <input
//               className="editor-input"
//               value={data.email || ''}
//               onChange={(e) => updateField('email', e.target.value)}
//             />
//           </div>

//           <div className="field">
//             <label>Phone Number</label>
//             <input
//               className="editor-input"
//               value={data.phone || ''}
//               onChange={(e) => updateField('phone', e.target.value)}
//             />
//           </div>

//           <div className="field">
//             <label>Office Address</label>
//             <textarea
//               rows={2}
//               className="editor-textarea"
//               value={data.address || ''}
//               onChange={(e) => updateField('address', e.target.value)}
//             />
//           </div>

//           <div className="field">
//             <label>Working Hours</label>
//             <input
//               className="editor-input"
//               value={data.workingHours || ''}
//               onChange={(e) => updateField('workingHours', e.target.value)}
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

export default function ContactSettings({ onBack }) {
  const { data, updateField, saveSection, isSaving } =
    usePreviewSettings('contact');

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSection();
  };

  if (!data) return null;

  return (
    <div className="contact-editor-page">
      <form onSubmit={handleSave}>
        <div className="editor-body">
          <div className="contact-two-panel-layout">
            <div className="contact-left-panel">
              <div className="contact-form-section">
                <h4 className="editor-section-title">
                  Hero Content
                </h4>

                <div className="field">
                  <label>Hero Title</label>

                  <input
                    className="editor-input"
                    value={data.heroTitle || ''}
                    onChange={(e) =>
                      updateField('heroTitle', e.target.value)
                    }
                    placeholder="Enter contact page hero title"
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
                    placeholder="Enter contact page hero subtitle"
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
                    placeholder="Paste hero image URL"
                  />
                </div>

                <div className="field">
                  <label>Hero Badge</label>

                  <input
                    className="editor-input"
                    value={data.badge || ''}
                    onChange={(e) =>
                      updateField('badge', e.target.value)
                    }
                    placeholder="Enter hero badge"
                  />
                </div>
              </div>

              <div className="contact-form-section">
                <h4 className="editor-section-title">
                  Contact Information
                </h4>

                <div className="contact-inner-grid two-col">
                  <div className="field">
                    <label>Email Address</label>

                    <input
                      className="editor-input"
                      value={data.email || ''}
                      onChange={(e) =>
                        updateField('email', e.target.value)
                      }
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="field">
                    <label>Phone Number</label>

                    <input
                      className="editor-input"
                      value={data.phone || ''}
                      onChange={(e) =>
                        updateField('phone', e.target.value)
                      }
                      placeholder="+971 XX XXX XXXX"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Office Address</label>

                  <textarea
                    rows={3}
                    className="editor-textarea"
                    value={data.address || ''}
                    onChange={(e) =>
                      updateField('address', e.target.value)
                    }
                    placeholder="Enter office address"
                  />
                </div>

                <div className="field">
                  <label>Working Hours</label>

                  <input
                    className="editor-input"
                    value={data.workingHours || ''}
                    onChange={(e) =>
                      updateField('workingHours', e.target.value)
                    }
                    placeholder="Monday - Friday, 9 AM - 6 PM"
                  />
                </div>
              </div>
            </div>

            <div className="contact-right-panel">
              <div className="contact-form-section">
                <h4 className="editor-section-title">
                  Hero Layout & Colors
                </h4>

                <div className="contact-inner-grid two-col">
                  <div className="field">
                    <label>Hero Layout</label>

                    <select
                      className="editor-input"
                      value={data.layout || 'full-width'}
                      onChange={(e) =>
                        updateField('layout', e.target.value)
                      }
                    >
                      <option value="full-width">
                        Full Width
                      </option>

                      <option value="sidebar">
                        Sidebar
                      </option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Text Alignment</label>

                    <select
                      className="editor-input"
                      value={data.alignment || 'left'}
                      onChange={(e) =>
                        updateField('alignment', e.target.value)
                      }
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label>Accent Color</label>

                  <div className="input-with-color">
                    <input
                      className="editor-input"
                      value={data.accentColor || '#7fb2e5'}
                      onChange={(e) =>
                        updateField(
                          'accentColor',
                          e.target.value
                        )
                      }
                      placeholder="#7fb2e5"
                    />

                    <input
                      type="color"
                      value={data.accentColor || '#7fb2e5'}
                      onChange={(e) =>
                        updateField(
                          'accentColor',
                          e.target.value
                        )
                      }
                      className="color-input"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Hero Background Color</label>

                  <div className="input-with-color">
                    <input
                      className="editor-input"
                      value={
                        data.backgroundColor || '#10233f'
                      }
                      onChange={(e) =>
                        updateField(
                          'backgroundColor',
                          e.target.value
                        )
                      }
                      placeholder="#10233f"
                    />

                    <input
                      type="color"
                      value={
                        data.backgroundColor || '#10233f'
                      }
                      onChange={(e) =>
                        updateField(
                          'backgroundColor',
                          e.target.value
                        )
                      }
                      className="color-input"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>
                    Overlay Opacity:{' '}
                    {data.overlayOpacity ?? 60}%
                  </label>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="contact-range-input"
                    value={data.overlayOpacity ?? 60}
                    onChange={(e) =>
                      updateField(
                        'overlayOpacity',
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
              </div>

              <div className="contact-form-section">
                <h4 className="editor-section-title">
                  Sidebar Section
                </h4>

                <div className="field">
                  <label>Sidebar Title</label>

                  <input
                    className="editor-input"
                    value={data.sidebar?.title || ''}
                    onChange={(e) =>
                      updateField(
                        'sidebar.title',
                        e.target.value
                      )
                    }
                    placeholder="Sidebar title"
                  />
                </div>

                <div className="field">
                  <label>Sidebar Copy</label>

                  <textarea
                    rows={3}
                    className="editor-textarea"
                    value={data.sidebar?.copy || ''}
                    onChange={(e) =>
                      updateField(
                        'sidebar.copy',
                        e.target.value
                      )
                    }
                    placeholder="Sidebar copy"
                  />
                </div>

                <div className="field">
                  <label>
                    Sidebar Highlights - Comma Separated
                  </label>

                  <input
                    className="editor-input"
                    value={(
                      data.sidebar?.highlights || []
                    ).join(', ')}
                    onChange={(e) =>
                      updateField(
                        'sidebar.highlights',
                        e.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="Fast response, Expert guidance, Free support"
                  />
                </div>

                <div className="contact-inner-grid two-col">
                  <div className="field">
                    <label>Sidebar CTA Label</label>

                    <input
                      className="editor-input"
                      value={data.sidebar?.ctaLabel || ''}
                      onChange={(e) =>
                        updateField(
                          'sidebar.ctaLabel',
                          e.target.value
                        )
                      }
                      placeholder="Talk to Advisor"
                    />
                  </div>

                  <div className="field">
                    <label>Sidebar CTA Href</label>

                    <input
                      className="editor-input"
                      value={data.sidebar?.ctaHref || ''}
                      onChange={(e) =>
                        updateField(
                          'sidebar.ctaHref',
                          e.target.value
                        )
                      }
                      placeholder="/contact"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Lock Sidebar On Hover</label>

                  <select
                    className="editor-input"
                    value={
                      data.sidebar?.lockOnHover
                        ? 'yes'
                        : 'no'
                    }
                    onChange={(e) =>
                      updateField(
                        'sidebar.lockOnHover',
                        e.target.value === 'yes'
                      )
                    }
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
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




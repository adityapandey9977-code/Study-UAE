// import React from 'react';
// import { usePreviewSettings } from '../../context/PreviewSettingsContext';
// import './css/web-settings.css';

// export default function NavigationSettings({ onBack }) {
//   const { data: navigation, fullSettings, updateField, saveSection, saveNamedSection, updateSectionField, isSaving } = usePreviewSettings('navigation');
//   const brand = fullSettings?.brand || {};
//   const header = fullSettings?.header || {};

//   const handleLinkChange = (index, field, value) => {
//     const updated = [...(navigation || [])];
//     updated[index] = {
//       ...updated[index],
//       [field]: value
//     };
//     updateField('', updated);
//   };

//   const handleRemoveLink = (index) => {
//     updateField('', (navigation || []).filter((_, i) => i !== index));
//   };

//   const handleAddLink = () => {
//     updateField('', [...(navigation || []), { label: 'New Link', href: '#' }]);
//   };

//   const saveAll = async () => {
//     await Promise.all([
//       saveNamedSection('brand'),
//       saveNamedSection('header'),
//       saveSection()
//     ]);
//   };

//   if (!navigation) return null;

//   return (
//     <div className="hero-editor-card">
//       <div className="editor-header">
//         <div>
//           <h3>Header & Navigation</h3>
//           <p>Manage brand text, login CTAs and top navigation links</p>
//         </div>
//         <button type="button" className="btn-back" onClick={onBack}>
//           <i className="fa fa-arrow-left" />
//           Back
//         </button>
//       </div>

//       <form onSubmit={(e) => { e.preventDefault(); saveAll(); }}>
//         <div className="editor-body">
//           <h4 className="editor-section-title">Brand</h4>
//           <div className="row">
//             <div className="col-md-6">
//               <div className="field">
//                 <label>Brand Name</label>
//                   <input
//                     className="editor-input"
//                     value={brand.name || ''}
//                     onChange={(e) => updateSectionField('brand', 'name', e.target.value)}
//                   />
//                 </div>
//               </div>
//             <div className="col-md-6">
//               <div className="field">
//                 <label>Strapline</label>
//                   <input
//                     className="editor-input"
//                     value={brand.strapline || ''}
//                     onChange={(e) => updateSectionField('brand', 'strapline', e.target.value)}
//                   />
//                 </div>
//               </div>
//           </div>

//           <h4 className="editor-section-title">Header Actions</h4>
//           <div className="editor-sub-card">
//             <div className="row">
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Student Login Label</label>
//                   <input
//                     className="editor-input"
//                     value={header.loginStudent?.label || ''}
//                     onChange={(e) => updateSectionField('header', 'loginStudent.label', e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Student Login URL</label>
//                   <input
//                     className="editor-input"
//                     value={header.loginStudent?.href || ''}
//                     onChange={(e) => updateSectionField('header', 'loginStudent.href', e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="row">
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Institution Login Label</label>
//                   <input
//                     className="editor-input"
//                     value={header.loginInstitution?.label || ''}
//                     onChange={(e) => updateSectionField('header', 'loginInstitution.label', e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Institution Login URL</label>
//                   <input
//                     className="editor-input"
//                     value={header.loginInstitution?.href || ''}
//                     onChange={(e) => updateSectionField('header', 'loginInstitution.href', e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="row">
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Primary CTA Label</label>
//                   <input
//                     className="editor-input"
//                     value={header.applyCta?.label || ''}
//                     onChange={(e) => updateSectionField('header', 'applyCta.label', e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Primary CTA URL</label>
//                   <input
//                     className="editor-input"
//                     value={header.applyCta?.href || ''}
//                     onChange={(e) => updateSectionField('header', 'applyCta.href', e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <h4 className="editor-section-title">Navigation Links</h4>
//           {navigation.map((nav, index) => (
//             <div key={index} className="editor-sub-card">
//               <div className="row">
//                 <div className="col-md-5">
//                   <div className="field">
//                     <label>Label</label>
//                     <input
//                       className="editor-input"
//                       value={nav.label || ''}
//                       onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
//                     />
//                   </div>
//                 </div>
//                 <div className="col-md-6">
//                   <div className="field">
//                     <label>URL</label>
//                     <input
//                       className="editor-input"
//                       value={nav.href || ''}
//                       onChange={(e) => handleLinkChange(index, 'href', e.target.value)}
//                     />
//                   </div>
//                 </div>
//                 <div className="col-md-1">
//                   <div className="field">
//                     <label>&nbsp;</label>
//                     <button type="button" className="btn-delete" onClick={() => handleRemoveLink(index)}>
//                       <i className="fa fa-trash" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}

//           <button type="button" className="btn-add-link" onClick={handleAddLink}>
//             <i className="fa fa-plus" />
//             Add Navigation Link
//           </button>
//         </div>

//         <div className="editor-footer">
//           <button type="button" className="btn-cancel" onClick={onBack}>
//             Cancel
//           </button>
//           <button type="submit" className="btn-save" disabled={isSaving}>
//             {isSaving ? 'Saving...' : 'Save Changes'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }






import React from 'react';
import { usePreviewSettings } from '../../context/PreviewSettingsContext';
import './css/web-settings.css';

export default function NavigationSettings({ onBack }) {
  const {
    data: navigation,
    fullSettings,
    updateField,
    saveSection,
    saveNamedSection,
    updateSectionField,
    isSaving
  } = usePreviewSettings('navigation');

  const brand = fullSettings?.brand || {};
  const header = fullSettings?.header || {};

  const handleLinkChange = (index, field, value) => {
    const updated = [...(navigation || [])];

    updated[index] = {
      ...updated[index],
      [field]: value
    };

    updateField('', updated);
  };

  const handleRemoveLink = (index) => {
    updateField(
      '',
      (navigation || []).filter((_, i) => i !== index)
    );
  };

  const handleAddLink = () => {
    updateField('', [
      ...(navigation || []),
      {
        label: 'New Link',
        href: '#'
      }
    ]);
  };

  const saveAll = async () => {
    await Promise.all([
      saveNamedSection('brand'),
      saveNamedSection('header'),
      saveSection()
    ]);
  };

  if (!navigation) return null;

  return (
    <div className="navigation-editor-page">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveAll();
        }}
      >
        <div className="editor-body">
          <div className="navigation-two-panel-layout">
            <div className="navigation-left-panel">
              <div className="navigation-form-section">
                <h4 className="editor-section-title">
                  Brand
                </h4>

                <div className="navigation-inner-grid two-col">
                  <div className="field">
                    <label>Brand Name</label>

                    <input
                      className="editor-input"
                      value={brand.name || ''}
                      onChange={(e) =>
                        updateSectionField(
                          'brand',
                          'name',
                          e.target.value
                        )
                      }
                      placeholder="Brand name"
                    />
                  </div>

                  <div className="field">
                    <label>Strapline</label>

                    <input
                      className="editor-input"
                      value={brand.strapline || ''}
                      onChange={(e) =>
                        updateSectionField(
                          'brand',
                          'strapline',
                          e.target.value
                        )
                      }
                      placeholder="Brand strapline"
                    />
                  </div>
                </div>
              </div>

              <div className="navigation-form-section">
                <h4 className="editor-section-title">
                  Header Actions
                </h4>

                <div className="navigation-inner-grid two-col">
                  <div className="field">
                    <label>Student Login Label</label>

                    <input
                      className="editor-input"
                      value={header.loginStudent?.label || ''}
                      onChange={(e) =>
                        updateSectionField(
                          'header',
                          'loginStudent.label',
                          e.target.value
                        )
                      }
                      placeholder="Student Login"
                    />
                  </div>

                  <div className="field">
                    <label>Student Login URL</label>

                    <input
                      className="editor-input"
                      value={header.loginStudent?.href || ''}
                      onChange={(e) =>
                        updateSectionField(
                          'header',
                          'loginStudent.href',
                          e.target.value
                        )
                      }
                      placeholder="/student-login"
                    />
                  </div>

                  <div className="field">
                    <label>Institution Login Label</label>

                    <input
                      className="editor-input"
                      value={
                        header.loginInstitution?.label || ''
                      }
                      onChange={(e) =>
                        updateSectionField(
                          'header',
                          'loginInstitution.label',
                          e.target.value
                        )
                      }
                      placeholder="Institution Login"
                    />
                  </div>

                  <div className="field">
                    <label>Institution Login URL</label>

                    <input
                      className="editor-input"
                      value={
                        header.loginInstitution?.href || ''
                      }
                      onChange={(e) =>
                        updateSectionField(
                          'header',
                          'loginInstitution.href',
                          e.target.value
                        )
                      }
                      placeholder="/institution-login"
                    />
                  </div>

                  <div className="field">
                    <label>Primary CTA Label</label>

                    <input
                      className="editor-input"
                      value={header.applyCta?.label || ''}
                      onChange={(e) =>
                        updateSectionField(
                          'header',
                          'applyCta.label',
                          e.target.value
                        )
                      }
                      placeholder="Apply Now"
                    />
                  </div>

                  <div className="field">
                    <label>Primary CTA URL</label>

                    <input
                      className="editor-input"
                      value={header.applyCta?.href || ''}
                      onChange={(e) =>
                        updateSectionField(
                          'header',
                          'applyCta.href',
                          e.target.value
                        )
                      }
                      placeholder="/apply"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="navigation-right-panel">
              <div className="navigation-form-section navigation-links-section">
                <div className="navigation-section-head">
                  <div>
                    <h4 className="editor-section-title">
                      Navigation Links
                    </h4>

                    <p>
                      {(navigation || []).length} links configured
                    </p>
                  </div>

                  <button
                    type="button"
                    className="navigation-add-btn"
                    onClick={handleAddLink}
                  >
                    <i className="fa fa-plus" />
                    Add Link
                  </button>
                </div>

                <div className="navigation-link-list">
                  {(navigation || []).map((nav, index) => (
                    <div
                      key={index}
                      className="navigation-link-card"
                    >
                      <div className="navigation-link-card-head">
                        <div>
                          <h5>
                            {nav.label ||
                              `Navigation Link ${index + 1}`}
                          </h5>

                          <p>{nav.href || '#'}</p>
                        </div>

                        <button
                          type="button"
                          className="navigation-delete-btn"
                          onClick={() =>
                            handleRemoveLink(index)
                          }
                          aria-label="Delete navigation link"
                        >
                          <i className="fa fa-trash" />
                        </button>
                      </div>

                      <div className="navigation-inner-grid two-col">
                        <div className="field">
                          <label>Label</label>

                          <input
                            className="editor-input"
                            value={nav.label || ''}
                            onChange={(e) =>
                              handleLinkChange(
                                index,
                                'label',
                                e.target.value
                              )
                            }
                            placeholder="Link label"
                          />
                        </div>

                        <div className="field">
                          <label>URL</label>

                          <input
                            className="editor-input"
                            value={nav.href || ''}
                            onChange={(e) =>
                              handleLinkChange(
                                index,
                                'href',
                                e.target.value
                              )
                            }
                            placeholder="/page-url"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* <div className="navigation-form-section">
                <h4 className="editor-section-title">
                  Quick Summary
                </h4>

                <div className="navigation-summary-grid">
                  <div>
                    <strong>
                      {(navigation || []).length}
                    </strong>

                    <span>Navigation Links</span>
                  </div>

                  <div>
                    <strong>
                      {brand.name ? 'Yes' : 'No'}
                    </strong>

                    <span>Brand Configured</span>
                  </div>
                </div>
              </div> */}


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
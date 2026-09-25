// import React, { useState } from 'react';
// import { usePreviewSettings } from '../../context/PreviewSettingsContext';
// import FileService from '../../services/FileService';
// import './css/web-settings.css';

// export default function HeroSection({ onBack }) {
//   const { data, updateField, saveSection, isSaving } = usePreviewSettings('hero');
//   const [isUploading, setIsUploading] = useState(false);

//   const handleSave = (e) => {
//     e.preventDefault();
//     saveSection();
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setIsUploading(true);
//     try {
//       const res = await FileService.upload(file);
//       if (res && res.data && res.data.file_url) {
//         updateField('background', res.data.file_url);
//       }
//     } catch (err) {
//       console.error('Error uploading image:', err);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handlePopularCityChange = (index, value) => {
//     const updated = [...(data.popularCities || [])];
//     updated[index] = value;
//     updateField('popularCities', updated);
//   };

//   const addPopularCity = () => {
//     updateField('popularCities', [...(data.popularCities || []), 'New City']);
//   };

//   const removePopularCity = (index) => {
//     updateField('popularCities', (data.popularCities || []).filter((_, i) => i !== index));
//   };

//   if (!data) return null;

//   return (
//     <div className="">
//       <div className="hero-editor-card">
//         <div className="editor-header">
//           <div>
//             <h3>Hero Section</h3>
//             <p>Manage Landing Page Content</p>
//           </div>
//           <button
//             type="button"
//             className="btn-back"
//             onClick={onBack}
//           >
//             <i className="fa fa-arrow-left" style={{ marginRight: '8px' }} />
//             Back
//           </button>
//         </div>
//         <form onSubmit={handleSave}>
//           <div className="editor-body">
            
//             {/* Main Title */}
//             <div className="field">
//               <label>Hero Badge</label>
//               <input
//                 className="editor-input"
//                 value={data.badge || ''}
//                 onChange={(e) => updateField('badge', e.target.value)}
//                 placeholder="e.g. #1 Study Destination in the Middle East"
//               />
//             </div>

//             <div className="field">
//               <label>Main Title</label>
//               <div className="input-with-color">
//                 <input
//                   className="editor-input"
//                   value={data.title || ''}
//                   onChange={(e) => updateField('title', e.target.value)}
//                 />
//                 <input
//                   type="color"
//                   value={data.titleColor || '#ffffff'}
//                   onChange={(e) => updateField('titleColor', e.target.value)}
//                   className="color-input"
//                 />
//               </div>
//             </div>

//             {/* Subtitle */}
//             <div className="field">
//               <label>Subtitle</label>
//               <div className="input-with-color" >
//                 <textarea
//                   rows={4}
//                   className="editor-textarea"
//                   value={data.copy || ''}
//                   onChange={(e) => updateField('copy', e.target.value)}
//                 />
//                 <input
//                   type="color"
//                   value={data.copyColor || '#ffffff'}
//                   onChange={(e) => updateField('copyColor', e.target.value)}
//                   className="color-input"
//                 />
//               </div>
//             </div>

//             <div className="row">
//               <div className="col-md-4">
//                 <div className="field">
//                   <label>Hero Layout</label>
//                   <select
//                     className="editor-input"
//                     value={data.layout || 'full-width'}
//                     onChange={(e) => updateField('layout', e.target.value)}
//                   >
//                     <option value="full-width">Full Width</option>
//                     <option value="sidebar">Sidebar</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="col-md-4">
//                 <div className="field">
//                   <label>Text Alignment</label>
//                   <select
//                     className="editor-input"
//                     value={data.alignment || 'center'}
//                     onChange={(e) => updateField('alignment', e.target.value)}
//                   >
//                     <option value="center">Center</option>
//                     <option value="left">Left</option>
//                     <option value="right">Right</option>
//                   </select>
//                 </div>
//               </div>
//               <div className="col-md-4">
//                 <div className="field">
//                   <label>Accent Color</label>
//                   <div className="input-with-color">
//                     <input
//                       className="editor-input"
//                       value={data.accentColor || '#7fb2e5'}
//                       onChange={(e) => updateField('accentColor', e.target.value)}
//                       placeholder="#7fb2e5"
//                     />
//                     <input
//                       type="color"
//                       value={data.accentColor || '#7fb2e5'}
//                       onChange={(e) => updateField('accentColor', e.target.value)}
//                       className="color-input"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="field">
//               <label>Overlay Strength: {data.overlayOpacity ?? 70}%</label>
//               <input
//                 type="range"
//                 min="0"
//                 max="100"
//                 value={data.overlayOpacity ?? 70}
//                 onChange={(e) => updateField('overlayOpacity', Number(e.target.value))}
//                 style={{ width: '100%' }}
//               />
//             </div>

//             <div className="row">
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Search Placeholder</label>
//                   <input
//                     className="editor-input"
//                     value={data.search?.placeholder || ''}
//                     onChange={(e) => updateField('search.placeholder', e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Search Button Label</label>
//                   <input
//                     className="editor-input"
//                     value={data.search?.button || ''}
//                     onChange={(e) => updateField('search.button', e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>

//             <h4 className="editor-section-title">Popular Cities</h4>
//             {(data.popularCities || []).map((city, index) => (
//               <div key={index} className="editor-sub-card">
//                 <div className="row">
//                   <div className="col-md-11">
//                     <div className="field" style={{ marginBottom: 0 }}>
//                       <label>City {index + 1}</label>
//                       <input
//                         className="editor-input"
//                         value={city || ''}
//                         onChange={(e) => handlePopularCityChange(index, e.target.value)}
//                       />
//                     </div>
//                   </div>
//                   <div className="col-md-1">
//                     <div className="field" style={{ marginBottom: 0 }}>
//                       <label>&nbsp;</label>
//                       <button type="button" className="btn-delete" onClick={() => removePopularCity(index)}>
//                         <i className="fa fa-trash" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//             <button type="button" className="btn-add-link" onClick={addPopularCity}>
//               <i className="fa fa-plus" />
//               Add Popular City
//             </button>

//             <h4 className="editor-section-title">Social Proof</h4>
//             <div className="row">
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Social Proof Title</label>
//                   <input
//                     className="editor-input"
//                     value={data.socialProof?.title || ''}
//                     onChange={(e) => updateField('socialProof.title', e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Social Proof Copy</label>
//                   <input
//                     className="editor-input"
//                     value={data.socialProof?.copy || ''}
//                     onChange={(e) => updateField('socialProof.copy', e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Background Image (File Upload & URL) */}
//             <div className="row">
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Primary CTA Label</label>
//                   <input
//                     className="editor-input"
//                     value={data.primaryCta?.label || ''}
//                     onChange={(e) => updateField('primaryCta.label', e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Primary CTA Link</label>
//                   <input
//                     className="editor-input"
//                     value={data.primaryCta?.href || ''}
//                     onChange={(e) => updateField('primaryCta.href', e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="row">
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Secondary CTA Label</label>
//                   <input
//                     className="editor-input"
//                     value={data.secondaryCta?.label || ''}
//                     onChange={(e) => updateField('secondaryCta.label', e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Secondary CTA Link</label>
//                   <input
//                     className="editor-input"
//                     value={data.secondaryCta?.href || ''}
//                     onChange={(e) => updateField('secondaryCta.href', e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="field">
//               <label>Popular Label</label>
//               <input
//                 className="editor-input"
//                 value={data.popularLabel || 'Popular:'}
//                 onChange={(e) => updateField('popularLabel', e.target.value)}
//               />
//             </div>

//             <div className="row">
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Social Proof Title</label>
//                   <input
//                     className="editor-input"
//                     value={data.socialProof?.title || ''}
//                     onChange={(e) => updateField('socialProof.title', e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Social Proof Copy</label>
//                   <input
//                     className="editor-input"
//                     value={data.socialProof?.copy || ''}
//                     onChange={(e) => updateField('socialProof.copy', e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="field">
//               <label>Social Proof Avatar URLs (one per line)</label>
//               <textarea
//                 rows={4}
//                 className="editor-textarea"
//                 value={(data.socialProof?.avatars || []).join('\n')}
//                 onChange={(e) => updateField('socialProof.avatars', e.target.value.split('\n').map((url) => url.trim()).filter(Boolean))}
//               />
//             </div>

//             <div className="field">
//               <label>Sidebar Eyebrow</label>
//               <input
//                 className="editor-input"
//                 value={data.sidebarContent?.eyebrow || ''}
//                 onChange={(e) => updateField('sidebarContent.eyebrow', e.target.value)}
//               />
//             </div>

//             <div className="field">
//               <label>Sidebar Title</label>
//               <input
//                 className="editor-input"
//                 value={data.sidebarContent?.title || ''}
//                 onChange={(e) => updateField('sidebarContent.title', e.target.value)}
//               />
//             </div>

//             <div className="field">
//               <label>Sidebar Copy</label>
//               <textarea
//                 rows={3}
//                 className="editor-textarea"
//                 value={data.sidebarContent?.copy || ''}
//                 onChange={(e) => updateField('sidebarContent.copy', e.target.value)}
//               />
//             </div>

//             <div className="field">
//               <label>Sidebar Highlights (one per line)</label>
//               <textarea
//                 rows={3}
//                 className="editor-textarea"
//                 value={(data.sidebarContent?.highlights || []).join('\n')}
//                 onChange={(e) => updateField('sidebarContent.highlights', e.target.value.split('\n').map((item) => item.trim()).filter(Boolean))}
//               />
//             </div>

//             <div className="row">
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Sidebar CTA Label</label>
//                   <input
//                     className="editor-input"
//                     value={data.sidebarContent?.ctaLabel || ''}
//                     onChange={(e) => updateField('sidebarContent.ctaLabel', e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="field">
//                   <label>Sidebar CTA Link</label>
//                   <input
//                     className="editor-input"
//                     value={data.sidebarContent?.ctaHref || ''}
//                     onChange={(e) => updateField('sidebarContent.ctaHref', e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="field">
//               <label>Hero Background Image</label>
//               <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '12px' }}>
//                 {data.background && (
//                   <div
//                     style={{
//                       width: '80px',
//                       height: '80px',
//                       borderRadius: '6px',
//                       backgroundImage: `url(${data.background})`,
//                       backgroundSize: 'cover',
//                       backgroundPosition: 'center',
//                       border: '1px solid #e1e5ea',
//                       flexShrink: 0
//                     }}
//                   />
//                 )}
//                 <div style={{ flex: 1 }}>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageUpload}
//                     style={{ display: 'none' }}
//                     id="hero-image-upload"
//                   />
//                   <label
//                     htmlFor="hero-image-upload"
//                     style={{
//                       display: 'inline-block',
//                       padding: '8px 12px',
//                       backgroundColor: '#f0f2f5',
//                       border: '1px solid #d1d5db',
//                       borderRadius: '6px',
//                       cursor: 'pointer',
//                       fontSize: '12px',
//                       fontWeight: '600',
//                       color: '#374151',
//                       marginBottom: '5px'
//                     }}
//                   >
//                     {isUploading ? 'Uploading...' : 'Choose Image File'}
//                   </label>
//                   <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>
//                     Recommended size: 1920x1080 px (JPEG, PNG).
//                   </p>
//                 </div>
//               </div>
              
//               <input
//                 type="text"
//                 className="editor-input"
//                 value={data.background || ''}
//                 onChange={(e) => updateField('background', e.target.value)}
//                 placeholder="Or paste background image URL here"
//               />
//             </div>

//           </div>
//           <div className="editor-footer">
//             <button
//               type="button"
//               className="btn-cancel"
//               onClick={onBack}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="btn-save"
//               disabled={isSaving}
//             >
//               {isSaving ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


import React, { useState } from 'react';
import { usePreviewSettings } from '../../context/PreviewSettingsContext';
import FileService from '../../services/FileService';
import './css/web-settings.css';

export default function HeroSection({ onBack }) {
  const { data, updateField, saveSection, isSaving } = usePreviewSettings('hero');
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSection();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const res = await FileService.upload(file);

      if (res?.data?.file_url) {
        updateField('background', res.data.file_url);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePopularCityChange = (index, value) => {
    const updated = [...(data.popularCities || [])];
    updated[index] = value;
    updateField('popularCities', updated);
  };

  const addPopularCity = () => {
    updateField('popularCities', [...(data.popularCities || []), 'New City']);
  };

  const removePopularCity = (index) => {
    updateField(
      'popularCities',
      (data.popularCities || []).filter((_, i) => i !== index)
    );
  };

  if (!data) return null;

  return (
    <div className="hero-editor-card hero-editor-card--flat">
      <form onSubmit={handleSave} className="hero-editor-form">
        <div className="editor-body hero-editor-body-flat">
          <div className="hero-two-panel-layout">
            <div className="hero-left-panel">
              <div className="hero-form-section">
                <h4 className="editor-section-title">Hero Main Content</h4>

                {/* <div className="field">
                  <label>Hero Badge</label>
                  <input
                    className="editor-input"
                    value={data.badge || ''}
                    onChange={(e) => updateField('badge', e.target.value)}
                    placeholder="e.g. #1 Study Destination in the Middle East"
                  />
                </div> */}

                <div className="field">
                  <label>Main Title</label>
                  <div className="input-with-color">
                    <input
                      className="editor-input"
                      value={data.title || ''}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="Enter hero title"
                    />

                    <input
                      type="color"
                      value={data.titleColor || '#ffffff'}
                      onChange={(e) => updateField('titleColor', e.target.value)}
                      className="color-input"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Subtitle</label>
                  <div className="input-with-color">
                    <textarea
                      rows={4}
                      className="editor-textarea"
                      value={data.copy || ''}
                      onChange={(e) => updateField('copy', e.target.value)}
                      placeholder="Enter hero subtitle"
                    />

                    <input
                      type="color"
                      value={data.copyColor || '#ffffff'}
                      onChange={(e) => updateField('copyColor', e.target.value)}
                      className="color-input"
                    />
                  </div>
                </div>
              </div>

              <div className="hero-form-section">
                <h4 className="editor-section-title">Layout & Styling</h4>

                <div className="hero-inner-grid two-col">
                  <div className="field">
                    <label>Hero Layout</label>
                    <select
                      className="editor-input"
                      value={data.layout || 'full-width'}
                      onChange={(e) => updateField('layout', e.target.value)}
                    >
                      <option value="full-width">Full Width</option>
                      <option value="sidebar">Sidebar</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Text Alignment</label>
                    <select
                      className="editor-input"
                      value={data.alignment || 'center'}
                      onChange={(e) => updateField('alignment', e.target.value)}
                    >
                      <option value="center">Center</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label>Hero Background Color</label>
                  <div className="input-with-color">
                    <input
                      className="editor-input"
                      value={data.backgroundColor || '#10233f'}
                      onChange={(e) => updateField('backgroundColor', e.target.value)}
                      placeholder="#10233f"
                    />

                    <input
                      type="color"
                      value={data.backgroundColor || '#10233f'}
                      onChange={(e) => updateField('backgroundColor', e.target.value)}
                      className="color-input"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Accent Color</label>
                  <div className="input-with-color">
                    <input
                      className="editor-input"
                      value={data.accentColor || '#7fb2e5'}
                      onChange={(e) => updateField('accentColor', e.target.value)}
                      placeholder="#7fb2e5"
                    />

                    <input
                      type="color"
                      value={data.accentColor || '#7fb2e5'}
                      onChange={(e) => updateField('accentColor', e.target.value)}
                      className="color-input"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Overlay Strength: {data.overlayOpacity ?? 70}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={data.overlayOpacity ?? 70}
                    onChange={(e) => updateField('overlayOpacity', Number(e.target.value))}
                    className="hero-range-input"
                  />
                </div>
              </div>

              <div className="hero-form-section">
                <h4 className="editor-section-title">Search Configuration</h4>

                <div className="hero-inner-grid two-col">
                  <div className="field">
                    <label>Search Placeholder</label>
                    <input
                      className="editor-input"
                      value={data.search?.placeholder || ''}
                      onChange={(e) => updateField('search.placeholder', e.target.value)}
                      placeholder="Search courses, universities or cities"
                    />
                  </div>

                  <div className="field">
                    <label>Search Button Label</label>
                    <input
                      className="editor-input"
                      value={data.search?.button || ''}
                      onChange={(e) => updateField('search.button', e.target.value)}
                      placeholder="Search"
                    />
                  </div>

                  <div className="field">
                    <label>Search Button Background Color</label>
                    <div className="input-with-color">
                      <input
                        className="editor-input"
                        value={data.search?.buttonBgColor || '#7fb2e5'}
                        onChange={(e) => updateField('search.buttonBgColor', e.target.value)}
                        placeholder="#7fb2e5"
                      />

                      <input
                        type="color"
                        value={data.search?.buttonBgColor || '#7fb2e5'}
                        onChange={(e) => updateField('search.buttonBgColor', e.target.value)}
                        className="color-input"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Search Button Text Color</label>
                    <div className="input-with-color">
                      <input
                        className="editor-input"
                        value={data.search?.buttonTextColor || '#ffffff'}
                        onChange={(e) => updateField('search.buttonTextColor', e.target.value)}
                        placeholder="#ffffff"
                      />

                      <input
                        type="color"
                        value={data.search?.buttonTextColor || '#ffffff'}
                        onChange={(e) => updateField('search.buttonTextColor', e.target.value)}
                        className="color-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
{/* 
              <div className="hero-form-section">
                <h4 className="editor-section-title">Call To Action Buttons</h4>

                <div className="hero-inner-grid two-col">
                  <div className="field">
                    <label>Primary CTA Label</label>
                    <input
                      className="editor-input"
                      value={data.primaryCta?.label || ''}
                      onChange={(e) => updateField('primaryCta.label', e.target.value)}
                      placeholder="Apply Now"
                    />
                  </div>

                  <div className="field">
                    <label>Primary CTA Link</label>
                    <input
                      className="editor-input"
                      value={data.primaryCta?.href || ''}
                      onChange={(e) => updateField('primaryCta.href', e.target.value)}
                      placeholder="/apply"
                    />
                  </div>

                  <div className="field">
                    <label>Primary CTA Background Color</label>
                    <div className="input-with-color">
                      <input
                        className="editor-input"
                        value={data.primaryCta?.bgColor || '#7fb2e5'}
                        onChange={(e) => updateField('primaryCta.bgColor', e.target.value)}
                        placeholder="#7fb2e5"
                      />

                      <input
                        type="color"
                        value={data.primaryCta?.bgColor || '#7fb2e5'}
                        onChange={(e) => updateField('primaryCta.bgColor', e.target.value)}
                        className="color-input"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Primary CTA Text Color</label>
                    <div className="input-with-color">
                      <input
                        className="editor-input"
                        value={data.primaryCta?.textColor || '#ffffff'}
                        onChange={(e) => updateField('primaryCta.textColor', e.target.value)}
                        placeholder="#ffffff"
                      />

                      <input
                        type="color"
                        value={data.primaryCta?.textColor || '#ffffff'}
                        onChange={(e) => updateField('primaryCta.textColor', e.target.value)}
                        className="color-input"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Secondary CTA Label</label>
                    <input
                      className="editor-input"
                      value={data.secondaryCta?.label || ''}
                      onChange={(e) => updateField('secondaryCta.label', e.target.value)}
                      placeholder="Explore Courses"
                    />
                  </div>

                  <div className="field">
                    <label>Secondary CTA Link</label>
                    <input
                      className="editor-input"
                      value={data.secondaryCta?.href || ''}
                      onChange={(e) => updateField('secondaryCta.href', e.target.value)}
                      placeholder="/courses"
                    />
                  </div>

                  <div className="field">
                    <label>Secondary CTA Background Color</label>
                    <div className="input-with-color">
                      <input
                        className="editor-input"
                        value={data.secondaryCta?.bgColor || 'transparent'}
                        onChange={(e) => updateField('secondaryCta.bgColor', e.target.value)}
                        placeholder="transparent or #ffffff"
                      />

                      <input
                        type="color"
                        value={
                          data.secondaryCta?.bgColor &&
                          data.secondaryCta.bgColor !== 'transparent'
                            ? data.secondaryCta.bgColor
                            : '#ffffff'
                        }
                        onChange={(e) => updateField('secondaryCta.bgColor', e.target.value)}
                        className="color-input"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Secondary CTA Text Color</label>
                    <div className="input-with-color">
                      <input
                        className="editor-input"
                        value={data.secondaryCta?.textColor || '#ffffff'}
                        onChange={(e) => updateField('secondaryCta.textColor', e.target.value)}
                        placeholder="#ffffff"
                      />

                      <input
                        type="color"
                        value={data.secondaryCta?.textColor || '#ffffff'}
                        onChange={(e) => updateField('secondaryCta.textColor', e.target.value)}
                        className="color-input"
                      />
                    </div>
                  </div>
                </div>
              </div> */}

            </div>

            <div className="hero-right-panel">
              <div className="hero-form-section">
                <div className="hero-section-heading-row">
                  <h4 className="editor-section-title">Popular Cities</h4>
                  <span>{(data.popularCities || []).length} cities</span>
                </div>

                <div className="hero-inner-grid two-col">
                  <div className="field">
                    <label>Popular Label</label>
                    <input
                      className="editor-input"
                      value={data.popularLabel || 'Popular:'}
                      onChange={(e) => updateField('popularLabel', e.target.value)}
                      placeholder="Popular:"
                    />
                  </div>

                  <div className="field">
                    <label>Popular Label Color</label>
                    <div className="input-with-color">
                      <input
                        className="editor-input"
                        value={data.popularLabelColor || '#ffffff'}
                        onChange={(e) => updateField('popularLabelColor', e.target.value)}
                        placeholder="#ffffff"
                      />

                      <input
                        type="color"
                        value={data.popularLabelColor || '#ffffff'}
                        onChange={(e) => updateField('popularLabelColor', e.target.value)}
                        className="color-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="hero-repeat-list">
                  {(data.popularCities || []).map((city, index) => (
                    <div key={index} className="hero-repeat-row">
                      <div className="field">
                        <label>City {index + 1}</label>
                        <input
                          className="editor-input"
                          value={city || ''}
                          onChange={(e) => handlePopularCityChange(index, e.target.value)}
                          placeholder="City name"
                        />
                      </div>

                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => removePopularCity(index)}
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-add-link hero-full-add-btn"
                  onClick={addPopularCity}
                >
                  <i className="fa fa-plus" />
                  Add Popular City
                </button>
              </div>

              <div className="hero-form-section">
                <h4 className="editor-section-title">Social Proof</h4>

                <div className="hero-inner-grid two-col">
                  <div className="field">
                    <label>Social Proof Title</label>
                    <input
                      className="editor-input"
                      value={data.socialProof?.title || ''}
                      onChange={(e) => updateField('socialProof.title', e.target.value)}
                      placeholder="Trusted by students"
                    />
                  </div>

                  <div className="field">
                    <label>Social Proof Copy</label>
                    <input
                      className="editor-input"
                      value={data.socialProof?.copy || ''}
                      onChange={(e) => updateField('socialProof.copy', e.target.value)}
                      placeholder="Short proof text"
                    />
                  </div>

                  <div className="field">
                    <label>Social Proof Title Color</label>
                    <div className="input-with-color">
                      <input
                        className="editor-input"
                        value={data.socialProof?.titleColor || '#ffffff'}
                        onChange={(e) => updateField('socialProof.titleColor', e.target.value)}
                        placeholder="#ffffff"
                      />

                      <input
                        type="color"
                        value={data.socialProof?.titleColor || '#ffffff'}
                        onChange={(e) => updateField('socialProof.titleColor', e.target.value)}
                        className="color-input"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Social Proof Copy Color</label>
                    <div className="input-with-color">
                      <input
                        className="editor-input"
                        value={data.socialProof?.copyColor || '#ffffff'}
                        onChange={(e) => updateField('socialProof.copyColor', e.target.value)}
                        placeholder="#ffffff"
                      />

                      <input
                        type="color"
                        value={data.socialProof?.copyColor || '#ffffff'}
                        onChange={(e) => updateField('socialProof.copyColor', e.target.value)}
                        className="color-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label>Avatar URLs - One Per Line</label>
                  <textarea
                    rows={4}
                    className="editor-textarea"
                    value={(data.socialProof?.avatars || []).join('\n')}
                    onChange={(e) =>
                      updateField(
                        'socialProof.avatars',
                        e.target.value
                          .split('\n')
                          .map((url) => url.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              {/* <div className="hero-form-section">
                <h4 className="editor-section-title">Sidebar Content</h4>

                <div className="hero-inner-grid two-col">
                  <div className="field">
                    <label>Sidebar Eyebrow</label>
                    <input
                      className="editor-input"
                      value={data.sidebarContent?.eyebrow || ''}
                      onChange={(e) => updateField('sidebarContent.eyebrow', e.target.value)}
                      placeholder="Sidebar eyebrow"
                    />
                  </div>

                  <div className="field">
                    <label>Sidebar Title</label>
                    <input
                      className="editor-input"
                      value={data.sidebarContent?.title || ''}
                      onChange={(e) => updateField('sidebarContent.title', e.target.value)}
                      placeholder="Sidebar title"
                    />
                  </div>

                  <div className="field">
                    <label>Sidebar Accent Color</label>
                    <div className="input-with-color">
                      <input
                        className="editor-input"
                        value={data.sidebarContent?.accentColor || '#7fb2e5'}
                        onChange={(e) => updateField('sidebarContent.accentColor', e.target.value)}
                        placeholder="#7fb2e5"
                      />

                      <input
                        type="color"
                        value={data.sidebarContent?.accentColor || '#7fb2e5'}
                        onChange={(e) => updateField('sidebarContent.accentColor', e.target.value)}
                        className="color-input"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Sidebar Text Color</label>
                    <div className="input-with-color">
                      <input
                        className="editor-input"
                        value={data.sidebarContent?.textColor || '#ffffff'}
                        onChange={(e) => updateField('sidebarContent.textColor', e.target.value)}
                        placeholder="#ffffff"
                      />

                      <input
                        type="color"
                        value={data.sidebarContent?.textColor || '#ffffff'}
                        onChange={(e) => updateField('sidebarContent.textColor', e.target.value)}
                        className="color-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="field">
                  <label>Sidebar Copy</label>
                  <textarea
                    rows={3}
                    className="editor-textarea"
                    value={data.sidebarContent?.copy || ''}
                    onChange={(e) => updateField('sidebarContent.copy', e.target.value)}
                    placeholder="Sidebar description"
                  />
                </div>

                <div className="field">
                  <label>Sidebar Highlights - One Per Line</label>
                  <textarea
                    rows={3}
                    className="editor-textarea"
                    value={(data.sidebarContent?.highlights || []).join('\n')}
                    onChange={(e) =>
                      updateField(
                        'sidebarContent.highlights',
                        e.target.value
                          .split('\n')
                          .map((item) => item.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="Highlight 1&#10;Highlight 2&#10;Highlight 3"
                  />
                </div>

                <div className="hero-inner-grid two-col">
                  <div className="field">
                    <label>Sidebar CTA Label</label>
                    <input
                      className="editor-input"
                      value={data.sidebarContent?.ctaLabel || ''}
                      onChange={(e) => updateField('sidebarContent.ctaLabel', e.target.value)}
                      placeholder="Talk to Advisor"
                    />
                  </div>

                  <div className="field">
                    <label>Sidebar CTA Link</label>
                    <input
                      className="editor-input"
                      value={data.sidebarContent?.ctaHref || ''}
                      onChange={(e) => updateField('sidebarContent.ctaHref', e.target.value)}
                      placeholder="/contact"
                    />
                  </div>
                </div>
              </div> */}

              {/* <div className="hero-form-section">
                <h4 className="editor-section-title">Hero Background Image</h4>

                <div className="hero-bg-upload-box">
                  {data.background && (
                    <div
                      className="hero-bg-preview"
                      style={{
                        backgroundImage: `url(${data.background})`,
                      }}
                    />
                  )}

                  <div className="hero-bg-upload-content">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="hero-image-upload"
                    />

                    <label htmlFor="hero-image-upload" className="hero-upload-label">
                      {isUploading ? 'Uploading...' : 'Choose Image File'}
                    </label>

                    <p>Recommended size: 1920x1080 px - JPEG, PNG.</p>
                  </div>
                </div>

                <div className="field">
                  <label>Background Image URL</label>
                  <input
                    type="text"
                    className="editor-input"
                    value={data.background || ''}
                    onChange={(e) => updateField('background', e.target.value)}
                    placeholder="Or paste background image URL here"
                  />
                </div>
              </div> */}

            </div>
          </div>
        </div>

        <div className="editor-footer hero-editor-footer-flat">
          <button type="button" className="btn-cancel" onClick={onBack}>
            Cancel
          </button>

          <button type="submit" className="btn-save" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
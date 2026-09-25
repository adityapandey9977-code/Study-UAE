// import React from 'react';
// import { usePreviewSettings } from '../../context/PreviewSettingsContext';
// import './css/web-settings.css';

// export default function TestimonialsSection({ onBack }) {
//   const { data, updateField, saveSection, isSaving } = usePreviewSettings('testimonials');

//   const handleItemChange = (index, field, value) => {
//     const updated = [...(data.items || [])];
//     updated[index] = {
//       ...updated[index],
//       [field]: value
//     };
//     updateField('items', updated);
//   };

//   const addItem = () => {
//     updateField('items', [
//       ...(data.items || []),
//       {
//         name: 'New Student',
//         program: 'Program Name',
//         university: 'University Name',
//         country: 'Country',
//         quote: 'Student testimonial goes here.',
//         rating: 5,
//         image: ''
//       }
//     ]);
//   };

//   const removeItem = (index) => {
//     updateField('items', (data.items || []).filter((_, i) => i !== index));
//   };

//   if (!data) return null;

//   return (
//     <div className="hero-editor-card">
//       <div className="editor-header">
//         <div>
//           <h3>Testimonials</h3>
//           <p>Manage student stories and social proof content</p>
//         </div>
//         <button type="button" className="btn-back" onClick={onBack}>
//           <i className="fa fa-arrow-left" />
//           Back
//         </button>
//       </div>

//       <form onSubmit={(e) => { e.preventDefault(); saveSection(); }}>
//         <div className="editor-body">
//           <div className="field">
//             <label>Eyebrow</label>
//             <div className="input-with-color">
//               <input className="editor-input" value={data.eyebrow || ''} onChange={(e) => updateField('eyebrow', e.target.value)} />
//               <input type="color" value={data.eyebrowColor || '#000000'} onChange={(e) => updateField('eyebrowColor', e.target.value)} className="color-input" />
//             </div>
//           </div>

//           <div className="field">
//             <label>Title</label>
//             <div className="input-with-color">
//               <input className="editor-input" value={data.title || ''} onChange={(e) => updateField('title', e.target.value)} />
//               <input type="color" value={data.titleColor || '#000000'} onChange={(e) => updateField('titleColor', e.target.value)} className="color-input" />
//             </div>
//           </div>

//           <div className="field">
//             <label>Section Copy</label>
//             <div className="input-with-color">
//               <textarea rows={4} className="editor-textarea" value={data.copy || ''} onChange={(e) => updateField('copy', e.target.value)} />
//               <input type="color" value={data.copyColor || '#000000'} onChange={(e) => updateField('copyColor', e.target.value)} className="color-input" />
//             </div>
//           </div>

//           <h4 className="editor-section-title">Testimonial Items</h4>
//           {(data.items || []).map((item, index) => (
//             <div key={index} className="editor-sub-card">
//               <div className="row">
//                 <div className="col-md-4">
//                   <div className="field">
//                     <label>Name</label>
//                     <input className="editor-input" value={item.name || ''} onChange={(e) => handleItemChange(index, 'name', e.target.value)} />
//                   </div>
//                 </div>
//                 <div className="col-md-4">
//                   <div className="field">
//                     <label>Program</label>
//                     <input className="editor-input" value={item.program || ''} onChange={(e) => handleItemChange(index, 'program', e.target.value)} />
//                   </div>
//                 </div>
//                 <div className="col-md-3">
//                   <div className="field">
//                     <label>Country</label>
//                     <input className="editor-input" value={item.country || ''} onChange={(e) => handleItemChange(index, 'country', e.target.value)} />
//                   </div>
//                 </div>
//                 <div className="col-md-1">
//                   <div className="field">
//                     <label>&nbsp;</label>
//                     <button type="button" className="btn-delete" onClick={() => removeItem(index)}>
//                       <i className="fa fa-trash" />
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <div className="row">
//                 <div className="col-md-6">
//                   <div className="field">
//                     <label>University</label>
//                     <input className="editor-input" value={item.university || ''} onChange={(e) => handleItemChange(index, 'university', e.target.value)} />
//                   </div>
//                 </div>
//                 <div className="col-md-3">
//                   <div className="field">
//                     <label>Rating</label>
//                     <input className="editor-input" type="number" min="1" max="5" value={item.rating || 5} onChange={(e) => handleItemChange(index, 'rating', Number(e.target.value))} />
//                   </div>
//                 </div>
//                 <div className="col-md-3">
//                   <div className="field">
//                     <label>Image URL</label>
//                     <input className="editor-input" value={item.image || ''} onChange={(e) => handleItemChange(index, 'image', e.target.value)} />
//                   </div>
//                 </div>
//               </div>

//               <div className="field" style={{ marginBottom: 0 }}>
//                 <label>Quote</label>
//                 <textarea rows={4} className="editor-textarea" value={item.quote || ''} onChange={(e) => handleItemChange(index, 'quote', e.target.value)} />
//               </div>
//             </div>
//           ))}

//           <button type="button" className="btn-add-link" onClick={addItem}>
//             <i className="fa fa-plus" />
//             Add Testimonial
//           </button>
//         </div>

//         <div className="editor-footer">
//           <button type="button" className="btn-cancel" onClick={onBack}>Cancel</button>
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

export default function TestimonialsSection({ onBack }) {
  const { data, updateField, saveSection, isSaving } =
    usePreviewSettings('testimonials');

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSection();
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...(data.items || [])];

    updated[index] = {
      ...updated[index],
      [field]: value
    };

    updateField('items', updated);
  };

  const addItem = () => {
    updateField('items', [
      ...(data.items || []),
      {
        name: 'New Student',
        program: 'Program Name',
        university: 'University Name',
        country: 'Country',
        quote: 'Student testimonial goes here.',
        rating: 5,
        image: ''
      }
    ]);
  };

  const removeItem = (index) => {
    updateField(
      'items',
      (data.items || []).filter((_, i) => i !== index)
    );
  };

  if (!data) return null;

  return (
    <div className="testimonials-editor-page">
      <form onSubmit={handleSave}>
        <div className="editor-body">
          <div className="testimonials-two-panel-layout">
            <div className="testimonials-left-panel">
              <div className="testimonials-form-section">
                <h4 className="editor-section-title">
                  Section Content
                </h4>

                <div className="field">
                  <label>Eyebrow</label>

                  <input
                    className="editor-input"
                    value={data.eyebrow || ''}
                    onChange={(e) =>
                      updateField('eyebrow', e.target.value)
                    }
                    placeholder="Enter eyebrow text"
                  />
                </div>

                <div className="field">
                  <label>Title</label>

                  <input
                    className="editor-input"
                    value={data.title || ''}
                    onChange={(e) =>
                      updateField('title', e.target.value)
                    }
                    placeholder="Enter section title"
                  />
                </div>

                <div className="field">
                  <label>Section Copy</label>

                  <textarea
                    rows={5}
                    className="editor-textarea"
                    value={data.copy || ''}
                    onChange={(e) =>
                      updateField('copy', e.target.value)
                    }
                    placeholder="Enter section copy"
                  />
                </div>
              </div>

              <div className="testimonials-form-section testimonials-items-section">
                <div className="testimonials-section-head">
                  <div>
                    <h4 className="editor-section-title">
                      Testimonial Items
                    </h4>

                    <p>
                      {(data.items || []).length}{' '}
                      testimonials configured
                    </p>
                  </div>

                  <button
                    type="button"
                    className="testimonials-add-btn"
                    onClick={addItem}
                  >
                    <i className="fa fa-plus" />
                    Add Testimonial
                  </button>
                </div>

                <div className="testimonials-item-list">
                  {(data.items || []).map((item, index) => (
                    <div
                      key={index}
                      className="testimonials-item-card"
                    >
                      <div className="testimonials-item-card-head">
                        <div>
                          <h5>
                            {item.name ||
                              `Student ${index + 1}`}
                          </h5>

                          <p>
                            {item.program || 'Program Name'} ·{' '}
                            {item.country || 'Country'}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="testimonials-delete-btn"
                          onClick={() => removeItem(index)}
                          aria-label="Delete testimonial"
                        >
                          <i className="fa fa-trash" />
                        </button>
                      </div>

                      <div className="testimonials-inner-grid three-col">
                        <div className="field">
                          <label>Name</label>

                          <input
                            className="editor-input"
                            value={item.name || ''}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'name',
                                e.target.value
                              )
                            }
                            placeholder="Student name"
                          />
                        </div>

                        <div className="field">
                          <label>Program</label>

                          <input
                            className="editor-input"
                            value={item.program || ''}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'program',
                                e.target.value
                              )
                            }
                            placeholder="Program name"
                          />
                        </div>

                        <div className="field">
                          <label>Country</label>

                          <input
                            className="editor-input"
                            value={item.country || ''}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'country',
                                e.target.value
                              )
                            }
                            placeholder="Country"
                          />
                        </div>
                      </div>

                      <div className="testimonials-inner-grid three-col">
                        <div className="field">
                          <label>University</label>

                          <input
                            className="editor-input"
                            value={item.university || ''}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'university',
                                e.target.value
                              )
                            }
                            placeholder="University name"
                          />
                        </div>

                        <div className="field">
                          <label>Rating</label>

                          <input
                            className="editor-input"
                            type="number"
                            min="1"
                            max="5"
                            value={item.rating || 5}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'rating',
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>

                        <div className="field">
                          <label>Image URL</label>

                          <input
                            className="editor-input"
                            value={item.image || ''}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'image',
                                e.target.value
                              )
                            }
                            placeholder="Image URL"
                          />
                        </div>
                      </div>

                      <div className="field">
                        <label>Quote</label>

                        <textarea
                          rows={4}
                          className="editor-textarea"
                          value={item.quote || ''}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              'quote',
                              e.target.value
                            )
                          }
                          placeholder="Student testimonial quote"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="testimonials-right-panel">
              <div className="testimonials-form-section">
                <h4 className="editor-section-title">
                  Text Colors
                </h4>

                <div className="field">
                  <label>Eyebrow Color</label>

                  <div className="input-with-color">
                    <input
                      className="editor-input"
                      value={data.eyebrowColor || '#000000'}
                      onChange={(e) =>
                        updateField(
                          'eyebrowColor',
                          e.target.value
                        )
                      }
                      placeholder="#000000"
                    />

                    <input
                      type="color"
                      value={data.eyebrowColor || '#000000'}
                      onChange={(e) =>
                        updateField(
                          'eyebrowColor',
                          e.target.value
                        )
                      }
                      className="color-input"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Title Color</label>

                  <div className="input-with-color">
                    <input
                      className="editor-input"
                      value={data.titleColor || '#000000'}
                      onChange={(e) =>
                        updateField(
                          'titleColor',
                          e.target.value
                        )
                      }
                      placeholder="#000000"
                    />

                    <input
                      type="color"
                      value={data.titleColor || '#000000'}
                      onChange={(e) =>
                        updateField(
                          'titleColor',
                          e.target.value
                        )
                      }
                      className="color-input"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Copy Color</label>

                  <div className="input-with-color">
                    <input
                      className="editor-input"
                      value={data.copyColor || '#000000'}
                      onChange={(e) =>
                        updateField(
                          'copyColor',
                          e.target.value
                        )
                      }
                      placeholder="#000000"
                    />

                    <input
                      type="color"
                      value={data.copyColor || '#000000'}
                      onChange={(e) =>
                        updateField(
                          'copyColor',
                          e.target.value
                        )
                      }
                      className="color-input"
                    />
                  </div>
                </div>
              </div>

              <div className="testimonials-form-section">
                <h4 className="editor-section-title">
                  Section Preview
                </h4>

                <div className="testimonials-preview-box">
                  <div
                    className="testimonials-preview-eyebrow"
                    style={{
                      color:
                        data.eyebrowColor || '#000000'
                    }}
                  >
                    {data.eyebrow || 'Eyebrow Preview'}
                  </div>

                  <div
                    className="testimonials-preview-title"
                    style={{
                      color: data.titleColor || '#000000'
                    }}
                  >
                    {data.title ||
                      'Testimonials Section Title Preview'}
                  </div>

                  <div
                    className="testimonials-preview-copy"
                    style={{
                      color: data.copyColor || '#000000'
                    }}
                  >
                    {data.copy ||
                      'Testimonials section copy preview will appear here.'}
                  </div>
                </div>
              </div>

              <div className="testimonials-form-section">
                <h4 className="editor-section-title">
                  Quick Summary
                </h4>

                <div className="testimonials-summary-grid">
                  <div>
                    <strong>
                      {(data.items || []).length}
                    </strong>

                    <span>Total Testimonials</span>
                  </div>

                  <div>
                    <strong>
                      {
                        (data.items || []).filter(
                          (item) =>
                            Number(item.rating || 0) >= 5
                        ).length
                      }
                    </strong>

                    <span>5 Star Reviews</span>
                  </div>
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



// import React from 'react';
// import { usePreviewSettings } from '../../context/PreviewSettingsContext';
// import './css/web-settings.css';

// export default function ProgramsSection({ onBack }) {
//   const { data, updateField, saveSection, isSaving } = usePreviewSettings('programs');

//   const handleItemChange = (index, field, value) => {
//     const updated = [...(data.items || [])];
//     updated[index] = {
//       ...updated[index],
//       [field]: value
//     };
//     updateField('items', updated);
//   };

//   const addItem = () => {
//     updateField('items', [...(data.items || []), { title: 'New Program', meta: 'Program meta', copy: 'Program description' }]);
//   };

//   const removeItem = (index) => {
//     updateField('items', (data.items || []).filter((_, i) => i !== index));
//   };

//   if (!data) return null;

//   return (
//     <div className="hero-editor-card">
//       <div className="editor-header">
//         <div>
//           <h3>Programs Section</h3>
//           <p>Manage streams, courses and discovery content</p>
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
//               <input type="color" value={data.eyebrowColor || '#174a8b'} onChange={(e) => updateField('eyebrowColor', e.target.value)} className="color-input" />
//             </div>
//           </div>

//           <div className="field">
//             <label>Title</label>
//             <div className="input-with-color">
//               <input className="editor-input" value={data.title || ''} onChange={(e) => updateField('title', e.target.value)} />
//               <input type="color" value={data.titleColor || '#173f73'} onChange={(e) => updateField('titleColor', e.target.value)} className="color-input" />
//             </div>
//           </div>

//           <div className="field">
//             <label>Description</label>
//             <textarea rows={4} className="editor-textarea" value={data.copy || ''} onChange={(e) => updateField('copy', e.target.value)} />
//           </div>

//           <h4 className="editor-section-title">Program Items</h4>
//           {(data.items || []).map((item, index) => (
//             <div key={index} className="editor-sub-card">
//               <div className="row">
//                 <div className="col-md-4">
//                   <div className="field">
//                     <label>Title</label>
//                     <input className="editor-input" value={item.title || ''} onChange={(e) => handleItemChange(index, 'title', e.target.value)} />
//                   </div>
//                 </div>
//                 <div className="col-md-4">
//                   <div className="field">
//                     <label>Meta</label>
//                     <input className="editor-input" value={item.meta || ''} onChange={(e) => handleItemChange(index, 'meta', e.target.value)} />
//                   </div>
//                 </div>
//                 <div className="col-md-3">
//                   <div className="field">
//                     <label>Description</label>
//                     <textarea rows={3} className="editor-textarea" value={item.copy || ''} onChange={(e) => handleItemChange(index, 'copy', e.target.value)} />
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
//             </div>
//           ))}

//           <button type="button" className="btn-add-link" onClick={addItem}>
//             <i className="fa fa-plus" />
//             Add Program Item
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

export default function ProgramsSection({ onBack }) {
  const { data, updateField, saveSection, isSaving } =
    usePreviewSettings('programs');

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
        title: 'New Program',
        meta: 'Program meta',
        copy: 'Program description'
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
    <div className="programs-editor-page">
      <form onSubmit={handleSave}>
        <div className="editor-body">
          <div className="programs-two-panel-layout">
            <div className="programs-left-panel">
              <div className="programs-form-section">
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
                  <label>Description</label>

                  <textarea
                    rows={5}
                    className="editor-textarea"
                    value={data.copy || ''}
                    onChange={(e) =>
                      updateField('copy', e.target.value)
                    }
                    placeholder="Enter section description"
                  />
                </div>
              </div>

              <div className="programs-form-section programs-items-section">
                <div className="programs-section-head">
                  <div>
                    <h4 className="editor-section-title">
                      Program Items
                    </h4>

                    <p>
                      {(data.items || []).length} items configured
                    </p>
                  </div>

                  <button
                    type="button"
                    className="programs-add-btn"
                    onClick={addItem}
                  >
                    <i className="fa fa-plus" />
                    Add Item
                  </button>
                </div>

                <div className="programs-item-list">
                  {(data.items || []).map((item, index) => (
                    <div
                      key={index}
                      className="programs-item-card"
                    >
                      <div className="programs-item-card-head">
                        <div>
                          <h5>
                            {item.title ||
                              `Program Item ${index + 1}`}
                          </h5>

                          <p>
                            {item.meta || 'Program meta'}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="programs-delete-btn"
                          onClick={() => removeItem(index)}
                          aria-label="Delete program item"
                        >
                          <i className="fa fa-trash" />
                        </button>
                      </div>

                      <div className="programs-inner-grid two-col">
                        <div className="field">
                          <label>Title</label>

                          <input
                            className="editor-input"
                            value={item.title || ''}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'title',
                                e.target.value
                              )
                            }
                            placeholder="Program title"
                          />
                        </div>

                        <div className="field">
                          <label>Meta</label>

                          <input
                            className="editor-input"
                            value={item.meta || ''}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'meta',
                                e.target.value
                              )
                            }
                            placeholder="Program meta"
                          />
                        </div>
                      </div>

                      <div className="field">
                        <label>Description</label>

                        <textarea
                          rows={3}
                          className="editor-textarea"
                          value={item.copy || ''}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              'copy',
                              e.target.value
                            )
                          }
                          placeholder="Program description"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="programs-right-panel">
              <div className="programs-form-section">
                <h4 className="editor-section-title">
                  Text Colors
                </h4>

                <div className="field">
                  <label>Eyebrow Color</label>

                  <div className="input-with-color">
                    <input
                      className="editor-input"
                      value={data.eyebrowColor || '#174a8b'}
                      onChange={(e) =>
                        updateField(
                          'eyebrowColor',
                          e.target.value
                        )
                      }
                      placeholder="#174a8b"
                    />

                    <input
                      type="color"
                      value={data.eyebrowColor || '#174a8b'}
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
                      value={data.titleColor || '#173f73'}
                      onChange={(e) =>
                        updateField(
                          'titleColor',
                          e.target.value
                        )
                      }
                      placeholder="#173f73"
                    />

                    <input
                      type="color"
                      value={data.titleColor || '#173f73'}
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
                  <label>Description Color</label>

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

              <div className="programs-form-section">
                <h4 className="editor-section-title">
                  Section Preview
                </h4>

                <div className="programs-preview-box">
                  <div
                    className="programs-preview-eyebrow"
                    style={{
                      color:
                        data.eyebrowColor || '#174a8b'
                    }}
                  >
                    {data.eyebrow || 'Eyebrow Preview'}
                  </div>

                  <div
                    className="programs-preview-title"
                    style={{
                      color: data.titleColor || '#173f73'
                    }}
                  >
                    {data.title ||
                      'Programs Section Title Preview'}
                  </div>

                  <div
                    className="programs-preview-copy"
                    style={{
                      color: data.copyColor || '#000000'
                    }}
                  >
                    {data.copy ||
                      'Programs section description preview will appear here.'}
                  </div>
                </div>
              </div>

              <div className="programs-form-section">
                <h4 className="editor-section-title">
                  Quick Summary
                </h4>

                <div className="programs-summary-grid">
                  <div>
                    <strong>
                      {(data.items || []).length}
                    </strong>

                    <span>Total Program Items</span>
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
// import React from 'react';
// import { usePreviewSettings } from '../../context/PreviewSettingsContext';
// import './css/web-settings.css';

// export default function FooterSettings({ onBack }) {
//   const { data, updateField, saveSection, isSaving } = usePreviewSettings('footer');

//   const updateTrack = (index, value) => {
//     const updated = [...(data.spotlightTracks || [])];
//     updated[index] = value;
//     updateField('spotlightTracks', updated);
//   };

//   const removeTrack = (index) => {
//     updateField('spotlightTracks', (data.spotlightTracks || []).filter((_, i) => i !== index));
//   };

//   const addTrack = () => {
//     updateField('spotlightTracks', [...(data.spotlightTracks || []), 'New Track']);
//   };

//   const updateColumn = (index, field, value) => {
//     const updated = [...(data.columns || [])];
//     updated[index] = {
//       ...updated[index],
//       [field]: value
//     };
//     updateField('columns', updated);
//   };

//   const addColumn = () => {
//     updateField('columns', [...(data.columns || []), { title: 'New Column', items: ['New Item'] }]);
//   };

//   const removeColumn = (index) => {
//     updateField('columns', (data.columns || []).filter((_, i) => i !== index));
//   };

//   const updateLegal = (index, value) => {
//     const updated = [...(data.legalLinks || [])];
//     updated[index] = value;
//     updateField('legalLinks', updated);
//   };

//   const addLegal = () => {
//     updateField('legalLinks', [...(data.legalLinks || []), 'New Legal Link']);
//   };

//   const removeLegal = (index) => {
//     updateField('legalLinks', (data.legalLinks || []).filter((_, i) => i !== index));
//   };

//   if (!data) return null;

//   return (
//     <div className="hero-editor-card">
//       <div className="editor-header">
//         <div>
//           <h3>Footer Settings</h3>
//           <p>Manage spotlight tracks, footer columns and legal links</p>
//         </div>
//         <button type="button" className="btn-back" onClick={onBack}>
//           <i className="fa fa-arrow-left" />
//           Back
//         </button>
//       </div>

//       <form onSubmit={(e) => { e.preventDefault(); saveSection(); }}>
//         <div className="editor-body">
//           <div className="field">
//             <label>Footer Title</label>
//             <input className="editor-input" value={data.title || ''} onChange={(e) => updateField('title', e.target.value)} />
//           </div>

//           <div className="field">
//             <label>Footer Summary</label>
//             <textarea rows={4} className="editor-textarea" value={data.summary || ''} onChange={(e) => updateField('summary', e.target.value)} />
//           </div>

//           <h4 className="editor-section-title">Spotlight Tracks</h4>
//           {(data.spotlightTracks || []).map((track, index) => (
//             <div key={index} className="editor-sub-card">
//               <div className="row">
//                 <div className="col-md-11">
//                   <div className="field" style={{ marginBottom: 0 }}>
//                     <label>Track {index + 1}</label>
//                     <input className="editor-input" value={track || ''} onChange={(e) => updateTrack(index, e.target.value)} />
//                   </div>
//                 </div>
//                 <div className="col-md-1">
//                   <div className="field" style={{ marginBottom: 0 }}>
//                     <label>&nbsp;</label>
//                     <button type="button" className="btn-delete" onClick={() => removeTrack(index)}>
//                       <i className="fa fa-trash" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//           <button type="button" className="btn-add-link" onClick={addTrack}>
//             <i className="fa fa-plus" />
//             Add Spotlight Track
//           </button>

//           <h4 className="editor-section-title">Footer Columns</h4>
//           {(data.columns || []).map((column, index) => (
//             <div key={index} className="editor-sub-card">
//               <div className="row">
//                 <div className="col-md-5">
//                   <div className="field">
//                     <label>Column Title</label>
//                     <input className="editor-input" value={column.title || ''} onChange={(e) => updateColumn(index, 'title', e.target.value)} />
//                   </div>
//                 </div>
//                 <div className="col-md-6">
//                   <div className="field">
//                     <label>Items</label>
//                     <textarea
//                       rows={3}
//                       className="editor-textarea"
//                       value={(column.items || []).join('\n')}
//                       onChange={(e) => updateColumn(index, 'items', e.target.value.split('\n').map((item) => item.trim()).filter(Boolean))}
//                     />
//                   </div>
//                 </div>
//                 <div className="col-md-1">
//                   <div className="field">
//                     <label>&nbsp;</label>
//                     <button type="button" className="btn-delete" onClick={() => removeColumn(index)}>
//                       <i className="fa fa-trash" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//           <button type="button" className="btn-add-link" onClick={addColumn}>
//             <i className="fa fa-plus" />
//             Add Footer Column
//           </button>

//           <h4 className="editor-section-title">Legal Links</h4>
//           {(data.legalLinks || []).map((item, index) => (
//             <div key={index} className="editor-sub-card">
//               <div className="row">
//                 <div className="col-md-11">
//                   <div className="field" style={{ marginBottom: 0 }}>
//                     <label>Legal Link {index + 1}</label>
//                     <input className="editor-input" value={item || ''} onChange={(e) => updateLegal(index, e.target.value)} />
//                   </div>
//                 </div>
//                 <div className="col-md-1">
//                   <div className="field" style={{ marginBottom: 0 }}>
//                     <label>&nbsp;</label>
//                     <button type="button" className="btn-delete" onClick={() => removeLegal(index)}>
//                       <i className="fa fa-trash" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//           <button type="button" className="btn-add-link" onClick={addLegal}>
//             <i className="fa fa-plus" />
//             Add Legal Link
//           </button>

//           <div className="field">
//             <label>Copyright</label>
//             <input className="editor-input" value={data.copyright || ''} onChange={(e) => updateField('copyright', e.target.value)} />
//           </div>
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

export default function FooterSettings({ onBack }) {
  const { data, updateField, saveSection, isSaving } =
    usePreviewSettings('footer');

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSection();
  };

  const updateTrack = (index, value) => {
    const updated = [...(data.spotlightTracks || [])];

    updated[index] = value;

    updateField('spotlightTracks', updated);
  };

  const removeTrack = (index) => {
    updateField(
      'spotlightTracks',
      (data.spotlightTracks || []).filter(
        (_, i) => i !== index
      )
    );
  };

  const addTrack = () => {
    updateField('spotlightTracks', [
      ...(data.spotlightTracks || []),
      'New Track'
    ]);
  };

  const updateColumn = (index, field, value) => {
    const updated = [...(data.columns || [])];

    updated[index] = {
      ...updated[index],
      [field]: value
    };

    updateField('columns', updated);
  };

  const addColumn = () => {
    updateField('columns', [
      ...(data.columns || []),
      {
        title: 'New Column',
        items: ['New Item']
      }
    ]);
  };

  const removeColumn = (index) => {
    updateField(
      'columns',
      (data.columns || []).filter(
        (_, i) => i !== index
      )
    );
  };

  const updateLegal = (index, value) => {
    const updated = [...(data.legalLinks || [])];

    updated[index] = value;

    updateField('legalLinks', updated);
  };

  const addLegal = () => {
    updateField('legalLinks', [
      ...(data.legalLinks || []),
      'New Legal Link'
    ]);
  };

  const removeLegal = (index) => {
    updateField(
      'legalLinks',
      (data.legalLinks || []).filter(
        (_, i) => i !== index
      )
    );
  };

  if (!data) return null;

  return (
    <div className="footer-editor-page">
      <form onSubmit={handleSave}>
        <div className="editor-body">
         
          <div className="footer-two-panel-layout">
            <div className="footer-left-panel">
              <div className="footer-form-section">
                <h4 className="editor-section-title">
                  Footer Content
                </h4>

                <div className="field">
                  <label>Footer Title</label>

                  <input
                    className="editor-input"
                    value={data.title || ''}
                    onChange={(e) =>
                      updateField(
                        'title',
                        e.target.value
                      )
                    }
                    placeholder="Footer title"
                  />
                </div>

                <div className="field">
                  <label>Footer Summary</label>

                  <textarea
                    rows={5}
                    className="editor-textarea"
                    value={data.summary || ''}
                    onChange={(e) =>
                      updateField(
                        'summary',
                        e.target.value
                      )
                    }
                    placeholder="Footer summary"
                  />
                </div>

                <div className="field">
                  <label>Copyright</label>

                  <input
                    className="editor-input"
                    value={data.copyright || ''}
                    onChange={(e) =>
                      updateField(
                        'copyright',
                        e.target.value
                      )
                    }
                    placeholder="Copyright text"
                  />
                </div>
              </div>

              <div className="footer-form-section footer-columns-section">
                <div className="footer-section-head">
                  <div>
                    <h4 className="editor-section-title">
                      Footer Columns
                    </h4>

                    <p>
                      {(data.columns || []).length}{' '}
                      columns configured
                    </p>
                  </div>

                  <button
                    type="button"
                    className="footer-add-btn"
                    onClick={addColumn}
                  >
                    <i className="fa fa-plus" />
                    Add Column
                  </button>
                </div>

                <div className="footer-item-list">
                  {(data.columns || []).map(
                    (column, index) => (
                      <div
                        key={index}
                        className="footer-item-card"
                      >
                        <div className="footer-item-card-head">
                          <div>
                            <h5>
                              {column.title ||
                                `Column ${index + 1}`}
                            </h5>

                            <p>
                              {(column.items || []).length}{' '}
                              items
                            </p>
                          </div>

                          <button
                            type="button"
                            className="footer-delete-btn"
                            onClick={() =>
                              removeColumn(index)
                            }
                            aria-label="Delete footer column"
                          >
                            <i className="fa fa-trash" />
                          </button>
                        </div>

                        <div className="field">
                          <label>Column Title</label>

                          <input
                            className="editor-input"
                            value={column.title || ''}
                            onChange={(e) =>
                              updateColumn(
                                index,
                                'title',
                                e.target.value
                              )
                            }
                            placeholder="Column title"
                          />
                        </div>

                        <div className="field">
                          <label>
                            Items - One Per Line
                          </label>

                          <textarea
                            rows={4}
                            className="editor-textarea"
                            value={(column.items || []).join(
                              '\n'
                            )}
                            onChange={(e) =>
                              updateColumn(
                                index,
                                'items',
                                e.target.value
                                  .split('\n')
                                  .map((item) =>
                                    item.trim()
                                  )
                                  .filter(Boolean)
                              )
                            }
                            placeholder={
                              'Item 1\nItem 2\nItem 3'
                            }
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="footer-right-panel">
              <div className="footer-form-section footer-tracks-section">
                <div className="footer-section-head">
                  <div>
                    <h4 className="editor-section-title">
                      Spotlight Tracks
                    </h4>

                    <p>
                      {(data.spotlightTracks || []).length}{' '}
                      tracks configured
                    </p>
                  </div>

                  <button
                    type="button"
                    className="footer-add-btn"
                    onClick={addTrack}
                  >
                    <i className="fa fa-plus" />
                    Add Track
                  </button>
                </div>

                <div className="footer-small-list">
                  {(data.spotlightTracks || []).map(
                    (track, index) => (
                      <div
                        key={index}
                        className="footer-small-row"
                      >
                        <div className="field">
                          <label>
                            Track {index + 1}
                          </label>

                          <input
                            className="editor-input"
                            value={track || ''}
                            onChange={(e) =>
                              updateTrack(
                                index,
                                e.target.value
                              )
                            }
                            placeholder="Track name"
                          />
                        </div>

                        <button
                          type="button"
                          className="footer-delete-btn"
                          onClick={() =>
                            removeTrack(index)
                          }
                          aria-label="Delete spotlight track"
                        >
                          <i className="fa fa-trash" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="footer-form-section footer-legal-section">
                <div className="footer-section-head">
                  <div>
                    <h4 className="editor-section-title">
                      Legal Links
                    </h4>

                    <p>
                      {(data.legalLinks || []).length}{' '}
                      links configured
                    </p>
                  </div>

                  <button
                    type="button"
                    className="footer-add-btn"
                    onClick={addLegal}
                  >
                    <i className="fa fa-plus" />
                    Add Legal
                  </button>
                </div>

                <div className="footer-small-list footer-legal-list">
                  {(data.legalLinks || []).map(
                    (item, index) => (
                      <div
                        key={index}
                        className="footer-small-row"
                      >
                        <div className="field">
                          <label>
                            Legal Link {index + 1}
                          </label>

                          <input
                            className="editor-input"
                            value={item || ''}
                            onChange={(e) =>
                              updateLegal(
                                index,
                                e.target.value
                              )
                            }
                            placeholder="Legal link"
                          />
                        </div>

                        <button
                          type="button"
                          className="footer-delete-btn"
                          onClick={() =>
                            removeLegal(index)
                          }
                          aria-label="Delete legal link"
                        >
                          <i className="fa fa-trash" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="editor-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => onBack?.()}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn-save"
            disabled={isSaving}
          >
            {isSaving
              ? 'Saving...'
              : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
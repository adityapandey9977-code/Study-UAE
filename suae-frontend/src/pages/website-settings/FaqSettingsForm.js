// import React, { useState } from 'react';
// import { usePreviewSettings } from '../../context/PreviewSettingsContext';
// import util from '../../utils/util';
// import './css/web-settings.css';

// export default function FaqSettingsForm({ onBack }) {
//   const { data, updateField, saveSection, isSaving } = usePreviewSettings('faqs');
//   const [editingIndex, setEditingIndex] = useState(null);

//   const isSuperAdmin = util.isAdmin() === 1 || util.isClientAdmin() === 1;

//   if (!isSuperAdmin) {
//     return (
//       <div className="hero-editor-card faq-settings-card">        
//        <div style={{ fontSize: '48px', color: '#e73d4a', marginBottom: '20px' }}>
//           <i className="fa fa-exclamation-triangle" />
//         </div>
//         <h3>Access Denied</h3>
//         <p style={{ color: '#666', fontSize: '15px' }}>Only Super Admins are authorized to manage FAQs on this platform.</p>
//         <button type="button" className="btn-back" onClick={onBack} style={{ marginTop: '20px', display: 'inline-block' }}>
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   if (!data) return null;

//   const items = Array.isArray(data) ? data : (data.items || []);

//   const handleSave = (e) => {
//     e.preventDefault();
//     saveSection();
//   };

//   const handleItemChange = (index, field, value) => {
//     const updated = [...items];
//     updated[index] = {
//       ...updated[index],
//       [field]: value
//     };
//     updateField('', updated);
//   };

//   const handleAddFaq = () => {
//     const newItem = {
//       id: items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1,
//       category: 'General',
//       question: 'New Question?',
//       answer: 'Answer text.'
//     };
//     const updated = [...items, newItem];
//     updateField('', updated);
//     setEditingIndex(updated.length - 1);
//   };

//   const handleRemoveFaq = (index) => {
//     const updated = items.filter((_, i) => i !== index);
//     updateField('', updated);
//     if (editingIndex === index) {
//       setEditingIndex(null);
//     } else if (editingIndex > index) {
//       setEditingIndex(editingIndex - 1);
//     }
//   };


//    return (
//     <div className="hero-editor-card faq-settings-card">
//       <div className="editor-header">
//         <div>
//           <h3>Manage FAQs</h3>
//           <p>Perform CRUD operations on portal FAQs (Super Admin Access)</p>
//         </div>

//         <button type="button" className="btn-back" onClick={onBack}>
//           <i className="fa fa-arrow-left" style={{ marginRight: '6px' }} />
//           Back
//         </button>
//       </div>

//       <form onSubmit={handleSave}>
//         <div className="editor-body">
//           {editingIndex === null ? (
//             <div className="faq-settings-list-layout">
//               <div className="faq-settings-list-left">
//                 <div className="faq-settings-section-card">
//                   <div className="faq-settings-section-head">
//                     <div>
//                       <h4 className="editor-section-title">FAQ Questions</h4>
//                       <p>{items.length} FAQs Listed</p>
//                     </div>

//                     <button
//                       type="button"
//                       className="btn-add-item faq-settings-add-btn"
//                       onClick={handleAddFaq}
//                     >
//                       <i className="fa fa-plus" style={{ marginRight: '6px' }} />
//                       Add FAQ
//                     </button>
//                   </div>

//                   <div className="faq-settings-list-wrap">
//                     {items.map((faq, index) => (
//                       <div key={index} className="editor-sub-card faq-settings-list-card">
//                         <div className="faq-settings-list-main">
//                           <div className="faq-settings-icon">
//                             <i className="fa fa-question-circle" />
//                           </div>

//                           <div className="faq-settings-list-content">
//                             <span className="faq-settings-category">
//                               {faq.category || 'General'}
//                             </span>

//                             <h5>{faq.question || 'Unnamed FAQ'}</h5>

//                             <p>{faq.answer || 'No answer added yet.'}</p>
//                           </div>
//                         </div>

//                         <div className="faq-settings-actions">
//                           <button
//                             type="button"
//                             className="btn-edit-sub"
//                             onClick={() => setEditingIndex(index)}
//                           >
//                             Edit
//                           </button>

//                           <button
//                             type="button"
//                             className="btn-remove-sub"
//                             onClick={() => handleRemoveFaq(index)}
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       </div>
//                     ))}

//                     {items.length === 0 && (
//                       <div className="faq-settings-empty">
//                         <i className="fa fa-question-circle" />
//                         <h5>No FAQs added yet</h5>
//                         <p>Add FAQ questions to manage portal help content.</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="faq-settings-list-right">
//                 <div className="faq-settings-section-card">

//                   <div className="faq-settings-summary-grid">
//                     <div>
//                       <strong>{items.length}</strong>
//                       <span>Total FAQs</span>
//                     </div>

//                     <div>
//                       <strong>
//                         {new Set(items.map((item) => item.category || 'General')).size}
//                       </strong>
//                       <span>Categories</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="faq-settings-section-card">
//                   <div className="faq-settings-preview-card">
//                     <span>{items[0]?.category || 'Category'}</span>

//                     <h5>{items[0]?.question || 'FAQ question preview'}</h5>

//                     <p>
//                       {items[0]?.answer || 'FAQ answer preview will appear here.'}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="faq-settings-edit-layout">
//               <div className="faq-settings-edit-left">
//                 <div className="faq-settings-section-card">
//                   <div className="faq-settings-section-head">
//                     <div>
//                       <h4 className="editor-section-title">Edit FAQ Item</h4>
//                       <p>Update FAQ category, question and answer.</p>
//                     </div>

//                     {/* <button
//                       type="button"
//                       className="btn-back faq-settings-done-btn"
//                       onClick={() => setEditingIndex(null)}
//                     >
//                       Done
//                     </button> */}
//                   </div>

//                   <div className="faq-settings-grid two-col">
//                     <div className="field">
//                       <label>Category</label>
//                       <input
//                         className="editor-input"
//                         value={items[editingIndex]?.category || ''}
//                         onChange={(e) => handleItemChange(editingIndex, 'category', e.target.value)}
//                         placeholder="e.g. Admissions, Visas, Scholarships"
//                         required
//                       />
//                     </div>

//                     <div className="field">
//                       <label>Question</label>
//                       <input
//                         className="editor-input"
//                         value={items[editingIndex]?.question || ''}
//                         onChange={(e) => handleItemChange(editingIndex, 'question', e.target.value)}
//                         placeholder="e.g. What are the requirement details?"
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div className="field">
//                     <label>Answer</label>
//                     <textarea
//                       rows={6}
//                       className="editor-textarea"
//                       value={items[editingIndex]?.answer || ''}
//                       onChange={(e) => handleItemChange(editingIndex, 'answer', e.target.value)}
//                       placeholder="Enter the FAQ answer explanation here..."
//                       required
//                     />
//                   </div>
//                    <button
//                       type="button"
//                       className="btn-back faq-settings-done-btn"
//                       onClick={() => setEditingIndex(null)}
//                     >
//                       Done
//                     </button>
//                 </div>
//               </div>

//               <div className="faq-settings-edit-right">
//                 <div className="faq-settings-section-card">
//                   <div className="faq-settings-preview-card">
//                     <span>{items[editingIndex]?.category || 'Category'}</span>

//                     <h5>{items[editingIndex]?.question || 'FAQ question preview'}</h5>

//                     <p>
//                       {items[editingIndex]?.answer || 'FAQ answer preview will appear here.'}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="editor-footer">
//           <button type="submit" className="btn-save" disabled={isSaving === 'faqs'}>
//             {isSaving === 'faqs' ? (
//               <>
//                 <i className="fa fa-spinner fa-spin" style={{ marginRight: '6px' }} />
//                 Saving...
//               </>
//             ) : (
//               <>
//                 <i className="fa fa-save" style={{ marginRight: '6px' }} />
//                 Save Changes
//               </>
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };






import React, { useState } from 'react';
import { usePreviewSettings } from '../../context/PreviewSettingsContext';
import util from '../../utils/util';
import './css/web-settings.css';

export default function FaqSettingsForm() {
  const { data, updateField, saveSection, isSaving } =
    usePreviewSettings('faqs');

  const [editingIndex, setEditingIndex] = useState(null);

  const isSuperAdmin =
    util.isAdmin() === 1 ||
    util.isClientAdmin() === 1;

  if (!isSuperAdmin) {
    return (
      <div className="hero-editor-card faq-settings-card">
        <div
          style={{
            fontSize: '48px',
            color: '#e73d4a',
            marginBottom: '20px'
          }}
        >
          <i className="fa fa-exclamation-triangle" />
        </div>

        <h3>Access Denied</h3>

        <p
          style={{
            color: '#666',
            fontSize: '15px'
          }}
        >
          Only Super Admins are authorized to manage FAQs on this platform.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const items = Array.isArray(data)
    ? data
    : data.items || [];

  const handleSave = (event) => {
    event.preventDefault();
    saveSection();
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];

    if (!updatedItems[index]) return;

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    updateField('', updatedItems);
  };

  const handleAddFaq = () => {
    const newItem = {
      id:
        items.length > 0
          ? Math.max(
              ...items.map((item) => item.id || 0)
            ) + 1
          : 1,
      category: 'General',
      question: 'New Question?',
      answer: 'Answer text.'
    };

    const updatedItems = [...items, newItem];

    updateField('', updatedItems);
    setEditingIndex(updatedItems.length - 1);
  };

  const handleRemoveFaq = (index) => {
    const updatedItems = items.filter(
      (_, itemIndex) => itemIndex !== index
    );

    updateField('', updatedItems);

    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (
      editingIndex !== null &&
      editingIndex > index
    ) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleBackToList = () => {
    setEditingIndex(null);
  };

  const isEditing = editingIndex !== null;
  const selectedFaq = isEditing
    ? items[editingIndex]
    : null;

  return (
    <div className="faq-settings-card faq-settings-flat">
      <form onSubmit={handleSave}>
        <div className="editor-body faq-settings-body">
          {!isEditing ? (
            <div className="faq-settings-list-layout">
              <div className="faq-settings-list-left">
                <div className="faq-settings-section-card faq-settings-list-section">
                  <div className="faq-settings-section-head">
                    <div>
                      <h4 className="editor-section-title">
                        FAQ Questions
                      </h4>

                      <p>
                        {items.length} FAQs Listed
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn-add-item faq-settings-add-btn"
                      onClick={handleAddFaq}
                    >
                      <i
                        className="fa fa-plus"
                        style={{ marginRight: '6px' }}
                      />

                      Add FAQ
                    </button>
                  </div>

                  <div className="faq-settings-list-wrap">
                    {items.map((faq, index) => (
                      <div
                        key={faq.id || index}
                        className="editor-sub-card faq-settings-list-card"
                      >
                        <div className="faq-settings-list-main">
                          <div className="faq-settings-icon">
                            <i className="fa fa-question-circle" />
                          </div>

                          <div className="faq-settings-list-content">
                            <span className="faq-settings-category">
                              {faq.category || 'General'}
                            </span>

                            <h5>
                              {faq.question || 'Unnamed FAQ'}
                            </h5>

                            <p>
                              {faq.answer ||
                                'No answer added yet.'}
                            </p>
                          </div>
                        </div>

                        <div className="faq-settings-actions">
                          <button
                            type="button"
                            className="btn-edit-sub"
                            onClick={() =>
                              setEditingIndex(index)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn-remove-sub"
                            onClick={() =>
                              handleRemoveFaq(index)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}

                    {items.length === 0 && (
                      <div className="faq-settings-empty">
                        <i className="fa fa-question-circle" />

                        <h5>No FAQs added yet</h5>

                        <p>
                          Add FAQ questions to manage portal help content.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="faq-settings-edit-layout">
              <div className="faq-settings-edit-left">
                <div className="faq-settings-section-card">
                  <div className="faq-settings-section-head">
                    <div>
                      <h4 className="editor-section-title">
                        {selectedFaq?.question ===
                        'New Question?'
                          ? 'Add FAQ Item'
                          : 'Edit FAQ Item'}
                      </h4>

                      <p>
                        Update FAQ category, question and answer.
                      </p>
                    </div>
                  </div>

                  <div className="faq-settings-grid two-col">
                    <div className="field">
                      <label>Category</label>

                      <input
                        className="editor-input"
                        value={
                          selectedFaq?.category || ''
                        }
                        onChange={(event) =>
                          handleItemChange(
                            editingIndex,
                            'category',
                            event.target.value
                          )
                        }
                        placeholder="e.g. Admissions, Visas, Scholarships"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Question</label>

                      <input
                        className="editor-input"
                        value={
                          selectedFaq?.question || ''
                        }
                        onChange={(event) =>
                          handleItemChange(
                            editingIndex,
                            'question',
                            event.target.value
                          )
                        }
                        placeholder="e.g. What are the requirement details?"
                        required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Answer</label>

                    <textarea
                      rows={8}
                      className="editor-textarea"
                      value={
                        selectedFaq?.answer || ''
                      }
                      onChange={(event) =>
                        handleItemChange(
                          editingIndex,
                          'answer',
                          event.target.value
                        )
                      }
                      placeholder="Enter the FAQ answer explanation here..."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="faq-settings-edit-right">
                <div className="faq-settings-section-card">
                  <h4 className="editor-section-title">
                    FAQ Preview
                  </h4>

                  <div className="faq-settings-preview-card">
                    <div className="faq-settings-preview-icon">
                      <i className="fa fa-question-circle" />
                    </div>

                    <span>
                      {selectedFaq?.category ||
                        'Category'}
                    </span>

                    <h5>
                      {selectedFaq?.question ||
                        'FAQ question preview'}
                    </h5>

                    <p>
                      {selectedFaq?.answer ||
                        'FAQ answer preview will appear here.'}
                    </p>
                  </div>
                </div>

                <div className="faq-settings-section-card faq-settings-help-card">
                  <h4 className="editor-section-title">
                    Content Guidelines
                  </h4>

                  <ul>
                    <li>
                      Keep the question clear and concise.
                    </li>

                    <li>
                      Use a category that matches the FAQ topic.
                    </li>

                    <li>
                      Provide a complete and readable answer.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="editor-footer faq-settings-footer">
          {isEditing ? (
            <>
              <button
                type="button"
                className="faq-settings-back-btn"
                onClick={handleBackToList}
              >
                <i className="fa fa-arrow-left" />
                Back
              </button>

              <button
                type="button"
                className="faq-settings-done-btn"
                onClick={handleBackToList}
              >
                <i className="fa fa-check" />
                Done
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="btn-save"
              disabled={
                isSaving === true ||
                isSaving === 'faqs'
              }
            >
              {isSaving === true ||
              isSaving === 'faqs' ? (
                <>
                  <i
                    className="fa fa-spinner fa-spin"
                    style={{
                      marginRight: '6px'
                    }}
                  />

                  Saving...
                </>
              ) : (
                <>
                  <i
                    className="fa fa-save"
                    style={{
                      marginRight: '6px'
                    }}
                  />

                  Save Changes
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
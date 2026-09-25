// import React, { useState } from 'react';
// import { usePreviewSettings } from '../../context/PreviewSettingsContext';
// import FileService from '../../services/FileService';
// import './css/web-settings.css';

// export default function CourseDetailsForm({ onBack }) {
//   const { data, updateField, saveSection, isSaving } = usePreviewSettings('programs');
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);

//   const handleSave = (e) => {
//     e.preventDefault();
//     saveSection();
//   };

//   const handleItemChange = (index, field, value) => {
//     if (!data || !data.items) return;
//     const updatedItems = [...data.items];
//     updatedItems[index] = {
//       ...updatedItems[index],
//       [field]: value
//     };
//     updateField('items', updatedItems);
//   };

//   const handleCareerChange = (itemIndex, careerIndex, field, value) => {
//     if (!data || !data.items) return;
//     const updatedItems = [...data.items];
//     const item = { ...updatedItems[itemIndex] };
//     const careers = [...(item.careers || [])];
    
//     // Ensure we have enough career slots (up to 4)
//     while (careers.length <= careerIndex) {
//       careers.push({ role: '', salary: '' });
//     }
    
//     careers[careerIndex] = {
//       ...careers[careerIndex],
//       [field]: value
//     };
//     item.careers = careers.filter(c => c.role || c.salary); // filter out empty ones
//     updatedItems[itemIndex] = item;
//     updateField('items', updatedItems);
//   };

//   const handleAddItem = () => {
//     if (!data) return;
//     const newItem = {
//       title: '',
//       meta: 'Undergraduate and postgraduate',
//       copy: '',
//       duration: '3-4 Years (UG), 1-2 Years (PG)',
//       fees: 'AED 50,000 - 85,000 / Year',
//       requirements: 'High School (60%+) or Bachelor\'s (2.5 GPA), IELTS 6.0',
//       intake: 'September / January',
//       overview: '',
//       highlights: 'AACSB or ABET accredited options available\nDirect access to Dubai\'s business and tech hubs\nInternship opportunities with global companies',
//       image: '',
//       careers: [
//         { role: 'Specialist', salary: 'AED 12,000 - 22,000 / Month' },
//         { role: 'Consultant', salary: 'AED 15,000 - 25,000 / Month' }
//       ]
//     };
//     const updatedItems = [...(data.items || []), newItem];
//     updateField('items', updatedItems);
//     setEditingIndex(updatedItems.length - 1);
//   };

//   const handleRemoveItem = (index) => {
//     if (!data || !data.items) return;
//     if (window.confirm('Are you sure you want to delete this course?')) {
//       const updatedItems = data.items.filter((_, i) => i !== index);
//       updateField('items', updatedItems);
//       if (editingIndex === index) {
//         setEditingIndex(null);
//       } else if (editingIndex > index) {
//         setEditingIndex(editingIndex - 1);
//       }
//     }
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setIsUploading(true);
//     try {
//       const res = await FileService.upload(file);
//       if (res && res.data && res.data.file_url) {
//         handleItemChange(editingIndex, 'image', res.data.file_url);
//       }
//     } catch (err) {
//       console.error('Error uploading image:', err);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   if (!data) return null;

//   return (
//     <div className="hero-editor-card">
//       <div className="editor-header">
//         <div>
//           <h3>Course Details</h3>
//           <p>{editingIndex !== null ? 'Edit Course Profile' : 'Manage Courses'}</p>
//         </div>
//         <button
//           type="button"
//           className="btn-back"
//           onClick={editingIndex !== null ? () => setEditingIndex(null) : onBack}
//         >
//           <i className="fa fa-arrow-left" style={{ marginRight: '8px' }} />
//           {editingIndex !== null ? 'Back to List' : 'Back'}
//         </button>
//       </div>

//       <form onSubmit={handleSave}>
//         <div className="editor-body" style={{ padding: '20px' }}>
//           {editingIndex === null ? (
//             <>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
//                 <span className="text-muted" style={{ fontSize: '13px' }}>
//                   {(data.items || []).length} Courses Listed
//                 </span>
//                 <button
//                   type="button"
//                   className="btn-add-item"
//                   onClick={handleAddItem}
//                   style={{
//                     padding: '6px 12px',
//                     fontSize: '12px',
//                     backgroundColor: '#174a8b',
//                     color: '#fff',
//                     border: 'none',
//                     borderRadius: '4px',
//                     cursor: 'pointer',
//                     fontWeight: '600'
//                   }}
//                 >
//                   <i className="fa fa-plus" style={{ marginRight: '6px' }} />
//                   Add Course
//                 </button>
//               </div>

//               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//                 {(data.items || []).map((item, index) => (
//                   <div
//                     key={index}
//                     className="editor-sub-card"
//                     style={{
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'space-between',
//                       padding: '12px',
//                       border: '1px solid #e1e5ea',
//                       borderRadius: '6px',
//                       backgroundColor: '#fdfdfd'
//                     }}
//                   >
//                     <div style={{ flex: 1, minWidth: 0 }}>
//                       <h5 style={{ margin: 0, fontWeight: 'bold', fontSize: '13px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                         {item.title || 'Unnamed Course'}
//                       </h5>
//                       <span className="text-muted" style={{ fontSize: '11px' }}>
//                         {item.meta || 'Undergraduate'}
//                       </span>
//                     </div>
//                     <div style={{ display: 'flex', gap: '8px' }}>
//                       <button
//                         type="button"
//                         className="btn-edit-sub"
//                         onClick={() => setEditingIndex(index)}
//                         style={{
//                           padding: '4px 8px',
//                           fontSize: '11px',
//                           backgroundColor: '#f0f2f5',
//                           border: 'none',
//                           borderRadius: '4px',
//                           cursor: 'pointer'
//                         }}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         type="button"
//                         className="btn-remove-sub"
//                         onClick={() => handleRemoveItem(index)}
//                         style={{
//                           padding: '4px 8px',
//                           fontSize: '11px',
//                           backgroundColor: '#fbe1e3',
//                           color: '#e73d4a',
//                           border: 'none',
//                           borderRadius: '4px',
//                           cursor: 'pointer'
//                         }}
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </>
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
//               <div className="field">
//                 <label>Course Title</label>
//                 <input
//                   className="editor-input"
//                   value={data.items[editingIndex]?.title || ''}
//                   onChange={(e) => handleItemChange(editingIndex, 'title', e.target.value)}
//                   placeholder="e.g. Business Management"
//                   required
//                 />
//               </div>

//               <div className="field">
//                 <label>Level / Meta</label>
//                 <input
//                   className="editor-input"
//                   value={data.items[editingIndex]?.meta || ''}
//                   onChange={(e) => handleItemChange(editingIndex, 'meta', e.target.value)}
//                   placeholder="e.g. Undergraduate and postgraduate"
//                   required
//                 />
//               </div>

//               <div className="field">
//                 <label>Short Summary</label>
//                 <textarea
//                   rows={2}
//                   className="editor-textarea"
//                   value={data.items[editingIndex]?.copy || ''}
//                   onChange={(e) => handleItemChange(editingIndex, 'copy', e.target.value)}
//                   placeholder="A short summary of the course for the card display..."
//                   required
//                 />
//               </div>

//               <h4 className="editor-section-title">Course Details</h4>

//               <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
//                 <div className="field">
//                   <label>Duration</label>
//                   <input
//                     className="editor-input"
//                     value={data.items[editingIndex]?.duration || ''}
//                     onChange={(e) => handleItemChange(editingIndex, 'duration', e.target.value)}
//                     placeholder="e.g. 3-4 Years (UG)"
//                   />
//                 </div>

//                 <div className="field">
//                   <label>Average Fees</label>
//                   <input
//                     className="editor-input"
//                     value={data.items[editingIndex]?.fees || ''}
//                     onChange={(e) => handleItemChange(editingIndex, 'fees', e.target.value)}
//                     placeholder="e.g. AED 50,000 / Year"
//                   />
//                 </div>
//               </div>

//               <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
//                 <div className="field">
//                   <label>Requirements</label>
//                   <input
//                     className="editor-input"
//                     value={data.items[editingIndex]?.requirements || ''}
//                     onChange={(e) => handleItemChange(editingIndex, 'requirements', e.target.value)}
//                     placeholder="e.g. IELTS 6.0, 60%+"
//                   />
//                 </div>

//                 <div className="field">
//                   <label>Next Intake</label>
//                   <input
//                     className="editor-input"
//                     value={data.items[editingIndex]?.intake || ''}
//                     onChange={(e) => handleItemChange(editingIndex, 'intake', e.target.value)}
//                     placeholder="e.g. September / January"
//                   />
//                 </div>
//               </div>

//               <div className="field">
//                 <label>Hero Background Image</label>
//                 <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
//                   {data.items[editingIndex]?.image && (
//                     <div
//                       style={{
//                         width: '60px',
//                         height: '60px',
//                         borderRadius: '6px',
//                         backgroundImage: `url(${data.items[editingIndex].image})`,
//                         backgroundSize: 'cover',
//                         backgroundPosition: 'center',
//                         border: '1px solid #e1e5ea',
//                         flexShrink: 0
//                       }}
//                     />
//                   )}
//                   <div style={{ flex: 1 }}>
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageUpload}
//                       style={{ display: 'none' }}
//                       id="course-image-upload"
//                     />
//                     <label
//                       htmlFor="course-image-upload"
//                       style={{
//                         display: 'inline-block',
//                         padding: '8px 12px',
//                         backgroundColor: '#f0f2f5',
//                         border: '1px solid #d1d5db',
//                         borderRadius: '6px',
//                         cursor: 'pointer',
//                         fontSize: '12px',
//                         fontWeight: '600',
//                         color: '#374151',
//                         textAlign: 'center'
//                       }}
//                     >
//                       {isUploading ? 'Uploading...' : 'Choose Image'}
//                     </label>
//                     <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6b7280' }}>
//                       Recommended size: 900x600 px (JPEG, PNG).
//                     </p>
//                     <input
//                       className="editor-input"
//                       style={{ marginTop: '8px' }}
//                       value={data.items[editingIndex]?.image || ''}
//                       onChange={(e) => handleItemChange(editingIndex, 'image', e.target.value)}
//                       placeholder="Or paste image URL"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="field">
//                 <label>Detailed Overview</label>
//                 <textarea
//                   rows={4}
//                   className="editor-textarea"
//                   value={data.items[editingIndex]?.overview || ''}
//                   onChange={(e) => handleItemChange(editingIndex, 'overview', e.target.value)}
//                   placeholder="Detailed description of what the course covers, teaching methodologies, etc..."
//                 />
//               </div>

//               <div className="field">
//                 <label>Key Highlights (One per line)</label>
//                 <textarea
//                   rows={3}
//                   className="editor-textarea"
//                   value={data.items[editingIndex]?.highlights || ''}
//                   onChange={(e) => handleItemChange(editingIndex, 'highlights', e.target.value)}
//                   placeholder="e.g. AACSB Accredited&#10;Global internships&#10;Dual-degree options"
//                 />
//               </div>

//               <h4 className="editor-section-title">Career Opportunities (Up to 3)</h4>
//               {[0, 1, 2].map((cIdx) => {
//                 const career = data.items[editingIndex]?.careers?.[cIdx] || { role: '', salary: '' };
//                 return (
//                   <div key={cIdx} className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
//                     <div className="field">
//                       <label>Career Role {cIdx + 1}</label>
//                       <input
//                         className="editor-input"
//                         value={career.role}
//                         onChange={(e) => handleCareerChange(editingIndex, cIdx, 'role', e.target.value)}
//                         placeholder="e.g. Business Analyst"
//                       />
//                     </div>
//                     <div className="field">
//                       <label>Starting Salary {cIdx + 1}</label>
//                       <input
//                         className="editor-input"
//                         value={career.salary}
//                         onChange={(e) => handleCareerChange(editingIndex, cIdx, 'salary', e.target.value)}
//                         placeholder="e.g. AED 12,000 / Month"
//                       />
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         <div className="editor-footer">
//           <button
//             type="button"
//             className="btn-cancel"
//             onClick={editingIndex !== null ? () => setEditingIndex(null) : onBack}
//           >
//             {editingIndex !== null ? 'Back to List' : 'Cancel'}
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



import React, { useState } from 'react';
import { usePreviewSettings } from '../../context/PreviewSettingsContext';
import FileService from '../../services/FileService';
import './css/web-settings.css';

export default function CourseDetailsForm({ onBack }) {
  const { data, updateField, saveSection, isSaving } =
    usePreviewSettings('programs');

  const [editingIndex, setEditingIndex] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const selectedCourse =
    editingIndex !== null
      ? data?.items?.[editingIndex]
      : null;

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSection();
  };

  const handleItemChange = (index, field, value) => {
    if (!data || !data.items) return;

    const updatedItems = [...data.items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    updateField('items', updatedItems);
  };

  const handleCareerChange = (
    itemIndex,
    careerIndex,
    field,
    value
  ) => {
    if (!data || !data.items) return;

    const updatedItems = [...data.items];
    const item = { ...updatedItems[itemIndex] };
    const careers = [...(item.careers || [])];

    while (careers.length <= careerIndex) {
      careers.push({
        role: '',
        salary: ''
      });
    }

    careers[careerIndex] = {
      ...careers[careerIndex],
      [field]: value
    };

    item.careers = careers.filter(
      (career) => career.role || career.salary
    );

    updatedItems[itemIndex] = item;

    updateField('items', updatedItems);
  };

  const handleAddItem = () => {
    if (!data) return;

    const newItem = {
      title: '',
      meta: 'Undergraduate and postgraduate',
      copy: '',
      duration: '3-4 Years (UG), 1-2 Years (PG)',
      fees: 'AED 50,000 - 85,000 / Year',
      requirements:
        "High School (60%+) or Bachelor's (2.5 GPA), IELTS 6.0",
      intake: 'September / January',
      overview: '',
      highlights:
        "AACSB or ABET accredited options available\nDirect access to Dubai's business and tech hubs\nInternship opportunities with global companies",
      image: '',
      careers: [
        {
          role: 'Specialist',
          salary: 'AED 12,000 - 22,000 / Month'
        },
        {
          role: 'Consultant',
          salary: 'AED 15,000 - 25,000 / Month'
        }
      ]
    };

    const updatedItems = [
      ...(data.items || []),
      newItem
    ];

    updateField('items', updatedItems);
    setEditingIndex(updatedItems.length - 1);
  };

  const handleRemoveItem = (index) => {
    if (!data || !data.items) return;

    if (
      window.confirm(
        'Are you sure you want to delete this course?'
      )
    ) {
      const updatedItems = data.items.filter(
        (_, i) => i !== index
      );

      updateField('items', updatedItems);

      if (editingIndex === index) {
        setEditingIndex(null);
      } else if (editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file || editingIndex === null) return;

    setIsUploading(true);

    try {
      const res = await FileService.upload(file);

      if (res?.data?.file_url) {
        handleItemChange(
          editingIndex,
          'image',
          res.data.file_url
        );
      }
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  if (!data) return null;

  return (
    <div className="course-details-editor-page">
      <form onSubmit={handleSave}>
        <div className="editor-body">
          {editingIndex === null ? (
            <div className="course-details-list-layout">
              <div className="course-details-form-section course-details-list-section">
                <div className="course-details-section-head">
                  <div>
                    <h4 className="editor-section-title">
                      Course List
                    </h4>

                    <p>
                      {(data.items || []).length} courses listed
                    </p>
                  </div>

                  <div className="course-details-header-actions">
                    <button
                      type="button"
                      className="btn-back"
                      onClick={() => onBack?.()}
                    >
                      <i className="fa fa-arrow-left" />
                      Back
                    </button>

                    <button
                      type="button"
                      className="course-details-add-btn"
                      onClick={handleAddItem}
                    >
                      <i className="fa fa-plus" />
                      Add Course
                    </button>
                  </div>
                </div>

                <div className="course-details-list">
                  {(data.items || []).map((item, index) => (
                    <div
                      key={index}
                      className="course-details-list-card"
                    >
                      <div className="course-details-list-info">
                        <div className="course-details-thumb">
                          {item.image ? (
                            <div
                              className="course-details-thumb-image"
                              style={{
                                backgroundImage: `url(${item.image})`
                              }}
                            />
                          ) : (
                            <i className="fa fa-book" />
                          )}
                        </div>

                        <div className="course-details-list-copy">
                          <h5>
                            {item.title || 'Unnamed Course'}
                          </h5>

                          <p>
                            {item.meta || 'Undergraduate'}
                          </p>
                        </div>
                      </div>

                      <div className="course-details-card-actions">
                        <button
                          type="button"
                          className="course-details-edit-btn"
                          onClick={() =>
                            setEditingIndex(index)
                          }
                        >
                          <i className="fa fa-edit" />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="course-details-delete-btn"
                          onClick={() =>
                            handleRemoveItem(index)
                          }
                        >
                          <i className="fa fa-trash" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="course-details-edit-layout">
              <div className="course-details-form-section">
                <div className="course-details-section-head">
                  <div>
                    <h4 className="editor-section-title">
                      {selectedCourse?.title
                        ? `Edit: ${selectedCourse.title}`
                        : 'New Course Details'}
                    </h4>

                    <p>
                      Update course detail page content.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="course-details-done-btn"
                    onClick={() =>
                      setEditingIndex(null)
                    }
                  >
                    Back to List
                  </button>
                </div>

                <div className="course-details-inner-grid two-col">
                  <div className="field">
                    <label>Course Title</label>

                    <input
                      className="editor-input"
                      value={selectedCourse?.title || ''}
                      onChange={(e) =>
                        handleItemChange(
                          editingIndex,
                          'title',
                          e.target.value
                        )
                      }
                      placeholder="e.g. Business Management"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Level / Meta</label>

                    <input
                      className="editor-input"
                      value={selectedCourse?.meta || ''}
                      onChange={(e) =>
                        handleItemChange(
                          editingIndex,
                          'meta',
                          e.target.value
                        )
                      }
                      placeholder="e.g. Undergraduate and postgraduate"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Short Summary</label>

                  <textarea
                    rows={3}
                    className="editor-textarea"
                    value={selectedCourse?.copy || ''}
                    onChange={(e) =>
                      handleItemChange(
                        editingIndex,
                        'copy',
                        e.target.value
                      )
                    }
                    placeholder="A short summary of the course for the card display..."
                    required
                  />
                </div>
              </div>

              <div className="course-details-form-section">
                <h4 className="editor-section-title">
                  Course Details
                </h4>

                <div className="course-details-inner-grid two-col">
                  <div className="field">
                    <label>Duration</label>

                    <input
                      className="editor-input"
                      value={
                        selectedCourse?.duration || ''
                      }
                      onChange={(e) =>
                        handleItemChange(
                          editingIndex,
                          'duration',
                          e.target.value
                        )
                      }
                      placeholder="e.g. 3-4 Years (UG)"
                    />
                  </div>

                  <div className="field">
                    <label>Average Fees</label>

                    <input
                      className="editor-input"
                      value={selectedCourse?.fees || ''}
                      onChange={(e) =>
                        handleItemChange(
                          editingIndex,
                          'fees',
                          e.target.value
                        )
                      }
                      placeholder="e.g. AED 50,000 / Year"
                    />
                  </div>

                  <div className="field">
                    <label>Requirements</label>

                    <input
                      className="editor-input"
                      value={
                        selectedCourse?.requirements || ''
                      }
                      onChange={(e) =>
                        handleItemChange(
                          editingIndex,
                          'requirements',
                          e.target.value
                        )
                      }
                      placeholder="e.g. IELTS 6.0, 60%+"
                    />
                  </div>

                  <div className="field">
                    <label>Next Intake</label>

                    <input
                      className="editor-input"
                      value={
                        selectedCourse?.intake || ''
                      }
                      onChange={(e) =>
                        handleItemChange(
                          editingIndex,
                          'intake',
                          e.target.value
                        )
                      }
                      placeholder="e.g. September / January"
                    />
                  </div>
                </div>
              </div>

              <div className="course-details-form-section">
                <h4 className="editor-section-title">
                  Hero Background Image
                </h4>

                <div className="course-details-upload-box">
                  <div className="course-details-image-preview">
                    {selectedCourse?.image ? (
                      <div
                        className="course-details-image-fill"
                        style={{
                          backgroundImage: `url(${selectedCourse.image})`
                        }}
                      />
                    ) : (
                      <i className="fa fa-image" />
                    )}

                    {isUploading && (
                      <div className="course-details-upload-loader">
                        <i className="fa fa-spinner fa-spin" />
                        Uploading...
                      </div>
                    )}
                  </div>

                  <div className="course-details-upload-content">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="course-image-upload"
                      disabled={isUploading}
                    />

                    <label
                      htmlFor="course-image-upload"
                      className="course-details-upload-label"
                    >
                      <i className="fa fa-upload" />
                      {isUploading
                        ? 'Uploading...'
                        : 'Choose Image'}
                    </label>

                    <p>
                      Recommended size: 900x600 px -
                      JPEG, PNG.
                    </p>
                  </div>
                </div>

                <div className="field">
                  <label>Image URL</label>

                  <input
                    className="editor-input"
                    value={selectedCourse?.image || ''}
                    onChange={(e) =>
                      handleItemChange(
                        editingIndex,
                        'image',
                        e.target.value
                      )
                    }
                    placeholder="Or paste image URL"
                    disabled={isUploading}
                  />
                </div>
              </div>

              <div className="course-details-form-section">
                <h4 className="editor-section-title">
                  Detailed Content
                </h4>

                <div className="field">
                  <label>Detailed Overview</label>

                  <textarea
                    rows={5}
                    className="editor-textarea"
                    value={
                      selectedCourse?.overview || ''
                    }
                    onChange={(e) =>
                      handleItemChange(
                        editingIndex,
                        'overview',
                        e.target.value
                      )
                    }
                    placeholder="Detailed description of what the course covers, teaching methodologies, etc..."
                  />
                </div>

                <div className="field">
                  <label>
                    Key Highlights - One Per Line
                  </label>

                  <textarea
                    rows={5}
                    className="editor-textarea"
                    value={
                      selectedCourse?.highlights || ''
                    }
                    onChange={(e) =>
                      handleItemChange(
                        editingIndex,
                        'highlights',
                        e.target.value
                      )
                    }
                    placeholder={
                      'AACSB Accredited\nGlobal internships\nDual-degree options'
                    }
                  />
                </div>
              </div>

              <div className="course-details-form-section">
                <h4 className="editor-section-title">
                  Career Opportunities - Up to 3
                </h4>

                <div className="course-details-careers-list">
                  {[0, 1, 2].map((cIdx) => {
                    const career =
                      selectedCourse?.careers?.[cIdx] || {
                        role: '',
                        salary: ''
                      };

                    return (
                      <div
                        key={cIdx}
                        className="course-details-career-card"
                      >
                        <div className="course-details-career-number">
                          {cIdx + 1}
                        </div>

                        <div className="course-details-career-row">
                          <div className="field">
                            <label>
                              Career Role {cIdx + 1}
                            </label>

                            <input
                              className="editor-input"
                              value={career.role}
                              onChange={(e) =>
                                handleCareerChange(
                                  editingIndex,
                                  cIdx,
                                  'role',
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Business Analyst"
                            />
                          </div>

                          <div className="field">
                            <label>
                              Starting Salary {cIdx + 1}
                            </label>

                            <input
                              className="editor-input"
                              value={career.salary}
                              onChange={(e) =>
                                handleCareerChange(
                                  editingIndex,
                                  cIdx,
                                  'salary',
                                  e.target.value
                                )
                              }
                              placeholder="e.g. AED 12,000 / Month"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="course-details-form-section">
                <h4 className="editor-section-title">
                  Quick Preview
                </h4>

                <div className="course-details-preview-box">
                  <div
                    className="course-details-preview-image"
                    style={{
                      backgroundImage: selectedCourse?.image
                        ? `url(${selectedCourse.image})`
                        : 'none'
                    }}
                  >
                    {!selectedCourse?.image && (
                      <i className="fa fa-book" />
                    )}
                  </div>

                  <div className="course-details-preview-copy">
                    <h5>
                      {selectedCourse?.title ||
                        'Course Name Preview'}
                    </h5>

                    <p>
                      {selectedCourse?.meta ||
                        'Course level'}
                    </p>

                    <span>
                      {selectedCourse?.duration ||
                        'Course duration'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="editor-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={
              editingIndex !== null
                ? () => setEditingIndex(null)
                : () => onBack?.()
            }
          >
            {editingIndex !== null
              ? 'Back to List'
              : 'Cancel'}
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






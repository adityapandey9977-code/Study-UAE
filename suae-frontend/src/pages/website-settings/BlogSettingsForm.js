// import React, { useState } from 'react';
// import { usePreviewSettings } from '../../context/PreviewSettingsContext';
// import FileService from '../../services/FileService';
// import util from '../../utils/util';
// import './css/web-settings.css';

// export default function BlogSettingsForm({ onBack }) {
//   const { data, updateField, saveSection, isSaving } = usePreviewSettings('blogs');
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);

//   const isSuperAdmin = util.isAdmin() === 1 || util.isClientAdmin() === 1;

//   if (!isSuperAdmin) {
//     return (
//       <div className="hero-editor-card blog-settings-card">
//         <div style={{ fontSize: '48px', color: '#e73d4a', marginBottom: '20px' }}>
//           <i className="fa fa-exclamation-triangle" />
//         </div>
//         <h3>Access Denied</h3>
//         <p style={{ color: '#666', fontSize: '15px' }}>Only Super Admins are authorized to manage blogs on this platform.</p>
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
//       console.error('Error uploading blog image:', err);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleAddBlog = () => {
//     const today = new Date().toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });

//     const newItem = {
//       id: items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1,
//       title: 'New Blog Post Title',
//       titleColor: '#172033',
//       category: 'Admissions',
//       categoryColor: '#0d8b89',
//       readTime: '5 min read',
//       date: today,
//       excerpt: 'Brief overview or excerpt of the new blog post.',
//       excerptColor: '#64748b',
//       image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
//       author: 'Super Admin',
//       content: '<p class="lead">Start writing your blog content here...</p>'
//     };

//     const updated = [...items, newItem];
//     updateField('', updated);
//     setEditingIndex(updated.length - 1);
//   };

//   const handleRemoveBlog = (index) => {
//     const updated = items.filter((_, i) => i !== index);
//     updateField('', updated);
//     if (editingIndex === index) {
//       setEditingIndex(null);
//     } else if (editingIndex > index) {
//       setEditingIndex(editingIndex - 1);
//     }
//   };

//   return (
//     <div className="hero-editor-card blog-settings-card">
//       <div className="editor-header">
//         <div>
//           <h3>Manage Blogs</h3>
//           <p>Add, edit, or delete articles and news (Super Admin Access)</p>
//         </div>

//         <button type="button" className="btn-back" onClick={onBack}>
//           <i className="fa fa-arrow-left" style={{ marginRight: '6px' }} />
//           Back
//         </button>
//       </div>

//       <form onSubmit={handleSave}>
//         <div className="editor-body">
//           {editingIndex === null ? (
//             <div className="blog-settings-list-layout">
//               <div className="blog-settings-list-left">
//                 <div className="blog-settings-section-card">
//                   <div className="blog-settings-section-head">
//                     <div>
//                       <h4 className="editor-section-title">Blog Articles</h4>
//                       <p>{items.length} Articles Listed</p>
//                     </div>

//                     <button
//                       type="button"
//                       className="btn-add-item blog-settings-add-btn"
//                       onClick={handleAddBlog}
//                     >
//                       <i className="fa fa-plus" style={{ marginRight: '6px' }} />
//                       Add Blog Post
//                     </button>
//                   </div>

//                   <div className="blog-settings-list-wrap">
//                     {items.map((blog, index) => (
//                       <div key={index} className="editor-sub-card blog-settings-list-card">
//                         <div className="blog-settings-list-main">
//                           <div className="blog-settings-thumb">
//                             {blog.image ? (
//                               <img src={blog.image} alt="" />
//                             ) : (
//                               <i className="fa fa-newspaper-o" />
//                             )}
//                           </div>

//                           <div className="blog-settings-list-content">
//                             <span
//                               className="blog-settings-category"
//                               style={{ color: blog.categoryColor || '#0d8b89' }}
//                             >
//                               {blog.category || 'General'}
//                             </span>

//                             <h5 style={{ color: blog.titleColor || '#172033' }}>
//                               {blog.title || 'Unnamed Post'}
//                             </h5>

//                             <p style={{ color: blog.excerptColor || '#64748b' }}>
//                               {blog.excerpt || 'No excerpt added yet.'}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="blog-settings-actions">
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
//                             onClick={() => handleRemoveBlog(index)}
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       </div>
//                     ))}

//                     {items.length === 0 && (
//                       <div className="blog-settings-empty">
//                         <i className="fa fa-newspaper-o" />
//                         <h5>No blogs added yet</h5>
//                         <p>Add blog posts to manage and display website articles.</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="blog-settings-list-right">
//                 <div className="blog-settings-section-card">
//                   <h4 className="editor-section-title">Quick Summary</h4>

//                   <div className="blog-settings-summary-grid">
//                     <div>
//                       <strong>{items.length}</strong>
//                       <span>Total Articles</span>
//                     </div>

//                     <div>
//                       <strong>
//                         {new Set(items.map((item) => item.category || 'General')).size}
//                       </strong>
//                       <span>Categories</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="blog-settings-section-card">
//                   <h4 className="editor-section-title">Preview</h4>

//                   <div className="blog-settings-preview-card">
//                     {items[0]?.image && (
//                       <img src={items[0].image} alt="" />
//                     )}

//                     <span style={{ color: items[0]?.categoryColor || '#0d8b89' }}>
//                       {items[0]?.category || 'Category'}
//                     </span>

//                     <h5 style={{ color: items[0]?.titleColor || '#172033' }}>
//                       {items[0]?.title || 'Blog title preview'}
//                     </h5>

//                     <p style={{ color: items[0]?.excerptColor || '#64748b' }}>
//                       {items[0]?.excerpt || 'Blog excerpt preview will appear here.'}
//                     </p>

//                     <small>
//                       {items[0]?.author || 'Author'} · {items[0]?.readTime || 'Read time'}
//                     </small>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="blog-settings-edit-layout">
//               <div className="blog-settings-edit-left">
//                 <div className="blog-settings-section-card">
//                   <div className="blog-settings-section-head">
//                     <div>
//                       <h4 className="editor-section-title">Edit Blog Article</h4>
//                       <p>Update blog title, category, author, date and summary.</p>
//                     </div>

//                     <button
//                       type="button"
//                       className="btn-back blog-settings-done-btn"
//                       onClick={() => setEditingIndex(null)}
//                     >
//                       Done
//                     </button>
//                   </div>

//                   <div className="field-group blog-settings-grid two-col">
//                     <div className="field">
//                       <label>Title</label>
//                       <input
//                         className="editor-input"
//                         value={items[editingIndex]?.title || ''}
//                         onChange={(e) => handleItemChange(editingIndex, 'title', e.target.value)}
//                         placeholder="e.g. How to Apply for a UAE Student Visa"
//                         required
//                       />
//                     </div>

//                     <div className="field">
//                       <label>Category</label>
//                       <input
//                         className="editor-input"
//                         value={items[editingIndex]?.category || ''}
//                         onChange={(e) => handleItemChange(editingIndex, 'category', e.target.value)}
//                         placeholder="e.g. Visas, Finance, Careers"
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div className="field-group blog-settings-grid three-col">
//                     <div className="field">
//                       <label>Author Name</label>
//                       <input
//                         className="editor-input"
//                         value={items[editingIndex]?.author || ''}
//                         onChange={(e) => handleItemChange(editingIndex, 'author', e.target.value)}
//                         placeholder="e.g. Sara Al-Mansoori"
//                         required
//                       />
//                     </div>

//                     <div className="field">
//                       <label>Read Time</label>
//                       <input
//                         className="editor-input"
//                         value={items[editingIndex]?.readTime || ''}
//                         onChange={(e) => handleItemChange(editingIndex, 'readTime', e.target.value)}
//                         placeholder="e.g. 5 min read"
//                         required
//                       />
//                     </div>

//                     <div className="field">
//                       <label>Publish Date</label>
//                       <input
//                         className="editor-input"
//                         value={items[editingIndex]?.date || ''}
//                         onChange={(e) => handleItemChange(editingIndex, 'date', e.target.value)}
//                         placeholder="e.g. June 28, 2026"
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div className="field">
//                     <label>Excerpt / Short Summary</label>
//                     <textarea
//                       rows={2}
//                       className="editor-textarea"
//                       value={items[editingIndex]?.excerpt || ''}
//                       onChange={(e) => handleItemChange(editingIndex, 'excerpt', e.target.value)}
//                       placeholder="Provide a short teaser sentence..."
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="blog-settings-section-card">
//                   <h4 className="editor-section-title">Featured Image</h4>

//                   <div className="blog-settings-upload-row">
//                     {items[editingIndex]?.image && (
//                       <img
//                         src={items[editingIndex].image}
//                         alt="Preview"
//                         className="blog-settings-image-preview"
//                       />
//                     )}

//                     <div className="blog-settings-upload-content">
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleImageUpload}
//                         style={{ display: 'none' }}
//                         id="blog-image-upload"
//                       />

//                       <label htmlFor="blog-image-upload" className="blog-settings-upload-label">
//                         {isUploading ? (
//                           <>
//                             <i className="fa fa-spinner fa-spin" style={{ marginRight: '6px' }} />
//                             Uploading...
//                           </>
//                         ) : (
//                           <>
//                             <i className="fa fa-upload" style={{ marginRight: '6px' }} />
//                             Choose Image File
//                           </>
//                         )}
//                       </label>

//                       <p>Recommended size: 900x600 px - JPEG, PNG.</p>

//                       <input
//                         className="editor-input"
//                         value={items[editingIndex]?.image || ''}
//                         onChange={(e) => handleItemChange(editingIndex, 'image', e.target.value)}
//                         placeholder="Or enter image URL directly"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="blog-settings-edit-right">
//                 <div className="blog-settings-section-card">
//                   <h4 className="editor-section-title">Blog Text Colors</h4>

//                   <div className="field">
//                     <label>Category Color</label>
//                     <div className="input-with-color">
//                       <input
//                         className="editor-input"
//                         value={items[editingIndex]?.categoryColor || '#0d8b89'}
//                         onChange={(e) => handleItemChange(editingIndex, 'categoryColor', e.target.value)}
//                         placeholder="#0d8b89"
//                       />

//                       <input
//                         type="color"
//                         value={items[editingIndex]?.categoryColor || '#0d8b89'}
//                         onChange={(e) => handleItemChange(editingIndex, 'categoryColor', e.target.value)}
//                         className="color-input"
//                       />
//                     </div>
//                   </div>

//                   <div className="field">
//                     <label>Title Color</label>
//                     <div className="input-with-color">
//                       <input
//                         className="editor-input"
//                         value={items[editingIndex]?.titleColor || '#172033'}
//                         onChange={(e) => handleItemChange(editingIndex, 'titleColor', e.target.value)}
//                         placeholder="#172033"
//                       />

//                       <input
//                         type="color"
//                         value={items[editingIndex]?.titleColor || '#172033'}
//                         onChange={(e) => handleItemChange(editingIndex, 'titleColor', e.target.value)}
//                         className="color-input"
//                       />
//                     </div>
//                   </div>

//                   <div className="field">
//                     <label>Excerpt Color</label>
//                     <div className="input-with-color">
//                       <input
//                         className="editor-input"
//                         value={items[editingIndex]?.excerptColor || '#64748b'}
//                         onChange={(e) => handleItemChange(editingIndex, 'excerptColor', e.target.value)}
//                         placeholder="#64748b"
//                       />

//                       <input
//                         type="color"
//                         value={items[editingIndex]?.excerptColor || '#64748b'}
//                         onChange={(e) => handleItemChange(editingIndex, 'excerptColor', e.target.value)}
//                         className="color-input"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="blog-settings-section-card">
//                   <h4 className="editor-section-title">Article Content</h4>

//                   <div className="field">
//                     <label>Article Content (HTML)</label>
//                     <textarea
//                       rows={8}
//                       className="editor-textarea"
//                       value={items[editingIndex]?.content || ''}
//                       onChange={(e) => handleItemChange(editingIndex, 'content', e.target.value)}
//                       placeholder="Write raw content paragraphs or HTML markup..."
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="blog-settings-section-card">
//                   <h4 className="editor-section-title">Card Preview</h4>

//                   <div className="blog-settings-preview-card">
//                     {items[editingIndex]?.image && (
//                       <img src={items[editingIndex].image} alt="" />
//                     )}

//                     <span style={{ color: items[editingIndex]?.categoryColor || '#0d8b89' }}>
//                       {items[editingIndex]?.category || 'Category'}
//                     </span>

//                     <h5 style={{ color: items[editingIndex]?.titleColor || '#172033' }}>
//                       {items[editingIndex]?.title || 'Blog title preview'}
//                     </h5>

//                     <p style={{ color: items[editingIndex]?.excerptColor || '#64748b' }}>
//                       {items[editingIndex]?.excerpt || 'Blog excerpt preview will appear here.'}
//                     </p>

//                     <small>
//                       {items[editingIndex]?.author || 'Author'} ·{' '}
//                       {items[editingIndex]?.readTime || 'Read time'}
//                     </small>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="editor-footer">
//           <button type="submit" className="btn-save" disabled={isSaving === 'blogs'}>
//             {isSaving === 'blogs' ? (
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
// }



import React, { useState } from 'react';
import { usePreviewSettings } from '../../context/PreviewSettingsContext';
import FileService from '../../services/FileService';
import util from '../../utils/util';
import './css/web-settings.css';

export default function BlogSettingsForm() {
  const { data, updateField, saveSection, isSaving } =
    usePreviewSettings('blogs');

  const [editingIndex, setEditingIndex] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const isSuperAdmin =
    util.isAdmin() === 1 ||
    util.isClientAdmin() === 1;

  if (!isSuperAdmin) {
    return (
      <div className="hero-editor-card blog-settings-card">
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
          Only Super Admins are authorized to manage blogs on this platform.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const items = Array.isArray(data)
    ? data
    : data.items || [];

  const handleSave = (e) => {
    e.preventDefault();
    saveSection();
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];

    updated[index] = {
      ...updated[index],
      [field]: value
    };

    updateField('', updated);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setIsUploading(true);

    try {
      const res = await FileService.upload(file);

      if (res && res.data && res.data.file_url) {
        handleItemChange(
          editingIndex,
          'image',
          res.data.file_url
        );
      }
    } catch (err) {
      console.error('Error uploading blog image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddBlog = () => {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const newItem = {
      id:
        items.length > 0
          ? Math.max(...items.map((item) => item.id || 0)) + 1
          : 1,
      title: 'New Blog Post Title',
      titleColor: '#172033',
      category: 'Admissions',
      categoryColor: '#0d8b89',
      readTime: '5 min read',
      date: today,
      excerpt: 'Brief overview or excerpt of the new blog post.',
      excerptColor: '#64748b',
      image:
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      author: 'Super Admin',
      content:
        '<p class="lead">Start writing your blog content here...</p>'
    };

    const updated = [...items, newItem];

    updateField('', updated);
    setEditingIndex(updated.length - 1);
  };

  const handleRemoveBlog = (index) => {
    const updated = items.filter(
      (_, itemIndex) => itemIndex !== index
    );

    updateField('', updated);

    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  return (
    <div className="blog-settings-card blog-settings-flat">
      <form onSubmit={handleSave}>
        <div className="editor-body blog-settings-body">
          {editingIndex === null ? (
            <div className="blog-settings-list-layout">
              <div className="blog-settings-list-left">
                <div className="blog-settings-section-card">
                  <div className="blog-settings-section-head">
                    <div>
                      <h4 className="editor-section-title">
                        Blog Articles
                      </h4>

                      <p>{items.length} Articles Listed</p>
                    </div>

                    <button
                      type="button"
                      className="btn-add-item blog-settings-add-btn"
                      onClick={handleAddBlog}
                    >
                      <i
                        className="fa fa-plus"
                        style={{ marginRight: '6px' }}
                      />
                      Add Blog Post
                    </button>
                  </div>

                  <div className="blog-settings-list-wrap">
                    {items.map((blog, index) => (
                      <div
                        key={blog.id || index}
                        className="editor-sub-card blog-settings-list-card"
                      >
                        <div className="blog-settings-list-main">
                          <div className="blog-settings-thumb">
                            {blog.image ? (
                              <img
                                src={blog.image}
                                alt=""
                              />
                            ) : (
                              <i className="fa fa-newspaper-o" />
                            )}
                          </div>

                          <div className="blog-settings-list-content">
                            <span
                              className="blog-settings-category"
                              style={{
                                color:
                                  blog.categoryColor ||
                                  '#0d8b89'
                              }}
                            >
                              {blog.category || 'General'}
                            </span>

                            <h5
                              style={{
                                color:
                                  blog.titleColor ||
                                  '#172033'
                              }}
                            >
                              {blog.title || 'Unnamed Post'}
                            </h5>

                            <p
                              style={{
                                color:
                                  blog.excerptColor ||
                                  '#64748b'
                              }}
                            >
                              {blog.excerpt ||
                                'No excerpt added yet.'}
                            </p>
                          </div>
                        </div>

                        <div className="blog-settings-actions">
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
                              handleRemoveBlog(index)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}

                    {items.length === 0 && (
                      <div className="blog-settings-empty">
                        <i className="fa fa-newspaper-o" />

                        <h5>No blogs added yet</h5>

                        <p>
                          Add blog posts to manage and display
                          website articles.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="blog-settings-list-right">
                <div className="blog-settings-section-card">
                  <h4 className="editor-section-title">
                    Quick Summary
                  </h4>

                  <div className="blog-settings-summary-grid">
                    <div>
                      <strong>{items.length}</strong>
                      <span>Total Articles</span>
                    </div>

                    <div>
                      <strong>
                        {
                          new Set(
                            items.map(
                              (item) =>
                                item.category || 'General'
                            )
                          ).size
                        }
                      </strong>

                      <span>Categories</span>
                    </div>
                  </div>
                </div>

                <div className="blog-settings-section-card">
                  <h4 className="editor-section-title">
                    Preview
                  </h4>

                  <div className="blog-settings-preview-card">
                    {items[0]?.image && (
                      <img
                        src={items[0].image}
                        alt=""
                      />
                    )}

                    <span
                      style={{
                        color:
                          items[0]?.categoryColor ||
                          '#0d8b89'
                      }}
                    >
                      {items[0]?.category || 'Category'}
                    </span>

                    <h5
                      style={{
                        color:
                          items[0]?.titleColor ||
                          '#172033'
                      }}
                    >
                      {items[0]?.title ||
                        'Blog title preview'}
                    </h5>

                    <p
                      style={{
                        color:
                          items[0]?.excerptColor ||
                          '#64748b'
                      }}
                    >
                      {items[0]?.excerpt ||
                        'Blog excerpt preview will appear here.'}
                    </p>

                    <small>
                      {items[0]?.author || 'Author'} ·{' '}
                      {items[0]?.readTime || 'Read time'}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="blog-settings-edit-layout">
              <div className="blog-settings-edit-left">
                <div className="blog-settings-section-card">
                  <div className="blog-settings-section-head">
                    <div>
                      <h4 className="editor-section-title">
                        Edit Blog Article
                      </h4>

                      <p>
                        Update blog title, category, author,
                        date and summary.
                      </p>
                    </div>

                  </div>

                  <div className="field-group blog-settings-grid two-col">
                    <div className="field">
                      <label>Title</label>

                      <input
                        className="editor-input"
                        value={
                          items[editingIndex]?.title || ''
                        }
                        onChange={(e) =>
                          handleItemChange(
                            editingIndex,
                            'title',
                            e.target.value
                          )
                        }
                        placeholder="e.g. How to Apply for a UAE Student Visa"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Category</label>

                      <input
                        className="editor-input"
                        value={
                          items[editingIndex]?.category || ''
                        }
                        onChange={(e) =>
                          handleItemChange(
                            editingIndex,
                            'category',
                            e.target.value
                          )
                        }
                        placeholder="e.g. Visas, Finance, Careers"
                        required
                      />
                    </div>
                  </div>

                  <div className="field-group blog-settings-grid three-col">
                    <div className="field">
                      <label>Author Name</label>

                      <input
                        className="editor-input"
                        value={
                          items[editingIndex]?.author || ''
                        }
                        onChange={(e) =>
                          handleItemChange(
                            editingIndex,
                            'author',
                            e.target.value
                          )
                        }
                        placeholder="e.g. Sara Al-Mansoori"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Read Time</label>

                      <input
                        className="editor-input"
                        value={
                          items[editingIndex]?.readTime || ''
                        }
                        onChange={(e) =>
                          handleItemChange(
                            editingIndex,
                            'readTime',
                            e.target.value
                          )
                        }
                        placeholder="e.g. 5 min read"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Publish Date</label>

                      <input
                        className="editor-input"
                        value={
                          items[editingIndex]?.date || ''
                        }
                        onChange={(e) =>
                          handleItemChange(
                            editingIndex,
                            'date',
                            e.target.value
                          )
                        }
                        placeholder="e.g. June 28, 2026"
                        required
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>
                      Excerpt / Short Summary
                    </label>

                    <textarea
                      rows={2}
                      className="editor-textarea"
                      value={
                        items[editingIndex]?.excerpt || ''
                      }
                      onChange={(e) =>
                        handleItemChange(
                          editingIndex,
                          'excerpt',
                          e.target.value
                        )
                      }
                      placeholder="Provide a short teaser sentence..."
                      required
                    />
                  </div>
                </div>

                <div className="blog-settings-section-card">
                  <h4 className="editor-section-title">
                    Featured Image
                  </h4>

                  <div className="blog-settings-upload-row">
                    {items[editingIndex]?.image && (
                      <img
                        src={items[editingIndex].image}
                        alt="Preview"
                        className="blog-settings-image-preview"
                      />
                    )}

                    <div className="blog-settings-upload-content">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        id="blog-image-upload"
                      />

                      <label
                        htmlFor="blog-image-upload"
                        className="blog-settings-upload-label"
                      >
                        {isUploading ? (
                          <>
                            <i
                              className="fa fa-spinner fa-spin"
                              style={{
                                marginRight: '6px'
                              }}
                            />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <i
                              className="fa fa-upload"
                              style={{
                                marginRight: '6px'
                              }}
                            />
                            Choose Image File
                          </>
                        )}
                      </label>

                      <p>
                        Recommended size: 900x600 px -
                        JPEG, PNG.
                      </p>

                      <input
                        className="editor-input"
                        value={
                          items[editingIndex]?.image || ''
                        }
                        onChange={(e) =>
                          handleItemChange(
                            editingIndex,
                            'image',
                            e.target.value
                          )
                        }
                        placeholder="Or enter image URL directly"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="blog-settings-edit-right">
                <div className="blog-settings-section-card">
                  <h4 className="editor-section-title">
                    Blog Text Colors
                  </h4>

                  <div className="field">
                    <label>Category Color</label>

                    <div className="input-with-color">
                      <input
                        className="editor-input"
                        value={
                          items[editingIndex]
                            ?.categoryColor || '#0d8b89'
                        }
                        onChange={(e) =>
                          handleItemChange(
                            editingIndex,
                            'categoryColor',
                            e.target.value
                          )
                        }
                        placeholder="#0d8b89"
                      />

                      <input
                        type="color"
                        value={
                          items[editingIndex]
                            ?.categoryColor || '#0d8b89'
                        }
                        onChange={(e) =>
                          handleItemChange(
                            editingIndex,
                            'categoryColor',
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
                        value={
                          items[editingIndex]?.titleColor ||
                          '#172033'
                        }
                        onChange={(e) =>
                          handleItemChange(
                            editingIndex,
                            'titleColor',
                            e.target.value
                          )
                        }
                        placeholder="#172033"
                      />

                      <input
                        type="color"
                        value={
                          items[editingIndex]?.titleColor ||
                          '#172033'
                        }
                        onChange={(e) =>
                          handleItemChange(
                            editingIndex,
                            'titleColor',
                            e.target.value
                          )
                        }
                        className="color-input"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Excerpt Color</label>

                    <div className="input-with-color">
                      <input
                        className="editor-input"
                        value={
                          items[editingIndex]
                            ?.excerptColor || '#64748b'
                        }
                        onChange={(e) =>
                          handleItemChange(
                            editingIndex,
                            'excerptColor',
                            e.target.value
                          )
                        }
                        placeholder="#64748b"
                      />

                      <input
                        type="color"
                        value={
                          items[editingIndex]
                            ?.excerptColor || '#64748b'
                        }
                        onChange={(e) =>
                          handleItemChange(
                            editingIndex,
                            'excerptColor',
                            e.target.value
                          )
                        }
                        className="color-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="blog-settings-section-card">
                  <h4 className="editor-section-title">
                    Article Content
                  </h4>

                  <div className="field">
                    <label>
                      Article Content (HTML)
                    </label>

                    <textarea
                      rows={8}
                      className="editor-textarea"
                      value={
                        items[editingIndex]?.content || ''
                      }
                      onChange={(e) =>
                        handleItemChange(
                          editingIndex,
                          'content',
                          e.target.value
                        )
                      }
                      placeholder="Write raw content paragraphs or HTML markup..."
                      required
                    />
                  </div>
                </div>
                {/* 
                <div className="blog-settings-section-card">
                  <h4 className="editor-section-title">
                    Card Preview
                  </h4>

                  <div className="blog-settings-preview-card">
                    {items[editingIndex]?.image && (
                      <img
                        src={items[editingIndex].image}
                        alt=""
                      />
                    )}

                    <span
                      style={{
                        color:
                          items[editingIndex]
                            ?.categoryColor ||
                          '#0d8b89'
                      }}
                    >
                      {items[editingIndex]?.category ||
                        'Category'}
                    </span>

                    <h5
                      style={{
                        color:
                          items[editingIndex]?.titleColor ||
                          '#172033'
                      }}
                    >
                      {items[editingIndex]?.title ||
                        'Blog title preview'}
                    </h5>

                    <p
                      style={{
                        color:
                          items[editingIndex]
                            ?.excerptColor ||
                          '#64748b'
                      }}
                    >
                      {items[editingIndex]?.excerpt ||
                        'Blog excerpt preview will appear here.'}
                    </p>

                    <small>
                      {items[editingIndex]?.author ||
                        'Author'}{' '}
                      ·{' '}
                      {items[editingIndex]?.readTime ||
                        'Read time'}
                    </small>
                  </div>
                </div> */}





              </div>
            </div>
          )}
        </div>

        <div className="editor-footer blog-settings-footer">
          {editingIndex !== null ? (
            <>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setEditingIndex(null)}
              >
                <i
                  className="fa fa-arrow-left"
                  style={{ marginRight: '6px' }}
                />
                Back
              </button>

              <button
                type="button"
                className="btn-save"
                onClick={() => setEditingIndex(null)}
              >
                <i
                  className="fa fa-check"
                  style={{ marginRight: '6px' }}
                />
                Done
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="btn-save"
              disabled={isSaving === 'blogs'}
            >
              {isSaving === 'blogs' ? (
                <>
                  <i
                    className="fa fa-spinner fa-spin"
                    style={{ marginRight: '6px' }}
                  />
                  Saving...
                </>
              ) : (
                <>
                  <i
                    className="fa fa-save"
                    style={{ marginRight: '6px' }}
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
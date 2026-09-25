// import React from 'react';
// import { usePreviewSettings } from '../../context/PreviewSettingsContext';
// import './css/web-settings.css';

// export default function IntroSection({ onBack }) {
//   const { data, updateField, saveSection, isSaving } = usePreviewSettings('intro');

//   const handleSave = (e) => {
//     e.preventDefault();
//     saveSection();
//   };

//   if (!data) return null;

//   return (
//     <div className="hero-editor-card">
//       <div className="editor-header">
//         <div>
//           <h3>Intro Section</h3>
//           <p>Manage Study Destination Overview</p>
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
//           <div className="cms-field-group">
//             <h4 className="editor-section-title">Intro content</h4>
//             <div className="cms-field-grid two-col">
//               <div className="field">
//                 <label>Eyebrow</label>
//                 <div className="input-with-color">
//                   <input
//                     className="editor-input"
//                     value={data.eyebrow || ''}
//                     onChange={(e) => updateField('eyebrow', e.target.value)}
//                   />
//                   <input
//                     type="color"
//                     value={data.eyebrowColor || '#0f5c5a'}
//                     onChange={(e) => updateField('eyebrowColor', e.target.value)}
//                     className="color-input"
//                   />
//                 </div>
//               </div>

//               <div className="field">
//                 <label>Title</label>
//                 <div className="input-with-color">
//                   <input
//                     className="editor-input"
//                     value={data.title || ''}
//                     onChange={(e) => updateField('title', e.target.value)}
//                   />
//                   <input
//                     type="color"
//                     value={data.titleColor || '#000000'}
//                     onChange={(e) => updateField('titleColor', e.target.value)}
//                     className="color-input"
//                   />
//                 </div>
//               </div>

//               <div className="field">
//                 <label>Copy</label>
//                 <div className="input-with-color">
//                   <textarea
//                     rows={4}
//                     className="editor-textarea"
//                     value={data.copy || ''}
//                     onChange={(e) => updateField('copy', e.target.value)}
//                   />
//                   <input
//                     type="color"
//                     value={data.copyColor || '#000000'}
//                     onChange={(e) => updateField('copyColor', e.target.value)}
//                     className="color-input"
//                   />
//                 </div>
//               </div>
//             </div>
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

export default function IntroSection({ onBack }) {
  const { data, updateField, saveSection, isSaving } = usePreviewSettings('intro');

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSection();
  };

  if (!data) return null;

  return (
    <div className="intro-editor-card intro-editor-card--flat">
      <form onSubmit={handleSave} className="intro-editor-form">
        <div className="editor-body intro-editor-body-flat">
          <div className="intro-two-panel-layout">
            <div className="intro-left-panel">
              <div className="intro-form-section">
                <h4 className="editor-section-title">Intro Content</h4>

                <div className="field">
                  <label>Eyebrow</label>
                  <input
                    className="editor-input"
                    value={data.eyebrow || ''}
                    onChange={(e) => updateField('eyebrow', e.target.value)}
                    placeholder="Enter eyebrow text"
                  />
                </div>

                <div className="field">
                  <label>Title</label>
                  <input
                    className="editor-input"
                    value={data.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Enter intro title"
                  />
                </div>

                <div className="field">
                  <label>Copy</label>
                  <textarea
                    rows={5}
                    className="editor-textarea"
                    value={data.copy || ''}
                    onChange={(e) => updateField('copy', e.target.value)}
                    placeholder="Enter intro description"
                  />
                </div>
              </div>
            </div>

            <div className="intro-right-panel">
              <div className="intro-form-section">
                <h4 className="editor-section-title">Text Colors</h4>

                <div className="field">
                  <label>Eyebrow Color</label>
                  <div className="input-with-color">
                    <input
                      className="editor-input"
                      value={data.eyebrowColor || '#0f5c5a'}
                      onChange={(e) => updateField('eyebrowColor', e.target.value)}
                      placeholder="#0f5c5a"
                    />

                    <input
                      type="color"
                      value={data.eyebrowColor || '#0f5c5a'}
                      onChange={(e) => updateField('eyebrowColor', e.target.value)}
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
                      onChange={(e) => updateField('titleColor', e.target.value)}
                      placeholder="#000000"
                    />

                    <input
                      type="color"
                      value={data.titleColor || '#000000'}
                      onChange={(e) => updateField('titleColor', e.target.value)}
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
                      onChange={(e) => updateField('copyColor', e.target.value)}
                      placeholder="#000000"
                    />

                    <input
                      type="color"
                      value={data.copyColor || '#000000'}
                      onChange={(e) => updateField('copyColor', e.target.value)}
                      className="color-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="editor-footer intro-editor-footer-flat">
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
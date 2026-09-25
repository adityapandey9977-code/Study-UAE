// import React from 'react';
// import { usePreviewSettings } from '../../context/PreviewSettingsContext';
// import './css/web-settings.css';

// export default function ConsultationModal({ onBack }) {
//   const { data, updateField, saveSection, isSaving } = usePreviewSettings('consultation');

//   const handleFieldChange = (index, field, value) => {
//     const updated = [...(data.form?.fields || [])];
//     updated[index] = {
//       ...updated[index],
//       [field]: value
//     };
//     updateField('form.fields', updated);
//   };

//   const addField = () => {
//     const updated = [
//       ...(data.form?.fields || []),
//       { name: 'newField', label: 'New Field', placeholder: 'Enter value', required: false, type: 'text' }
//     ];
//     updateField('form.fields', updated);
//   };

//   const removeField = (index) => {
//     updateField('form.fields', (data.form?.fields || []).filter((_, i) => i !== index));
//   };

//   const handleSidebarItemChange = (index, field, value) => {
//     const updated = [...(data.sidebar?.items || [])];
//     updated[index] = {
//       ...updated[index],
//       [field]: value
//     };
//     updateField('sidebar.items', updated);
//   };

//   const addSidebarItem = () => {
//     updateField('sidebar.items', [...(data.sidebar?.items || []), { label: 'New Benefit', value: 'Benefit description' }]);
//   };

//   const removeSidebarItem = (index) => {
//     updateField('sidebar.items', (data.sidebar?.items || []).filter((_, i) => i !== index));
//   };

//   if (!data) return null;

//   return (
//     <div className="hero-editor-card">
//       <div className="editor-header">
//         <div>
//           <h3>Consultation Modal</h3>
//           <p>Manage the application popup, form fields and conversion copy</p>
//         </div>
//         <button type="button" className="btn-back" onClick={onBack}>
//           <i className="fa fa-arrow-left" />
//           Back
//         </button>
//       </div>

//       <form onSubmit={(e) => { e.preventDefault(); saveSection(); }}>
//         <div className="editor-body">
//           <div className="cms-field-group">
//             <h4 className="editor-section-title">Modal details</h4>
//             <div className="cms-field-grid two-col">
//               <div className="field">
//                 <label>Modal Title</label>
//                 <div className="input-with-color">
//                   <input className="editor-input" value={data.title || ''} onChange={(e) => updateField('title', e.target.value)} />
//                   <input type="color" value={data.titleColor || '#182b67'} onChange={(e) => updateField('titleColor', e.target.value)} className="color-input" />
//                 </div>
//               </div>

//               <div className="field">
//                 <label>Modal Copy</label>
//                 <div className="input-with-color">
//                   <textarea rows={4} className="editor-textarea" value={data.copy || ''} onChange={(e) => updateField('copy', e.target.value)} />
//                   <input type="color" value={data.copyColor || '#6b7280'} onChange={(e) => updateField('copyColor', e.target.value)} className="color-input" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="cms-field-group">
//             <h4 className="editor-section-title">Form Fields</h4>
//             {(data.form?.fields || []).map((field, index) => (
//               <div key={index} className="editor-sub-card">
//                 <div className="sub-card-header">
//                   <div>
//                     <p className="sub-card-title">Field {index + 1}</p>
//                     <p className="section-description">Edit label, name, type, placeholder and options for this form field.</p>
//                   </div>
//                   <button type="button" className="btn-delete" onClick={() => removeField(index)}>
//                     <i className="fa fa-trash" />
//                   </button>
//                 </div>
//                 <div className="cms-field-grid two-col">
//                   <div className="field">
//                     <label>Label</label>
//                     <input className="editor-input" value={field.label || ''} onChange={(e) => handleFieldChange(index, 'label', e.target.value)} />
//                   </div>
//                   <div className="field">
//                     <label>Name</label>
//                     <input className="editor-input" value={field.name || ''} onChange={(e) => handleFieldChange(index, 'name', e.target.value)} />
//                   </div>
//                   <div className="field">
//                     <label>Type</label>
//                     <select className="editor-input" value={field.type || 'text'} onChange={(e) => handleFieldChange(index, 'type', e.target.value)}>
//                       <option value="text">Text</option>
//                       <option value="email">Email</option>
//                       <option value="tel">Telephone</option>
//                       <option value="select">Select</option>
//                       <option value="textarea">Textarea</option>
//                     </select>
//                   </div>
//                   <div className="field">
//                     <label>Placeholder</label>
//                     <input className="editor-input" value={field.placeholder || ''} onChange={(e) => handleFieldChange(index, 'placeholder', e.target.value)} />
//                   </div>
//                 </div>
//                 <div className="field">
//                   <label>Options</label>
//                   <input
//                     className="editor-input"
//                     value={(field.options || []).join(', ')}
//                     onChange={(e) => handleFieldChange(index, 'options', e.target.value.split(',').map((item) => item.trim()).filter(Boolean))}
//                     placeholder="Comma separated"
//                   />
//                 </div>
//               </div>
//             ))}
//             <button type="button" className="btn-add-link" onClick={addField}>
//               <i className="fa fa-plus" />
//               Add Form Field
//             </button>
//           </div>

//           <div className="cms-field-group">
//             <h4 className="editor-section-title">Consent & CTA</h4>
//             <div className="field">
//               <label>Consent Prefix</label>
//               <textarea rows={2} className="editor-textarea" value={data.form?.consentPrefix || ''} onChange={(e) => updateField('form.consentPrefix', e.target.value)} />
//             </div>
//             <div className="cms-field-grid three-col">
//               <div className="field">
//                 <label>Terms Label</label>
//                 <input className="editor-input" value={data.form?.termsLink || ''} onChange={(e) => updateField('form.termsLink', e.target.value)} />
//               </div>
//               <div className="field">
//                 <label>Middle Word</label>
//                 <input className="editor-input" value={data.form?.andWord || ''} onChange={(e) => updateField('form.andWord', e.target.value)} />
//               </div>
//               <div className="field">
//                 <label>Privacy Label</label>
//                 <input className="editor-input" value={data.form?.privacyLink || ''} onChange={(e) => updateField('form.privacyLink', e.target.value)} />
//               </div>
//             </div>
//             <div className="field">
//               <label>Submit Button</label>
//               <input className="editor-input" value={data.form?.submitButton || ''} onChange={(e) => updateField('form.submitButton', e.target.value)} />
//             </div>
//           </div>

//           <div className="cms-field-group">
//             <h4 className="editor-section-title">Sidebar Benefits</h4>
//             {(data.sidebar?.items || []).map((item, index) => (
//               <div key={index} className="editor-sub-card">
//                 <div className="sub-card-header">
//                   <div>
//                     <p className="sub-card-title">Benefit {index + 1}</p>
//                     <p className="section-description">This text appears beside the consultation form to reinforce benefits.</p>
//                   </div>
//                   <button type="button" className="btn-delete" onClick={() => removeSidebarItem(index)}>
//                     <i className="fa fa-trash" />
//                   </button>
//                 </div>
//                 <div className="cms-field-grid two-col">
//                   <div className="field">
//                     <label>Benefit Label</label>
//                     <input className="editor-input" value={item.label || ''} onChange={(e) => handleSidebarItemChange(index, 'label', e.target.value)} />
//                   </div>
//                   <div className="field">
//                     <label>Benefit Value</label>
//                     <input className="editor-input" value={item.value || ''} onChange={(e) => handleSidebarItemChange(index, 'value', e.target.value)} />
//                   </div>
//                 </div>
//               </div>
//             ))}
//             <button type="button" className="btn-add-link" onClick={addSidebarItem}>
//               <i className="fa fa-plus" />
//               Add Sidebar Benefit
//             </button>
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








import React, { useEffect, useRef } from 'react';
import { usePreviewSettings } from '../../context/PreviewSettingsContext';
import './css/web-settings.css';

const createFieldName = (label, index = 0) => {
  const normalized = String(label || '')
    .trim()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, character) =>
      character ? character.toUpperCase() : ''
    )
    .replace(/^[^a-zA-Z]+/, '');

  return normalized || `field${index + 1}`;
};

export default function ConsultationModal({ onBack }) {
  const { data, updateField, saveSection, isSaving } =
    usePreviewSettings('consultation');

  const fieldsOrderUpdatedRef = useRef(false);

  useEffect(() => {
    const fields = Array.isArray(data?.form?.fields)
      ? data.form.fields
      : [];

    if (
      fieldsOrderUpdatedRef.current ||
      fields.length === 0
    ) {
      return;
    }

    const mobileIndex = fields.findIndex((field) => {
      const label = String(field?.label || '').toLowerCase();
      const name = String(field?.name || '').toLowerCase();

      return (
        label.includes('mobile') ||
        label.includes('whatsapp') ||
        name.includes('mobile') ||
        name.includes('phone') ||
        name.includes('whatsapp')
      );
    });

    const countryIndex = fields.findIndex((field) => {
      const label = String(field?.label || '').toLowerCase();
      const name = String(field?.name || '').toLowerCase();

      return (
        label.includes('country of residence') ||
        label === 'country' ||
        name.includes('country')
      );
    });

    if (mobileIndex === -1 || countryIndex === -1) {
      return;
    }

    fieldsOrderUpdatedRef.current = true;

    /*
      Required order:
      Country of Residence first
      Mobile / WhatsApp Number second
    */
    if (countryIndex > mobileIndex) {
      const updatedFields = [...fields];

      [
        updatedFields[mobileIndex],
        updatedFields[countryIndex]
      ] = [
        updatedFields[countryIndex],
        updatedFields[mobileIndex]
      ];

      updateField('form.fields', updatedFields);
    }
  }, [data?.form?.fields, updateField]);

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSection();
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...(data.form?.fields || [])];

    updated[index] = {
      ...updated[index],
      [field]: value,
      ...(field === 'label'
        ? { name: createFieldName(value, index) }
        : {})
    };

    updateField('form.fields', updated);
  };

  const addField = () => {
    const currentFields = data.form?.fields || [];
    const nextIndex = currentFields.length;

    updateField('form.fields', [
      ...currentFields,
      {
        name: createFieldName('New Field', nextIndex),
        label: 'New Field',
        placeholder: 'Enter value',
        required: false,
        type: 'text'
      }
    ]);
  };

  const removeField = (index) => {
    updateField(
      'form.fields',
      (data.form?.fields || []).filter(
        (_, currentIndex) => currentIndex !== index
      )
    );
  };

  const handleSidebarItemChange = (
    index,
    field,
    value
  ) => {
    const updated = [...(data.sidebar?.items || [])];

    updated[index] = {
      ...updated[index],
      [field]: value
    };

    updateField('sidebar.items', updated);
  };

  const addSidebarItem = () => {
    updateField('sidebar.items', [
      ...(data.sidebar?.items || []),
      {
        label: 'New Benefit',
        value: 'Benefit description'
      }
    ]);
  };

  const removeSidebarItem = (index) => {
    updateField(
      'sidebar.items',
      (data.sidebar?.items || []).filter(
        (_, currentIndex) => currentIndex !== index
      )
    );
  };

  if (!data) return null;

  return (
    <div className="consultation-editor-page">
      <form onSubmit={handleSave}>
        <div className="editor-body">
          <div className="consultation-two-panel-layout">
            <div className="consultation-left-panel">
              <div className="consultation-form-section">
                <h4 className="editor-section-title">
                  Modal Content
                </h4>

                <div className="field">
                  <label>Modal Title</label>

                  <input
                    className="editor-input"
                    value={data.title || ''}
                    onChange={(e) =>
                      updateField(
                        'title',
                        e.target.value
                      )
                    }
                    placeholder="Enter modal title"
                  />
                </div>

                <div className="field">
                  <label>Modal Copy</label>

                  <textarea
                    rows={5}
                    className="editor-textarea"
                    value={data.copy || ''}
                    onChange={(e) =>
                      updateField(
                        'copy',
                        e.target.value
                      )
                    }
                    placeholder="Enter modal copy"
                  />
                </div>
              </div>

              <div className="consultation-form-section consultation-fields-section">
                <div className="consultation-section-head">
                  <div>
                    <h4 className="editor-section-title">
                      Form Fields
                    </h4>

                    <p>
                      {(data.form?.fields || []).length}{' '}
                      fields configured
                    </p>
                  </div>

                  <button
                    type="button"
                    className="consultation-add-btn"
                    onClick={addField}
                  >
                    <i className="fa fa-plus" />
                    Add Field
                  </button>
                </div>

                <div className="consultation-item-list">
                  {(data.form?.fields || []).map(
                    (field, index) => (
                      <div
                        key={index}
                        className="consultation-item-card consultation-field-item-card"
                      >
                        <div className="consultation-item-card-head">
                          <div>
                            <h5>
                              {field.label ||
                                `Field ${index + 1}`}
                            </h5>

                            <p>
                              {field.type || 'text'}
                            </p>
                          </div>

                          <button
                            type="button"
                            className="consultation-delete-btn"
                            onClick={() =>
                              removeField(index)
                            }
                            aria-label="Delete form field"
                          >
                            <i className="fa fa-trash" />
                          </button>
                        </div>

                        <div className="consultation-field-editor-grid">
                          <div className="field consultation-field-label">
                            <label>Label</label>

                            <input
                              className="editor-input"
                              value={field.label || ''}
                              onChange={(e) =>
                                handleFieldChange(
                                  index,
                                  'label',
                                  e.target.value
                                )
                              }
                              placeholder="Field label"
                            />
                          </div>

                          <div className="field consultation-field-type">
                            <label>Type</label>

                            <select
                              className="editor-input"
                              value={field.type || 'text'}
                              onChange={(e) =>
                                handleFieldChange(
                                  index,
                                  'type',
                                  e.target.value
                                )
                              }
                            >
                              <option value="text">
                                Text
                              </option>

                              <option value="email">
                                Email
                              </option>

                              <option value="tel">
                                Telephone
                              </option>

                              <option value="select">
                                Select
                              </option>

                              <option value="textarea">
                                Textarea
                              </option>
                            </select>
                          </div>

                          <div className="field consultation-field-placeholder">
                            <label>Placeholder</label>

                            <input
                              className="editor-input"
                              value={
                                field.placeholder || ''
                              }
                              onChange={(e) =>
                                handleFieldChange(
                                  index,
                                  'placeholder',
                                  e.target.value
                                )
                              }
                              placeholder="Placeholder"
                            />
                          </div>
                        </div>

                        <div className="field consultation-field-options">
                          <label>
                            Options - Comma Separated
                          </label>

                          <input
                            className="editor-input"
                            value={(
                              field.options || []
                            ).join(', ')}
                            onChange={(e) =>
                              handleFieldChange(
                                index,
                                'options',
                                e.target.value
                                  .split(',')
                                  .map((item) =>
                                    item.trim()
                                  )
                                  .filter(Boolean)
                              )
                            }
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="consultation-form-section">
                <h4 className="editor-section-title">
                  Consent & CTA
                </h4>

                <div className="field">
                  <label>Consent Prefix</label>

                  <textarea
                    rows={3}
                    className="editor-textarea"
                    value={
                      data.form?.consentPrefix || ''
                    }
                    onChange={(e) =>
                      updateField(
                        'form.consentPrefix',
                        e.target.value
                      )
                    }
                    placeholder="Enter consent text"
                  />
                </div>

                <div className="consultation-inner-grid three-col">
                  <div className="field">
                    <label>Terms Label</label>

                    <input
                      className="editor-input"
                      value={
                        data.form?.termsLink || ''
                      }
                      onChange={(e) =>
                        updateField(
                          'form.termsLink',
                          e.target.value
                        )
                      }
                      placeholder="Terms"
                    />
                  </div>

                  <div className="field">
                    <label>Middle Word</label>

                    <input
                      className="editor-input"
                      value={data.form?.andWord || ''}
                      onChange={(e) =>
                        updateField(
                          'form.andWord',
                          e.target.value
                        )
                      }
                      placeholder="and"
                    />
                  </div>

                  <div className="field">
                    <label>Privacy Label</label>

                    <input
                      className="editor-input"
                      value={
                        data.form?.privacyLink || ''
                      }
                      onChange={(e) =>
                        updateField(
                          'form.privacyLink',
                          e.target.value
                        )
                      }
                      placeholder="Privacy Policy"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Submit Button</label>

                  <input
                    className="editor-input"
                    value={
                      data.form?.submitButton || ''
                    }
                    onChange={(e) =>
                      updateField(
                        'form.submitButton',
                        e.target.value
                      )
                    }
                    placeholder="Submit"
                  />
                </div>
              </div>
            </div>

            <div className="consultation-right-panel">
              <div className="consultation-form-section">
                <h4 className="editor-section-title">
                  Text Colors
                </h4>

                <div className="field">
                  <label>Title Color</label>

                  <div className="input-with-color">
                    <input
                      className="editor-input"
                      value={
                        data.titleColor || '#182b67'
                      }
                      onChange={(e) =>
                        updateField(
                          'titleColor',
                          e.target.value
                        )
                      }
                      placeholder="#182b67"
                    />

                    <input
                      type="color"
                      value={
                        data.titleColor || '#182b67'
                      }
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
                      value={
                        data.copyColor || '#6b7280'
                      }
                      onChange={(e) =>
                        updateField(
                          'copyColor',
                          e.target.value
                        )
                      }
                      placeholder="#6b7280"
                    />

                    <input
                      type="color"
                      value={
                        data.copyColor || '#6b7280'
                      }
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

              <div className="consultation-form-section">
                <h4 className="editor-section-title">
                  Modal Preview
                </h4>

                <div className="consultation-preview-box">
                  <div
                    className="consultation-preview-title"
                    style={{
                      color:
                        data.titleColor || '#182b67'
                    }}
                  >
                    {data.title ||
                      'Modal Title Preview'}
                  </div>

                  <div
                    className="consultation-preview-copy"
                    style={{
                      color:
                        data.copyColor || '#6b7280'
                    }}
                  >
                    {data.copy ||
                      'Modal copy preview will appear here.'}
                  </div>

                  <div className="consultation-preview-button">
                    {data.form?.submitButton ||
                      'Submit Button'}
                  </div>
                </div>
              </div>

              <div className="consultation-form-section consultation-benefits-section">
                <div className="consultation-section-head">
                  <div>
                    <h4 className="editor-section-title">
                      Sidebar Benefits
                    </h4>

                    <p>
                      {(data.sidebar?.items || [])
                        .length}{' '}
                      benefits configured
                    </p>
                  </div>

                  <button
                    type="button"
                    className="consultation-add-btn"
                    onClick={addSidebarItem}
                  >
                    <i className="fa fa-plus" />
                    Add Benefit
                  </button>
                </div>

                <div className="consultation-item-list consultation-benefit-list">
                  {(data.sidebar?.items || []).map(
                    (item, index) => (
                      <div
                        key={index}
                        className="consultation-item-card"
                      >
                        <div className="consultation-item-card-head">
                          <div>
                            <h5>
                              {item.label ||
                                `Benefit ${index + 1}`}
                            </h5>

                            <p>
                              {item.value ||
                                'Benefit description'}
                            </p>
                          </div>

                          <button
                            type="button"
                            className="consultation-delete-btn"
                            onClick={() =>
                              removeSidebarItem(index)
                            }
                            aria-label="Delete sidebar benefit"
                          >
                            <i className="fa fa-trash" />
                          </button>
                        </div>

                        <div className="consultation-inner-grid two-col">
                          <div className="field">
                            <label>
                              Benefit Label
                            </label>

                            <input
                              className="editor-input"
                              value={item.label || ''}
                              onChange={(e) =>
                                handleSidebarItemChange(
                                  index,
                                  'label',
                                  e.target.value
                                )
                              }
                              placeholder="Benefit label"
                            />
                          </div>

                          <div className="field">
                            <label>
                              Benefit Value
                            </label>

                            <input
                              className="editor-input"
                              value={item.value || ''}
                              onChange={(e) =>
                                handleSidebarItemChange(
                                  index,
                                  'value',
                                  e.target.value
                                )
                              }
                              placeholder="Benefit value"
                            />
                          </div>
                        </div>
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
            onClick={onBack}
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









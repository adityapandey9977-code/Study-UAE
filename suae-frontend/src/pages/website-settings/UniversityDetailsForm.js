import { useEffect, useMemo, useState } from 'react';
import { usePreviewSettings } from '../../context/PreviewSettingsContext';
import FileService from '../../services/FileService';
import axiosnode from '../../utils/axiosnode';
import './css/web-settings.css';

export default function UniversityDetailsForm({ onBack }) {
  const { data, updateField, saveSection, isSaving } =
    usePreviewSettings('universities');

  const [editingIndex, setEditingIndex] = useState(null);
  const [uploadingField, setUploadingField] = useState(null);
  const [dbInstitutes, setDbInstitutes] = useState([]);

  useEffect(() => {
    let isMounted = true;

    axiosnode
      .get('/public/institutes?cms=true')
      .then((res) => {
        if (!isMounted) return;

        if (res?.data?.success && Array.isArray(res?.data?.data)) {
          setDbInstitutes(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching database institutes for CMS:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayCards = useMemo(() => {
    const currentCards = Array.isArray(data?.cards) ? data.cards : [];

    if (!Array.isArray(dbInstitutes) || dbInstitutes.length === 0) {
      return currentCards;
    }

    return dbInstitutes.map((inst) => {
      const instName = String(inst?.name || '').trim().toLowerCase();
      const instId = String(inst?.id || '');

      const existing = currentCards.find((card) => {
        const cardName = String(card?.name || '').trim().toLowerCase();
        const cardId = String(card?.id || '');

        return (
          (instName && cardName && cardName === instName) ||
          (instId && cardId && cardId === instId)
        );
      });

      return {
        id: inst?.id || existing?.id || '',
        name: inst?.name || existing?.name || '',
        city: existing?.city || inst?.city || 'Dubai',
        type: existing?.type || inst?.type || 'Private',
        image: existing?.image || inst?.image || '',
        note: existing?.note || inst?.note || '',
        courses: existing?.courses || inst?.courses || '12+ Courses',
        intake: existing?.intake || inst?.intake || 'Sep / Jan',
        scholarship:
          existing?.scholarship ||
          inst?.scholarship ||
          'Merit-based support available',
        programs: existing?.programs || inst?.programs || '',
        highlight1:
          existing?.highlight1 ||
          inst?.highlight1 ||
          'Globally accredited and recognized degrees',
        highlight2:
          existing?.highlight2 ||
          inst?.highlight2 ||
          'State-of-the-art campus and research facilities',
        highlight3:
          existing?.highlight3 ||
          inst?.highlight3 ||
          'Strong industry partnerships and internship placement',
        highlight4:
          existing?.highlight4 ||
          inst?.highlight4 ||
          'Vibrant multicultural student community',
        website: existing?.website || inst?.website || '',
        experience: existing?.experience || inst?.experience || '',
        experienceImage1:
          existing?.experienceImage1 || inst?.experienceImage1 || '',
        experienceImage2:
          existing?.experienceImage2 || inst?.experienceImage2 || '',
        experienceImage3:
          existing?.experienceImage3 || inst?.experienceImage3 || '',
        isFeatured: existing ? !!existing.isFeatured : !!inst?.isFeatured,
        isListed: inst ? inst.mask_status !== 0 : (existing ? (existing.isListed !== undefined ? !!existing.isListed : true) : true),
        isDbInstitute: true
      };
    });
  }, [data?.cards, dbInstitutes]);

  const selectedUniversity =
    editingIndex !== null && displayCards?.[editingIndex]
      ? displayCards[editingIndex]
      : null;

  const titleColor = /^#[0-9A-Fa-f]{6}$/.test(data?.titleColor || '')
    ? data.titleColor
    : '#000000';

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSection();
  };

  const handleCardChange = (index, field, value) => {
    const updatedCards = [...displayCards];

    if (!updatedCards[index]) return;

    updatedCards[index] = {
      ...updatedCards[index],
      [field]: value
    };

    updateField('cards', updatedCards);
  };

  const handleAddCard = () => {
    const newCard = {
      name: '',
      city: '',
      image: '',
      note: '',
      courses: '',
      type: 'Private',
      intake: 'Fall / Spring',
      scholarship: 'Fee support on selected programs',
      programs: '',
      website: '',
      highlight1: '',
      highlight2: '',
      highlight3: '',
      highlight4: '',
      experience: '',
      experienceImage1: '',
      experienceImage2: '',
      experienceImage3: '',
      isFeatured: false
    };

    const updatedCards = [...displayCards, newCard];

    updateField('cards', updatedCards);
    setEditingIndex(updatedCards.length - 1);
  };

  const handleRemoveCard = (index) => {
    if (!window.confirm('Are you sure you want to delete this university?')) return;

    const updatedCards = displayCards.filter((_, i) => i !== index);

    updateField('cards', updatedCards);

    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleToggleFeatured = async (card, index) => {
    const newStatus = !card.isFeatured;

    if (newStatus) {
      const featuredCount = displayCards.filter((item) => item.isFeatured).length;

      if (featuredCount >= 6) {
        alert('You can only feature up to 6 universities.');
        return;
      }
    }

    try {
      const res = await axiosnode.post(
        '/master/website-settings/feature-institute',
        {
          instituteId: card.id,
          isFeatured: newStatus
        }
      );

      if (res?.data?.success) {
        handleCardChange(index, 'isFeatured', newStatus);

        setDbInstitutes((prev) =>
          prev.map((inst) => {
            if (String(inst.id) === String(card.id)) {
              return {
                ...inst,
                isFeatured: newStatus
              };
            }

            return inst;
          })
        );
      } else {
        alert(res?.data?.message || 'Failed to update featured status.');
      }
    } catch (err) {
      console.error('Error featuring institute:', err);
      alert(
        'Error updating featured status: ' +
        (err.response?.data?.message || err.message)
      );
    }
  };

  const handleToggleListed = async (card, index) => {
    const newStatus = !card.isListed;

    try {
      const res = await axiosnode.post(
        '/master/website-settings/toggle-list-institute',
        {
          instituteId: card.id,
          isListed: newStatus
        }
      );

      if (res?.data?.success) {
        handleCardChange(index, 'isListed', newStatus);

        setDbInstitutes((prev) =>
          prev.map((inst) => {
            if (String(inst.id) === String(card.id)) {
              return {
                ...inst,
                isListed: newStatus,
                mask_status: newStatus ? 1 : 0
              };
            }

            return inst;
          })
        );
      } else {
        alert(res?.data?.message || 'Failed to update listing status.');
      }
    } catch (err) {
      console.error('Error toggling list status:', err);
      alert(
        'Error updating listing status: ' +
        (err.response?.data?.message || err.message)
      );
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];

    if (!file || editingIndex === null) return;

    setUploadingField(field);

    try {
      const res = await FileService.upload(file);

      if (res?.data?.file_url) {
        handleCardChange(editingIndex, field, res.data.file_url);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  const renderImageUpload = ({
    label,
    field,
    uploadId,
    recommendedSize = '900x600 px'
  }) => {
    const imageValue = selectedUniversity?.[field] || '';

    return (
      <div className="field">
        <label>{label}</label>

        <div className="university-details-upload-box">
          {imageValue && (
            <div
              className="university-details-image-preview"
              style={{
                backgroundImage: `url(${imageValue})`
              }}
            />
          )}

          <div className="university-details-upload-content">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, field)}
              style={{ display: 'none' }}
              id={uploadId}
              disabled={uploadingField === field}
            />

            <label htmlFor={uploadId} className="university-details-upload-label">
              {uploadingField === field ? 'Uploading...' : 'Choose Image'}
            </label>

            <p>Recommended size: {recommendedSize} - JPEG, PNG.</p>
          </div>
        </div>

        <input
          className="editor-input"
          value={imageValue}
          onChange={(e) => handleCardChange(editingIndex, field, e.target.value)}
          placeholder="Or paste image URL"
          disabled={uploadingField === field}
        />
      </div>
    );
  };

  if (!data) return null;

  return (
    <div className="university-details-editor-page">

      <form onSubmit={handleSave}>
        <div className="editor-body">
          {editingIndex === null ? (
            <div className="university-details-list-layout">
              <div className="university-details-settings-grid">
                <div className="university-details-form-section university-details-content-card">
                  <h4 className="editor-section-title">Section Content</h4>

                  <div className="field">
                    <label>Eyebrow</label>
                    <input
                      className="editor-input"
                      value={data.eyebrow || ''}
                      onChange={(e) =>
                        updateField('eyebrow', e.target.value)
                      }
                      placeholder="e.g. Explore Top Universities"
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
                </div>

                <div className="university-details-form-section university-details-colors-card">
                  <h4 className="editor-section-title">Text Colors</h4>

                  <div className="field">
                    <label>Title Color</label>
                    <div className="university-details-color-row">
                      <input
                        className="editor-input"
                        value={data.titleColor || '#000000'}
                        onChange={(e) =>
                          updateField('titleColor', e.target.value)
                        }
                        placeholder="#000000"
                        maxLength={7}
                      />

                      <input
                        type="color"
                        value={titleColor}
                        onChange={(e) =>
                          updateField('titleColor', e.target.value)
                        }
                        aria-label="Select title color"
                        className="university-details-color-picker" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="university-details-form-section university-details-list-section">
                <div className="university-details-section-head">
                  <div>
                    <h4 className="editor-section-title">
                      University List
                    </h4>

                    <p>
                      {displayCards.length} universities listed
                    </p>
                  </div>

                  <div className="university-details-header-actions">
                    <button
                      type="button"
                      className="btn-back"
                      onClick={() => onBack?.()}
                    >
                      <i
                        className="fa fa-arrow-left"
                        style={{ marginRight: '8px' }}
                      />
                      Back
                    </button>

                    <button
                      type="button"
                      className="university-details-add-btn"
                      onClick={handleAddCard}
                    >
                      <i className="fa fa-plus" />
                      Add University
                    </button>
                  </div>
                </div>

                <div className="university-details-card-list">
                  {displayCards.map((card, index) => (
                    <div
                      key={`${card.id || card.name || 'university'
                        }-${index}`}
                      className={`university-details-list-card ${card.isFeatured ? 'is-featured' : ''
                        }`}
                    >
                      <div className="university-details-card-info">
                        <div
                          className="university-details-card-image"
                          style={{
                            backgroundImage: card.image
                              ? `url(${card.image})`
                              : 'none'
                          }}
                        >
                          {!card.image && (
                            <i className="fa fa-university" />
                          )}
                        </div>

                        <div className="university-details-card-copy">
                          <h5>
                            {card.name || 'Unnamed University'}

                            {card.isFeatured && (
                              <i className="fa fa-star" />
                            )}
                          </h5>

                          <p>
                            {card.city || 'No City Specified'} ·{' '}
                            {card.type || 'Private'}
                          </p>
                        </div>
                      </div>

                      <div className="university-details-card-actions">
                        <button
                          type="button"
                          className={`university-details-feature-btn ${card.isFeatured ? 'active' : ''
                            }`}
                          onClick={() =>
                            handleToggleFeatured(card, index)
                          }
                        >
                          <i
                            className={
                              card.isFeatured
                                ? 'fa fa-star'
                                : 'fa fa-star-o'
                            }
                          />

                          {card.isFeatured
                            ? 'Featured'
                            : 'Feature'}
                        </button>

                        <button
                          type="button"
                          className={`university-details-list-btn ${card.isListed ? 'active' : ''}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: card.isListed ? '#ecfdf5' : '#f3f4f6',
                            color: card.isListed ? '#059669' : '#475569',
                            borderColor: card.isListed ? '#a7f3d0' : '#d1d5db',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            marginRight: '6px'
                          }}
                          onClick={() =>
                            handleToggleListed(card, index)
                          }
                        >
                          <i
                            className={
                              card.isListed
                                ? 'fa fa-eye'
                                : 'fa fa-eye-slash'
                            }
                            style={{ marginRight: '2px' }}
                          />
                          {card.isListed ? 'Listed' : 'Unlisted'}
                        </button>

                        <button
                          type="button"
                          className="university-details-edit-btn"
                          onClick={() => setEditingIndex(index)}
                        >
                          <i className="fa fa-edit" />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="university-details-delete-btn"
                          onClick={() => handleRemoveCard(index)}
                        >
                          <i className="fa fa-trash" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="university-details-edit-layout">
              <div className="university-details-form-section">
                <div className="university-details-section-head">
                  <div>
                    <h4 className="editor-section-title">
                      {selectedUniversity?.name
                        ? `Edit: ${selectedUniversity.name}`
                        : 'New University Details'}
                    </h4>

                    <p>
                      Update university detail page content.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="universities-done-btn"
                    onClick={() => setEditingIndex(null)}
                  >
                    Done Editing
                  </button>
                </div>

                <div className="university-details-inner-grid two-col">
                  <div className="field">
                    <label>University Name</label>

                    <input
                      className="editor-input"
                      value={selectedUniversity?.name || ''}
                      onChange={(e) =>
                        handleCardChange(
                          editingIndex,
                          'name',
                          e.target.value
                        )
                      }
                      placeholder="e.g. University of Dubai"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>City</label>

                    <input
                      className="editor-input"
                      value={selectedUniversity?.city || ''}
                      onChange={(e) =>
                        handleCardChange(
                          editingIndex,
                          'city',
                          e.target.value
                        )
                      }
                      placeholder="e.g. Dubai"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label>About Overview</label>

                  <textarea
                    rows={5}
                    className="editor-textarea"
                    value={selectedUniversity?.note || ''}
                    onChange={(e) =>
                      handleCardChange(
                        editingIndex,
                        'note',
                        e.target.value
                      )
                    }
                    placeholder="Provide a detailed overview of the university campus and facilities..."
                  />
                </div>
              </div>

              <div className="university-details-form-section">
                <h4 className="editor-section-title">
                  Campus Image / Logo
                </h4>

                {renderImageUpload({
                  label: 'Campus Image / Logo',
                  field: 'image',
                  uploadId: 'uni-image-upload',
                  recommendedSize: '900x600 px'
                })}
              </div>

              <div className="university-details-form-section">
                <h4 className="editor-section-title">
                  Key Highlights
                </h4>

                <div className="university-details-inner-grid two-col">
                  <div className="field">
                    <label>Highlight 1</label>

                    <input
                      className="editor-input"
                      value={
                        selectedUniversity?.highlight1 || ''
                      }
                      onChange={(e) =>
                        handleCardChange(
                          editingIndex,
                          'highlight1',
                          e.target.value
                        )
                      }
                      placeholder="e.g. Globally accredited degrees"
                    />
                  </div>

                  <div className="field">
                    <label>Highlight 2</label>

                    <input
                      className="editor-input"
                      value={
                        selectedUniversity?.highlight2 || ''
                      }
                      onChange={(e) =>
                        handleCardChange(
                          editingIndex,
                          'highlight2',
                          e.target.value
                        )
                      }
                      placeholder="e.g. State-of-the-art campus"
                    />
                  </div>

                  <div className="field">
                    <label>Highlight 3</label>

                    <input
                      className="editor-input"
                      value={
                        selectedUniversity?.highlight3 || ''
                      }
                      onChange={(e) =>
                        handleCardChange(
                          editingIndex,
                          'highlight3',
                          e.target.value
                        )
                      }
                      placeholder="e.g. Strong industry partnerships"
                    />
                  </div>

                  <div className="field">
                    <label>Highlight 4</label>

                    <input
                      className="editor-input"
                      value={
                        selectedUniversity?.highlight4 || ''
                      }
                      onChange={(e) =>
                        handleCardChange(
                          editingIndex,
                          'highlight4',
                          e.target.value
                        )
                      }
                      placeholder="e.g. Multicultural student community"
                    />
                  </div>
                </div>
              </div>

              <div className="university-details-form-section">
                <h4 className="editor-section-title">
                  Campus Experience Details
                </h4>

                <div className="field">
                  <label>Experience Description</label>

                  <textarea
                    rows={5}
                    className="editor-textarea"
                    value={selectedUniversity?.experience || ''}
                    onChange={(e) =>
                      handleCardChange(
                        editingIndex,
                        'experience',
                        e.target.value
                      )
                    }
                    placeholder="Provide details about library, laboratories, sports facilities, student community..."
                  />
                </div>
              </div>

              <div className="university-details-form-section">
                <h4 className="editor-section-title">
                  Campus Experience Gallery
                </h4>

                <div className="university-details-gallery-grid">
                  {renderImageUpload({
                    label: 'Gallery Image 1',
                    field: 'experienceImage1',
                    uploadId: 'exp-image-upload-1',
                    recommendedSize: '800x600 px'
                  })}

                  {renderImageUpload({
                    label: 'Gallery Image 2',
                    field: 'experienceImage2',
                    uploadId: 'exp-image-upload-2',
                    recommendedSize: '800x600 px'
                  })}

                  {renderImageUpload({
                    label: 'Gallery Image 3',
                    field: 'experienceImage3',
                    uploadId: 'exp-image-upload-3',
                    recommendedSize: '800x600 px'
                  })}
                </div>
              </div>

              <div className="university-details-form-section">
                <h4 className="editor-section-title">
                  Academic & Admission Details
                </h4>

                <div className="university-details-inner-grid two-col">
                  <div className="field">
                    <label>Courses Offered</label>

                    <input
                      className="editor-input"
                      value={selectedUniversity?.courses || ''}
                      onChange={(e) =>
                        handleCardChange(
                          editingIndex,
                          'courses',
                          e.target.value
                        )
                      }
                      placeholder="e.g. 19+"
                    />
                  </div>

                  <div className="field">
                    <label>Institute Type</label>

                    <select
                      className="editor-input"
                      value={
                        selectedUniversity?.type || 'Private'
                      }
                      onChange={(e) =>
                        handleCardChange(
                          editingIndex,
                          'type',
                          e.target.value
                        )
                      }
                    >
                      <option value="Private">
                        Private
                      </option>
                      <option value="Public">
                        Public
                      </option>
                      <option value="Government">
                        Government
                      </option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Intake Period</label>

                    <input
                      className="editor-input"
                      value={selectedUniversity?.intake || ''}
                      onChange={(e) =>
                        handleCardChange(
                          editingIndex,
                          'intake',
                          e.target.value
                        )
                      }
                      placeholder="e.g. Fall / Spring"
                    />
                  </div>

                  <div className="field">
                    <label>Scholarship Details</label>

                    <input
                      className="editor-input"
                      value={
                        selectedUniversity?.scholarship || ''
                      }
                      onChange={(e) =>
                        handleCardChange(
                          editingIndex,
                          'scholarship',
                          e.target.value
                        )
                      }
                      placeholder="e.g. Up to 50% waiver"
                    />
                  </div>
                </div>

                <div className="field">
                  <label>
                    Programs Offered - Comma Separated
                  </label>

                  <input
                    className="editor-input"
                    value={selectedUniversity?.programs || ''}
                    onChange={(e) =>
                      handleCardChange(
                        editingIndex,
                        'programs',
                        e.target.value
                      )
                    }
                    placeholder="e.g. business management, engineering and technology, health sciences"
                  />

                  <span className="university-details-help-text">
                    Must match the exact course names to link
                    them dynamically.
                  </span>
                </div>

                <div className="field">
                  <label>Website</label>

                  <input
                    className="editor-input"
                    value={selectedUniversity?.website || ''}
                    onChange={(e) =>
                      handleCardChange(
                        editingIndex,
                        'website',
                        e.target.value
                      )
                    }
                    placeholder="https://example.com"
                  />
                </div>

                <div className="field university-details-feature-field">
                  <label className="universities-feature-toggle">
                    <input
                      type="checkbox"
                      checked={
                        !!selectedUniversity?.isFeatured
                      }
                      onChange={() =>
                        handleToggleFeatured(
                          selectedUniversity,
                          editingIndex
                        )
                      }
                    />

                    <span>
                      Featured University

                      <small>
                        Only featured universities are listed
                        on the website homepage.
                      </small>
                    </span>
                  </label>
                </div>
              </div>

              <div className="university-details-form-section">
                <h4 className="editor-section-title">
                  Quick Preview
                </h4>

                <div className="university-details-preview-box">
                  <div
                    className="university-details-preview-image"
                    style={{
                      backgroundImage: selectedUniversity?.image
                        ? `url(${selectedUniversity.image})`
                        : 'none'
                    }}
                  >
                    {!selectedUniversity?.image && (
                      <i className="fa fa-university" />
                    )}
                  </div>

                  <div>
                    <h5>
                      {selectedUniversity?.name ||
                        'University Name Preview'}
                    </h5>

                    <p>
                      {selectedUniversity?.city || 'City'} ·{' '}
                      {selectedUniversity?.type || 'Private'}
                    </p>

                    <span>
                      {selectedUniversity?.courses ||
                        'Courses offered'}
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
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
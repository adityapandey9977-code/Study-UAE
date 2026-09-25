import React, { useEffect, useMemo, useState } from 'react';
import { usePreviewSettings } from '../../context/PreviewSettingsContext';
import FileService from '../../services/FileService';
import axiosnode from '../../utils/axiosnode';
import './css/web-settings.css';

export default function UniversitiesSection({ onBack }) {
  const { data, updateField, saveSection, isSaving } = usePreviewSettings('universities');

  const [editingIndex, setEditingIndex] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dbInstitutes, setDbInstitutes] = useState([]);

  useEffect(() => {
    let isMounted = true;

    axiosnode.get('/public/institutes')
      .then((res) => {
        if (!isMounted) return;

        const list =
          res?.data?.success && Array.isArray(res?.data?.data)
            ? res.data.data
            : [];

        setDbInstitutes(list);
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

        return (instName && cardName && cardName === instName) || (instId && cardId && cardId === instId);
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
        isFeatured: inst ? !!inst.isFeatured : (existing ? !!existing.isFeatured : false),
        isDbInstitute: true
      };
    });
  }, [data?.cards, dbInstitutes]);

  const selectedCard =
    editingIndex !== null && displayCards?.[editingIndex]
      ? displayCards[editingIndex]
      : null;

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

  const handleAddCard = () => {
    const newCard = {
      name: '',
      city: '',
      image: '',
      note: '',
      courses: '',
      type: '',
      intake: '',
      scholarship: '',
      programs: '',
      website: '',
      isFeatured: false
    };

    const updatedCards = [...displayCards, newCard];

    updateField('cards', updatedCards);
    setEditingIndex(updatedCards.length - 1);
  };

  const handleRemoveCard = (index) => {
    const updatedCards = displayCards.filter((_, i) => i !== index);

    updateField('cards', updatedCards);

    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file || editingIndex === null) return;

    setIsUploading(true);

    try {
      const res = await FileService.upload(file);

      if (res?.data?.file_url) {
        handleCardChange(editingIndex, 'image', res.data.file_url);
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
    <div className="universities-editor-page">
      <form onSubmit={handleSave}>
        <div className="editor-body">
          {editingIndex === null ? (
            <div className="universities-list-layout">
              <div className="universities-list-left">
                <div className="universities-form-section">
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

                <div className="universities-form-section universities-cards-section">
                  <div className="universities-list-heading">
                    <span className="editor-section-title">
                      University Cards
                    </span>

                    <span className="universities-count">
                      {displayCards.length} universities
                    </span>
                  </div>

                  <div className="universities-card-list">
                    {displayCards.map((card, index) => (
                      <div
                        key={`${
                          card.id || card.name || 'university'
                        }-${index}`}
                        className="editor-sub-card universities-card-row"
                      >
                        <div className="universities-card-info">
                          <div
                            className="universities-card-thumb"
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

                          <div className="universities-card-copy">
                            <h5>
                              {card.name || 'Unnamed University'}
                            </h5>

                            <p>
                              {card.city || 'No City Specified'}
                            </p>
                          </div>
                        </div>

                        <div className="universities-card-actions">
                          <button
                            type="button"
                            className={`universities-feature-btn ${
                              card.isFeatured ? 'active' : ''
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
                            className="universities-edit-btn"
                            onClick={() =>
                              setEditingIndex(index)
                            }
                          >
                            <i className="fa fa-edit" />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="universities-delete-btn"
                            onClick={() =>
                              handleRemoveCard(index)
                            }
                            aria-label="Delete university"
                          >
                            <i className="fa fa-trash" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn-add-link universities-add-university-btn"
                    onClick={handleAddCard}
                  >
                    <i className="fa fa-plus" />
                    Add University
                  </button>
                </div>
              </div>

              <div className="universities-list-right">
                <div className="universities-form-section">
                  <h4 className="editor-section-title">
                    Text Colors
                  </h4>

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
                </div>

                <div className="universities-form-section">
                  <h4 className="editor-section-title">
                    Section Preview
                  </h4>

                  <div className="universities-preview-box">
                    <div className="universities-preview-eyebrow">
                      {data.eyebrow || 'Eyebrow Preview'}
                    </div>

                    <div
                      className="universities-preview-title"
                      style={{
                        color:
                          data.titleColor || '#000000'
                      }}
                    >
                      {data.title ||
                        'Universities Section Title Preview'}
                    </div>

                    <div className="universities-preview-count">
                      {displayCards.length} university cards
                      configured
                    </div>
                  </div>
                </div>

                <div className="universities-form-section">
                  <h4 className="editor-section-title">
                    Quick Summary
                  </h4>

                  <div className="universities-summary-grid">
                    <div>
                      <strong>{displayCards.length}</strong>
                      <span>Total Universities</span>
                    </div>

                    <div>
                      <strong>
                        {
                          displayCards.filter(
                            (card) => card.isFeatured
                          ).length
                        }
                      </strong>

                      <span>Featured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="universities-edit-layout">
              <div className="universities-edit-left">
                <div className="universities-form-section">
                  <div className="universities-section-head">
                    <div>
                      <h4 className="editor-section-title">
                        {selectedCard?.name
                          ? `Edit: ${selectedCard.name}`
                          : 'New University Details'}
                      </h4>

                      <p>
                        Update university basic information
                        and card details.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="universities-done-btn"
                      onClick={() =>
                        setEditingIndex(null)
                      }
                    >
                      Done Editing
                    </button>
                  </div>

                  <div className="universities-inner-grid two-col">
                    <div className="field">
                      <label>University Name</label>

                      <input
                        className="editor-input"
                        value={selectedCard?.name || ''}
                        onChange={(e) =>
                          handleCardChange(
                            editingIndex,
                            'name',
                            e.target.value
                          )
                        }
                        placeholder="e.g. Canadian University Dubai"
                      />
                    </div>

                    <div className="field">
                      <label>City</label>

                      <input
                        className="editor-input"
                        value={selectedCard?.city || ''}
                        onChange={(e) =>
                          handleCardChange(
                            editingIndex,
                            'city',
                            e.target.value
                          )
                        }
                        placeholder="e.g. Dubai"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>University Image</label>

                    <div className="universities-upload-box">
                      <div
                        className="universities-upload-preview"
                        style={{
                          backgroundImage:
                            selectedCard?.image
                              ? `url(${selectedCard.image})`
                              : 'none'
                        }}
                      >
                        {isUploading ? (
                          <div className="universities-upload-loader">
                            <i className="fa fa-spinner fa-spin" />
                            Uploading...
                          </div>
                        ) : !selectedCard?.image ? (
                          <i className="fa fa-university" />
                        ) : null}
                      </div>

                      <div className="universities-upload-content">
                        <label className="universities-upload-label">
                          <i className="fa fa-upload" />
                          Select File

                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                            disabled={isUploading}
                          />
                        </label>

                        {selectedCard?.image && (
                          <button
                            type="button"
                            className="universities-remove-image-btn"
                            onClick={() =>
                              handleCardChange(
                                editingIndex,
                                'image',
                                ''
                              )
                            }
                            disabled={isUploading}
                          >
                            Remove Image
                          </button>
                        )}

                        <p>
                          Recommended size: 900x600 px -
                          JPEG, PNG.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="field">
                    <label>Image URL</label>

                    <input
                      className="editor-input"
                      value={selectedCard?.image || ''}
                      onChange={(e) =>
                        handleCardChange(
                          editingIndex,
                          'image',
                          e.target.value
                        )
                      }
                      placeholder="Or enter image URL manually..."
                      disabled={isUploading}
                    />
                  </div>

                  <div className="field">
                    <label>Description / Note</label>

                    <textarea
                      className="editor-textarea"
                      rows={3}
                      value={selectedCard?.note || ''}
                      onChange={(e) =>
                        handleCardChange(
                          editingIndex,
                          'note',
                          e.target.value
                        )
                      }
                      placeholder="Brief description or highlight of this university..."
                    />
                  </div>
                </div>
              </div>

              <div className="universities-edit-right">
                <div className="universities-form-section">
                  <h4 className="editor-section-title">
                    Academic Details
                  </h4>

                  <div className="universities-inner-grid two-col">
                    <div className="field">
                      <label>Courses Offered</label>

                      <input
                        className="editor-input"
                        value={
                          selectedCard?.courses || ''
                        }
                        onChange={(e) =>
                          handleCardChange(
                            editingIndex,
                            'courses',
                            e.target.value
                          )
                        }
                        placeholder="e.g. 34+"
                      />
                    </div>

                    <div className="field">
                      <label>Institute Type</label>

                      <input
                        className="editor-input"
                        value={selectedCard?.type || ''}
                        onChange={(e) =>
                          handleCardChange(
                            editingIndex,
                            'type',
                            e.target.value
                          )
                        }
                        placeholder="e.g. Private / Public"
                      />
                    </div>

                    <div className="field">
                      <label>Intake</label>

                      <input
                        className="editor-input"
                        value={
                          selectedCard?.intake || ''
                        }
                        onChange={(e) =>
                          handleCardChange(
                            editingIndex,
                            'intake',
                            e.target.value
                          )
                        }
                        placeholder="e.g. Sep / Jan"
                      />
                    </div>

                    <div className="field">
                      <label>Scholarship</label>

                      <input
                        className="editor-input"
                        value={
                          selectedCard?.scholarship || ''
                        }
                        onChange={(e) =>
                          handleCardChange(
                            editingIndex,
                            'scholarship',
                            e.target.value
                          )
                        }
                        placeholder="e.g. Merit-based support available"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Popular Programs</label>

                    <input
                      className="editor-input"
                      value={
                        selectedCard?.programs || ''
                      }
                      onChange={(e) =>
                        handleCardChange(
                          editingIndex,
                          'programs',
                          e.target.value
                        )
                      }
                      placeholder="e.g. Business, computing, design"
                    />
                  </div>

                  <div className="field">
                    <label>Website</label>

                    <input
                      className="editor-input"
                      value={
                        selectedCard?.website || ''
                      }
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
                </div>

                <div className="universities-form-section">
                  <h4 className="editor-section-title">
                    Homepage Visibility
                  </h4>

                  <label className="universities-feature-toggle">
                    <input
                      type="checkbox"
                      checked={
                        !!selectedCard?.isFeatured
                      }
                      onChange={() =>
                        handleToggleFeatured(
                          selectedCard,
                          editingIndex
                        )
                      }
                    />

                    <span>
                      Featured University

                      <small>
                        Only featured universities are
                        listed on the website homepage.
                      </small>
                    </span>
                  </label>
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
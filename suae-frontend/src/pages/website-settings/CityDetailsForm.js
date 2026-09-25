import React, { useState } from 'react';
import { usePreviewSettings } from '../../context/PreviewSettingsContext';
import FileService from '../../services/FileService';
import './css/web-settings.css';

const defaultCities = [
  {
    name: "Dubai",
    eyebrow: "The Global Metropolis",
    tagline: "Study in a hyper-connected global business hub offering endless career energy and a cosmopolitan lifestyle.",
    overview: "Dubai is one of the world's most dynamic cities, attracting students from over 150 countries. With dedicated academic zones like Dubai International Academic City (DIAC) and Dubai Knowledge Park, the city hosts branch campuses of leading global universities. It offers an energetic, fast-paced environment with unmatched networking, internship, and career opportunities.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80",
    dailyLife: "Dubai offers student accommodation in modern residential towers or dedicated student hubs like Myriad. The city is connected by a state-of-the-art Metro system, making commuting to classes and leisure spots seamless.",
    culture: "From the historic Al Fahidi district to the futuristic Museum of the Future, Dubai offers a blend of heritage and cutting-edge design. It is a hub for global concerts, sports events, and culinary experiences.",
    socialLife: "Student social life is extremely vibrant, with beaches, theme parks, shopping malls, and outdoor dining. Digital networking and professional meetups in areas like DIFC and Internet City are common.",
    livingCosts: [
      { category: "Accommodation", cost: "AED 3,000 - AED 5,500" },
      { category: "Food", cost: "AED 900 - AED 1,500" },
      { category: "Travel", cost: "AED 200 - AED 400" },
      { category: "Utilities", cost: "AED 500 - AED 850" }
    ],
    educationCosts: [
      { course: "Engineering & Tech", cost: "AED 55,000 - AED 160,000" },
      { course: "Business Management", cost: "AED 35,000 - AED 120,000" },
      { course: "Arts & Humanities", cost: "AED 40,000 - AED 90,000" },
      { course: "Health Sciences", cost: "AED 90,000 - AED 120,000" }
    ]
  },
  {
    name: "Abu Dhabi",
    eyebrow: "The UAE's Capital of Innovation",
    tagline: "Study in a secure, futuristic capital city that blends world-class research with rich Arabian hospitality.",
    overview: "Abu Dhabi, the capital of the UAE, is a major center for research, technology, and cultural landmarks. With campuses like NYU Abu Dhabi, Sorbonne Abu Dhabi, and Khalifa University, the city is focused on high-impact research, sustainability, and space tech. It offers a clean, safe, and highly prestigious environment for academic pursuits.",
    image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1920&q=80",
    dailyLife: "Students live in modern campus residences or downtown apartments. The city features wide bike lanes, clean public parks, and a reliable public bus network, creating a pleasant daily environment.",
    culture: "Abu Dhabi is the cultural heart of the UAE, hosting the Saadiyat Cultural District. Students can explore world-class art exhibitions, traditional heritage villages, and international film and music festivals.",
    socialLife: "Social life includes kayaking in the Eastern Mangroves, visiting Yas Island's theme parks, or relaxing at Corniche Beach. It is a slightly more relaxed but highly sophisticated student lifestyle.",
    livingCosts: [
      { category: "Accommodation", cost: "AED 2,800 - AED 4,800" },
      { category: "Food", cost: "AED 850 - AED 1,400" },
      { category: "Travel", cost: "AED 180 - AED 350" },
      { category: "Utilities", cost: "AED 480 - AED 800" }
    ],
    educationCosts: [
      { course: "Engineering & Tech", cost: "AED 50,000 - AED 150,000" },
      { course: "Business Management", cost: "AED 30,000 - AED 110,000" },
      { course: "Arts & Humanities", cost: "AED 35,000 - AED 85,000" },
      { course: "Health Sciences", cost: "AED 85,000 - AED 110,000" }
    ]
  },
  {
    name: "Sharjah",
    eyebrow: "The Cultural & Education Capital",
    tagline: "Experience academic excellence in a city rich with heritage, art, and student-friendly communities.",
    overview: "Sharjah is widely recognized as the cultural and educational hub of the UAE. Home to the famous University City, it offers a serene, academic-focused environment with world-class campuses, beautiful Islamic architecture, and a wealth of museums and libraries. Its close proximity to Dubai makes it a perfect balance of focused study and urban access.",
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1920&q=80",
    dailyLife: "Student life in Sharjah revolves around the massive, self-contained University City, which features parks, sports complexes, and student residential areas. Transport is easy with dedicated student shuttle buses and taxis linking to neighboring Dubai.",
    culture: "Sharjah is home to over 20 museums, the Sharjah Art Foundation, and traditional souks. The city hosts the annual Sharjah International Book Fair, one of the largest in the world, alongside various heritage festivals.",
    socialLife: "Socializing in Sharjah is centered around cafes, cultural exhibitions, and waterfront dining at Al Qasba and Al Majaz. Students enjoy a safe, family-friendly atmosphere with strong community values.",
    livingCosts: [
      { category: "Accommodation", cost: "AED 2,200 - AED 3,500" },
      { category: "Food", cost: "AED 750 - AED 1,200" },
      { category: "Travel", cost: "AED 150 - AED 300" },
      { category: "Utilities", cost: "AED 450 - AED 700" }
    ],
    educationCosts: [
      { course: "Engineering & Tech", cost: "AED 45,000 - AED 140,000" },
      { course: "Business Management", cost: "AED 25,000 - AED 100,000" },
      { course: "Arts & Humanities", cost: "AED 30,000 - AED 75,000" },
      { course: "Health Sciences", cost: "AED 80,000 - AED 100,000" }
    ]
  },
  {
    name: "Ajman",
    eyebrow: "Study in Ajman",
    tagline: "Discover affordable education and a peaceful coastal student lifestyle in Ajman.",
    overview: "Ajman offers a relaxed, community-focused environment for students. With lower living costs, scenic coastal views, and rapidly growing university campuses, it is an excellent choice for students seeking high-quality education in a peaceful setting close to nature.",
    image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=800&q=80",
    dailyLife: "Daily life in Ajman is calm and student-focused. Campuses are close to residential areas, making commute times minimal. Basic amenities, cafes, and supermarkets are easily accessible.",
    culture: "Explore local heritage sites, traditional markets, and scenic coastal pathways. Ajman offers a close look at traditional UAE culture and natural landscapes.",
    socialLife: "Student social life is centered around beach outings, outdoor sports, local cafes, and campus events. It is a friendly, welcoming environment where students quickly feel at home.",
    livingCosts: [
      { category: "Accommodation", cost: "AED 1,800 - AED 2,800" },
      { category: "Food", cost: "AED 600 - AED 1,000" },
      { category: "Travel", cost: "AED 100 - AED 250" },
      { category: "Utilities", cost: "AED 350 - AED 600" }
    ],
    educationCosts: [
      { course: "Engineering & Tech", cost: "AED 40,000 - AED 85,000" },
      { course: "Business Management", cost: "AED 30,000 - AED 70,000" },
      { course: "Arts & Humanities", cost: "AED 25,000 - AED 55,000" },
      { course: "Health Sciences", cost: "AED 50,000 - AED 85,000" }
    ]
  },
  {
    name: "Ras Al Khaimah",
    eyebrow: "Study in Ras Al Khaimah",
    tagline: "Discover branch campus excellence and lower costs in a beautiful northern emirate.",
    overview: "Ras Al Khaimah (RAK) hosts international branch campuses with flexible student visa pathways and significantly lower living and education expenses. Bordered by the Hajar mountains and sandy beaches, it provides a safe, focused environment for international students.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    dailyLife: "RAK provides a calm daily experience with high-quality branch accommodations. Moving between campus, residential zones, and malls is fast and affordable.",
    culture: "Home to historic forts, old pearling ports, and traditional camel tracks, offering deep cultural insights.",
    socialLife: "Students socialize at waterfront parks, mountain hiking trips, local coastal cafes, and collaborative student activities.",
    livingCosts: [
      { category: "Accommodation", cost: "AED 1,800 - AED 2,800" },
      { category: "Food", cost: "AED 600 - AED 1,000" },
      { category: "Travel", cost: "AED 100 - AED 250" },
      { category: "Utilities", cost: "AED 350 - AED 600" }
    ],
    educationCosts: [
      { course: "Engineering & Tech", cost: "AED 42,000 - AED 90,000" },
      { course: "Business Management", cost: "AED 32,000 - AED 75,000" },
      { course: "Arts & Humanities", cost: "AED 28,000 - AED 60,000" },
      { course: "Health Sciences", cost: "AED 52,000 - AED 90,000" }
    ]
  },
  {
    name: "Fujairah",
    eyebrow: "Study in Fujairah",
    tagline: "Explore specialized academic paths in the UAE's scenic eastern coast.",
    overview: "Fujairah is unique as the only emirate located on the Gulf of Oman, offering a stunning backdrop of mountains and sea. It hosts growing campuses specializing in engineering, maritime studies, and medical science, with highly competitive tuition rates.",
    image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=800&q=80",
    dailyLife: "Life is peaceful and close to nature. Commute times are virtually zero since accommodations are near campus hubs.",
    culture: "Explore Fujairah Fort (the oldest fort in the UAE), ancient mosques, and traditional Friday bull-butting sports.",
    socialLife: "Focused on beach camping, marine sports (snorkeling, diving), close student lounge gatherings, and hiking.",
    livingCosts: [
      { category: "Accommodation", cost: "AED 1,800 - AED 2,800" },
      { category: "Food", cost: "AED 600 - AED 1,000" },
      { category: "Travel", cost: "AED 100 - AED 250" },
      { category: "Utilities", cost: "AED 350 - AED 600" }
    ],
    educationCosts: [
      { course: "Engineering & Tech", cost: "AED 40,000 - AED 85,000" },
      { course: "Business Management", cost: "AED 30,000 - AED 70,000" },
      { course: "Arts & Humanities", cost: "AED 25,000 - AED 55,000" },
      { course: "Health Sciences", cost: "AED 50,000 - AED 85,000" }
    ]
  },
  {
    name: "Umm Al Quwain",
    eyebrow: "Study in Umm Al Quwain",
    tagline: "Focused vocational pathways in a peaceful and coastal environment.",
    overview: "Umm Al Quwain (UAQ) offers specialized vocational training schools and university campuses in a small, serene coastal community. It is the perfect location for students looking for dedicated study, zero distractions, and an affordable lifestyle.",
    image: "https://images.unsplash.com/photo-1504297050568-910d24c426d3?auto=format&fit=crop&w=800&q=80",
    dailyLife: "Extremely cost-effective daily living. Everything is located within walking or short driving distance.",
    culture: "Explore historic dhow building yards, UAQ museum, and archaeological excavations at Ed-Dur.",
    socialLife: "Centered around island boat trips, beach barbecues, and student sports clubs.",
    livingCosts: [
      { category: "Accommodation", cost: "AED 1,800 - AED 2,800" },
      { category: "Food", cost: "AED 600 - AED 1,000" },
      { category: "Travel", cost: "AED 100 - AED 250" },
      { category: "Utilities", cost: "AED 350 - AED 600" }
    ],
    educationCosts: [
      { course: "Engineering & Tech", cost: "AED 40,000 - AED 85,000" },
      { course: "Business Management", cost: "AED 30,000 - AED 70,000" },
      { course: "Arts & Humanities", cost: "AED 25,000 - AED 55,000" },
      { course: "Health Sciences", cost: "AED 50,000 - AED 85,000" }
    ]
  }
];

export default function CityDetailsForm({ onBack }) {
  const { data, updateField, saveSection, isSaving } = usePreviewSettings('cities');
  const [editingIndex, setEditingIndex] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const citiesList = data && data.length > 0 ? data : defaultCities;
  const selectedCity = editingIndex !== null ? citiesList[editingIndex] : null;

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSection();
  };

  const handleCityChange = (index, field, value) => {
    const updated = [...citiesList];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    updateField('', updated);
  };

  const handleCostChange = (cityIndex, costType, itemIndex, field, value) => {
    const updated = [...citiesList];
    const city = { ...updated[cityIndex] };
    const costs = [...(city[costType] || [])];

    costs[itemIndex] = {
      ...costs[itemIndex],
      [field]: value,
    };

    city[costType] = costs;
    updated[cityIndex] = city;

    updateField('', updated);
  };

  const handleAddCity = () => {
    const newCity = {
      name: '',
      eyebrow: 'The Academic & Cultural Hub',
      tagline:
        'Experience academic excellence in a city rich with heritage, art, and student-friendly communities.',
      overview:
        'This city is widely recognized as an educational hub of the UAE, offering a unique blend of high-quality education and student-friendly living.',
      image: '',
      dailyLife:
        'Classes, metro-connected districts, evening study spots, student events, and weekend plans all sit close together.',
      culture:
        'A rich tapestry of traditional heritage meets modern entertainment, featuring museums, art galleries, and dining spots.',
      socialLife:
        'A vibrant international student community offers countless opportunities for networking, sports, and outdoor activities.',
      livingCosts: [
        { category: 'Accommodation', cost: 'AED 2,000 - 3,500 / Month' },
        { category: 'Food', cost: 'AED 800 - 1,200 / Month' },
        { category: 'Travel (Metro/Taxi)', cost: 'AED 250 - 400 / Month' },
        { category: 'Utilities', cost: 'AED 300 - 500 / Month' },
      ],
      educationCosts: [
        { course: 'Engineering & Tech', cost: 'AED 50,000 - 95,000 / Year' },
        { course: 'Business Management', cost: 'AED 45,000 - 85,000 / Year' },
        { course: 'Health Sciences', cost: 'AED 60,000 - 110,000 / Year' },
        { course: 'Arts & Humanities', cost: 'AED 40,000 - 70,000 / Year' },
      ],
    };

    const updated = [...citiesList, newCity];

    updateField('', updated);
    setEditingIndex(updated.length - 1);
  };

  const handleRemoveCity = (index) => {
    if (window.confirm('Are you sure you want to delete this city?')) {
      const updated = citiesList.filter((_, i) => i !== index);

      updateField('', updated);

      if (editingIndex === index) {
        setEditingIndex(null);
      } else if (editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || editingIndex === null) return;

    setIsUploading(true);

    try {
      const res = await FileService.upload(file);

      if (res?.data?.file_url) {
        handleCityChange(editingIndex, 'image', res.data.file_url);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="city-details-card city-details-card--flat">
      <form onSubmit={handleSave} className="city-details-editor-form">
        <div className="editor-body city-details-editor-body-flat">
          {editingIndex === null ? (
            <div className="city-details-single-layout">
              <div className="city-details-form-section city-details-list-section">
                <div className="city-details-section-head">
                  <div>
                    <h4 className="editor-section-title">
                      Cities List
                    </h4>

                    <p>{citiesList.length} cities listed</p>
                  </div>

                  <div className="city-details-header-actions">
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
                      className="city-details-add-btn"
                      onClick={handleAddCity}
                    >
                      <i className="fa fa-plus" />
                      Add City
                    </button>
                  </div>
                </div>

                <div className="city-details-list">
                  {citiesList.map((city, index) => (
                    <div key={index} className="city-details-list-card">
                      <div className="city-details-list-info">
                        <div
                          className="city-details-thumb"
                          style={{
                            backgroundImage: city.image ? `url(${city.image})` : 'none',
                          }}
                        >
                          {!city.image && <i className="fa fa-map-marker" />}
                        </div>

                        <div className="city-details-list-text">
                          <h5>{city.name || 'Unnamed City'}</h5>
                          <p>{city.eyebrow || 'Student Life'}</p>
                        </div>
                      </div>

                      <div className="city-details-card-actions">
                        <button
                          type="button"
                          className="city-details-edit-btn"
                          onClick={() => setEditingIndex(index)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="city-details-delete-btn"
                          onClick={() => handleRemoveCity(index)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="city-details-edit-single-layout">
              <div className="city-details-form-section">
                <h4 className="editor-section-title">Basic City Information</h4>

                <div className="city-details-inner-grid two-col">
                  <div className="field">
                    <label>City Name</label>
                    <input
                      className="editor-input"
                      value={selectedCity?.name || ''}
                      onChange={(e) =>
                        handleCityChange(editingIndex, 'name', e.target.value)
                      }
                      placeholder="e.g. Dubai"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Eyebrow / Category</label>
                    <input
                      className="editor-input"
                      value={selectedCity?.eyebrow || ''}
                      onChange={(e) =>
                        handleCityChange(editingIndex, 'eyebrow', e.target.value)
                      }
                      placeholder="e.g. The Cultural & Education Capital"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Tagline</label>
                  <input
                    className="editor-input"
                    value={selectedCity?.tagline || ''}
                    onChange={(e) =>
                      handleCityChange(editingIndex, 'tagline', e.target.value)
                    }
                    placeholder="e.g. Experience academic excellence..."
                    required
                  />
                </div>

                <div className="field">
                  <label>Overview Description</label>
                  <textarea
                    rows={4}
                    className="editor-textarea"
                    value={selectedCity?.overview || ''}
                    onChange={(e) =>
                      handleCityChange(editingIndex, 'overview', e.target.value)
                    }
                    placeholder="Why study in this city overview..."
                    required
                  />
                </div>
              </div>

              <div className="city-details-form-section">
                <h4 className="editor-section-title">Skyline / Banner Image</h4>

                <div className="city-details-upload-box">
                  {selectedCity?.image && (
                    <div
                      className="city-details-image-preview"
                      style={{
                        backgroundImage: `url(${selectedCity.image})`,
                      }}
                    />
                  )}

                  <div className="city-details-upload-content">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="city-image-upload"
                    />

                    <label htmlFor="city-image-upload" className="city-details-upload-label">
                      {isUploading ? 'Uploading...' : 'Choose Image'}
                    </label>

                    <p>Recommended size: 1920x1080 px - JPEG, PNG.</p>
                  </div>
                </div>

                <div className="field">
                  <label>Image URL</label>
                  <input
                    className="editor-input"
                    value={selectedCity?.image || ''}
                    onChange={(e) =>
                      handleCityChange(editingIndex, 'image', e.target.value)
                    }
                    placeholder="Or paste image URL"
                  />
                </div>
              </div>

              <div className="city-details-form-section">
                <h4 className="editor-section-title">Student Life Descriptions</h4>

                <div className="field">
                  <label>Daily Life</label>
                  <textarea
                    rows={3}
                    className="editor-textarea"
                    value={selectedCity?.dailyLife || ''}
                    onChange={(e) =>
                      handleCityChange(editingIndex, 'dailyLife', e.target.value)
                    }
                    placeholder="Describe daily student life..."
                  />
                </div>

                <div className="field">
                  <label>Culture & Entertainment</label>
                  <textarea
                    rows={3}
                    className="editor-textarea"
                    value={selectedCity?.culture || ''}
                    onChange={(e) =>
                      handleCityChange(editingIndex, 'culture', e.target.value)
                    }
                    placeholder="Describe cultural sights, food, events..."
                  />
                </div>

                <div className="field">
                  <label>Social Life</label>
                  <textarea
                    rows={3}
                    className="editor-textarea"
                    value={selectedCity?.socialLife || ''}
                    onChange={(e) =>
                      handleCityChange(editingIndex, 'socialLife', e.target.value)
                    }
                    placeholder="Describe student communities, sports, social scene..."
                  />
                </div>
              </div>

              <div className="city-details-form-section">
                <h4 className="editor-section-title">Cost of Living - Monthly</h4>

                {[0, 1, 2, 3].map((cIdx) => {
                  const cost = selectedCity?.livingCosts?.[cIdx] || {
                    category: '',
                    cost: '',
                  };

                  return (
                    <div key={cIdx} className="city-details-cost-row">
                      <div className="field">
                        <label>Category {cIdx + 1}</label>
                        <input
                          className="editor-input"
                          value={cost.category}
                          onChange={(e) =>
                            handleCostChange(
                              editingIndex,
                              'livingCosts',
                              cIdx,
                              'category',
                              e.target.value
                            )
                          }
                          placeholder="e.g. Accommodation"
                        />
                      </div>

                      <div className="field">
                        <label>Monthly Cost {cIdx + 1}</label>
                        <input
                          className="editor-input"
                          value={cost.cost}
                          onChange={(e) =>
                            handleCostChange(
                              editingIndex,
                              'livingCosts',
                              cIdx,
                              'cost',
                              e.target.value
                            )
                          }
                          placeholder="e.g. AED 2,000 - 3,500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="city-details-form-section">
                <h4 className="editor-section-title">Tuition Fees - Annual</h4>

                {[0, 1, 2, 3].map((cIdx) => {
                  const fee = selectedCity?.educationCosts?.[cIdx] || {
                    course: '',
                    cost: '',
                  };

                  return (
                    <div key={cIdx} className="city-details-cost-row">
                      <div className="field">
                        <label>Discipline {cIdx + 1}</label>
                        <input
                          className="editor-input"
                          value={fee.course}
                          onChange={(e) =>
                            handleCostChange(
                              editingIndex,
                              'educationCosts',
                              cIdx,
                              'course',
                              e.target.value
                            )
                          }
                          placeholder="e.g. Engineering & Tech"
                        />
                      </div>

                      <div className="field">
                        <label>Annual Tuition {cIdx + 1}</label>
                        <input
                          className="editor-input"
                          value={fee.cost}
                          onChange={(e) =>
                            handleCostChange(
                              editingIndex,
                              'educationCosts',
                              cIdx,
                              'cost',
                              e.target.value
                            )
                          }
                          placeholder="e.g. AED 50,000 - 95,000"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="editor-footer city-details-editor-footer-flat">
          <button
            type="button"
            className="btn-cancel"
            onClick={editingIndex !== null ? () => setEditingIndex(null) : onBack}
          >
            {editingIndex !== null ? 'Back to List' : 'Cancel'}
          </button>

          <button type="submit" className="btn-save" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}




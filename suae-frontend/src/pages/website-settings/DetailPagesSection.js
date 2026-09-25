// import React, { useState } from 'react';
// import UniversityDetailsForm from './UniversityDetailsForm';
// import CourseDetailsForm from './CourseDetailsForm';
// import CityDetailsForm from './CityDetailsForm';
// import './css/web-settings.css';

// export default function DetailPagesSection({ onBack }) {
//   const [activeForm, setActiveForm] = useState(null);

//   if (activeForm === 'university') {
//     return <UniversityDetailsForm onBack={() => setActiveForm(null)} />;
//   }
//   if (activeForm === 'course') {
//     return <CourseDetailsForm onBack={() => setActiveForm(null)} />;
//   }
//   if (activeForm === 'city') {
//     return <CityDetailsForm onBack={() => setActiveForm(null)} />;
//   }

//   return (
//     <div className="hero-editor-card">
//       <div className="editor-header">
//         <div>
//           <h3>Detail Pages</h3>
//           <p>Select a form to edit inner page content</p>
//         </div>
//         <button
//           type="button"
//           className="btn-back"
//           onClick={onBack}
//         >
//           <i className="fa fa-arrow-left" style={{ marginRight: '8px' }} />
//           Back
//         </button>
//       </div>

//       <div className="editor-body" style={{ padding: '20px' }}>
//         <div className="list-group" style={{ boxShadow: 'none', margin: 0 }}>
//           <div
//             className="list-group-item"
//             style={{
//               cursor: 'pointer',
//               border: 'none',
//               borderBottom: '1px solid #f5f5f5',
//               padding: '15px 10px',
//               display: 'flex',
//               alignItems: 'center',
//               transition: 'background 0.2s',
//               background: 'transparent'
//             }}
//             onClick={() => setActiveForm('university')}
//             onMouseEnter={(e) => e.currentTarget.style.background = '#eef4ff'}
//             onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
//           >
//             <div style={{ width: '40px', textAlign: 'center' }}>
//               <i className="fa fa-university" style={{ fontSize: '20px', color: '#174a8b' }}></i>
//             </div>
//             <div style={{ flex: 1, paddingLeft: '5px' }}>
//               <h4 className="list-group-item-heading" style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#333' }}>
//                 University Details Form
//               </h4>
//               <p className="list-group-item-text text-muted" style={{ fontSize: '12px', margin: 0, color: '#888' }}>
//                 Add, update or remove university profiles, notes & highlights
//               </p>
//             </div>
//             <div style={{ color: '#c2c9d1' }}>
//               <i className="fa fa-chevron-right" style={{ fontSize: '12px' }}></i>
//             </div>
//           </div>

//           <div
//             className="list-group-item"
//             style={{
//               cursor: 'pointer',
//               border: 'none',
//               borderBottom: '1px solid #f5f5f5',
//               padding: '15px 10px',
//               display: 'flex',
//               alignItems: 'center',
//               transition: 'background 0.2s',
//               background: 'transparent'
//             }}
//             onClick={() => setActiveForm('course')}
//             onMouseEnter={(e) => e.currentTarget.style.background = '#eef4ff'}
//             onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
//           >
//             <div style={{ width: '40px', textAlign: 'center' }}>
//               <i className="fa fa-book" style={{ fontSize: '20px', color: '#174a8b' }}></i>
//             </div>
//             <div style={{ flex: 1, paddingLeft: '5px' }}>
//               <h4 className="list-group-item-heading" style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#333' }}>
//                 Course Details Form
//               </h4>
//               <p className="list-group-item-text text-muted" style={{ fontSize: '12px', margin: 0, color: '#888' }}>
//                 Add, update or remove course durations, fees & career options
//               </p>
//             </div>
//             <div style={{ color: '#c2c9d1' }}>
//               <i className="fa fa-chevron-right" style={{ fontSize: '12px' }}></i>
//             </div>
//           </div>

//           <div
//             className="list-group-item"
//             style={{
//               cursor: 'pointer',
//               border: 'none',
//               padding: '15px 10px',
//               display: 'flex',
//               alignItems: 'center',
//               transition: 'background 0.2s',
//               background: 'transparent'
//             }}
//             onClick={() => setActiveForm('city')}
//             onMouseEnter={(e) => e.currentTarget.style.background = '#eef4ff'}
//             onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
//           >
//             <div style={{ width: '40px', textAlign: 'center' }}>
//               <i className="fa fa-building" style={{ fontSize: '20px', color: '#174a8b' }}></i>
//             </div>
//             <div style={{ flex: 1, paddingLeft: '5px' }}>
//               <h4 className="list-group-item-heading" style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#333' }}>
//                 City Details Form
//               </h4>
//               <p className="list-group-item-text text-muted" style={{ fontSize: '12px', margin: 0, color: '#888' }}>
//                 Add, update or remove city lifestyles, cost of living & education
//               </p>
//             </div>
//             <div style={{ color: '#c2c9d1' }}>
//               <i className="fa fa-chevron-right" style={{ fontSize: '12px' }}></i>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useState } from 'react';
import UniversityDetailsForm from './UniversityDetailsForm';
import CourseDetailsForm from './CourseDetailsForm';
import CityDetailsForm from './CityDetailsForm';
import './css/web-settings.css';

export default function DetailPagesSection() {
  const [activeForm, setActiveForm] = useState(null);

  if (activeForm === 'university') {
    return (
      <UniversityDetailsForm
        onBack={() => setActiveForm(null)}
      />
    );
  }

  if (activeForm === 'course') {
    return (
      <CourseDetailsForm
        onBack={() => setActiveForm(null)}
      />
    );
  }

  if (activeForm === 'city') {
    return (
      <CityDetailsForm
        onBack={() => setActiveForm(null)}
      />
    );
  }

  return (
    <div className="detail-pages-editor-page">
      <div className="detail-pages-single-layout">
        <div className="detail-pages-form-section">
          <h4 className="editor-section-title">
            Inner Page Forms
          </h4>

          <div className="detail-pages-card-list">
            <button
              type="button"
              className="detail-pages-option-card"
              onClick={() => setActiveForm('university')}
            >
              <div className="detail-pages-option-icon">
                <i className="fa fa-university" />
              </div>

              <div className="detail-pages-option-content">
                <h5>University Details Form</h5>

                <p>
                  Add, update or remove university profiles,
                  notes and highlights.
                </p>
              </div>

              <i className="fa fa-chevron-right detail-pages-arrow" />
            </button>

            <button
              type="button"
              className="detail-pages-option-card"
              onClick={() => setActiveForm('course')}
            >
              <div className="detail-pages-option-icon">
                <i className="fa fa-book" />
              </div>

              <div className="detail-pages-option-content">
                <h5>Course Details Form</h5>

                <p>
                  Add, update or remove course durations,
                  fees and career options.
                </p>
              </div>

              <i className="fa fa-chevron-right detail-pages-arrow" />
            </button>

            <button
              type="button"
              className="detail-pages-option-card"
              onClick={() => setActiveForm('city')}
            >
              <div className="detail-pages-option-icon">
                <i className="fa fa-building" />
              </div>

              <div className="detail-pages-option-content">
                <h5>City Details Form</h5>

                <p>
                  Add, update or remove city lifestyles,
                  cost of living and education.
                </p>
              </div>

              <i className="fa fa-chevron-right detail-pages-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import InstituteService from '../../services/InstituteService';
// import CmasterService from '../../services/CmasterService';
// import util from '../../utils/util';
// import { AntdSelect } from '../../utils/Antd';
// import {
//   message,
//   Modal,
//   Input,
//   Divider,
//   Checkbox,
//   Result,
//   Alert,
// } from 'antd';

// export default function InstituteRegistration(props) {
//   const { profilePage, callback = null, instituteId = null } = props;
//   const navigate = useNavigate();
//   const [states, setStates] = useState([]);
//   const [data, setData] = useState({
//     terms_check: true,
//     naac: '',
//     nirf: '',
//     nba: '',
//     etablished_after_2019: '',
//     aicte: 1,
//     international_exposure: 1,
//   });
//   const [isRegDone, setRegDone] = useState(false);

//   const handleChange = (v, k) => {
//     data[k] = v;
//     setData({ ...data });
//   };

//   const register = () => {
//     if (!data.terms_check && !profilePage) {
//       Modal.error({
//         title: 'Error',
//         content: 'Please accept the privacy policy to finish registration.',
//         width: '500px',
//       });
//       return;
//     }

//     message.destroy();
//     util.showLoader();
//     const payload = {
//       ...data,
//       etablished_after_2019: data.etablished_after_2019 ? String(data.etablished_after_2019) : '',
//       nirf: data.nirf ? String(data.nirf) : '',
//       naac: data.naac ? String(data.naac) : '',
//       nba: data.nba === '1' ? '1' : '0',
//       aicte: [1, '1'].includes(data.aicte) ? '1' : '0',
//       international_exposure: [1, '1'].includes(data.international_exposure) ? '1' : '0',
//       state_id: data.state_id ? String(data.state_id) : '',
//       pincode: data.pincode ? String(data.pincode) : '',
//       head_mobile: data.head_mobile ? String(data.head_mobile) : '',
//       nodal_mobile: data.nodal_mobile ? String(data.nodal_mobile) : '',
//       type: data.type ? String(data.type) : '',
//       website: data.website ? String(data.website) : '',
//       city: data.city ? String(data.city) : '',
//       address: data.address ? String(data.address) : '',
//       name: data.name ? String(data.name) : '',
//       nodal_name: data.nodal_name ? String(data.nodal_name) : '',
//       nodal_designation: data.nodal_designation ? String(data.nodal_designation) : '',
//       nodal_email: data.nodal_email ? String(data.nodal_email) : '',
//       head_name: data.head_name ? String(data.head_name) : '',
//       head_designation: data.head_designation ? String(data.head_designation) : '',
//       head_email: data.head_email ? String(data.head_email) : '',
//     };

//     // Remove frontend-only keys
//     delete payload.terms_check;

//     console.log('Payload to Backend:', payload);

//     InstituteService.register(payload)
//       .then((res) => {
//         if (profilePage) {
//           message.success(res.data.message || 'Profile updated successfully');
//         } else {
//           setRegDone(true);
//         }
//         if (callback) { callback(); }
//       })
//       .catch((e) => {
//         message.error(e.message || 'Registration failed. Please try again.');
//       })
//       .finally(() => {
//         util.hideLoader();
//       });
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Load states
//         const stateRes = await CmasterService.allStates({ status: 1 });
//         setStates(stateRes.data?.result?.data || []);

//         // Load institute details if editing profile
//         if (profilePage) {
//           const res = await InstituteService.detail(instituteId);
//           const result = res.data?.result;

//           // Validate and sanitize naac
//           const validNaacGrades = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'D'];
//           const naacValue = validNaacGrades.includes(result.naac) ? result.naac : '';

//           setData((prev) => ({
//             ...prev,
//             ...result,
//             naac: naacValue,
//             nirf: result.nirf || '',
//             nba: result.nba === '1' ? '1' : '0',
//             etablished_after_2019: result.etablished_after_2019 ? String(result.etablished_after_2019) : '',
//             aicte: [1, '1'].includes(result.aicte) ? 1 : 0,
//             international_exposure: [1, '1'].includes(result.international_exposure) ? 1 : 0,
//             state_id: result.state_id ? String(result.state_id) : '',
//             pincode: result.pincode ? String(result.pincode) : '',
//           }));
//         }
//       } catch (err) {
//         console.error('Error loading data:', err);
//         message.error('Failed to load required data. Please refresh.');
//       }
//     };

//     fetchData();
//   }, [profilePage]);

//   const isFormDisable = profilePage && data.status === 1 && util.isInstitute() === 1 && !util.isAutoLoggedIn();

//   const naacGrades = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'D'];

//   return (
//     <div
//       className={profilePage ? '' : 'h-100 cscroll round-input'}
//       style={profilePage ? {} : { position: '', left: 0, right: 0, top: 0, bottom: 0 }}
//     >
//       {!profilePage && (
//         <>
//           {/* Header */}
//           <div className="text-white p8" style={{ background: 'var(--theme-green-light)' }}>
//             <div className="container">
//               <div className="d-flex align-items-center fs13">
//                 <div className="pr20">
//                   <img src="theme/img/sis-logo.png" width="150" alt="SIS Logo" />
//                 </div>
//                 <div className="pr3 font-green1">
//                   <i className="fa fa-envelope"></i>
//                 </div>
//                 <div className="pr30">info@studyindiascholarship.com</div>
//                 <div className="ml-auto">
//                   <div className="d-flex">
//                     <div className="pr3 font-green1">
//                       <i className="fa fa-user-circle"></i>
//                     </div>
//                     <div className="cpointer" onClick={() => navigate('/login')}>
//                       Institute Login
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Title */}
//           <div style={{ background: 'var(--theme-green-dark)' }}>
//             <div className="container">
//               <div className="fs22 text-white pt15 pb15">Institute Registration Form</div>
//             </div>
//           </div>
//         </>
//       )}

//       <div className={profilePage ? 'w-75 mx-auto' : 'container pb20'}>
//         <div className={profilePage ? '' : 'pt30'}>
//           {isRegDone ? (
//             <Result
//               status="success"
//               title="Successfully registered with us!"
//               subTitle="Welcome email has been sent. We will contact you soon."
//             />
//           ) : (
//             <div
//               className={profilePage ? '' : 'border shadow overflow-hidden'}
//               style={
//                 profilePage
//                   ? {}
//                   : { borderRadius: '20px', backgroundColor: '#fff' }
//               }
//             >
//               {isFormDisable && (
//                 <Alert
//                   message="After approval you cannot edit your details"
//                   type="warning"
//                   className="mb10"
//                 />
//               )}

//               <div className="position-relative" style={{ padding: isFormDisable ? '10px' : '0' }}>
//                 {isFormDisable && (
//                   <div
//                     style={{
//                       position: 'absolute',
//                       zIndex: 1,
//                       left: 0,
//                       top: 0,
//                       width: '100%',
//                       height: '100%',
//                       background: 'rgba(0,0,0,0.05)',
//                       borderRadius: '4px',
//                     }}
//                   ></div>
//                 )}

//                 <div className={profilePage ? '' : 'pt25 pl20 pr20 pb20'}>
//                   {/* Institute Details */}
//                   <div className="row mingap">
//                     <div className="col-md-12 form-group">
//                       <label className="req">Name of Institute</label>
//                       <Input
//                         size="large"
//                         placeholder="Name of Institute"
//                         value={data.name || ''}
//                         onChange={(e) => handleChange(e.target.value, 'name')}
//                         disabled={isFormDisable}
//                       />
//                     </div>
//                     <div className="col-md-6 form-group">
//                       <label className="req">Institute Address</label>
//                       <Input
//                         size="large"
//                         placeholder="Institute Address"
//                         value={data.address || ''}
//                         onChange={(e) => handleChange(e.target.value, 'address')}
//                         disabled={isFormDisable}
//                       />
//                     </div>
//                     <div className="col-md-6 form-group">
//                       <label className="req">Institute Website Url</label>
//                       <Input
//                         size="large"
//                         placeholder="Institute Website Url"
//                         value={data.website || ''}
//                         onChange={(e) => handleChange(e.target.value, 'website')}
//                         disabled={isFormDisable}
//                       />
//                     </div>

//                     <div className="col-md-3 form-group">
//                       <label className="req">State</label>
//                       <AntdSelect
//                         size="large"
//                         placeholder="--State--"
//                         showSearch
//                         options={states.map((v) => ({ id: v.id, name: v.name }))}
//                         value={data.state_id}
//                         onChange={(v) => handleChange(v, 'state_id')}
//                         disabled={isFormDisable}
//                       />
//                     </div>
//                     <div className="col-md-3 form-group">
//                       <label className="req">City</label>
//                       <Input
//                         size="large"
//                         placeholder="City"
//                         value={data.city || ''}
//                         onChange={(e) => handleChange(e.target.value, 'city')}
//                         disabled={isFormDisable}
//                       />
//                     </div>
//                     <div className="col-md-3 form-group">
//                       <label className="req">Zip Code</label>
//                       <Input
//                         size="large"
//                         placeholder="Zip Code"
//                         value={data.pincode || ''}
//                         onChange={(e) => handleChange(e.target.value, 'pincode')}
//                         disabled={isFormDisable}
//                       />
//                     </div>
//                     <div className="col-md-3 form-group">
//                       <label className="req">Type of Institute</label>
//                       <AntdSelect
//                         size="large"
//                         placeholder="--Type of Institute--"
//                         showSearch
//                         options={['Public', 'Private']}
//                         value={data.type}
//                         onChange={(v) => handleChange(v, 'type')}
//                         disabled={isFormDisable}
//                       />
//                     </div>
//                   </div>

//                   {/* Nodal Office */}
//                   <Divider orientation="left">Nodal Office Details</Divider>
//                   <div className="row mingap">
//                     <div className="col-md-6 form-group">
//                       <label className="req">Full Name</label>
//                       <Input
//                         size="large"
//                         placeholder="Name"
//                         value={data.nodal_name || ''}
//                         onChange={(e) => handleChange(e.target.value, 'nodal_name')}
//                         disabled={isFormDisable}
//                       />
//                     </div>
//                     <div className="col-md-6 form-group">
//                       <label className="req">Designation</label>
//                       <Input
//                         size="large"
//                         placeholder="Designation"
//                         value={data.nodal_designation || ''}
//                         onChange={(e) => handleChange(e.target.value, 'nodal_designation')}
//                         disabled={isFormDisable}
//                       />
//                     </div>
//                     <div className="col-md-6 form-group">
//                       <label className="req">Email</label>
//                       <Input
//                         size="large"
//                         placeholder="Email"
//                         value={data.nodal_email || ''}
//                         onChange={(e) => handleChange(e.target.value, 'nodal_email')}
//                         disabled={isFormDisable}
//                       />
//                     </div>
//                     <div className="col-md-6 form-group">
//                       <label className="req">Mobile</label>
//                       <Input
//                         size="large"
//                         placeholder="Mobile"
//                         value={data.nodal_mobile || ''}
//                         onChange={(e) => handleChange(e.target.value, 'nodal_mobile')}
//                         maxLength="10"
//                         disabled={isFormDisable}
//                       />
//                     </div>
//                   </div>

//                   {/* Head of Institution */}
//                   <Divider orientation="left">Head of Institution Details</Divider>
//                   <div className="row mingap">
//                     <div className="col-md-6 form-group">
//                       <label className="req">Full Name</label>
//                       <Input
//                         size="large"
//                         placeholder="Name"
//                         value={data.head_name || ''}
//                         onChange={(e) => handleChange(e.target.value, 'head_name')}
//                         disabled={isFormDisable}
//                       />
//                     </div>
//                     <div className="col-md-6 form-group">
//                       <label className="req">Designation</label>
//                       <Input
//                         size="large"
//                         placeholder="Designation"
//                         value={data.head_designation || ''}
//                         onChange={(e) => handleChange(e.target.value, 'head_designation')}
//                         disabled={isFormDisable}
//                       />
//                     </div>
//                     <div className="col-md-6 form-group">
//                       <label className="req">Email (Will be used for login)</label>
//                       <Input
//                         size="large"
//                         placeholder="Email"
//                         value={data.head_email || ''}
//                         onChange={(e) => handleChange(e.target.value, 'head_email')}
//                         disabled={profilePage || isFormDisable}
//                       />
//                     </div>
//                     <div className="col-md-6 form-group">
//                       <label className="req">Mobile</label>
//                       <Input
//                         size="large"
//                         placeholder="Mobile"
//                         value={data.head_mobile || ''}
//                         onChange={(e) => handleChange(e.target.value, 'head_mobile')}
//                         maxLength="10"
//                         disabled={isFormDisable}
//                       />
//                     </div>
//                   </div>

//                   {/* Accreditations & Features */}
//                   <Divider />

//                   <div className="row align-items-center">
//                     {/* NAAC Grade */}
//                     <div className="col-md-3 form-group">
//                       <label>NAAC Grade</label>
//                       <AntdSelect
//                         size="large"
//                         placeholder="Select Grade"
//                         options={naacGrades.map((grade) => ({
//                           value: grade,
//                           label: grade,
//                         }))}
//                         value={data.naac}
//                         onChange={(v) => handleChange(v, 'naac')}
//                         disabled={isFormDisable}
//                       />
//                     </div>

//                     {/* NIRF Ranking */}
//                     <div className="col-md-3 form-group">
//                       <label>NIRF Ranking</label>
//                       <Input
//                         size="large"
//                         placeholder="Enter NIRF Rank"
//                         value={data.nirf || ''}
//                         onChange={(e) => handleChange(e.target.value, 'nirf')}
//                         disabled={isFormDisable}
//                       />
//                     </div>

//                     {/* NBA Accreditation */}
//                     <div className="col-md-3 form-group">
//                       <label className="d-block">NBA Accreditation</label>
//                       <Checkbox
//                         checked={data.nba === '1'}
//                         onChange={(e) => handleChange(e.target.checked ? '1' : '0', 'nba')}
//                         disabled={isFormDisable}
//                       >
//                         NBA Accredited
//                       </Checkbox>
//                     </div>

//                     {/* International Exposure */}
//                     <div className="col-md-3 form-group">
//                       <label className="d-block">International Exposure</label>
//                       <Checkbox
//                         checked={data.international_exposure === 1}
//                         onChange={(e) => handleChange(e.target.checked ? 1 : 0, 'international_exposure')}
//                         disabled={isFormDisable}
//                       >
//                         5+ Years of International Exposure
//                       </Checkbox>
//                     </div>

//                     {/* Establishment Year */}
//                     <div className="col-md-3 form-group">
//                       <label>Establishment Year</label>
//                       <Input
//                         size="large"
//                         type="number"
//                         placeholder="e.g. 2015"
//                         min="1900"
//                         max="2025"
//                         value={data.etablished_after_2019 || ''}
//                         onChange={(e) => handleChange(e.target.value, 'etablished_after_2019')}
//                         disabled={isFormDisable}
//                       />
//                     </div>

//                     {/* AICTE Foreign Quota */}
//                     <div className="col-md-3 form-group">
//                       <label className="d-block">AICTE Foreign Quota</label>
//                       <Checkbox
//                         checked={data.aicte === 1}
//                         onChange={(e) => handleChange(e.target.checked ? 1 : 0, 'aicte')}
//                         disabled={isFormDisable}
//                       >
//                         AICTE Foreign Quota
//                       </Checkbox>
//                     </div>
//                   </div>

//                   {/* Terms & Submit */}
//                   {!profilePage && (
//                     <>
//                       <div className="text-secondary pt10 d-flex">
//                         <Checkbox
//                           checked={data.terms_check}
//                           onChange={(e) =>
//                             setData({ ...data, terms_check: e.target.checked })
//                           }
//                           disabled={isFormDisable}
//                         />
//                         <div className="pl15">
//                           I accept the terms of{' '}
//                           <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
//                             privacy policy
//                           </a>{' '}
//                           and would like to receive updates about Study India Scholarship.
//                         </div>
//                       </div>

//                       <div className="pt25 d-flex align-items-center flex-wrap">
//                         <div
//                           className="pill-btn active w200 fs16 pt10 pb10 text-center"
//                           onClick={register}
//                         >
//                           Register
//                         </div>
//                         <div className="ml-auto fs16">
//                           Already have an account?{' '}
//                           <span className="link" onClick={() => navigate('/login')}>
//                             Login
//                           </span>
//                         </div>
//                       </div>
//                     </>
//                   )}

//                   {profilePage && !isFormDisable && (
//                     <div
//                       className="pill-btn active w200 fs16 pt10 pb10 text-center mt15"
//                       onClick={register}
//                     >
//                       Save
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstituteService from '../../services/InstituteService';
import CmasterService from '../../services/CmasterService';
import util from '../../utils/util';
import { AntdSelect } from '../../utils/Antd';
import { useDynamicLogo } from '../../hooks/useDynamicLogo';
import {
  message,
  Modal,
  Input,
  Divider,
  Checkbox,
  Result,
  Alert,
} from 'antd';

export default function InstituteRegistration(props) {
  const { profilePage, callback = null, instituteId = null } = props;
  const navigate = useNavigate();
  const dynamicLogo = useDynamicLogo();
  const [states, setStates] = useState([]);
  const [data, setData] = useState({
    terms_check: true,
    naac: '',
    nirf: '',
    nba: '',
    etablished_after_2019: '',
    aicte: 1,
    international_exposure: 1,
  });
  const [isRegDone, setRegDone] = useState(false);

  const handleChange = (v, k) => {
    setData((prev) => ({
      ...prev,
      [k]: v,
    }));
  };

  const register = () => {
    if (!data.terms_check && !profilePage) {
      Modal.error({
        title: 'Error',
        content: 'Please accept the privacy policy to finish registration.',
        width: '500px',
      });
      return;
    }

    message.destroy();
    util.showLoader();
    const payload = {
      ...data,
      ...(data.id && { institute_id: String(data.id) }),
      etablished_after_2019: data.etablished_after_2019 ? String(data.etablished_after_2019) : '',
      nirf: data.nirf ? String(data.nirf) : '',
      naac: data.naac ? String(data.naac) : '',
      nba: data.nba === '1' ? '1' : '0',
      aicte: [1, '1'].includes(data.aicte) ? '1' : '0',
      international_exposure: data.international_exposure ? String(data.international_exposure) : '',
      state_id: data.state_id ? String(data.state_id) : '',
      pincode: data.pincode ? String(data.pincode) : '',
      head_mobile: data.head_mobile ? String(data.head_mobile) : '',
      nodal_mobile: data.nodal_mobile ? String(data.nodal_mobile) : '',
      type: data.type ? String(data.type) : '',
      website: data.website ? String(data.website) : '',
      city: data.city ? String(data.city) : '',
      address: data.address ? String(data.address) : '',
      name: data.name ? String(data.name) : '',
      nodal_name: data.nodal_name ? String(data.nodal_name) : '',
      nodal_designation: data.nodal_designation ? String(data.nodal_designation) : '',
      nodal_email: data.nodal_email ? String(data.nodal_email) : '',
      head_name: data.head_name ? String(data.head_name) : '',
      head_designation: data.head_designation ? String(data.head_designation) : '',
      head_email: data.head_email ? String(data.head_email) : '',
    };

    // Remove frontend-only keys
    delete payload.terms_check;
    delete payload.id;

    console.log('Payload to Backend:', payload);

    InstituteService.register(payload)
      .then((res) => {
        if (profilePage) {
          message.success(res.data.message || 'Profile updated successfully');
        } else {
          setRegDone(true);
        }
        if (callback) { callback(); }
      })
      .catch((e) => {
        message.error(e.message || 'Registration failed. Please try again.');
      })
      .finally(() => {
        util.hideLoader();
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load states
        const stateRes = await CmasterService.allStates({ status: 1 });
        setStates(stateRes.data?.result?.data || []);

        // Load institute details if editing profile
        if (profilePage) {
          const res = await InstituteService.detail(instituteId);
          const result = res.data?.result;

          // Validate and sanitize naac
          const validNaacGrades = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'D'];
          const naacValue = validNaacGrades.includes(result.naac) ? result.naac : '';

          setData((prev) => ({
            ...prev,
            ...result,
            naac: naacValue,
            nirf: result.nirf || '',
            nba: result.nba === '1' ? '1' : '0',
            etablished_after_2019: result.etablished_after_2019 ? String(result.etablished_after_2019) : '',
            aicte: [1, '1'].includes(result.aicte) ? 1 : 0,
            international_exposure: result.international_exposure ? String(result.international_exposure) : '',
            state_id: result.state_id ? String(result.state_id) : '',
            pincode: result.pincode ? String(result.pincode) : '',
          }));
        }
      } catch (err) {
        console.error('Error loading data:', err);
        message.error('Failed to load required data. Please refresh.');
      }
    };

    fetchData();
  }, [profilePage]);

  const isFormDisable = profilePage && data.status === 1 && util.isInstitute() === 1 && !util.isAutoLoggedIn();

  const naacGrades = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'D'];

  return (
    <div
      className={profilePage ? '' : 'h-100 cscroll round-input'}
      style={profilePage ? {} : { position: '', left: 0, right: 0, top: 0, bottom: 0 }}
    >
      {!profilePage && (
        <>
          {/* Header */}
          <div className="text-white p8" style={{ background: 'var(--theme-green-dark)' }}>
            <div className="container">
              <div className="d-flex align-items-center fs13">
                <div className="pr20">
                  {dynamicLogo ? (
                    <img 
                      src={dynamicLogo} 
                      width="150" 
                      height="60"
                      alt="Logo" 
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <img src="theme/img/sis-logo.png" width="150" alt="SIS Logo" />
                  )}
                </div>
                <div className="pr3 font-green1">
                  <i className="fa fa-envelope"></i>
                </div>
                <div className="pr30">info@studyindiascholarship.com</div>
                <div className="ml-auto">
                  <div className="d-flex">
                    <div className="pr3 font-green1">
                      <i className="fa fa-user-circle"></i>
                    </div>
                    <div className="cpointer" onClick={() => navigate('/login')}>
                      Institute Login
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div style={{ background: 'var(--theme-green-dark)' }}>
            <div className="container">
              <div className="fs22 text-white pt15 pb15">Institute Registration Form</div>
            </div>
          </div>
        </>
      )}

      <div className={profilePage ? 'w-75 mx-auto' : 'container pb20'}>
        <div className={profilePage ? '' : 'pt30'}>
          {isRegDone ? (
            <Result
              status="success"
              title="Successfully registered with us!"
              subTitle="Welcome email has been sent. We will contact you soon."
            />
          ) : (
            <div
              className={profilePage ? '' : 'border shadow overflow-hidden'}
              style={
                profilePage
                  ? {}
                  : { borderRadius: '20px', backgroundColor: '#fff' }
              }
            >
              {isFormDisable && (
                <Alert
                  message="After approval you cannot edit your details"
                  type="warning"
                  className="mb10"
                />
              )}

              <div className="position-relative" style={{ padding: isFormDisable ? '10px' : '0' }}>
                {isFormDisable && (
                  <div
                    style={{
                      position: 'absolute',
                      zIndex: 1,
                      left: 0,
                      top: 0,
                      width: '100%',
                      height: '100%',
                      background: 'rgba(0,0,0,0.05)',
                      borderRadius: '4px',
                    }}
                  ></div>
                )}

                <div className={profilePage ? '' : 'pt25 pl20 pr20 pb20'}>
                  {/* Institute Details */}
                  <div className="row mingap">
                    <div className="col-md-12 form-group">
                      <label className="req">Name of Institute</label>
                      <Input
                        size="large"
                        placeholder="Name of Institute"
                        value={data.name || ''}
                        onChange={(e) => handleChange(e.target.value, 'name')}
                        disabled={isFormDisable}
                      />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="req">Institute Address</label>
                      <Input
                        size="large"
                        placeholder="Institute Address"
                        value={data.address || ''}
                        onChange={(e) => handleChange(e.target.value, 'address')}
                        disabled={isFormDisable}
                      />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="req">Institute Website Url</label>
                      <Input
                        size="large"
                        placeholder="Institute Website Url"
                        value={data.website || ''}
                        onChange={(e) => handleChange(e.target.value, 'website')}
                        disabled={isFormDisable}
                      />
                    </div>

                    <div className="col-md-3 form-group">
                      <label className="req">State</label>
                      <AntdSelect
                        size="large"
                        placeholder="--State--"
                        showSearch
                        options={states.map((v) => ({ id: v.id, name: v.name }))}
                        value={data.state_id}
                        onChange={(v) => handleChange(v, 'state_id')}
                        disabled={isFormDisable}
                      />
                    </div>
                    <div className="col-md-3 form-group">
                      <label className="req">City</label>
                      <Input
                        size="large"
                        placeholder="City"
                        value={data.city || ''}
                        onChange={(e) => handleChange(e.target.value, 'city')}
                        disabled={isFormDisable}
                      />
                    </div>
                    <div className="col-md-3 form-group">
                      <label className="req">Zip Code</label>
                      <Input
                        size="large"
                        placeholder="Zip Code"
                        value={data.pincode || ''}
                        onChange={(e) => handleChange(e.target.value, 'pincode')}
                        disabled={isFormDisable}
                      />
                    </div>
                    <div className="col-md-3 form-group">
                      <label className="req">Type of Institute</label>
                      <AntdSelect
                        size="large"
                        placeholder="--Type of Institute--"
                        showSearch
                        options={['Public', 'Private']}
                        value={data.type}
                        onChange={(v) => handleChange(v, 'type')}
                        disabled={isFormDisable}
                      />
                    </div>
                  </div>

                  {/* Nodal Office */}
                  <Divider orientation="left">Nodal Office Details</Divider>
                  <div className="row mingap">
                    <div className="col-md-6 form-group">
                      <label className="req">Full Name</label>
                      <Input
                        size="large"
                        placeholder="Name"
                        value={data.nodal_name || ''}
                        onChange={(e) => handleChange(e.target.value, 'nodal_name')}
                        disabled={isFormDisable}
                      />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="req">Designation</label>
                      <Input
                        size="large"
                        placeholder="Designation"
                        value={data.nodal_designation || ''}
                        onChange={(e) => handleChange(e.target.value, 'nodal_designation')}
                        disabled={isFormDisable}
                      />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="req">Email</label>
                      <Input
                        size="large"
                        placeholder="Email"
                        value={data.nodal_email || ''}
                        onChange={(e) => handleChange(e.target.value, 'nodal_email')}
                        disabled={isFormDisable}
                      />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="req">Mobile</label>
                      <Input
                        size="large"
                        placeholder="Mobile"
                        value={data.nodal_mobile || ''}
                        onChange={(e) => handleChange(e.target.value, 'nodal_mobile')}
                        maxLength="10"
                        disabled={isFormDisable}
                      />
                    </div>
                  </div>

                  {/* Head of Institution */}
                  <Divider orientation="left">Head of Institution Details</Divider>
                  <div className="row mingap">
                    <div className="col-md-6 form-group">
                      <label className="req">Full Name</label>
                      <Input
                        size="large"
                        placeholder="Name"
                        value={data.head_name || ''}
                        onChange={(e) => handleChange(e.target.value, 'head_name')}
                        disabled={isFormDisable}
                      />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="req">Designation</label>
                      <Input
                        size="large"
                        placeholder="Designation"
                        value={data.head_designation || ''}
                        onChange={(e) => handleChange(e.target.value, 'head_designation')}
                        disabled={isFormDisable}
                      />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="req">Email (Will be used for login)</label>
                      <Input
                        size="large"
                        placeholder="Email"
                        value={data.head_email || ''}
                        onChange={(e) => handleChange(e.target.value, 'head_email')}
                        disabled={profilePage || isFormDisable}
                      />
                    </div>
                    <div className="col-md-6 form-group">
                      <label className="req">Mobile</label>
                      <Input
                        size="large"
                        placeholder="Mobile"
                        value={data.head_mobile || ''}
                        onChange={(e) => handleChange(e.target.value, 'head_mobile')}
                        maxLength="10"
                        disabled={isFormDisable}
                      />
                    </div>
                  </div>

                  {/* Accreditations & Features */}
                  <Divider />

                  <div className="row align-items-center">
                    {/* NAAC Grade */}
                    <div className="col-md-3 form-group">
                      <label>NAAC Grade</label>
                      <AntdSelect
                        size="large"
                        placeholder="Select Grade"
                        options={naacGrades.map((grade) => ({
                          value: grade,
                          label: grade,
                        }))}
                        value={data.naac}
                        onChange={(v) => handleChange(v, 'naac')}
                        disabled={isFormDisable}
                      />
                    </div>

                    {/* NIRF Ranking */}
                    <div className="col-md-3 form-group">
                      <label>NIRF Ranking</label>
                      <Input
                        size="large"
                        placeholder="Enter NIRF Rank"
                        value={data.nirf || ''}
                        onChange={(e) => handleChange(e.target.value, 'nirf')}
                        disabled={isFormDisable}
                      />
                    </div>

                    {/* NBA Accreditation */}
                    <div className="col-md-3 form-group">
                      <label className="d-block">Accreditation</label>
                      <Checkbox
                        checked={data.nba === '1'}
                        onChange={(e) => handleChange(e.target.checked ? '1' : '0', 'nba')}
                        disabled={isFormDisable}
                      >
                        NBA Accredited
                      </Checkbox>
                    </div>

                    {/* International Exposure */}
                    <div className="col-md-3 form-group">
                      <label className="d-block">Years of International Exposure</label>
                      <Input
                        size="large"
                        placeholder="Enter International Exposure"
                        value={data.international_exposure || ''}
                        onChange={(e) => handleChange(e.target.value, 'international_exposure')}
                        disabled={isFormDisable}
                      />

                    </div>

                    {/* Establishment Year */}
                    <div className="col-md-3 form-group">
                      <label>Establishment Year</label>
                      <Input
                        size="large"
                        type="number"
                        placeholder="e.g. 2015"
                        min="1900"
                        max="2025"
                        value={data.etablished_after_2019 || ''}
                        onChange={(e) => handleChange(e.target.value, 'etablished_after_2019')}
                        disabled={isFormDisable}
                      />
                    </div>

                    {/* AICTE Foreign Quota */}
                    <div className="col-md-3 form-group">
                      <label className="d-block">AICTE Foreign Quota</label>
                      <Checkbox
                        checked={data.aicte === 1}
                        onChange={(e) => handleChange(e.target.checked ? 1 : 0, 'aicte')}
                        disabled={isFormDisable}
                      >
                        AICTE Foreign Quota
                      </Checkbox>
                    </div>
                  </div>

                  {/* Terms & Submit */}
                  {!profilePage && (
                    <>
                      <div className="text-secondary pt10 d-flex">
                        <Checkbox
                          checked={data.terms_check}
                          onChange={(e) =>
                            setData({ ...data, terms_check: e.target.checked })
                          }
                          disabled={isFormDisable}
                        />
                        <div className="pl15">
                          I accept the terms of{' '}
                          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                            privacy policy
                          </a>{' '}
                          and would like to receive updates about Study India Scholarship.
                        </div>
                      </div>

                      <div className="pt25 d-flex align-items-center flex-wrap">
                        <div
                          className="pill-btn active w200 fs16 pt10 pb10 text-center"
                          onClick={register}
                        >
                          Register
                        </div>
                        <div className="ml-auto fs16">
                          Already have an account?{' '}
                          <span className="link" onClick={() => navigate('/login')}>
                            Login
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {profilePage && !isFormDisable && (
                    <div
                      className="pill-btn active w200 fs16 pt10 pb10 text-center mt15"
                      onClick={register}
                      style={{ background: 'linear-gradient(135deg, #588d93 0%, #568cb1 100%)' }}
                    >
                      Save
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import util from '../../utils/util';
import CompanyDetailForm from './CompanyDetailForm';
import UserService from '../../services/UserService';
import InstituteRegistration from '../institute/InstituteRegistration';
import FileService from '../../services/FileService';
import { message, Tabs, Image } from 'antd';

export default function Profile(props) {
  const { InstituteListPage = false, instituteId: propInstituteId = null, callback } = props;

  const userType = util.getUserType();
  const isStudentUser = userType ? userType === 'STUDENT' : !!util.isStudent();
  const isInstituteUser = userType ? userType === 'INSTITUTE' : !!util.isInstitute();
  const showInstituteProfileTab = InstituteListPage || isInstituteUser;

  // State for user profile and logo/banner
  const [profileData, setProfileData] = useState({
    fname: '',
    lname: '',
    name: '',
    email: '',
    mobile: '',
    emp_code: '',
    username: '',
  });
  const [lbData, setLBData] = useState({
    logo_file_id: null,
    logo_file_url: '',
    banner_file_id: null,
    banner_file_url: '',
  });
  const [isClientAdmin, setIsClientAdmin] = useState(false);

  // Determine active tab
  const [activeTab, setActiveTab] = useState(
    isStudentUser ? '5' : InstituteListPage ? '2' : isInstituteUser ? '2' : '1'
  );

  // Is viewing another institute (Super Admin case)
  const isOwnProfile = !propInstituteId || (isInstituteUser && !InstituteListPage);

  // Tab change handler
  const changeTab = (key) => setActiveTab(key);

  // Handle input changes
  const handleProfileChange = (e) => {
    setProfileData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setProfileData((prev) => ({
      ...prev,
      passData: {
        ...prev.passData,
        [e.target.name]: e.target.value,
      },
    }));
  };

  // Update user profile
  const updateProfile = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    util.showLoader();
    UserService.updateProfile(fd)
      .then(({ data }) => {
        message.success(data.message);
      })
      .catch((e) => message.error(e.message))
      .finally(() => util.hideLoader());
  };

  // Change password
  const changePassword = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    util.showLoader();
    UserService.changePassword(fd)
      .then(({ data }) => {
        message.success(data.message);
        setProfileData((prev) => ({
          ...prev,
          passData: {},
        }));
      })
      .catch((e) => message.error(e.message))
      .finally(() => util.hideLoader());
  };

  // Upload logo/banner
  const uploadDoc = async (e, fieldId, urlKey) => {
    if (!util.checkImage(e.target, 5)) return;
    util.showLoader();
    const file = e.target.files?.[0];
    const previewUrl = file ? URL.createObjectURL(file) : '';
    let previousUrl = '';
    try {
      if (previewUrl) {
        setLBData((prev) => {
          previousUrl = prev?.[urlKey] || '';
          return {
            ...prev,
            [urlKey]: previewUrl,
          };
        });
      }

      const rs = await FileService.upload(file);
      setLBData((prev) => ({
        ...prev,
        [fieldId]: rs.data.file_id,
        [urlKey]: rs.data.file_url,
      }));
    } catch (err) {
      message.error('Upload failed');
      if (previewUrl) {
        setLBData((prev) => ({
          ...prev,
          [urlKey]: previousUrl || prev?.[urlKey] || '',
        }));
      }
    } finally {
      e.target.value = '';
      util.hideLoader();
    }
  };

  // Save logo/banner
  const saveLogoBanner = (e) => {
    e.preventDefault();
    util.showLoader();
    UserService.saveLogoBanner({
      logo_file_id: lbData.logo_file_id,
      banner_file_id: lbData.banner_file_id,
    })
      .then(({ data }) => {
        message.success(data.message);
        try {
          window.dispatchEvent(new Event('instituteLogoChanged'));
        } catch (e) {}
        // Refresh logo/banner from backend after save
        return UserService.logoAndBanner();
      })
      .then((lbRes) => {
        const lb = lbRes.data.result;
        // Always use Node API for uploads
        const logoUrlRaw = util.normalizeUploadsUrl(lb.logo_file_url, 'node');
        const bannerUrlRaw = util.normalizeUploadsUrl(lb.banner_file_url, 'node');
        const logoUrl = logoUrlRaw ? `${logoUrlRaw}${logoUrlRaw.includes('?') ? '&' : '?'}v=${lb.logo_file_id || Date.now()}` : logoUrlRaw;
        const bannerUrl = bannerUrlRaw ? `${bannerUrlRaw}${bannerUrlRaw.includes('?') ? '&' : '?'}v=${lb.banner_file_id || Date.now()}` : bannerUrlRaw;
        setLBData({
          logo_file_id: lb.logo_file_id,
          logo_file_url: logoUrl,
          banner_file_id: lb.banner_file_id,
          banner_file_url: bannerUrl,
        });
      })
      .catch((e) => message.error(e.message))
      .finally(() => util.hideLoader());
  };

  // Initialize data
  useEffect(() => {
    const init = async () => {
      util.showLoader();
      setIsClientAdmin(util.isClientAdmin());
      try {
        if (isOwnProfile) {
          // Load logged-in user's profile
          const profileRes = await UserService.profileDetail();
          const pdata = profileRes.data.result;
          setProfileData({
            fname: pdata.fname,
            lname: pdata.lname,
            name: pdata.name,
            email: pdata.email,
            mobile: pdata.mobile,
            emp_code: pdata.emp_code,
            username: pdata.username,
          });

          if (isInstituteUser) {
            const lbRes = await UserService.logoAndBanner();
            const lb = lbRes.data.result;
            setLBData({
              logo_file_id: lb.logo_file_id,
              logo_file_url: lb.logo_file_url
                ? `${util.normalizeUploadsUrl(lb.logo_file_url, 'node')}${util.normalizeUploadsUrl(lb.logo_file_url, 'node').includes('?') ? '&' : '?'}v=${lb.logo_file_id || Date.now()}`
                : lb.logo_file_url,
              banner_file_id: lb.banner_file_id,
              banner_file_url: lb.banner_file_url
                ? `${util.normalizeUploadsUrl(lb.banner_file_url, 'node')}${util.normalizeUploadsUrl(lb.banner_file_url, 'node').includes('?') ? '&' : '?'}v=${lb.banner_file_id || Date.now()}`
                : lb.banner_file_url,
            });
          } else {
            setLBData({});
          }
        } else {
          // Super Admin: don't load user profile
          // InstituteRegistration will load data via instituteId
          setLBData({});
        }
      } catch (err) {
        message.error(err.message || 'Failed to load profile');
      } finally {
        util.hideLoader();
      }
    };

    init();
  }, [isOwnProfile, propInstituteId, isInstituteUser]);

  return (
    <div className="page-content">
      {!InstituteListPage && (
        <div className="page-head-gradient">
          <h2>{userType === 'STUDENT' ? 'Change Password' : 'Profile'}</h2>
        </div>
      )}

      <div className={!InstituteListPage ? 'page-pad' : ''}>
        <Tabs activeKey={activeTab} onChange={changeTab}>
          {/* User Profile (Non-Institute Users) */}
          {!isStudentUser && !isInstituteUser && !InstituteListPage && (
            <Tabs.TabPane tab="Profile" key="1">
              <form onSubmit={updateProfile} autoComplete="off" spellCheck="false">
                <div className="row mingap">
                  {profileData.username && (
                    <div className="form-group col-md-12">
                      <label>Username</label>
                      <div className="form-control bg-light">{profileData.username}</div>
                    </div>
                  )}
                  <div className="form-group col-md-12">
                    <label className="req">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fname"
                      value={profileData.fname || ''}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group col-md-12">
                    <label className="req">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lname"
                      value={profileData.lname || ''}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group col-md-12">
                    <label>Email</label>
                    <input
                      type="text"
                      className="form-control"
                      name="email"
                      value={profileData.email || ''}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group col-md-12">
                    <label className="req">Mobile</label>
                    <input
                      type="text"
                      className="form-control"
                      name="mobile"
                      value={profileData.mobile || ''}
                      onChange={handleProfileChange}
                      maxLength="10"
                    />
                  </div>
                  <div className="col-md-12">
                    <button type="submit" className="btn btn-info">
                      Update
                    </button>
                  </div>
                </div>
              </form>
            </Tabs.TabPane>
          )}

          {/* Institute Profile */}
          {showInstituteProfileTab && (
            <Tabs.TabPane tab="Institute Profile" key="2">
              <InstituteRegistration
                profilePage={true}
                callback={callback}
                instituteId={propInstituteId} // ✅ Pass to InstituteRegistration
              />
            </Tabs.TabPane>
          )}

          {/* Logo & Banner */}
          {(isInstituteUser || InstituteListPage) && (
            <Tabs.TabPane tab="Logo & Banner" key="3">
              <form onSubmit={saveLogoBanner} autoComplete="off" spellCheck="false">
                <div className="row mingap">
                  <div className="mx-2">
                    <div className="w-[200px] h-[120px] bdr mt-2 flex justify-center items-center">
                      <Image
                        width={194}
                        height={114}
                        style={{ objectFit: 'contain' }}
                        key={lbData.logo_file_url || 'logo'}
                        src={lbData.logo_file_url}
                        fallback="data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="
                        preview={{ mask: 'View' }}
                      />
                    </div>
                    <label className="ant-btn mt-1 w200">
                      <input
                        type="file"
                        className="d-none"
                        accept="image/*"
                        onChange={(e) => uploadDoc(e, 'logo_file_id', 'logo_file_url')}
                      />
                      <i className="fa fa-upload"></i> Upload Logo
                    </label>
                  </div>

                  <div className="mx-2">
                    <div className="w-[200px] h-[120px] bdr mt-2 flex justify-center items-center">
                      <Image
                        width={194}
                        height={114}
                        style={{ objectFit: 'contain' }}
                        key={lbData.banner_file_url || 'banner'}
                        src={lbData.banner_file_url}
                        fallback="data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="
                        preview={{ mask: 'View' }}
                      />
                    </div>
                    <label className="ant-btn mt-1 w200">
                      <input
                        type="file"
                        className="d-none"
                        accept="image/*"
                        onChange={(e) => uploadDoc(e, 'banner_file_id', 'banner_file_url')}
                      />
                      <i className="fa fa-upload"></i> Upload Banner
                    </label>
                  </div>

                  <div className="col-md-12 pt20">
                    <button type="submit" className="btn btn-info">
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </Tabs.TabPane>
          )}

          {/* Company Details */}
          {isClientAdmin && !InstituteListPage && (
            <Tabs.TabPane tab="Company Details" key="4">
              <CompanyDetailForm />
            </Tabs.TabPane>
          )}

          {/* Change Password */}
          {!InstituteListPage && (
            <Tabs.TabPane tab="Change Password" key="5">
              <form onSubmit={changePassword} autoComplete="off" spellCheck="false">
                <div className="row mingap">
                  <div className="form-group col-md-12">
                    <label className="req">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="current_password"
                      value={profileData.passData?.current_password || ''}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="form-group col-md-12">
                    <label className="req">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="new_password"
                      value={profileData.passData?.new_password || ''}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="form-group col-md-12">
                    <label className="req">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirm_password"
                      value={profileData.passData?.confirm_password || ''}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="col-md-12">
                    <button type="submit" className="btn btn-info">
                      Change Password
                    </button>
                  </div>
                </div>
              </form>
            </Tabs.TabPane>
          )}
        </Tabs>
      </div>
    </div>
  );
}
// //import {Switch} from 'react-router-dom';
// import { Routes, Route } from 'react-router-dom';
// import DefaultLayout from './pages/layouts/Default';
// //import LoginLayout from './pages/layouts/Login';

// import Login from './pages/Login';
// import StudentRegistration from './pages/student/Registration';
// import InstituteRegistration from './pages/institute/InstituteRegistration';

// import Dashboard from './pages/dashboard';

// import Profile from './pages/user/Profile';
// import User from './pages/user/User';
// import Role from './pages/user/Role';
// import Clients from './pages/Clients';
// import CMasters from './pages/cmasters';

// import Students from './pages/student/Students';

// import Institutes from './pages/institute/Institutes';
// import InstituteCourses from './pages/institute/Courses';
// import InstituteAbout from './pages/institute/About';
// import InstituteDocuments from './pages/institute/Documents';
// import InstituteStudents from './pages/institute/InsStudents';

// import ApplicationForm from './pages/student/ApplicationForm';
// import Comunications from './pages/student/Comunications';
// import Notifications from './pages/student/Notifications';
// import NotificationsInstitute from './pages/institute/Notifications';
// import Issues from './pages/student/Issues';
// import Result from './pages/student/Result';
// import ChoiceFilling from './pages/student/ChoiceFilling';

// import UploadPaymentProof from './pages/student/UploadPaymentProof';
// import DownloadVisaLetter from './pages/student/DownloadVisaLetter';
// // import UploadTicketDetails from './pages/student/UploadTicketDetails';
// import DownloadPickupSchedule from './pages/student/DownloadPickupSchedule';

// import AgentUrlLinks from './pages/user/AgentUrlLinks';
// import ForgotPassword from './pages/ForgotPassword';
// import ResetPassword from './pages/ResetPassword';
// import BlackListCountry from './pages/institute/BlackListCountry';
// import Registration from './pages/agent/Registration';
// import Agents from './pages/agent/Agent';
// import EmailTemplates from './pages/cmasters/EmailTemplates';
// import WhatsappTemplates from './pages/cmasters/WhatsappTemplates';
// import Campaign from './pages/cmasters/Campaign';
// import LeadAutomation from './pages/cmasters/LeadAutomation';
// import EmailCommunication from './pages/cmasters/EmailCommunication';
// // import WhatsappCommunication from './pages/cmasters/WhatsappCommunication';
// import Setting from './pages/cmasters/Setting';

// export default function AppRoutes() {
//     return (
//         <Routes>
//             <Route path="/" element={<Login />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/forgot-password" element={<ForgotPassword />} />
//             <Route path="/reset-password" element={<ResetPassword />} />
//             <Route path="/applynow" element={<StudentRegistration />} />
//             <Route path="/applynow/:agent_uid" element={<StudentRegistration />} />
//             <Route path="/partnership" element={<InstituteRegistration />} />
//             <Route path='/agents/registration' element={<Registration />} />
//             <Route path="/" element={<DefaultLayout />}>
//                 <Route path="dashboard" element={<Dashboard />} />
//                 <Route path="/profile" element={<Profile />} />
//                 <Route path="/roles" element={<Role />} />
//                 <Route path="/users" element={<User key="users" type="CLIENT" />} />
//                 {/* <Route path="/agents" element={<User key="agents" type="AGENT" />} /> */}
//                 <Route path="/agents" element={<Agents key="agents" type="AGENT" />} />
//                 <Route path="/clients" element={<Clients />} />
//                 <Route path="/cmasters" element={<CMasters />} />
//                 <Route path="/setting" element={<Setting />} />
//                 <Route path="/email-templates" element={<EmailTemplates />} />
//                 <Route path="/whatsapp-templates" element={<WhatsappTemplates />} />
//                 <Route path="/campaign-templates" element={<Campaign />} />
//                 <Route path="/applicant-response" element={<EmailCommunication />} />
//                 {/* <Route path="/whatsapp-communication" element={<WhatsappCommunication />} /> */}
//                 <Route path='/lead-assign-automation' element={<LeadAutomation />} />
//                 <Route path="/students" element={<Students />} />
//                 <Route path="/institutes" element={<Institutes />} />
//                 <Route path="/icourses" element={<InstituteCourses />} />
//                 <Route path="/istudents" element={<InstituteStudents />} />
//                 <Route path="/iabout" element={<InstituteAbout />} />
//                 <Route path="/idocuments" element={<InstituteDocuments />} />
//                 <Route path="/blacklist-Country" element={<BlackListCountry />} />
//                 <Route path="/student-application" exact element={<ApplicationForm />} />
//                 <Route path="/student-application/:step" element={<ApplicationForm />} />
//                 <Route path="/choice-filling" element={<ChoiceFilling />} />
//                 <Route path="/student-comunications" element={<Comunications />} />
//                 <Route path="/student-issues" element={<Issues />} />
//                 <Route path="/student-notifications" element={<Notifications />} />
//                 <Route path="/institute-notifications" element={<NotificationsInstitute />} />
//                 <Route path="/student-result" element={<Result />} />
//                 <Route path="/student-payment-proof" element={<UploadPaymentProof />} />
//                 <Route path="/student-visa-letter" element={<DownloadVisaLetter />} />
//                 {/* <Route path="/student-ticket-details" element={<UploadTicketDetails />} /> */}
//                 <Route path="/student-pickup-schedule" element={<DownloadPickupSchedule />} />
//                 <Route path="/agent-create-url-links" element={<AgentUrlLinks />} />
//                 <Route path="*" element={<Login />} />
//             </Route>
//         </Routes>
//     );
// }

//import {Switch} from 'react-router-dom';



import { Routes, Route, Navigate } from 'react-router-dom';
import DefaultLayout from './pages/layouts/Default';
import CmsStudioLayout from './pages/layouts/CmsStudio';
//import LoginLayout from './pages/layouts/Login';

import Login from './pages/Login';
import StudentRegistration from './pages/student/Registration';
import InstituteRegistration from './pages/institute/InstituteRegistration';

import Dashboard from './pages/dashboard';

import Profile from './pages/user/Profile';
import User from './pages/user/User';
import Role from './pages/user/Role';
import Clients from './pages/Clients';
import CMasters from './pages/cmasters';

import Students from './pages/student/Students';

import Institutes from './pages/institute/Institutes';
import InstituteCourses from './pages/institute/Courses';
import InstituteAbout from './pages/institute/About';
import InstituteDocuments from './pages/institute/Documents';
import InstituteStudents from './pages/institute/InsStudents';

import ApplicationForm from './pages/student/ApplicationForm';
import Comunications from './pages/student/Comunications';
import Notifications from './pages/student/Notifications';
import NotificationsInstitute from './pages/institute/Notifications';
import Issues from './pages/student/Issues';
import Result from './pages/student/Result';
import ChoiceFilling from './pages/student/ChoiceFilling';

import UploadPaymentProof from './pages/student/UploadPaymentProof';
import DownloadVisaLetter from './pages/student/DownloadVisaLetter';
import DownloadPickupSchedule from './pages/student/DownloadPickupSchedule';

import AgentUrlLinks from './pages/user/AgentUrlLinks';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import BlackListCountry from './pages/institute/BlackListCountry';
import Registration from './pages/agent/Registration';
import Agents from './pages/agent/Agent';
import EmailTemplates from './pages/cmasters/EmailTemplates';
import WhatsappTemplates from './pages/cmasters/WhatsappTemplates';
import Campaign from './pages/cmasters/Campaign';
import LeadAutomation from './pages/cmasters/LeadAutomation';
import EmailCommunication from './pages/cmasters/EmailCommunication';
// import WhatsappCommunication from './pages/cmasters/WhatsappCommunication';
import Setting from './pages/cmasters/Setting';
import LoginBackgroundChange from './pages/cmasters/LoginBackgroundChange';
import DashboardPreview from './pages/website-settings/DashboardPreview';
import ManageReviewsPage from './pages/website-settings/ManageReviewsPage';
import AdminConversations from './pages/conversations/AdminConversations';
import ApplicationEngineIndex from './pages/application-engine/ApplicationEngineIndex';



export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/student-login" element={<Login />} />
            <Route path="/institute-login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/applynow" element={<StudentRegistration />} />
            <Route path="/applynow/:agent_uid" element={<StudentRegistration />} />
            <Route path="/partnership" element={<InstituteRegistration />} />
            <Route path='/agents/registration' element={<Registration />} />
            <Route path="/" element={<DefaultLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/roles" element={<Role />} />
                <Route path="/users" element={<User key="users" type="CLIENT" />} />
                {/* <Route path="/agents" element={<User key="agents" type="AGENT" />} /> */}
                <Route path="/agents" element={<Agents key="agents" type="AGENT" />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/cmasters" element={<CMasters />} />
                <Route path="/application-engine" element={<ApplicationEngineIndex />} />
                <Route path="/setting" element={<Setting />} />
                <Route path="/email-templates" element={<EmailTemplates />} />
                <Route path="/whatsapp-templates" element={<WhatsappTemplates />} />
                <Route path="/campaign-templates" element={<Campaign />} />
                <Route path="/applicant-response" element={<EmailCommunication />} />
                {/* <Route path="/whatsapp-communication" element={<WhatsappCommunication />} /> */}
                <Route path='/lead-assign-automation' element={<LeadAutomation />} />
                <Route path="/students" element={<Students />} />
                <Route path="/institutes" element={<Institutes />} />
                <Route path="/icourses" element={<InstituteCourses />} />
                <Route path="/istudents" element={<InstituteStudents />} />
                <Route path="/iabout" element={<InstituteAbout />} />
                <Route path="/idocuments" element={<InstituteDocuments />} />
                <Route path="/blacklist-Country" element={<BlackListCountry />} />
                <Route path="/student-application" exact element={<ApplicationForm />} />
                <Route path="/student-application/:step" element={<ApplicationForm />} />
                <Route path="/choice-filling" element={<ChoiceFilling />} />
                <Route path="/student-comunications" element={<Comunications />} />
                <Route path="/student-issues" element={<Issues />} />
                <Route path="/institute-queries" element={<Issues />} />
                <Route path="/student-notifications" element={<Notifications />} />
                <Route path="/institute-notifications" element={<NotificationsInstitute />} />
                <Route path="/student-result" element={<Result />} />
                <Route path="/student-payment-proof" element={<UploadPaymentProof />} />
                <Route path="/student-visa-letter" element={<DownloadVisaLetter />} />
                <Route path="/student-pickup-schedule" element={<DownloadPickupSchedule />} />
                <Route path="/agent-create-url-links" element={<AgentUrlLinks />} />
                <Route path="/settings/backgrounds" element={<LoginBackgroundChange />} />
                <Route path="/manage-reviews" element={<ManageReviewsPage />} />
                <Route path="/conversations" element={<AdminConversations />} />

                <Route path="*" element={<Login />} />
            </Route>

            <Route path="/cms-studio" element={<Navigate to="/website-settings" replace />} />
            <Route path="/website-settings" element={<CmsStudioLayout />}>
                <Route index element={<DashboardPreview />} />
                <Route path="homepage" element={<Navigate to="/website-settings" replace />} />
                <Route path="navigation" element={<DashboardPreview />} />
                <Route path="hero" element={<DashboardPreview />} />
                <Route path="consultation-modal" element={<DashboardPreview />} />
                <Route path="support-rails" element={<DashboardPreview />} />
                <Route path="intro-section" element={<DashboardPreview />} />
                <Route path="city-details" element={<DashboardPreview />} />
                <Route path="universities" element={<DashboardPreview />} />
                <Route path="programs" element={<DashboardPreview />} />
                <Route path="testimonials" element={<DashboardPreview />} />
                <Route path="advisor-form" element={<DashboardPreview />} />
                <Route path="footer" element={<DashboardPreview />} />
                <Route path="about" element={<DashboardPreview />} />
                <Route path="contact" element={<DashboardPreview />} />
                <Route path="detail-pages" element={<DashboardPreview />} />
                <Route path="faqs" element={<DashboardPreview />} />
                <Route path="blogs" element={<DashboardPreview />} />
                <Route path="reviews" element={<DashboardPreview />} />
                <Route path="form-widgets" element={<DashboardPreview />} />
            </Route>


        </Routes>
    );
}

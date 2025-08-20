import React from "react";  
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Notfound from "./pages/Notfound";
import Sidebar from "./components/Sidebar";
import BlogManagementForm from "./BlogsManagement/BlogManagementForm";
import BlogManagementDashboard from "./BlogsManagement/BlogManagementDashboard";
import BlogList from "./BlogsManagement/BlogList";
import BlogEditForm from "./BlogsManagement/BlogEditForm";
import BlogView from "./BlogsManagement/BlogView";
// Dynamic Form Components
import FormManagementDashboard from "./DynamicForms/FormManagementDashboard";
import FormBuilder from "./DynamicForms/FormBuilder";
import FormSubmissionsView from "./DynamicForms/FormSubmissionsView";
import FormPreviewPage from "./DynamicForms/FormPreviewPage";
import LeadsManagement from "./DynamicForms/LeadsManagement";
import TeamManagement from "./TeamManagement/TeamManagement";
import TestimonialManagement from "./TestimonialManagement/TestimonialManagement";
// import AdminAuth from "./components/AdminAuth";
import AnnouncementForm from "./Announcement/AnnouncementForm";
import AnnouncementList from "./Announcement/AnnouncementList";
import AnnouncementPreview from "./Announcement/AnnouncementPreview";
import EmailTemplateManagement from "./DynamicForms/EmailTemplateManagement";

function AppWrapper() {
  const location = useLocation();
  // const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex">
       <Sidebar />
      <main
        className={
             "flex-grow ml-0 md:ml-64 transition-all duration-300"
            // "flex-grow"
        }
      >
        <Routes>
          <Route index element={<Home />} />
          <Route path="*" element={<Notfound />} />
          
          {/* Blog Management Routes */}
          <Route path="/blog-management" element={<BlogEditForm />} />
          <Route path="/blog-management/dashboard" element={<BlogManagementDashboard />} />
          <Route path="/blog-management/list" element={<BlogList />} />
          <Route path="/blog-management/create" element={<BlogEditForm />} />
          <Route path="/blog-management/edit/:blogId" element={<BlogEditForm />} />
          <Route path="/blog-management/view/:blogId" element={<BlogView />} />
          
          {/* Dynamic Form Management Routes */}
          <Route path="/form-management" element={<FormManagementDashboard />} />
          <Route path="/form-management/create" element={<FormBuilder />} />
          <Route path="/form-management/edit/:formId" element={<FormBuilder />} />
          <Route path="/form-management/submissions/:formId" element={<FormSubmissionsView />} />
          <Route path="/form-management/preview/:formId" element={<FormPreviewPage />} />
          <Route path="/leads-management" element={<LeadsManagement />} />
          <Route path="/teammanagement" element={<TeamManagement />} />
          <Route path="/testimonialmanagement" element={<TestimonialManagement />}  />
          <Route path="/announcement" element={<AnnouncementForm />} />
          <Route path="/announcement/list" element={<AnnouncementList />} />
          <Route path="/announcement/preview" element={<AnnouncementPreview />} />
          <Route path="/email-templates" element={<EmailTemplateManagement />} />
          {/* Public Form Route - This would typically be in your frontend app */}
          <Route path="/forms/:page" element={<FormPreviewPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { isTokenExpired } from "../utils/auth"; // path as per your structure
import { jwtDecode } from "jwt-decode";

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
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";

// Donation Management Components
import DonationDashboard from "./DonationManagement/DonationDashboard";
import DonationForm from "./DonationManagement/DonationForm";
import DonationView from "./DonationManagement/DonationView";
import UTMTrackingDashboard from "./DonationManagement/UTMTrackingDashboard";

// Event Management Components
import EventManagementList from "./EventManagement/EventManagmentList";

// Banner Management Components
import BannerManagement from "./pages/BannerManagement";
import CareerForm from "./pages/CareerForm";
function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = token && !isTokenExpired(token);

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      localStorage.removeItem("token");
      navigate("/"); // redirect to login
    }
  }, [token, navigate]);
  const shouldHideSidebar = location.pathname === "/utm-tracking-dashboard";

  return (
    <div className="flex">
      {/* <Sidebar /> */}
      {isLoggedIn && !shouldHideSidebar && <Sidebar />}

      <main
        className={
          isLoggedIn && !shouldHideSidebar
            ? "flex-grow ml-0 md:ml-64 transition-all duration-300"
            : "flex-grow"
        }
      >
        <Routes>
          <Route index element={<Login />} />

          {/* <Route path="*" element={<Notfound />} /> */}
          {isLoggedIn ? (
            <>
              {/* Blog Management Routes */}
              <Route path="/dashboard" element={<Home />} />
              <Route path="/banner" element={<BannerManagement />} />

              <Route path="/apply" element={<CareerForm />} />

              <Route path="/signUp" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/blog-management" element={<BlogEditForm />} />
              <Route
                path="/blog-management/dashboard"
                element={<BlogManagementDashboard />}
              />
              <Route path="/blog-management/list" element={<BlogList />} />
              <Route
                path="/blog-management/create"
                element={<BlogEditForm />}
              />
              <Route
                path="/blog-management/edit/:blogId"
                element={<BlogEditForm />}
              />
              <Route
                path="/blog-management/view/:blogId"
                element={<BlogView />}
              />

              {/* Dynamic Form Management Routes */}
              <Route
                path="/form-management"
                element={<FormManagementDashboard />}
              />
              <Route path="/form-management/create" element={<FormBuilder />} />
              <Route
                path="/form-management/edit/:formId"
                element={<FormBuilder />}
              />
              <Route
                path="/form-management/submissions/:formId"
                element={<FormSubmissionsView />}
              />
              <Route
                path="/form-management/preview/:formId"
                element={<FormPreviewPage />}
              />
              <Route path="/leads-management" element={<LeadsManagement />} />
              <Route path="/teammanagement" element={<TeamManagement />} />
              <Route
                path="/testimonialmanagement"
                element={<TestimonialManagement />}
              />
              <Route path="/announcement" element={<AnnouncementForm />} />
              <Route path="/announcement/list" element={<AnnouncementList />} />
              <Route
                path="/announcement/preview"
                element={<AnnouncementPreview />}
              />
              <Route
                path="/email-templates"
                element={<EmailTemplateManagement />}
              />

              {/* Donation Management Routes */}
              <Route
                path="/donation-management"
                element={<DonationDashboard />}
              />
              <Route
                path="/donation-management/create"
                element={<DonationForm />}
              />
              <Route
                path="/donation-management/edit/:id"
                element={<DonationForm />}
              />
              <Route
                path="/donation-management/view/:id"
                element={<DonationView />}
              />
              <Route
                path="/utm-tracking-dashboard"
                element={<UTMTrackingDashboard />}
              />

              {/* Public Form Route - This would typically be in your frontend app */}
              <Route path="/forms/:page" element={<FormPreviewPage />} />
              <Route path="/events/list" element={<EventManagementList />} />
            </>
          ) : (
            <Route path="*" element={<Login />} />
          )}
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

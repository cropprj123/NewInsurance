/* eslint-disable no-unused-vars */
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./page/HomePage";
import SignupPage from "./page/SignupPage";
import SigninPage from "./page/SigninPage";
import Insurance from "./page/Insurance";
import DashLayout from "./components/DashLayout";
import AdminDashboard from "./components/DashboardComponents/AdminDashboard";
import UsersInformation from "./page/UsersInformation";
import ErrorBoundary from "./ErrorBoundary";
import InsuranceDetail from "./components/InsuranceDetail";
import AssignAgents from "./components/DashboardComponents/AssignAgents";
import FeaturesPage from "./page/FeaturePage"; // Import the FeaturesPage component
import Location from "./page/Aboutus";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="max-w-8xl mx-auto">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SigninPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/about-us" element={<Location />} />
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/insurance/:id" element={<InsuranceDetail />} />
            {/* Updated Features routes */}
            <Route path="/features/*" element={<FeaturesPage />} />
            <Route path="/profile" element={<DashLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="farmer-profile/:id" element={<UsersInformation />} />
              <Route path="assign-agents" element={<AssignAgents />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

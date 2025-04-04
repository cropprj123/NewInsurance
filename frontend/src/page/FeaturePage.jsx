import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Leaf,
  Sprout,
  Cloud,
  Brain,
  CloudRain,
  MapPin,
  Search,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from "lucide-react";
import { FaBriefcaseMedical } from "react-icons/fa";

const FeaturesPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    analysis: true,
    recommendations: true,
    chatbots: true,
    reports: true
  });

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="md:hidden bg-mycol-dartmouth_green p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Smart Farming</h2>
        <button
          onClick={toggleMenu}
          className="text-white focus:outline-none"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${isMenuOpen ? 'block' : 'hidden'
          } md:block w-full md:w-80 flex-shrink-0 bg-mycol-dartmouth_green text-white overflow-y-auto transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen' : 'max-h-0 md:max-h-screen'
          }`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-8 hidden md:block">Smart Farming</h2>
          <nav className="space-y-4">
            {/* Analysis Category */}
            <div className="border-b border-green-500/30 pb-2">
              <button
                onClick={() => toggleCategory('analysis')}
                className="flex items-center justify-between w-full p-2 text-left font-medium text-white hover:bg-green-500/10 rounded-lg"
              >
                <span>Analysis Tools</span>
                {expandedCategories.analysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedCategories.analysis && (
                <div className="ml-2 mt-2 space-y-1">
                  <NavLink
                    to="/features"
                    end
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Leaf className="w-5 h-5" />
                    <span>Disease Detection</span>
                  </NavLink>

                  <NavLink
                    to="/features/weather"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Cloud className="w-5 h-5" />
                    <span>Crop Video Analysis</span>
                  </NavLink>

                  <NavLink
                    to="/features/soil"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Sprout className="w-5 h-5" />
                    <span>Soil Analysis</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Recommendations Category */}
            <div className="border-b border-green-500/30 pb-2">
              <button
                onClick={() => toggleCategory('recommendations')}
                className="flex items-center justify-between w-full p-2 text-left font-medium text-white hover:bg-green-500/10 rounded-lg"
              >
                <span>Recommendations</span>
                {expandedCategories.recommendations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedCategories.recommendations && (
                <div className="ml-2 mt-2 space-y-1">
                  <NavLink
                    to="/features/crop-recommendation"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Leaf className="w-5 h-5" />
                    <span>Crop Recommendation</span>
                  </NavLink>

                  <NavLink
                    to="/features/fertilizer-recommendation"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Leaf className="w-5 h-5" />
                    <span>Fertilizer Recommendation</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Chatbots Category */}
            <div className="border-b border-green-500/30 pb-2">
              <button
                onClick={() => toggleCategory('chatbots')}
                className="flex items-center justify-between w-full p-2 text-left font-medium text-white hover:bg-green-500/10 rounded-lg"
              >
                <span>AI Assistants</span>
                {expandedCategories.chatbots ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedCategories.chatbots && (
                <div className="ml-2 mt-2 space-y-1">
                  <NavLink
                    to="/features/general-expert"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Brain className="w-5 h-5" />
                    <span>AI-Expert</span>
                  </NavLink>

                  <NavLink
                    to="/features/disease-expert"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaBriefcaseMedical className="w-5 h-5" />
                    <span>Disease AI-Expert</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Weather & Reports Category */}
            <div className="border-b border-green-500/30 pb-2">
              <button
                onClick={() => toggleCategory('reports')}
                className="flex items-center justify-between w-full p-2 text-left font-medium text-white hover:bg-green-500/10 rounded-lg"
              >
                <span>Weather & Reports</span>
                {expandedCategories.reports ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedCategories.reports && (
                <div className="ml-2 mt-2 space-y-1">
                  <NavLink
                    to="/features/forecast"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <CloudRain className="w-5 h-5" />
                    <span>Weather Forecast</span>
                  </NavLink>

                  <NavLink
                    to="/features/disease-report"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MapPin className="w-5 h-5" />
                    <span>Report Disease</span>
                  </NavLink>

                  <NavLink
                    to="/features/disease-reports"
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Search className="w-5 h-5" />
                    <span>Nearby Diseases</span>
                  </NavLink>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;

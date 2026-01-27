import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaClipboardList, 
  FaTrophy, 
  FaChartBar, 
  FaCalendarAlt,
  FaBed,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaSignOutAlt,
  FaYoutubeSquare,
  FaHackerNewsSquare,
  FaPlus,
  FaList,
  FaUserFriends,
  FaHeart
} from 'react-icons/fa';
import logo from '../assets/DTG.png'
import logo2 from '../../public/logo.png'

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        const response = await fetch('https://api.harekrishnavidya.org/api/admin/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin data');
        }

        const data = await response.json();
        setAdminData(data.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchAdminData();
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Close sidebar on mobile by default, open on desktop
      setIsOpen(!mobile);
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarRoutes = [
  
  

    { 
      path: '/dashboard', 
      icon: <FaHome className="text-blue-900" />, 
      label: 'Dashboard',
      color: 'from-blue-300 to-blue-200'
    },
    { 
      path: '/leads-management', 
      icon: <FaUsers className="text-blue-900" />, 
      label: 'Lead Management',
      color: 'from-blue-300 to-blue-200'
    },
    { 
      path: '/teammanagement', 
      icon: <FaUserFriends className="text-blue-900" />, 
      label: 'Team Management',
      color: 'from-blue-300 to-blue-200'
    },
    { 
      path: '/blog-management', 
      icon: <FaClipboardList className="text-blue-900" />, 
      label: 'Blog Management',
      color: 'from-blue-300 to-blue-200',
      hasSubmenu: true,
      submenu: [
        {
          path: '/blog-management/list',
          icon: <FaList className="text-blue-900" />,
          label: 'All Blogs'
        },
        {
          path: '/blog-management/create',
          icon: <FaPlus className="text-blue-900" />,
          label: 'Create Blog'
        }
      ]
    },
    { 
      path: '/testimonialmanagement', 
      icon: <FaTrophy className="text-blue-900" />, 
      label: 'Testimonials',
      color: 'from-blue-300 to-blue-200'
    },
    { 
      path: '/donation-management', 
      icon: <FaHeart className="text-blue-900" />, 
      label: 'Razorpay Donation Management',
      color: 'from-blue-300 to-blue-200'
    },
    { 
      path: '/utm-tracking-dashboard', 
      icon: <FaChartBar className="text-blue-900" />, 
      label: 'UTM Tracking Dashboard',
      color: 'from-blue-300 to-blue-200'
    },
    // { 
    //   path: '/announcement/list', 
    //   icon: <FaHackerNewsSquare className="text-blue-900" />, 
    //   label: 'Announcement',
    //   color: 'from-blue-300 to-blue-200'
    // },
     { 
      path: '/events/list', 
      icon: <FaHackerNewsSquare className="text-blue-900" />, 
      label: 'Event Management',
      color: 'from-blue-300 to-blue-200'
    },
    // { 
    //   path: '/apply', 
    //   icon: <FaHackerNewsSquare className="text-blue-900" />, 
    //   label: 'Career Form',
    //   color: 'from-blue-300 to-blue-200'
    // },
    { 
      path: '/appliedstatus', 
      icon: <FaHackerNewsSquare className="text-blue-900" />, 
      label: 'Applied Forms',
      color: 'from-blue-300 to-blue-200'
    },
    { 
      path: '/donation-kit-management', 
      icon: <FaHackerNewsSquare className="text-blue-900" />, 
      label: 'Donation Kit Management',
      color: 'from-blue-300 to-blue-200'
    },
  ];

  // Mobile toggle button
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  // Toggle submenu expansion
  const toggleSubmenu = (menuPath) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuPath]: !prev[menuPath]
    }));
  };

  // Check if a route is active (including submenu items)
  const isRouteActive = (route) => {
    if (route.hasSubmenu) {
      return route.submenu.some(subItem => location.pathname === subItem.path);
    }
    return location.pathname === route.path;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={toggleSidebar}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white shadow-lg transition-all duration-300 ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <FaBars className="w-5 h-5" />
      </button>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-30 transition-opacity duration-300 bg-black bg-opacity-50"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full w-64 bg-blue-100 text-white shadow-2xl z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Close button for mobile */}
        {isMobile && (
          <button 
            onClick={toggleSidebar}
            className="absolute p-1 transition-colors rounded-full top-4 right-4 hover:bg-gray-300"
          >
            <FaTimes className="w-5 h-5 text-blue-900" />
          </button>
        )}

        {/* Logo/Brand */}
        <div className="p-4 pb-3 border-b border-gray-300">
          <div className="flex items-center justify-center">
            <img src={logo2} alt="Logo" className="object-contain w-full h-16" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-3 px-3 overflow-y-auto h-[calc(100%-180px)]">
          {sidebarRoutes.map((route) => (
            <div key={route.path}>
              {route.hasSubmenu ? (
                // Menu item with submenu
                <div>
                  <button
                    onClick={() => toggleSubmenu(route.path)}
                    className={`
                      w-full relative flex items-center p-3 my-1 rounded-lg transition-all duration-200
                      ${isRouteActive(route) ? 
                        `bg-gradient-to-r ${route.color} shadow-md` : 
                        'hover:bg-gray-300'}
                    `}
                    onMouseEnter={() => setHoveredItem(route.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className={`mr-3 text-lg transition-transform duration-200 ${
                      hoveredItem === route.path ? 'scale-110' : ''
                    }`}>
                      {route.icon}
                    </span>
                    <span className="text-sm font-medium text-blue-900">{route.label}</span>
                    
                    {/* Expandable chevron */}
                    <FaChevronRight 
                      className={`ml-auto text-xs transition-all duration-300 ${
                        expandedMenus[route.path] ? 'rotate-90' : ''
                      } ${
                        hoveredItem === route.path || isRouteActive(route) ? 
                        'opacity-100 translate-x-0 text-blue-900' : 
                        'opacity-0 -translate-x-2'
                      }`} 
                    />
                    
                    {/* Active indicator */}
                    {isRouteActive(route) && (
                      <span className="absolute right-0 w-1 h-6 transform -translate-y-1/2 bg-blue-700 rounded-l-full top-1/2"></span>
                    )}
                  </button>
                  
                  {/* Submenu */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedMenus[route.path] ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="ml-4 space-y-1">
                      {route.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`
                            flex items-center p-2 rounded-lg transition-all duration-200 text-sm
                            ${location.pathname === subItem.path ? 
                              'bg-gray-300' : 
                              'text-gray-700 hover:bg-gray-300'}
                          `}
                          onClick={() => isMobile && toggleSidebar()}
                        >
                          <span className="mr-2 text-sm">{subItem.icon}</span>
                          <span className='text-blue-900'>{subItem.label}</span>
                          
                          {/* Active indicator for submenu items */}
                          {location.pathname === subItem.path && (
                            <span className="w-1 h-4 ml-auto bg-blue-700 rounded-l-full"></span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Regular menu item
                <Link 
                  to={route.path} 
                  className={`
                    relative flex items-center p-3 my-1 rounded-lg transition-all duration-200
                    ${location.pathname === route.path ? 
                      `bg-gradient-to-r ${route.color} shadow-md` : 
                      'hover:bg-gray-300'}
                  `}
                  onMouseEnter={() => setHoveredItem(route.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => isMobile && toggleSidebar()}
                >
                  <span className={`mr-3 text-lg transition-transform duration-200 ${
                    hoveredItem === route.path ? 'scale-110' : ''
                  }`}>
                    {route.icon}
                  </span>
                  <span className="text-sm font-medium text-blue-900">{route.label}</span>
                  
                  {/* Animated chevron */}
                  <FaChevronRight 
                    className={`ml-auto text-xs transition-all duration-300 ${
                      hoveredItem === route.path || location.pathname === route.path ? 
                      'opacity-100 translate-x-0 text-blue-900' : 
                      'opacity-0 -translate-x-2'
                    }`} 
                  />
                  
                  {/* Active indicator */}
                  {location.pathname === route.path && (
                    <span className="absolute right-0 w-1 h-6 transform -translate-y-1/2 bg-blue-700 rounded-l-full top-1/2"></span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-800 border-t border-gray-700">
          <div 
            className="flex items-center p-2 transition-colors duration-200 rounded-lg cursor-pointer hover:bg-gray-700"
            onClick={() => setShowPremiumModal(true)}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              <span className="text-sm font-bold text-white">
                {adminData?.name ? adminData.name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-white">
                Admin Panel
              </p>
              <p className="text-xs text-gray-400">
                {adminData?.role ? adminData.role.charAt(0).toUpperCase() + adminData.role.slice(1) : 'Administrator'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 rounded-lg shadow-xl bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Admin Profile</h2>
              <button 
                onClick={() => setShowPremiumModal(false)}
                className="text-gray-400 transition-colors duration-200 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              {adminData ? (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                      <span className="text-2xl font-bold text-white">
                        {adminData.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{adminData.name}</h3>
                      <p className="text-sm text-gray-400">{adminData.role}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-blue-400">Mobile Number</p>
                        <p className="text-sm text-white">{adminData.mobileNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="py-4 text-center text-white">Loading admin data...</p>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-white transition-colors duration-200 bg-red-600 rounded-lg hover:bg-red-700"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
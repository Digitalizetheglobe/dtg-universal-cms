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
  FaUserFriends
} from 'react-icons/fa';
import logo from '../assets/DTG.png'
import logo2 from '../assets/ac-logo.png'

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

        const response = await fetch('http://localhost:5000/api/admin/me', {
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
        // Handle error (e.g., redirect to login)
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
      path: '/', 
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
      path: '/form-management', 
      icon: <FaChartBar className="text-blue-900" />, 
      label: 'Form Management',
      color: 'from-blue-300 to-blue-200'
    },
    { 
      path: '/outpass/management', 
      icon: <FaYoutubeSquare className="text-blue-900" />, 
      label: 'Media Manager',
      color: 'from-blue-300 to-blue-200'
    },
    { 
      path: '/announcement/list', 
      icon: <FaHackerNewsSquare className="text-blue-900" />, 
      label: 'Announcement',
      color: 'from-blue-300 to-blue-200'
    },
    // { 
    //   path: '/hostel/management', 
    //   icon: <FaBed className="text-teal-300" />, 
    //   label: 'Hostel Management',
    //   color: 'from-teal-500 to-teal-700'
    // },
    // { 
    //   path: '/employee/dashboard', 
    //   icon: <FaClipboardList className="text-teal-300" />, 
    //   label: 'Employee Management',
    //   color: 'from-green-500 to-green-700'
    // }, 
  ];

  // Mobile toggle button
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); // Or redirect to login page
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
        className={`md:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-gray-800 text-white shadow-lg transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}
      >
        <FaBars className="w-5 h-5" />
      </button>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full w-56 md:w-64 bg-blue-100 text-white shadow-2xl z-40 transition-all duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Close button for mobile */}
        {isMobile && (
          <button 
            onClick={toggleSidebar}
            className="absolute top-0 p-1 transition-colors rounded-full right-3 hover:bg-gray-700"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}

        {/* Logo/Brand */}
        <div className="p-4 pb-3 border-b border-gray-700 md:p-6 md:pb-4">
          {/* <h1 className="text-xl font-bold text-transparent md:text-2xl bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Cadet Management
          </h1>
          <p className="mt-1 text-xs text-gray-400">Leadership Development System</p> */}
          <div className="flex items-center justify-center">
            {/* <img src={logo} alt="Logo" className="w-16 h-16 rounded-full" /> */}
            <img src={logo2} alt="Logo" className="w-fullrounded-full" />
            {/* <h1 className="ml-2 text-xl font-bold text-transparent md:text-2xl bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Qstudy CMS
            </h1> */}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-3 md:mt-4 px-2 md:px-4 overflow-y-auto h-[calc(100%-180px)]">
          {sidebarRoutes.map((route) => (
            <div key={route.path}>
              {route.hasSubmenu ? (
                // Menu item with submenu
                <div>
                  <button
                    onClick={() => toggleSubmenu(route.path)}
                    className={`
                      w-full relative flex items-center p-3 my-1 md:my-2 rounded-lg transition-all duration-200
                      ${isRouteActive(route) ? 
                        `bg-gradient-to-r ${route.color} shadow-md` : 
                        'hover:bg-gray-300'}
                    `}
                    onMouseEnter={() => setHoveredItem(route.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className={`mr-2 md:mr-3 text-base md:text-lg transition-transform duration-200 ${hoveredItem === route.path ? 'scale-110' : ''}`}>
                      {route.icon}
                    </span>
                    <span className="text-sm font-medium text-blue-900 md:text-base">{route.label}</span>
                    
                    {/* Expandable chevron */}
                    <FaChevronRight 
                      className={`ml-auto text-xs transition-all duration-300 ${expandedMenus[route.path] ? 'rotate-90' : ''} ${hoveredItem === route.path || isRouteActive(route) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} 
                    />
                    
                    {/* Active indicator */}
                    {isRouteActive(route) && (
                      <span className="absolute right-0 w-1 h-6 transform -translate-y-1/2 bg-white rounded-l-full top-1/2 md:h-8"></span>
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {expandedMenus[route.path] && (
                    <div className="ml-4 space-y-1">
                      {route.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`
                            flex items-center p-2 rounded-lg transition-all duration-200 text-sm
                            ${location.pathname === subItem.path ? 
                              'bg-gray-300 text-white' : 
                              'text-gray-300 hover:bg-gray-300 hover:text-white'}
                          `}
                        >
                          <span className="mr-2 text-sm">{subItem.icon}</span>
                          <span className='text-blue-900'>{subItem.label}</span>
                          
                          {/* Active indicator for submenu items */}
                          {location.pathname === subItem.path && (
                            <span className="w-1 h-4 ml-auto bg-white rounded-l-full"></span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular menu item
                <Link 
                  to={route.path} 
                  className={`
                    relative flex items-center p-3 my-1 md:my-2 rounded-lg transition-all duration-200
                    ${location.pathname === route.path ? 
                      `bg-gradient-to-r ${route.color} shadow-md` : 
                      'hover:bg-gray-300'}
                  `}
                  onMouseEnter={() => setHoveredItem(route.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span className={`mr-2 md:mr-3 text-base md:text-lg transition-transform duration-200 ${hoveredItem === route.path ? 'scale-110' : ''}`}>
                    {route.icon}
                  </span>
                  <span className="text-sm font-medium text-blue-900 md:text-base">{route.label}</span>
                  
                  {/* Animated chevron */}
                  <FaChevronRight 
                    className={`ml-auto text-xs transition-all duration-300 ${hoveredItem === route.path || location.pathname === route.path ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} 
                  />
                  
                  {/* Active indicator */}
                  {location.pathname === route.path && (
                    <span className="absolute right-0 w-1 h-6 transform -translate-y-1/2 bg-white rounded-l-full top-1/2 md:h-8"></span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-800 border-t border-gray-700 md:p-4">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => setShowPremiumModal(true)}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-purple-600">
              <span className="text-sm font-bold text-white md:text-base">
                {adminData?.name ? adminData.name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div className="ml-2 md:ml-3">
              <p className="text-xs font-medium md:text-sm">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 rounded-lg shadow-xl bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Admin Profile</h2>
              <button 
                onClick={() => setShowPremiumModal(false)}
                className="text-gray-400 hover:text-white"
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
                      <h3 className="text-lg font-semibold">{adminData.name}</h3>
                      <p className="text-sm text-gray-400">{adminData.role}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-blue-400">Mobile Number</p>
                        <p className="text-sm text-white">{adminData.mobileNumber || 'N/A'}</p>
                      </div>
                      {/* <div>
                        <p className="text-xs text-blue-400">Admin ID</p>
                        <p className="text-sm text-white">{adminData.id}</p>
                      </div> */}
                    </div>
                  </div>
                </>
              ) : (
                <p className="py-4 text-center">Loading admin data...</p>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
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
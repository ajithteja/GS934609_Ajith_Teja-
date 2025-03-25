import { useState, useEffect, JSX } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaStore,
  FaBox,
  FaChartBar,
  FaClipboardList,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { MdOutlineStore } from 'react-icons/md';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(window.innerWidth >= 768); //  Explicitly typed

  // Handle Window Resize
  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  //  Handle Navigation & Auto-Close on Small Screens
  const handleNavigation = (path: string): void => {
    navigate(path);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <div>
      {/* 🔹 Toggle Button (for Small Screens) */}
      {/* <button
        className="cursor-pointer md:hidden bg-gray-600 toggle-btn"
        onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes size={12} /> : <FaBars size={12} />}
      </button> */}

      <div
        className={` bg-gray-100 p-  top-15 left-0 h-[calc(100vh-80px)] transition-all duration-200 shadow-lg z-40 ${
          isOpen ? 'fixed  w-64 mt-5 md:mt-0' : 'w-16'
        } md:relative md:w-64 md:top-0`}>
        <ul className="mt- md:mt-0 md:relative">
          <li
            className={`md:hidden side-bar-text flex items-center pl-6 space-x-3 cursor-pointer h-16 rounded-none transition-colors duration-50
    
      `}
            onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes size={12} /> : <FaBars size={12} />}
          </li>

          <SidebarItem
            icon={<MdOutlineStore size={22} />}
            label="Store"
            isOpen={isOpen}
            currentPath={location.pathname}
            path="/"
            onClick={() => handleNavigation('/')}
          />
          <SidebarItem
            icon={<FaBox size={22} />}
            label="SKU"
            isOpen={isOpen}
            currentPath={location.pathname}
            path="/skus"
            onClick={() => handleNavigation('/skus')}
          />
          <SidebarItem
            icon={<FaClipboardList size={22} />}
            label="Planning"
            isOpen={isOpen}
            currentPath={location.pathname}
            path="/planning"
            onClick={() => handleNavigation('/planning')}
          />
          <SidebarItem
            icon={<FaChartBar size={22} />}
            label="Charts"
            isOpen={isOpen}
            currentPath={location.pathname}
            path="/chart"
            onClick={() => handleNavigation('/chart')}
          />
        </ul>
      </div>

      {/* 🔹 Overlay (for Small Screens) */}
      {isOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-30"
          onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  );
};

//  Define Props for SidebarItem
interface SidebarItemProps {
  icon: JSX.Element;
  label: string;
  isOpen: boolean;
  path: string;
  currentPath: string;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  isOpen,
  path,
  currentPath,
  onClick,
}) => (
  <li
    className={`side-bar-text flex items-center pl-6 space-x-3 cursor-pointer h-16 rounded-none transition-colors duration-50
      ${
        currentPath === path
          ? 'side-bar-bg text-gray-700'
          : 'text-gray-700 side-bar-bg-on-h'
      }`}
    onClick={onClick}>
    {icon}
    {isOpen && <span>{label}</span>}
  </li>
);

export default Sidebar;

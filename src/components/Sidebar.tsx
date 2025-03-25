import { useState, useEffect, JSX } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
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
  const [isOpen, setIsOpen] = useState<boolean>(window.innerWidth >= 768);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768);
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getIconSize = () => {
    return windowWidth < 768 ? 16 : 22;
  };

  const handleNavigation = (path: string): void => {
    navigate(path);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div
        className={` md:static h-screen bg-gray-100 shadow-lg transition-transform duration-300 ease-in-out z-40 ${
          isOpen
            ? 'translate-x-0 w-34 md:w-64'
            : 'w-16 md:translate-x-0 -translate-x-0'
        }`}>
        <ul className="mt-4 md:mt-0">
          <li
            className={`side-bar-bg-on-h text-gray-700 md:hidden side-bar-text flex items-center pl-6 space-x-3 cursor-pointer h-10 rounded-none transition-colors duration-50
    
      `}
            onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes size={14} /> : <FaBars size={10} />}
          </li>

          <SidebarItem
            icon={<MdOutlineStore size={getIconSize()} />}
            label="Store"
            isOpen={isOpen}
            currentPath={location.pathname}
            path="/"
            onClick={() => handleNavigation('/')}
          />
          <SidebarItem
            icon={<FaBox size={getIconSize()} />}
            label="SKU"
            isOpen={isOpen}
            currentPath={location.pathname}
            path="/skus"
            onClick={() => handleNavigation('/skus')}
          />
          <SidebarItem
            icon={<FaClipboardList size={getIconSize()} />}
            label="Planning"
            isOpen={isOpen}
            currentPath={location.pathname}
            path="/planning"
            onClick={() => handleNavigation('/planning')}
          />
          <SidebarItem
            icon={<FaChartBar size={getIconSize()} />}
            label="Charts"
            isOpen={isOpen}
            currentPath={location.pathname}
            path="/chart"
            onClick={() => handleNavigation('/chart')}
          />
        </ul>
      </div>

      {isOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

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
    className={`side-bar-text flex items-center pl-6 space-x-3 cursor-pointer h-14 rounded-none transition-colors duration-50
      md:h-16

      ${
        currentPath === path
          ? 'side-bar-bg text-gray-700'
          : 'text-gray-700 side-bar-bg-on-h'
      }`}
    onClick={onClick}>
    <div className="flex items-center">
      {icon}
      {isOpen && (
        <span className="ml-3 text-xs sm:text-sm md:text-base">{label}</span>
      )}
    </div>
  </li>
);

export default Sidebar;

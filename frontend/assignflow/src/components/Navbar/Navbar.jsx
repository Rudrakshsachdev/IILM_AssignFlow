import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';

const Navbar = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? <MobileNavbar /> : <DesktopNavbar />;
};

export default Navbar;

import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import DesktopHero from './DesktopHero';
import MobileHero from './MobileHero';

const Hero = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? <MobileHero /> : <DesktopHero />;
};

export default Hero;

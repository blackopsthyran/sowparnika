import { HiCube, HiNewspaper, HiPhoneArrowUpRight } from 'react-icons/hi2';
import { IconType } from 'react-icons/lib';

export type navigationLink = {
  title: string;
  link: string;
  icon: IconType;
};

export const navigationLinks: Array<navigationLink> = [
  { title: 'Properties', link: '/properties', icon: HiCube },
  { title: 'Contact', link: '/contact', icon: HiNewspaper },
  {
    title: '+91 9446211417',
    link: 'tel:+919446211417',
    icon: HiPhoneArrowUpRight,
  },
];

import React from 'react';
import './Brand.css';

// PrimeStay mark: a roofline over a bed-and-doorway "P", drawn inline so it follows the theme colours.
export const BrandMark = ({ size }) => (
  <svg className="brand-mark" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <rect className="brand-mark-bg" width="40" height="40" rx="12" />
    <path className="brand-mark-fg" d="M11 29V12.5h8.2a5.3 5.3 0 0 1 0 10.6H15.5" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <path className="brand-mark-fg" d="M23.5 29V19.8h6.6a2 2 0 0 1 2 2V29M23.5 25h8.6" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Brand = ({ className = '', tag = 'Admin' }) => (
  <span className={`brand ${className}`.trim()}>
    <BrandMark />
    <span className="brand-text">
      <strong className="brand-name">PrimeStay</strong>
      {tag && <small className="brand-tag">{tag}</small>}
    </span>
  </span>
);

export default Brand;

import React from 'react';
import './Stars.css';

// Read-only stars, filled to `value` (e.g. 4.3 fills 86% of the row). Solid colours only.
const Stars = ({value=0,size=16}) => {
  const v = Math.max(0,Math.min(5,Number(value) || 0));
  return (
    <span className="stars" role="img" aria-label={`${v} out of 5 stars`} style={{'--size':`${size}px`,'--fill':`${v/5*100}%`}}>
      <span className="stars-base" aria-hidden="true">★★★★★</span>
      <span className="stars-fill" aria-hidden="true">★★★★★</span>
    </span>
  );
}

export default Stars;

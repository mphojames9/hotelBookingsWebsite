import React from 'react';
import './Stars.css';
import { StarIcon } from '../Icons';

// Five stars filled up to `value` (rounded to the nearest whole star).
export const Stars = ({ value = 0, size = 16 }) => {
  const rounded = Math.round(value);
  return (
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`star${rounded >= n ? ' on' : ''}`} style={{ width: size, height: size }}>
          <StarIcon width={size} height={size} />
        </span>
      ))}
    </span>
  );
};

// "4.6 (12)" next to the stars, or nothing at all while a room has no reviews yet
export const RatingBadge = ({ rating, onClick }) => {
  if (!rating || !rating.count) return null;
  const inner = (
    <>
      <Stars value={rating.average} size={14} />
      <b>{rating.average.toFixed(1)}</b>
      <span>({rating.count})</span>
    </>
  );
  return onClick
    ? <button type="button" className="rating-badge" onClick={onClick} aria-label={`${rating.average} out of 5 from ${rating.count} reviews. Read reviews`}>{inner}</button>
    : <span className="rating-badge">{inner}</span>;
};

export default Stars;

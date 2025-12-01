import { Star } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * StarRating Component
 * Interactive star rating input (1-5 stars)
 * 
 * @param {number} value - Current rating value (0-5)
 * @param {function} onChange - Callback when rating changes
 * @param {boolean} readOnly - If true, stars are not clickable
 * @param {string} size - Size of stars: 'sm', 'md', 'lg'
 */
export default function StarRating({ 
  value = 0, 
  onChange, 
  readOnly = false,
  size = 'md' 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const starSize = sizeClasses[size] || sizeClasses.md;

  const handleClick = (rating) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={readOnly}
          className={`
            ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
            transition-transform
            ${!readOnly && 'focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded'}
          `}
          aria-label={`${star} sao`}
        >
          <Star
            className={`
              ${starSize}
              ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              transition-colors
            `}
          />
        </button>
      ))}
    </div>
  );
}

StarRating.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};


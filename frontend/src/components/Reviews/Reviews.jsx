import React, { useCallback, useContext, useEffect, useState } from 'react';
import './Reviews.css';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import { Stars } from '../Stars/Stars';
import { StarIcon, CheckIcon } from '../Icons';

const MAX_COMMENT = 600;
const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

const when = (date) => new Date(date).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' });

// Guest reviews of one room: the list, the star breakdown and a form to write / edit / delete your own.
// Reviews hidden by an admin never come from the server, so nothing to filter here.
const Reviews = ({ roomId, onRequestLogin }) => {
  const { url, token, authConfig, fetchRatings, handleAuth } = useContext(StoreContext);

  const [data, setData] = useState(null);          // {average,count,breakdown,reviews}
  const [loading, setLoading] = useState(true);
  const [mine, setMine] = useState(null);           // {rating,comment} or null
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await axios.get(url + '/api/review/list', { params: { foodId: roomId } });
      if (response.data.success) setData(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
    if (token) {
      try {
        const response = await axios.post(url + '/api/review/mine', { foodId: roomId }, authConfig());
        if (response.data.success) {
          setMine(response.data.review);
          setRating(response.data.review?.rating || 0);
          setComment(response.data.review?.comment || '');
        }
      } catch (error) {
        handleAuth?.(error);
      }
    } else {
      setMine(null);
    }
  }, [roomId, token]);

  useEffect(() => {
    setLoading(true);
    setEditing(false);
    setMessage('');
    load();
  }, [load]);

  const refresh = async () => {
    await Promise.all([load(), fetchRatings()]);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!rating) { setMessage('Please choose a star rating.'); return; }
    setBusy(true);
    setMessage('');
    try {
      const response = await axios.post(url + '/api/review/add', { foodId: roomId, rating, comment }, authConfig());
      if (response.data.success) {
        setEditing(false);
        await refresh();
        setMessage(response.data.message || 'Thanks for your review');
      } else {
        setMessage(response.data.message || 'Could not save your review');
      }
    } catch (error) {
      handleAuth?.(error);
      setMessage(error.response?.data?.message || 'Could not save your review');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete your review?')) return;
    setBusy(true);
    try {
      const response = await axios.post(url + '/api/review/remove', { foodId: roomId }, authConfig());
      if (response.data.success) {
        setMine(null);
        setRating(0);
        setComment('');
        setEditing(false);
        await refresh();
        setMessage('Your review was deleted');
      }
    } catch (error) {
      handleAuth?.(error);
      setMessage('Could not delete your review');
    } finally {
      setBusy(false);
    }
  };

  const total = data?.count || 0;
  const shown = hover || rating;

  return (
    <section className="rv" id="room-reviews" aria-labelledby="rv-title">
      <h3 className="ps-subtitle" id="rv-title">Guest reviews</h3>

      {loading ? (
        <p className="rv-note">Loading reviews…</p>
      ) : total === 0 ? (
        <p className="rv-note">No reviews yet. Be the first to share how your stay was.</p>
      ) : (
        <div className="rv-summary">
          <div className="rv-score">
            <strong>{data.average.toFixed(1)}</strong>
            <Stars value={data.average} size={16} />
            <small>{total} {total === 1 ? 'review' : 'reviews'}</small>
          </div>
          <ul className="rv-bars" aria-label="Rating breakdown">
            {[5, 4, 3, 2, 1].map((n) => (
              <li key={n}>
                <span>{n}<StarIcon width={11} height={11} /></span>
                <i><b style={{ width: `${total ? (data.breakdown[n] / total) * 100 : 0}%` }} /></i>
                <em>{data.breakdown[n]}</em>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* write / edit */}
      {!token ? (
        <button type="button" className="rv-signin" onClick={onRequestLogin}>Sign in to write a review</button>
      ) : editing || !mine ? (
        <form className="rv-form" onSubmit={submit}>
          <p className="rv-form-title">{mine ? 'Edit your review' : 'Rate your stay'}</p>
          <div className="rv-pick" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={n <= shown ? 'on' : ''}
                aria-label={`${n} star${n === 1 ? '' : 's'}`}
                aria-pressed={rating === n}
                onMouseEnter={() => setHover(n)}
                onClick={() => setRating(n)}
              >
                <StarIcon width={26} height={26} />
              </button>
            ))}
            <span className="rv-label">{LABELS[shown] || 'Tap a star'}</span>
          </div>
          <textarea
            rows="3"
            maxLength={MAX_COMMENT}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like? (optional)"
            aria-label="Your review"
          />
          <div className="rv-form-foot">
            <small>{comment.length}/{MAX_COMMENT}</small>
            {mine && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setRating(mine.rating); setComment(mine.comment || ''); }}>Cancel</button>}
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Saving…' : mine ? 'Save changes' : 'Post review'}</button>
          </div>
        </form>
      ) : (
        <div className="rv-mine">
          <span><CheckIcon width={15} height={15} /> You rated this room {mine.rating}/5</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={remove} disabled={busy}>Delete</button>
        </div>
      )}
      {message && <p className="rv-msg" role="status">{message}</p>}

      {total > 0 && (
        <ul className="rv-list">
          {data.reviews.map((review, i) => (
            <li key={i} className="rv-item">
              <div className="rv-top">
                <Stars value={review.rating} size={14} />
                <strong>{review.name}</strong>
                {review.verified && <span className="rv-verified"><CheckIcon width={12} height={12} /> Verified stay</span>}
                <time dateTime={new Date(review.date).toISOString()}>{when(review.date)}</time>
              </div>
              {review.comment && <p>{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Reviews;

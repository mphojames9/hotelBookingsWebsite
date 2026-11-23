import React, { useContext, useEffect, useState } from 'react';
import './Reviews.css';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import Stars from '../Stars/Stars';

const MAX_COMMENT = 600;
const formatDate = (date) => new Date(date).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric'});

// Reviews for one product: the summary, what shoppers wrote, and a form to add your own.
// `onNeedLogin` is called when a signed-out shopper wants to write one.
const Reviews = ({productId,productName,onNeedLogin}) => {

  const {url,token,authConfig,refreshRatings,handleAuthError} = useContext(StoreContext);

  const [data,setData] = useState(null);      // {average,count,breakdown,reviews}
  const [failed,setFailed] = useState(false);
  const [mine,setMine] = useState(null);      // the shopper's own review, if any
  const [rating,setRating] = useState(0);
  const [comment,setComment] = useState('');
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState({text:'',bad:false});

  const load = async () => {
    try {
      const response = await axios.get(`${url}/api/review/list?foodId=${productId}`);
      if (response.data.success) { setData(response.data); setFailed(false); } else setFailed(true);
    } catch (error) { setFailed(true); }
  }

  const loadMine = async () => {
    if (!token) { setMine(null); return; }
    try {
      const response = await axios.post(url+'/api/review/mine',{foodId:productId},authConfig());
      const review = response.data.success ? response.data.review : null;
      setMine(review);
      setRating(review ? review.rating : 0);
      setComment(review ? review.comment : '');
    } catch (error) { handleAuthError?.(error); }
  }

  useEffect(()=>{
    setData(null); setFailed(false); setMessage({text:'',bad:false}); setRating(0); setComment(''); setMine(null);
    load();
    loadMine();
  },[productId,token]);

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (rating < 1) { setMessage({text:'Please choose a star rating first.',bad:true}); return; }
    setBusy(true);
    setMessage({text:'',bad:false});
    try {
      const response = await axios.post(url+'/api/review/add',{foodId:productId,rating,comment},authConfig());
      if (response.data.success) {
        setMessage({text:mine ? 'Your review was updated.' : 'Thanks for your review!',bad:false});
        await Promise.all([load(),loadMine(),refreshRatings()]);
      } else {
        setMessage({text:response.data.message || 'Could not save your review.',bad:true});
      }
    } catch (error) {
      handleAuthError?.(error);
      setMessage({text:error.response?.data?.message || 'Could not save your review. Please try again.',bad:true});
    } finally {
      setBusy(false);
    }
  }

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const response = await axios.post(url+'/api/review/remove',{foodId:productId},authConfig());
      if (response.data.success) {
        setMine(null); setRating(0); setComment('');
        setMessage({text:'Your review was deleted.',bad:false});
        await Promise.all([load(),refreshRatings()]);
      } else {
        setMessage({text:response.data.message || 'Could not delete your review.',bad:true});
      }
    } catch (error) {
      handleAuthError?.(error);
      setMessage({text:'Could not delete your review. Please try again.',bad:true});
    } finally {
      setBusy(false);
    }
  }

  const count = data?.count || 0;

  return (
    <section className="reviews" aria-labelledby="reviews-title">
      <h3 id="reviews-title" className="ps-subtitle">Reviews</h3>

      {failed && <p className="reviews-note">Reviews could not be loaded right now.</p>}
      {!data && !failed && <p className="reviews-note">Loading reviews…</p>}

      {data && count === 0 && <p className="reviews-note">No reviews yet. Be the first to share what you think.</p>}

      {data && count > 0 &&
        <>
          <div className="reviews-summary">
            <div className="reviews-score">
              <strong>{data.average.toFixed(1)}</strong>
              <Stars value={data.average} size={18} />
              <span>{count} {count === 1 ? 'review' : 'reviews'}</span>
            </div>
            <ul className="reviews-bars" aria-label="Ratings breakdown">
              {[5,4,3,2,1].map((star)=>(
                <li key={star}>
                  <span>{star} star</span>
                  <i><b style={{width:`${(data.breakdown[star]/count)*100}%`}} /></i>
                  <span>{data.breakdown[star]}</span>
                </li>
              ))}
            </ul>
          </div>

          <ul className="reviews-list">
            {data.reviews.map((review,i)=>(
              <li key={i}>
                <div className="review-top">
                  <Stars value={review.rating} size={14} />
                  <strong>{review.name}</strong>
                  {review.verified && <small className="review-verified">Verified purchase</small>}
                  <time dateTime={new Date(review.date).toISOString()}>{formatDate(review.date)}</time>
                </div>
                {review.comment && <p>{review.comment}</p>}
              </li>
            ))}
          </ul>
        </>
      }

      {token
        ? <form className="review-form" onSubmit={submit}>
            <h4>{mine ? 'Your review' : 'Write a review'}</h4>
            <fieldset className="star-picker">
              <legend className="reviews-sr">Your rating for {productName}</legend>
              {[1,2,3,4,5].map((n)=>(
                <label key={n} className={n <= rating ? 'is-on' : ''}>
                  <input type="radio" name={`rating-${productId}`} value={n} checked={rating === n} onChange={()=>{ setRating(n); setMessage({text:'',bad:false}); }} />
                  <span aria-hidden="true">★</span>
                  <span className="reviews-sr">{n} {n === 1 ? 'star' : 'stars'}</span>
                </label>
              ))}
            </fieldset>
            <label className="review-comment">
              <span className="reviews-sr">Your review (optional)</span>
              <textarea value={comment} onChange={(e)=>setComment(e.target.value)} maxLength={MAX_COMMENT} rows={3} placeholder="What did you think? (optional)" />
            </label>
            <div className="review-actions">
              <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Saving…' : mine ? 'Update review' : 'Post review'}</button>
              {mine && <button type="button" className="review-delete" onClick={remove} disabled={busy}>Delete</button>}
              <small>{comment.length}/{MAX_COMMENT}</small>
            </div>
            <p className={`review-msg${message.bad ? ' is-bad' : ''}`} role="status" aria-live="polite">{message.text}</p>
          </form>
        : <button type="button" className="btn btn-ghost btn-sm review-signin" onClick={onNeedLogin}>Sign in to write a review</button>
      }
    </section>
  );
}

export default Reviews;

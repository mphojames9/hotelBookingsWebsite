import React, { useEffect, useMemo, useState } from 'react';
import './Reviews.css';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../api';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { CheckIcon, EyeIcon, EyeOffIcon, SearchIcon, StarIcon, TrashIcon } from '../../components/Icons';
import { formatDate } from '../../utils/format';

const FILTERS = [
  { key: 'all',     label: 'All',          test: () => true },
  { key: 'visible', label: 'Visible',      test: (r) => !r.hidden },
  { key: 'hidden',  label: 'Hidden',       test: (r) => r.hidden },
  { key: 'low',     label: '1 to 2 stars', test: (r) => r.rating <= 2 },
];

// five stars filled up to the rating (solid colours)
const Rating = ({ value }) => (
  <span className="rv-stars" role="img" aria-label={`${value} out of 5 stars`}>
    {[1,2,3,4,5].map((n)=><StarIcon key={n} size={16} className={n <= value ? 'on' : ''} />)}
  </span>
);

const Reviews = () => {

  const [reviews,setReviews] = useState([]);
  const [loading,setLoading] = useState(true);
  const [filter,setFilter] = useState('all');
  const [query,setQuery] = useState('');
  const [busyId,setBusyId] = useState(null);     // review being hidden / shown
  const [target,setTarget] = useState(null);     // review waiting for delete confirmation
  const [deleting,setDeleting] = useState(false);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/api/review/admin');
      if (response.data.success) setReviews(response.data.data);
      else toast.error(response.data.message);
    } catch (error) {
      toast.error(errorMessage(error,'Could not load reviews'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ fetchReviews(); },[]);

  const toggleHidden = async (review) => {
    setBusyId(review._id);
    try {
      const response = await api.post('/api/review/admin/hide',{id:review._id,hidden:!review.hidden});
      if (response.data.success) {
        setReviews((list)=>list.map((r)=>r._id === review._id ? {...r,hidden:!review.hidden} : r));
        toast.success(response.data.message);
      } else toast.error(response.data.message);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  }

  const deleteReview = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      const response = await api.post('/api/review/admin/delete',{id:target._id});
      if (response.data.success) {
        setReviews((list)=>list.filter((r)=>r._id !== target._id));
        toast.success(response.data.message);
      } else toast.error(response.data.message);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeleting(false);
      setTarget(null);
    }
  }

  const counts = useMemo(()=>Object.fromEntries(FILTERS.map((f)=>[f.key,reviews.filter(f.test).length])),[reviews]);

  const visible = useMemo(()=>{
    const test = FILTERS.find((f)=>f.key === filter).test;
    const q = query.trim().toLowerCase();
    return reviews.filter((r)=>test(r) && (!q || [r.productName,r.userName,r.comment].some((text)=>String(text || '').toLowerCase().includes(q))));
  },[reviews,filter,query]);

  return (
    <div className='reviews-page'>

      <div className="page-head">
        <div>
          <h1>Reviews</h1>
          <p>{loading ? 'Loading reviews...' : `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'} from guests`}</p>
        </div>
      </div>

      {(loading || reviews.length > 0) &&
        <div className="rv-toolbar">
          <div className="rv-filters" role="tablist" aria-label="Filter reviews">
            {FILTERS.map((f)=>(
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                className={`rv-filter${filter === f.key ? ' is-active' : ''}`}
                onClick={()=>setFilter(f.key)}
              >
                {f.label}
                <span className="rv-count">{counts[f.key]}</span>
              </button>
            ))}
          </div>
          <label className="control-wrap rv-search">
            <SearchIcon size={19} />
            <input className="control-bare" type="search" placeholder="Search room, guest or comment" value={query} onChange={(e)=>setQuery(e.target.value)} aria-label="Search reviews" />
          </label>
        </div>
      }

      {loading &&
        <div className="rv-list" aria-hidden="true">
          {Array.from({length:4}).map((_,i)=><div key={i} className="card skeleton rv-skeleton" />)}
        </div>
      }

      {!loading && reviews.length === 0 &&
        <div className="card">
          <div className="empty">
            <span className="empty-icon"><StarIcon size={32} /></span>
            <h3>No reviews yet</h3>
            <p>Guest reviews will show up here, ready to hide or delete.</p>
          </div>
        </div>
      }

      {!loading && reviews.length > 0 && visible.length === 0 &&
        <div className="card">
          <div className="empty">
            <span className="empty-icon"><SearchIcon size={30} /></span>
            <h3>Nothing here</h3>
            <p>No reviews match this filter or search.</p>
          </div>
        </div>
      }

      {!loading && visible.length > 0 &&
        <div className="rv-list">
          {visible.map((review,index)=>(
            <article key={review._id} className={`card rv-card rise${review.hidden ? ' is-hidden' : ''}`} style={{'--i':Math.min(index,10)}}>
              <header className="rv-top">
                <Rating value={review.rating} />
                <strong className="rv-who">{review.userName}</strong>
                {review.verified && <span className="rv-tag ok"><CheckIcon size={12} /> Verified stay</span>}
                {review.hidden && <span className="rv-tag muted"><EyeOffIcon size={13} /> Hidden from guests</span>}
                <time className="rv-date" dateTime={new Date(review.date).toISOString()}>{formatDate(review.date)}</time>
              </header>

              <p className="rv-product">
                on <Link to={`/edit/${review.foodId}`}>{review.productName}</Link>
              </p>

              {review.comment
                ? <p className="rv-comment">{review.comment}</p>
                : <p className="rv-comment rv-none">No written comment, rating only.</p>}

              <footer className="rv-actions">
                <button type="button" className="btn btn-ghost" onClick={()=>toggleHidden(review)} disabled={busyId === review._id}>
                  {review.hidden ? <><EyeIcon size={18} /> Show again</> : <><EyeOffIcon size={18} /> Hide</>}
                </button>
                <button type="button" className="btn btn-danger" onClick={()=>setTarget(review)}>
                  <TrashIcon size={18} /> Delete
                </button>
              </footer>
            </article>
          ))}
        </div>
      }

      <ConfirmDialog
        open={!!target}
        title="Delete this review?"
        message={target ? `${target.userName}'s ${target.rating}-star review of “${target.productName}” will be deleted for good. Hiding it instead keeps it but removes it from the site.` : ''}
        confirmLabel="Delete review"
        busy={deleting}
        onConfirm={deleteReview}
        onCancel={()=>setTarget(null)}
      />

    </div>
  );
}

export default Reviews;

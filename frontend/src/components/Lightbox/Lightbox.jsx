import React, { useCallback, useEffect, useRef, useState } from 'react';
import './Lightbox.css';
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from '../Icons';

// Full-screen photo viewer: the current photo in the middle, its neighbours dimmed at the sides.
// Open it from anywhere with  openLightbox({ images: [url, ...], index: 0, title: 'Room name' })
export const openLightbox = (detail) => window.dispatchEvent(new CustomEvent('lightbox:open', { detail }));

const Lightbox = () => {
  const [state, setState] = useState(null);      // { images, index, title }
  const [closing, setClosing] = useState(false);
  const closeRef = useRef(null);
  const returnTo = useRef(null);
  const touchX = useRef(null);

  const hide = useCallback(() => {
    setClosing(true);
    setTimeout(() => { setState(null); setClosing(false); returnTo.current?.focus?.(); }, 180);
  }, []);

  useEffect(() => {
    const open = (event) => {
      const { images = [], index = 0, title = '' } = event.detail || {};
      if (!images.length) return;
      returnTo.current = document.activeElement;
      setClosing(false);
      setState({ images, index: Math.min(Math.max(index, 0), images.length - 1), title });
    };
    window.addEventListener('lightbox:open', open);
    return () => window.removeEventListener('lightbox:open', open);
  }, []);

  const count = state?.images.length || 0;
  const go = useCallback((step) => setState((s) => (s ? { ...s, index: (s.index + step + s.images.length) % s.images.length } : s)), []);
  const jump = (index) => setState((s) => (s ? { ...s, index } : s));

  useEffect(() => {
    if (!state) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') { event.stopPropagation(); hide(); }
      else if (event.key === 'ArrowLeft') go(-1);
      else if (event.key === 'ArrowRight') go(1);
      else if (event.key === 'Tab') { event.preventDefault(); closeRef.current?.focus(); }   // only the buttons matter here
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey, true);
    closeRef.current?.focus();
    return () => { window.removeEventListener('keydown', onKey, true); document.body.style.overflow = previous; };
  }, [state === null, go, hide]);   // eslint-disable-line react-hooks/exhaustive-deps

  if (!state) return null;
  const { images, index, title } = state;

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
  };

  return (
    <div className={`lb${closing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-label={title ? `${title} photos` : 'Photo viewer'} onClick={(e) => { if (e.target === e.currentTarget || e.target.classList.contains('lb-stage')) hide(); }}>
      <button type="button" ref={closeRef} className="lb-close" aria-label="Close photos" onClick={hide}><CloseIcon /></button>

      <div className="lb-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="lb-track" style={{ '--i': index }}>
          {images.map((src, i) => (
            <figure key={src + i} className={`lb-slide${i === index ? ' is-current' : ''}`} aria-hidden={i !== index} onClick={() => i !== index && jump(i)}>
              {Math.abs(i - index) <= 2 || i === (index + count - 1) % count || i === (index + 1) % count
                ? <img src={src} alt={i === index ? `${title || 'Photo'} ${i + 1} of ${count}` : ''} draggable="false" />
                : null}
            </figure>
          ))}
        </div>
      </div>

      {count > 1 && (
        <>
          <button type="button" className="lb-arrow lb-prev" aria-label="Previous photo" onClick={() => go(-1)}><ArrowLeftIcon /></button>
          <button type="button" className="lb-arrow lb-next" aria-label="Next photo" onClick={() => go(1)}><ArrowRightIcon /></button>
        </>
      )}

      <div className="lb-cap" aria-live="polite">
        {title && <strong>{title}</strong>}
        {count > 1 && <span>{index + 1} / {count}</span>}
      </div>
    </div>
  );
};

export default Lightbox;

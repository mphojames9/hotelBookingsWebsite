import React, { useEffect, useRef, useState } from 'react';
import './GalleryEditor.css';
import { toast } from 'react-toastify';
import { API_URL } from '../../api';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, ImageIcon, PlusIcon, StarIcon } from '../Icons';
import { MAX_PHOTOS } from '../../utils/images';

// A photo is either already saved ({kind:'existing', name}) or picked on this device ({kind:'new', file}).
let counter = 0;
const uid = () => `p${Date.now().toString(36)}${(counter++).toString(36)}`;

export const fromSaved = (names = []) =>
  names.map((name) => ({ key: `saved-${name}`, kind: 'existing', name, url: `${API_URL}/images/${name}` }));

/**
 * The photo list of a room: the first photo is the cover, guests swipe through the rest.
 * Reorder by dragging (desktop) or with the arrow buttons (touch).
 */
const GalleryEditor = ({ items, onChange, max = MAX_PHOTOS, disabled = false }) => {

  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [fileOver, setFileOver] = useState(false);
  const [broken, setBroken] = useState(() => new Set());
  const urls = useRef(new Set());          // object URLs this component created

  // release object URLs of photos that were removed, and all of them on unmount
  useEffect(() => {
    const live = new Set(items.filter((i) => i.kind === 'new').map((i) => i.url));
    urls.current.forEach((url) => {
      if (!live.has(url)) { URL.revokeObjectURL(url); urls.current.delete(url); }
    });
  }, [items]);
  useEffect(() => () => { urls.current.forEach((url) => URL.revokeObjectURL(url)); }, []);

  const addFiles = (fileList) => {
    const images = [...(fileList || [])].filter((file) => file.type.startsWith('image/'));
    if (images.length === 0) return;
    const room = max - items.length;
    if (room <= 0) { toast.info(`A room can have up to ${max} photos`); return; }
    if (images.length > room) toast.info(`Only ${room} more ${room === 1 ? 'photo' : 'photos'} fit, the rest were skipped`);
    const added = images.slice(0, room).map((file) => {
      const url = URL.createObjectURL(file);
      urls.current.add(url);
      return { key: uid(), kind: 'new', file, url };
    });
    onChange([...items, ...added]);
  };

  const move = (from, to) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [picked] = next.splice(from, 1);
    next.splice(to, 0, picked);
    onChange(next);
  };

  const remove = (index) => onChange(items.filter((_, i) => i !== index));

  const endDrag = () => { setDragIndex(null); setOverIndex(null); };

  const hasFiles = (event) => [...(event.dataTransfer?.types || [])].includes('Files');

  return (
    <div
      className={`gal${fileOver ? ' is-file-over' : ''}${disabled ? ' is-disabled' : ''}`}
      onDragOver={(event) => { if (hasFiles(event) && !disabled) { event.preventDefault(); setFileOver(true); } }}
      onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFileOver(false); }}
      onDrop={(event) => {
        setFileOver(false);
        if (hasFiles(event) && !disabled) { event.preventDefault(); addFiles(event.dataTransfer.files); }
      }}
    >
      <div className="gal-head">
        <h2>Photos</h2>
        <span className="gal-count" aria-live="polite">{items.length} / {max}</span>
      </div>
      <p className="gal-help">
        The first photo is the cover. Guests can swipe or scroll through the rest, so add the bed, the bathroom and the view.
      </p>

      {items.length === 0 ? (
        <label className="gal-empty">
          <input type="file" accept="image/*" multiple hidden disabled={disabled}
            onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} />
          <span className="gal-empty-icon"><ImageIcon size={28} /></span>
          <strong>Tap to add photos</strong>
          <span>or drag and drop up to {max} images here</span>
        </label>
      ) : (
        <ul className="gal-grid">
          {items.map((item, index) => (
            <li
              key={item.key}
              className={`gal-tile${index === 0 ? ' is-cover' : ''}${dragIndex === index ? ' is-dragging' : ''}${overIndex === index && dragIndex !== index ? ' is-over' : ''}`}
              draggable={!disabled}
              onDragStart={(event) => {
                setDragIndex(index);
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', String(index));
              }}
              onDragOver={(event) => { if (dragIndex !== null) { event.preventDefault(); setOverIndex(index); } }}
              onDrop={(event) => {
                if (dragIndex === null) return;           // a file drop: the gallery handles it
                event.preventDefault();
                move(dragIndex, index);
                endDrag();
              }}
              onDragEnd={endDrag}
            >
              <span className="gal-ph"><ImageIcon size={22} /></span>
              {!broken.has(item.key) &&
                <img
                  src={item.url}
                  alt={`Photo ${index + 1}`}
                  draggable={false}
                  onError={() => setBroken((set) => new Set(set).add(item.key))}
                />
              }
              <span className="gal-badge">{index === 0 ? 'Cover' : index + 1}</span>

              <div className="gal-actions">
                <button type="button" onClick={() => move(index, index - 1)} disabled={disabled || index === 0} aria-label={`Move photo ${index + 1} earlier`}>
                  <ChevronLeftIcon size={16} />
                </button>
                <button type="button" onClick={() => move(index, index + 1)} disabled={disabled || index === items.length - 1} aria-label={`Move photo ${index + 1} later`}>
                  <ChevronRightIcon size={16} />
                </button>
                {index > 0 &&
                  <button type="button" onClick={() => move(index, 0)} disabled={disabled} aria-label={`Make photo ${index + 1} the cover`} title="Make cover">
                    <StarIcon size={15} />
                  </button>
                }
                <button type="button" className="is-danger" onClick={() => remove(index)} disabled={disabled} aria-label={`Remove photo ${index + 1}`}>
                  <CloseIcon size={15} />
                </button>
              </div>
            </li>
          ))}

          {items.length < max &&
            <li className="gal-add">
              <label>
                <input type="file" accept="image/*" multiple hidden disabled={disabled}
                  onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} />
                <PlusIcon size={22} />
                <span>Add photos</span>
              </label>
            </li>
          }
        </ul>
      )}
    </div>
  );
};

export default GalleryEditor;

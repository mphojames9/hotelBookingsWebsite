import React, { useEffect, useMemo, useState } from 'react';
import './Messages.css';
import api, { errorMessage } from '../../api';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { CheckIcon, EyeIcon, EyeOffIcon, MailIcon, PhoneIcon, SearchIcon, TrashIcon } from '../../components/Icons';
import { formatDate } from '../../utils/format';

const FILTERS = [
  { key: 'all',        label: 'All',         test: () => true },
  { key: 'unread',     label: 'Unread',      test: (m) => !m.read },
  { key: 'message',    label: 'Enquiries',   test: (m) => m.kind === 'message' },
  { key: 'newsletter', label: 'Newsletter',  test: (m) => m.kind === 'newsletter' },
];

// Enquiries from the website's contact form and newsletter sign-ups
const Messages = () => {

  const [items,setItems] = useState([]);
  const [loading,setLoading] = useState(true);
  const [filter,setFilter] = useState('all');
  const [query,setQuery] = useState('');
  const [busyId,setBusyId] = useState(null);
  const [target,setTarget] = useState(null);
  const [deleting,setDeleting] = useState(false);

  const load = async () => {
    try {
      const response = await api.get('/api/contact/list');
      if (response.data.success) setItems(response.data.data);
      else toast.error(response.data.message);
    } catch (error) {
      toast.error(errorMessage(error,'Could not load messages'));
    } finally {
      setLoading(false);
    }
  }
  useEffect(()=>{ load(); },[]);

  const toggleRead = async (item) => {
    setBusyId(item._id);
    try {
      const response = await api.post('/api/contact/read',{id:item._id,read:!item.read});
      if (response.data.success) setItems((list)=>list.map((m)=>m._id === item._id ? {...m,read:!item.read} : m));
      else toast.error(response.data.message);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  }

  const remove = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      const response = await api.post('/api/contact/delete',{id:target._id});
      if (response.data.success) {
        setItems((list)=>list.filter((m)=>m._id !== target._id));
        toast.success(response.data.message);
      } else toast.error(response.data.message);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeleting(false);
      setTarget(null);
    }
  }

  const counts = useMemo(()=>Object.fromEntries(FILTERS.map((f)=>[f.key,items.filter(f.test).length])),[items]);
  const visible = useMemo(()=>{
    const test = FILTERS.find((f)=>f.key === filter).test;
    const q = query.trim().toLowerCase();
    return items.filter((m)=>test(m) && (!q || [m.name,m.email,m.topic,m.message,m.location].some((t)=>String(t || '').toLowerCase().includes(q))));
  },[items,filter,query]);

  return (
    <div className="messages-page">
      <div className="page-head">
        <div>
          <h1>Messages</h1>
          <p>{loading ? 'Loading messages...' : `${counts.unread} unread of ${items.length} from the website`}</p>
        </div>
      </div>

      {(loading || items.length > 0) &&
        <div className="rv-toolbar">
          <div className="rv-filters" role="tablist" aria-label="Filter messages">
            {FILTERS.map((f)=>(
              <button key={f.key} type="button" role="tab" aria-selected={filter === f.key} className={`rv-filter${filter === f.key ? ' is-active' : ''}`} onClick={()=>setFilter(f.key)}>
                {f.label}<span className="rv-count">{counts[f.key]}</span>
              </button>
            ))}
          </div>
          <label className="control-wrap rv-search">
            <SearchIcon size={19} />
            <input className="control-bare" type="search" placeholder="Search name, email or text" value={query} onChange={(e)=>setQuery(e.target.value)} aria-label="Search messages" />
          </label>
        </div>
      }

      {loading && <div className="rv-list" aria-hidden="true">{Array.from({length:3}).map((_,i)=><div key={i} className="card skeleton rv-skeleton" />)}</div>}

      {!loading && items.length === 0 &&
        <div className="card"><div className="empty">
          <span className="empty-icon"><MailIcon size={32} /></span>
          <h3>No messages yet</h3>
          <p>Enquiries from the Contact page and newsletter sign-ups will show up here.</p>
        </div></div>
      }

      {!loading && items.length > 0 && visible.length === 0 &&
        <div className="card"><div className="empty">
          <span className="empty-icon"><SearchIcon size={30} /></span>
          <h3>Nothing here</h3>
          <p>No messages match this filter or search.</p>
        </div></div>
      }

      {!loading && visible.length > 0 &&
        <div className="rv-list">
          {visible.map((m,index)=>(
            <article key={m._id} className={`card rv-card rise${m.read ? ' is-read' : ' is-unread'}`} style={{'--i':Math.min(index,10)}}>
              <header className="rv-top">
                <strong className="rv-who">{m.kind === 'newsletter' ? 'Newsletter sign-up' : (m.name || 'Guest')}</strong>
                <span className={`rv-tag ${m.kind === 'newsletter' ? 'muted' : 'ok'}`}>{m.kind === 'newsletter' ? 'Newsletter' : (m.topic || 'Enquiry')}</span>
                {m.location && <span className="rv-tag muted">PrimeStay {m.location}</span>}
                {!m.read && <span className="msg-new">New</span>}
                <time className="rv-date" dateTime={new Date(m.date).toISOString()}>{formatDate(m.date)}</time>
              </header>
              <p className="msg-contact">
                <a href={`mailto:${m.email}`}><MailIcon size={16} /> {m.email}</a>
                {m.phone && <a href={`tel:${m.phone}`}><PhoneIcon size={16} /> {m.phone}</a>}
              </p>
              {m.message && <p className="rv-comment">{m.message}</p>}
              <footer className="rv-actions">
                <button type="button" className="btn btn-ghost" onClick={()=>toggleRead(m)} disabled={busyId === m._id}>
                  {m.read ? <><EyeOffIcon size={18} /> Mark unread</> : <><CheckIcon size={18} /> Mark read</>}
                </button>
                <a className="btn btn-ghost" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.topic || 'your enquiry') + ' - PrimeStay')}`}><MailIcon size={18} /> Reply</a>
                <button type="button" className="btn btn-danger" onClick={()=>setTarget(m)}><TrashIcon size={18} /> Delete</button>
              </footer>
            </article>
          ))}
        </div>
      }

      <ConfirmDialog
        open={!!target}
        title="Delete this message?"
        message={target ? `The message from ${target.email} will be deleted for good.` : ''}
        confirmLabel="Delete message"
        busy={deleting}
        onConfirm={remove}
        onCancel={()=>setTarget(null)}
      />
    </div>
  );
}

export default Messages;

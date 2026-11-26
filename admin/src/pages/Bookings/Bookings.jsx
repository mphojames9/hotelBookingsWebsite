import React, { useEffect, useMemo, useState } from 'react';
import './Bookings.css';
import { useSearchParams } from 'react-router-dom';
import api, { errorMessage } from '../../api';
import { toast } from 'react-toastify';
import {
  ArrowRightIcon, BedIcon, CalendarIcon, CheckIcon, ChevronDownIcon, MailIcon, MapPinIcon, MoonIcon, PhoneIcon, UsersIcon,
} from '../../components/Icons';
import { formatDate, formatRand, formatStayDate } from '../../utils/format';

// bookings keep the "order-*" class names of the stylesheet they grew from
const STATUSES = ["Confirmed", "Checked in", "Checked out", "Cancelled"];
const STEPS = ["Confirmed", "Checked in", "Checked out"];
const TONES = { "Confirmed": "info", "Checked in": "warn", "Checked out": "ok", "Cancelled": "danger" };

const Bookings = () => {

  const [bookings,setBookings] = useState([]);
  const [loading,setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const requestedStatus = searchParams.get("status");
  const [filter,setFilter] = useState(STATUSES.includes(requestedStatus) ? requestedStatus : "All");
  const [updatingId,setUpdatingId] = useState(null);

  const fetchBookings = async () => {
    try {
      const response = await api.get("/api/booking/list");
      if (response.data.success) {
        setBookings(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(errorMessage(error,"Could not load bookings"));
    } finally {
      setLoading(false);
    }
  }

  const statusHandler = async (event,bookingId) => {
    setUpdatingId(bookingId);
    try {
      const response = await api.post("/api/booking/status",{bookingId,status:event.target.value});
      if (response.data.success) {
        await fetchBookings();
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(()=>{
    fetchBookings();
  },[])

  const counts = useMemo(()=>{
    const result = { All: bookings.length };
    STATUSES.forEach((status)=>{ result[status] = bookings.filter((b)=>b.status === status).length; });
    return result;
  },[bookings]);

  const visible = filter === "All" ? bookings : bookings.filter((b)=>b.status === filter);

  return (
    <div className='order'>

      <div className="page-head">
        <div>
          <h1>Bookings</h1>
          <p>{loading ? "Loading bookings..." : `${bookings.length} paid ${bookings.length === 1 ? "booking" : "bookings"}`}</p>
        </div>
      </div>

      {(loading || bookings.length > 0) &&
        <div className="filters" role="tablist" aria-label="Filter bookings by status">
          {["All",...STATUSES].map((status)=>(
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={filter === status}
              className={`filter${filter === status ? " is-active" : ""}`}
              onClick={()=>setFilter(status)}
            >
              {status}
              <span className="filter-count">{counts[status]}</span>
            </button>
          ))}
        </div>
      }

      {loading &&
        <div className="order-list" aria-hidden="true">
          {Array.from({length:4}).map((_,i)=>(
            <div key={i} className="card order-card">
              <div className="skeleton skel-a"/>
              <div className="skeleton skel-b"/>
              <div className="skeleton skel-c"/>
            </div>
          ))}
        </div>
      }

      {!loading && bookings.length === 0 &&
        <div className="card">
          <div className="empty">
            <span className="empty-icon"><CalendarIcon size={32} /></span>
            <h3>No paid bookings yet</h3>
            <p>Bookings show up here as soon as a guest has paid.</p>
          </div>
        </div>
      }

      {!loading && bookings.length > 0 && visible.length === 0 &&
        <div className="card">
          <div className="empty">
            <span className="empty-icon"><BedIcon size={30} /></span>
            <h3>Nothing here</h3>
            <p>No bookings are marked “{filter}” right now.</p>
          </div>
        </div>
      }

      {!loading && visible.length > 0 &&
        <div className="order-list">
          {visible.map((booking,index)=>{
            const cancelled = booking.status === "Cancelled";
            const stepIndex = Math.max(0,STEPS.indexOf(booking.status));
            const tone = TONES[booking.status] || "info";
            const items = Array.isArray(booking.items) ? booking.items : [];
            const roomCount = items.reduce((sum,item)=>sum+(Number(item.quantity)||0),0);
            const guest = booking.guest || {};
            const fullName = `${guest.firstName || ""} ${guest.lastName || ""}`.trim() || "Guest";
            const nights = Number(booking.nights) || 0;
            const guests = Number(booking.guests) || 0;

            return (
              <article
                key={booking._id}
                className={`card order-card rise${updatingId === booking._id ? " is-updating" : ""}`}
                style={{'--i':index}}
                data-tone={tone}
              >
                <header className="order-top">
                  <span className="order-icon"><BedIcon size={22} /></span>
                  <div className="order-who">
                    <h3>{fullName}</h3>
                    <span>Booked {formatDate(booking.date)}</span>
                  </div>
                  <div className="order-total">
                    <strong>{formatRand(booking.amount)}</strong>
                    <span>{roomCount} {roomCount === 1 ? "room" : "rooms"}</span>
                  </div>
                </header>

                <div className="stay">
                  <div className="stay-date">
                    <small>Check-in</small>
                    <strong>{formatStayDate(booking.checkIn)}</strong>
                  </div>
                  <ArrowRightIcon size={18} className="stay-arrow" />
                  <div className="stay-date">
                    <small>Check-out</small>
                    <strong>{formatStayDate(booking.checkOut)}</strong>
                  </div>
                  <ul className="stay-meta">
                    <li><MoonIcon size={15} />{nights} {nights === 1 ? "night" : "nights"}</li>
                    <li><UsersIcon size={15} />{guests} {guests === 1 ? "guest" : "guests"}</li>
                  </ul>
                </div>

                <ul className="order-items">
                  {items.map((item,i)=>(
                    <li key={i}>
                      <span className="qty">{item.quantity} ×</span>
                      <span className="name">{item.name}{item.location ? ` · ${item.location}` : ""}</span>
                    </li>
                  ))}
                </ul>

                <div className="order-contact">
                  {guest.email &&
                    <a href={`mailto:${guest.email}`}>
                      <MailIcon size={17} />
                      {guest.email}
                    </a>
                  }
                  {guest.phone &&
                    <a href={`tel:${guest.phone}`}>
                      <PhoneIcon size={17} />
                      {guest.phone}
                    </a>
                  }
                  {guest.country &&
                    <p>
                      <MapPinIcon size={17} />
                      <span>{guest.country}</span>
                    </p>
                  }
                  {guest.requests &&
                    <p className="stay-request">
                      <span><strong>Request:</strong> {guest.requests}</span>
                    </p>
                  }
                </div>

                <div className="order-foot">
                  {cancelled ? (
                    <span className="cancelled-pill">Cancelled</span>
                  ) : (
                    <ol className="stepper" style={{'--step':stepIndex}} aria-label="Stay progress">
                      {STEPS.map((status,k)=>(
                        <li key={status} className={k <= stepIndex ? "done" : ""} aria-current={k === stepIndex ? "step" : undefined}>
                          <span className="dot">{k < stepIndex && <CheckIcon size={11} />}</span>
                          <span className="label">{status}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  <div className="status-select">
                    <span className="status-dot" aria-hidden="true" />
                    <select
                      aria-label={`Booking status for ${fullName}`}
                      onChange={(event)=>statusHandler(event,booking._id)}
                      value={booking.status}
                      disabled={updatingId === booking._id}
                    >
                      {STATUSES.map((status)=>(
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <ChevronDownIcon size={16} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      }

    </div>
  );
}

export default Bookings;

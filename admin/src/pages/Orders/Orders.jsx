import React, { useEffect, useMemo, useState } from 'react';
import './Orders.css';
import { useSearchParams } from 'react-router-dom';
import api, { errorMessage } from '../../api';
import { toast } from 'react-toastify';
import { BoxIcon, CheckIcon, ChevronDownIcon, MapPinIcon, PhoneIcon, ReceiptIcon } from '../../components/Icons';
import { formatDate, formatRand } from '../../utils/format';

const STATUSES = ["Confirmed","Checked in","Checked out","Cancelled"];
const TONES = { "Confirmed":"warn", "Checked in":"info", "Checked out":"ok", "Cancelled":"bad" };

const Orders = () => {

  const [orders,setOrders] = useState([]);
  const [loading,setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const requestedStatus = searchParams.get("status");
  const [filter,setFilter] = useState(STATUSES.includes(requestedStatus) ? requestedStatus : "All");
  const [updatingId,setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/api/booking/list");
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(errorMessage(error,"Could not load bookings"));
    } finally {
      setLoading(false);
    }
  }

  const statusHandler = async (event,orderId) => {
    setUpdatingId(orderId);
    try {
      const response = await api.post("/api/booking/status",{bookingId:orderId,status:event.target.value});
      if (response.data.success) {
        await fetchOrders();
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
    fetchOrders();
  },[])

  const counts = useMemo(()=>{
    const result = { All: orders.length };
    STATUSES.forEach((status)=>{ result[status] = orders.filter((o)=>o.status === status).length; });
    return result;
  },[orders]);

  const visible = filter === "All" ? orders : orders.filter((o)=>o.status === filter);

  return (
    <div className='order'>

      <div className="page-head">
        <div>
          <h1>Bookings</h1>
          <p>{loading ? "Loading orders..." : `${orders.length} paid ${orders.length === 1 ? "order" : "orders"}`}</p>
        </div>
      </div>

      {(loading || orders.length > 0) &&
        <div className="filters" role="tablist" aria-label="Filter orders by status">
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

      {!loading && orders.length === 0 &&
        <div className="card">
          <div className="empty">
            <span className="empty-icon"><ReceiptIcon size={32} /></span>
            <h3>No paid bookings yet</h3>
            <p>Bookings show up here as soon as a guest has paid.</p>
          </div>
        </div>
      }

      {!loading && orders.length > 0 && visible.length === 0 &&
        <div className="card">
          <div className="empty">
            <span className="empty-icon"><BoxIcon size={30} /></span>
            <h3>Nothing here</h3>
            <p>No bookings are marked “{filter}” right now.</p>
          </div>
        </div>
      }

      {!loading && visible.length > 0 &&
        <div className="order-list">
          {visible.map((order,index)=>{
            const stepIndex = Math.max(0,STATUSES.indexOf(order.status));
            const tone = TONES[order.status] || "info";
            const itemCount = order.items.reduce((sum,item)=>sum+item.quantity,0);
            const fullName = order.guest.firstName+" "+order.guest.lastName;

            return (
              <article
                key={order._id}
                className={`card order-card rise${updatingId === order._id ? " is-updating" : ""}`}
                style={{'--i':index}}
                data-tone={tone}
              >
                <header className="order-top">
                  <span className="order-icon"><BoxIcon size={22} /></span>
                  <div className="order-who">
                    <h3>{fullName}</h3>
                    <span>{formatDate(order.checkIn)} → {formatDate(order.checkOut)} · {order.guests} guests</span>
                  </div>
                  <div className="order-total">
                    <strong>{formatRand(order.amount)}</strong>
                    <span>{order.nights} {order.nights === 1 ? "night" : "nights"} · {itemCount} {itemCount === 1 ? "room" : "rooms"}</span>
                  </div>
                </header>

                <ul className="order-items">
                  {order.items.map((item,i)=>(
                    <li key={i}>
                      <span className="qty">{item.quantity} ×</span>
                      <span className="name">{item.name}</span>
                    </li>
                  ))}
                </ul>

                <div className="order-contact">
                  <p>
                    <MapPinIcon size={17} />
                    <span>{order.guest.email}{order.guest.requests ? <><br/>Request: {order.guest.requests}</> : null}</span>
                  </p>
                  <a href={`tel:${order.guest.phone}`}>
                    <PhoneIcon size={17} />
                    {order.guest.phone}
                  </a>
                </div>

                <div className="order-foot">
                  <ol className="stepper" style={{'--step':stepIndex}} aria-label="Stay progress">
                    {STATUSES.slice(0,3).map((status,k)=>(
                      <li key={status} className={k <= stepIndex ? "done" : ""} aria-current={k === stepIndex ? "step" : undefined}>
                        <span className="dot">{k < stepIndex && <CheckIcon size={11} />}</span>
                        <span className="label">{status}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="status-select">
                    <span className="status-dot" aria-hidden="true" />
                    <select
                      aria-label={`Booking status for ${fullName}`}
                      onChange={(event)=>statusHandler(event,order._id)}
                      value={order.status}
                      disabled={updatingId === order._id}
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

export default Orders;

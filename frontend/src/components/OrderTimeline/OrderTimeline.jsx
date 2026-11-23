import React from 'react';
import './OrderTimeline.css';
import { CheckIcon } from '../Icons';
import { formatPrice } from '../../utils/format';
import { TRACK_STEPS, DELIVERY_WORKING_DAYS, addWorkingDays, currentStep, stepDates } from '../../utils/orders';

// "19 Nov" and "Wednesday, 25 November" (the day is written by hand so it never gets a leading zero)
const part = (date,options) => date.toLocaleDateString('en-ZA',options);
const dayMonth = (date) => `${date.getDate()} ${part(date,{month:'short'})}`;
const longDate = (date) => `${part(date,{weekday:'long'})}, ${date.getDate()} ${part(date,{month:'long'})}`;

// Where one order is on its way: the four steps, a delivery estimate, and what is in the parcel.
const OrderTimeline = ({order,id}) => {

  const cur = currentStep(order.status);
  const delivered = order.status === 'Delivered';
  const dates = stepDates(order);
  const estimate = addWorkingDays(order.date,DELIVERY_WORKING_DAYS);
  const address = order.address || {};
  const name = [address.firstName,address.lastName].filter(Boolean).join(' ');
  const place = [address.street,address.city,address.province,address.zipCode].filter(Boolean).join(', ');

  return (
    <div className="track-panel" id={id}>
      <p className="track-eta">
        {delivered
          ? dates.Delivered ? <>Delivered on <b>{longDate(dates.Delivered)}</b></> : <b>Delivered</b>
          : <>Estimated delivery by <b>{longDate(estimate)}</b></>}
      </p>

      <ol className="track" aria-label="Order progress">
        {TRACK_STEPS.map((step,i)=>{
          const state = i < cur || (delivered && i === cur) ? 'done' : i === cur ? 'current' : 'todo';
          const when = dates[step.key];
          return (
            <li key={step.key} className={`track-step is-${state}${i + 1 <= cur ? ' is-linked' : ''}`} aria-current={state === 'current' ? 'step' : undefined}>
              <span className="track-dot" aria-hidden="true">{state === 'done' && <CheckIcon />}</span>
              <span className="track-text">
                <b>{step.label}</b>
                <small>{when ? dayMonth(when) : state === 'todo' ? '' : step.note}</small>
                <span className="track-sr">{state === 'done' ? 'Completed' : state === 'current' ? 'Current step' : 'Not yet'}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="track-details">
        <div>
          <h4>Items</h4>
          <ul>
            {order.items.map((item,i)=>(
              <li key={i}><span>{item.name} × {item.quantity}</span><span>{formatPrice(item.price * item.quantity)}</span></li>
            ))}
            {order.discount > 0 && <li className="track-discount"><span>Promo {order.promoCode}</span><span>&minus;{formatPrice(order.discount)}</span></li>}
          </ul>
        </div>
        {(name || place) &&
          <div>
            <h4>Delivering to</h4>
            <p>{name && <>{name}<br /></>}{place}</p>
          </div>
        }
      </div>
    </div>
  );
}

export default OrderTimeline;

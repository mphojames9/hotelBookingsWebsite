import React from 'react';

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};

const icon = (children, extra = {}) => (props) => (
  <svg {...base} {...extra} {...props}>{children}</svg>
);

export const SearchIcon = icon(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);

export const CartIcon = icon(
  <>
    <path d="M3 4h2.2l2 10.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.78L19.5 8H6" />
    <circle cx="9.5" cy="19.5" r="1.3" />
    <circle cx="17" cy="19.5" r="1.3" />
  </>
);

export const ChevronIcon = icon(<path d="m6 9 6 6 6-6" />, { width: 16, height: 16 });

export const HomeIcon = icon(
  <>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1v-9" />
  </>
);

export const GridIcon = icon(
  <>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.6" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" />
  </>
);

export const UserIcon = icon(
  <>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20c.8-3.6 3.8-5.6 7.5-5.6s6.7 2 7.5 5.6" />
  </>
);

export const PackageIcon = icon(
  <>
    <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
    <path d="m4 7 8 4 8-4M12 11v10" />
  </>
);

export const PlusIcon = icon(<path d="M12 5v14M5 12h14" />);
export const MinusIcon = icon(<path d="M5 12h14" />);
export const CheckIcon = icon(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const CloseIcon = icon(<path d="M6 6l12 12M18 6 6 18" />);
export const ArrowRightIcon = icon(<path d="M5 12h14M13 6l6 6-6 6" />);

export const TruckIcon = icon(
  <>
    <path d="M3 6.5h10.5V16H3zM13.5 10h4l3 3v3h-7" />
    <circle cx="7.5" cy="17.5" r="1.8" />
    <circle cx="16.5" cy="17.5" r="1.8" />
  </>
);

export const ClockIcon = icon(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </>
);

export const ShieldIcon = icon(
  <>
    <path d="M12 3 5 6v5.5c0 4.3 2.9 7.6 7 9 4.1-1.4 7-4.7 7-9V6l-7-3Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </>
);

export const MicIcon = icon(
  <>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </>
);

export const SparklesIcon = icon(
  <>
    <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
  </>
);

export const EnterIcon = icon(<path d="M20 5v6a3 3 0 0 1-3 3H5m0 0 4-4m-4 4 4 4" />);

export const StarIcon = icon(<path d="m12 3.6 2.5 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8 6.9 19.6l1-5.8-4.2-4.1 5.8-.8L12 3.6Z" />, { fill: "currentColor", strokeWidth: 1.2 });
export const ChevronLeftIcon = icon(<path d="m15 6-6 6 6 6" />);
export const ChevronRightIcon = icon(<path d="m9 6 6 6-6 6" />);

/* ---------- amenity + site icons ---------- */
const P = (d, extra) => icon(<path d={d} />, extra);
export const BedIcon = P('M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 12h.01');
export const UsersIcon = P('M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 6.6M18 14.8c2.2.6 3.5 2.4 3.5 5.2');
export const WifiIcon = P('M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01M2 9a15 15 0 0 1 20 0');
export const EyeIcon = P('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z');
export const CoffeeIcon = P('M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9ZM17 11h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3');
export const DeskIcon = P('M3 8h18v3H3zM5 11v8M19 11v8M9 14h6');
export const ShowerIcon = P('M4 21v-9a5 5 0 0 1 9-3M13 7l4 4M12 15v.01M15 15v.01M18 15v.01M12 19v.01M15 19v.01M18 19v.01');
export const BalconyIcon = P('M4 20h16M6 20V10h12v10M9 10V6h6v4M12 14v2');
export const SofaIcon = P('M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3v-5ZM6 18v2M18 18v2');
export const UtensilsIcon = P('M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1.5-3 4-3 7h3v11');
export const GlassIcon = P('M8 3h8l-.6 6a3.4 3.4 0 0 1-6.8 0L8 3ZM12 12.5V20M8.5 21h7');
export const WashIcon = P('M5 3h14v18H5zM5 7h14M12 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z');
export const AccessIcon = P('M12 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM12 7v6h5l2 5M9 10a5 5 0 1 0 6 7');
export const RulerIcon = P('M3 17 17 3l4 4L7 21l-4-4ZM7 13l2 2M10 10l2 2M13 7l2 2');
export const SnowIcon = P('M12 2v20M4.9 7l14.2 10M19.1 7 4.9 17M9 3.5l3 2 3-2M9 20.5l3-2 3 2');
export const ParkingIcon = P('M5 3h14v18H5zM9 17V7h4a3 3 0 0 1 0 6H9');
export const PinIcon = P('M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z');
export const PhoneIcon = P('M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z');
export const MailIcon = P('M3 6h18v12H3zM3 7l9 7 9-7');
export const PlaneIcon = P('M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z');
export const TrainIcon = P('M6 3h12a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2ZM4 11h16M8 21l2-3M16 21l-2-3M8 15h.01M16 15h.01');
export const BagIcon = P('M5 8h14l-1 12H6L5 8ZM9 8V6a3 3 0 0 1 6 0v2');
export const WavesIcon = P('M2 8c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M2 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M2 20c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2');
export const MountainIcon = P('m3 20 6-11 4 6 3-4 5 9H3Z');
export const SunIcon = P('M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4');
export const LeafIcon = P('M5 19c0-8 5-14 15-14 0 10-5 15-13 15M5 19c2-5 5-8 9-10');
export const CompassIcon = P('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z');
export const CarIcon = P('M5 16h14M4 16l1.5-5.5A2 2 0 0 1 7.4 9h9.2a2 2 0 0 1 1.9 1.5L20 16v3h-3v-2H7v2H4v-3ZM7.5 13h.01M16.5 13h.01');
export const GiftIcon = P('M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2 0-4-.5-4-2a2 2 0 0 1 4 0c0 1.5 0 2 0 2Zm0 0c2 0 4-.5 4-2a2 2 0 0 0-4 0');
export const HeartIcon = P('M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z');
export const TagIcon = P('M3 12V3h9l9 9-9 9ZM7.5 7.5h.01');
export const CalendarIcon = P('M4 6h16v14H4zM4 10h16M8 3v5M16 3v5');
export const HelpIcon = P('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01');
export const BriefcaseIcon = P('M4 8h16v11H4zM9 8V5h6v3M4 13h16');
export const CakeIcon = P('M4 20h16v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6ZM4 16c2 1.5 4-1.5 8 0s6-1.5 8 0M12 12V8M12 5.5v.01');
export const PlusSmallIcon = P('M12 5v14M5 12h14');

// the right icon for an amenity row from the admin ({label, value})
const AMENITY_ICONS = [
  [/^(bed|beds|bedrooms?)$/i, BedIcon], [/^(sleeps|guests)$/i, UsersIcon], [/^size$/i, RulerIcon],
  [/^views?$/i, EyeIcon], [/wi-?fi|internet/i, WifiIcon], [/breakfast/i, CoffeeIcon], [/coffee|tea|kettle/i, CoffeeIcon], [/pool|swim/i, WavesIcon], [/fridge/i, SnowIcon], [/desk|work/i, DeskIcon],
  [/shower|bath/i, ShowerIcon], [/balcony|terrace/i, BalconyIcon], [/lounge|living/i, SofaIcon],
  [/kitchen/i, UtensilsIcon], [/minibar|bar/i, GlassIcon], [/laundry|washer/i, WashIcon],
  [/access|wheelchair/i, AccessIcon], [/parking/i, ParkingIcon], [/air|a\/c|aircon|cooling/i, SnowIcon],
];
export const AmenityIcon = ({ label, ...props }) => {
  const match = AMENITY_ICONS.find(([test]) => test.test(String(label || '').trim()));
  const Cmp = match ? match[1] : CheckIcon;
  return <Cmp {...props} />;
};

// short readable text for a chip: "Queen bed", "Sea view", "Wi-Fi: Free", "Desk"
export const amenityText = ({ label = '', value = '' }) => {
  const l = String(label).trim(), v = String(value).trim();
  if (/^bed$/i.test(l)) return `${v} bed`;
  if (/^views?$/i.test(l)) return `${v} ${/^views$/i.test(l) ? 'views' : 'view'}`;
  if (/^(beds|size)$/i.test(l)) return v;
  if (/^(yes|included)$/i.test(v)) return l;
  if (/^free$/i.test(v)) return `Free ${l}`;
  return `${l}: ${v}`;
};

export const ExpandIcon = P('M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5');
export const ArrowLeftIcon = P('M20 12H4M10 6l-6 6 6 6');
export const ImagesIcon = P('M3 5h14v12H3zM7 21h14V9M3 14l4-4 4 4 3-3 3 3');

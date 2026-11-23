// Turns the paid-booking list + room list into everything the Dashboard shows.
import { formatRandWhole } from "./format";

const DAY = 86400000;
export const STATUSES = ["Confirmed", "Checked in", "Checked out", "Cancelled"];

export const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

// stay dates are stored as UTC midnight: compare them as calendar days, whatever the viewer's time zone
const stayDay = (value) => {
  const d = new Date(value);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};
const localDay = (value) => {
  const d = new Date(value);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
};

const linesOf = (booking) => (Array.isArray(booking.items) ? booking.items : []);
const roomsIn = (booking) => linesOf(booking).reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
const nightsOf = (booking) => (Number(booking.nights) || 0) * roomsIn(booking);   // room nights

// one bucket per calendar day (the day the booking was made), starting at `start`
const bucketByDay = (bookings, start, days) => {
  const buckets = Array.from({ length: days }, (_, i) => ({
    date: addDays(start, i),
    revenue: 0,
    bookings: 0,
    nights: 0,
  }));
  for (const booking of bookings) {
    const index = Math.round((startOfDay(booking.date) - start) / DAY);
    if (index < 0 || index >= days) continue;
    const bucket = buckets[index];
    bucket.revenue += Number(booking.amount) || 0;
    bucket.bookings += 1;
    bucket.nights += nightsOf(booking);
  }
  return buckets;
};

const totalsOf = (buckets) => {
  const revenue = buckets.reduce((sum, b) => sum + b.revenue, 0);
  const bookings = buckets.reduce((sum, b) => sum + b.bookings, 0);
  const nights = buckets.reduce((sum, b) => sum + b.nights, 0);
  return { revenue, bookings, nights, aov: bookings ? revenue / bookings : 0 };
};

// null = nothing to compare, isNew = there was nothing before, otherwise a percentage
export const deltaOf = (current, previous) => {
  if (!previous) return current ? { isNew: true, pct: null } : null;
  return { isNew: false, pct: ((current - previous) / previous) * 100 };
};

export function buildStats(allBookings, rooms, days, nowValue = new Date()) {
  const valid = allBookings.filter((b) => !Number.isNaN(new Date(b.date).getTime()));
  // cancelled stays are not income: they only show up in the pipeline
  const active = valid.filter((b) => b.status !== "Cancelled");

  const today = startOfDay(nowValue);
  const start = addDays(today, -(days - 1));
  const previousStart = addDays(start, -days);

  const current = bucketByDay(active, start, days);
  const previous = bucketByDay(active, previousStart, days);
  const totals = totalsOf(current);
  const prevTotals = totalsOf(previous);
  const deltas = {
    revenue: deltaOf(totals.revenue, prevTotals.revenue),
    bookings: deltaOf(totals.bookings, prevTotals.bookings),
    nights: deltaOf(totals.nights, prevTotals.nights),
    aov: deltaOf(totals.aov, prevTotals.aov),
  };

  const inPeriod = active.filter((b) => {
    const day = startOfDay(b.date);
    return day >= start && day <= today;
  });

  // ----- rooms booked in the period
  const roomById = new Map(rooms.map((room) => [String(room._id), room]));
  const sold = new Map();
  for (const booking of inPeriod) {
    const nights = Number(booking.nights) || 0;
    for (const line of linesOf(booking)) {
      const quantity = Number(line.quantity) || 0;
      const key = String(line.roomId || line.name);
      const entry = sold.get(key) || {
        key,
        roomId: line.roomId ? String(line.roomId) : null,
        fallbackName: line.name,
        units: 0,       // room nights
        revenue: 0,
      };
      entry.units += quantity * nights;
      entry.revenue += quantity * nights * (Number(line.price) || 0);
      sold.set(key, entry);
    }
  }
  const products = [...sold.values()].map((entry) => {
    const room = entry.roomId ? roomById.get(entry.roomId) : null;
    return {
      ...entry,
      exists: !!room,
      name: room?.name || entry.fallbackName || "Removed room",
      image: room?.image || null,
      category: room?.category || "Other",
    };
  });
  const top = [...products].sort((a, b) => b.revenue - a.revenue || b.units - a.units).slice(0, 5);

  // ----- revenue by room type (top 5 + "Other")
  const byCategory = new Map();
  for (const product of products) {
    byCategory.set(product.category, (byCategory.get(product.category) || 0) + product.revenue);
  }
  const otherRevenue = byCategory.get("Other") || 0;
  byCategory.delete("Other");
  const ranked = [...byCategory.entries()]
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
  const categories = ranked.slice(0, 5);
  const rest = ranked.slice(5).reduce((sum, c) => sum + c.revenue, 0) + otherRevenue;
  if (rest > 0) categories.push({ name: "Other", revenue: rest });
  const categoryTotal = categories.reduce((sum, c) => sum + c.revenue, 0);

  // ----- booking pipeline (every paid booking, not just this period)
  const counts = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  for (const booking of valid) {
    const status = STATUSES.includes(booking.status) ? booking.status : "Confirmed";
    counts[status] += 1;
  }

  // ----- arrivals: confirmed stays that have not been checked in yet
  const todayKey = localDay(nowValue);
  const waiting = valid.filter((b) => (STATUSES.includes(b.status) ? b.status : "Confirmed") === "Confirmed");
  const overdue = waiting.filter((b) => stayDay(b.checkIn) < todayKey && stayDay(b.checkOut) > todayKey).length;
  const arrivingToday = waiting.filter((b) => stayDay(b.checkIn) === todayKey).length;
  const arrivingWeek = waiting.filter((b) => {
    const d = stayDay(b.checkIn);
    return d > todayKey && d <= todayKey + 7 * DAY;
  }).length;

  // ----- plain-language insights
  const insights = [];
  if (overdue > 0) {
    insights.push({
      id: "overdue",
      tone: "warn",
      icon: "orders",
      title: `${overdue} ${overdue === 1 ? "guest hasn't" : "guests haven't"} been checked in`,
      body: "The stay has started but the booking is still marked Confirmed. Tap to update it.",
      to: "/bookings?status=Confirmed",
    });
  }
  if (arrivingToday > 0) {
    insights.push({
      id: "today",
      tone: "info",
      icon: "day",
      title: `${arrivingToday} ${arrivingToday === 1 ? "arrival" : "arrivals"} today`,
      body: "Get the rooms ready and check guests in as they arrive.",
      to: "/bookings?status=Confirmed",
    });
  } else if (arrivingWeek > 0) {
    insights.push({
      id: "week",
      tone: "info",
      icon: "day",
      title: `${arrivingWeek} ${arrivingWeek === 1 ? "arrival" : "arrivals"} in the next 7 days`,
      body: "Confirmed and paid. Tap to see who is coming.",
      to: "/bookings?status=Confirmed",
    });
  }

  if (deltas.revenue && !deltas.revenue.isNew) {
    const pct = Math.round(Math.abs(deltas.revenue.pct));
    if (pct >= 1) {
      const up = deltas.revenue.pct > 0;
      insights.push({
        id: "trend",
        tone: up ? "up" : "down",
        icon: up ? "up" : "down",
        title: `Revenue is ${up ? "up" : "down"} ${pct}%`,
        body: `${formatRandWhole(totals.revenue)} compared with ${formatRandWhole(prevTotals.revenue)} in the previous ${days} days.`,
      });
    }
  } else if (deltas.revenue?.isNew) {
    insights.push({
      id: "trend",
      tone: "up",
      icon: "up",
      title: "Bookings are picking up",
      body: `Nothing booked in the previous ${days} days, then ${totals.bookings} ${totals.bookings === 1 ? "booking" : "bookings"} in this period.`,
    });
  }

  const bookedIds = new Set(products.filter((p) => p.roomId).map((p) => p.roomId));
  const unbooked = rooms.filter((room) => !bookedIds.has(String(room._id)));
  if (inPeriod.length > 0 && unbooked.length > 0) {
    insights.push({
      id: "unbooked",
      tone: "info",
      icon: "products",
      title: `${unbooked.length} ${unbooked.length === 1 ? "room type hasn't" : "room types haven't"} been booked`,
      body: `No bookings in the last ${days} days. A fresh photo or a rate tweak might help.`,
      to: "/rooms",
    });
  }

  if (inPeriod.length === 0) {
    insights.push({
      id: "quiet",
      tone: "info",
      icon: "quiet",
      title: "A quiet stretch",
      body: `No paid bookings in the last ${days} days.`,
    });
  }

  return {
    days,
    series: { current, previous },
    totals,
    prevTotals,
    deltas,
    top,
    categories,
    categoryTotal,
    pipeline: { counts, total: valid.length },
    insights: insights.slice(0, 4),
    periodBookings: inPeriod.length,
    hasPrevious: prevTotals.bookings > 0,
  };
}

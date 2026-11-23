// The four stops an order passes through. "Order placed" is always done (we only list paid orders).
export const TRACK_STEPS = [
    { key: 'placed', label: 'Order placed', note: 'Payment received' },
    { key: 'Processing', label: 'Processing', note: 'We are packing your items' },
    { key: 'Out for delivery', label: 'Out for delivery', note: 'On its way to you' },
    { key: 'Delivered', label: 'Delivered', note: 'Enjoy!' },
];

// position of the order's current step in TRACK_STEPS (Delivered = last)
export const currentStep = (status) => {
    const i = TRACK_STEPS.findIndex((step) => step.key === status);
    return i < 1 ? 1 : i; // unknown statuses count as Processing
};

// the shop promises delivery within 7 working days (Monday to Friday)
export const DELIVERY_WORKING_DAYS = 7;
export const addWorkingDays = (start, days) => {
    const d = new Date(start);
    let left = days;
    while (left > 0) {
        d.setDate(d.getDate() + 1);
        const day = d.getDay();
        if (day !== 0 && day !== 6) left -= 1;
    }
    return d;
};

// when each step happened, if we know: { placed: Date, Processing?: Date, ... }
export const stepDates = (order) => {
    const dates = { placed: new Date(order.date) };
    for (const entry of order.statusHistory || []) {
        if (entry && entry.status && entry.at) dates[entry.status] = new Date(entry.at);
    }
    return dates;
};

// Promo codes live here. Add, remove or change them, then restart the server.
//   percent  : value% off the items (delivery is not discounted)
//   amount   : a fixed rand amount off the items, optional minSubtotal
//   shipping : delivery is free
// Codes are matched ignoring upper/lower case.
export const PROMOS = {
    WELCOME10: { type: "percent",  value: 10,  label: "10% off your items" },
    SAVE100:   { type: "amount",   value: 100, minSubtotal: 1000, label: "R100 off orders of R1 000 or more" },
    FREESHIP:  { type: "shipping", label: "Free delivery" },
};

const money = (n) => Math.round(n * 100) / 100;

// The one place prices are worked out. `subtotal` must come from database prices, never from the browser.
export const priceOrder = (subtotal, code, deliveryFee) => {
    const base = { subtotal, discount: 0, delivery: subtotal > 0 ? deliveryFee : 0 };
    const total = (r) => ({ ...r, total: money(r.subtotal - r.discount + r.delivery) });

    const key = String(code ?? "").trim().toUpperCase();
    if (!key) return { ok: true, ...total(base) };

    const promo = Object.prototype.hasOwnProperty.call(PROMOS, key) ? PROMOS[key] : null;
    if (!promo) return { ok: false, message: "That promo code is not valid", ...total(base) };
    if (promo.minSubtotal && subtotal < promo.minSubtotal) {
        return { ok: false, message: `${key} needs an order of R${promo.minSubtotal.toLocaleString("en-ZA")} or more`, ...total(base) };
    }

    const result = { ...base, ok: true, code: key, label: promo.label };
    if (promo.type === "percent") result.discount = money(Math.min(subtotal, subtotal * promo.value / 100));
    if (promo.type === "amount") result.discount = money(Math.min(subtotal, promo.value));
    if (promo.type === "shipping") result.delivery = 0;
    return total(result);
};

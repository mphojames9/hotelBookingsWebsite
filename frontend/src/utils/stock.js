// A product's `stock` is a number when the shop tracks it, and empty (null) when it does not.
export const LOW_STOCK = 5;

// how many can still be bought, or null when stock is not tracked
export const stockLeft = (product) =>
    product && typeof product.stock === 'number' ? Math.max(0, product.stock) : null;

export const stockInfo = (stock) => {
    const left = typeof stock === 'number' ? Math.max(0, stock) : null;
    return {
        left,
        out: left === 0,
        low: left !== null && left > 0 && left <= LOW_STOCK,
    };
};

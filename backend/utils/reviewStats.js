// Pure helpers (no database) so the maths can be tested on its own.

// { average: 4.3, count: 7, breakdown: {1:0,2:1,3:0,4:2,5:4} } for a list of ratings
export const summarise = (ratings) => {
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let count = 0;
    for (const value of ratings) {
        const n = Number(value);
        if (!Number.isInteger(n) || n < 1 || n > 5) continue;
        breakdown[n] += 1;
        total += n;
        count += 1;
    }
    return { average: count ? Math.round((total / count) * 10) / 10 : 0, count, breakdown };
};

// a rating must be a whole number from 1 to 5; undefined when it is not
export const cleanRating = (input) => {
    const n = Number(input);
    return Number.isInteger(n) && n >= 1 && n <= 5 ? n : undefined;
};

export const MAX_COMMENT = 600;
export const cleanComment = (input) => String(input ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_COMMENT);

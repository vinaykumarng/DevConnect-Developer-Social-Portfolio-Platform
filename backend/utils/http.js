// Small helpers shared by the Prisma controllers.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Malformed ids would make Prisma throw on a UUID column; treat them as "not found".
export const isUuid = (value) => typeof value === 'string' && UUID_RE.test(value);

// Clamp page/limit so ?limit=100000 can't dump the table.
export const parsePagination = (query, defaultLimit = 10, maxLimit = 50) => {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
    return { page, limit, skip: (page - 1) * limit };
};

export const buildPagination = ({ page, limit, skip }, total, returned) => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + returned < total,
});

// Public author fields only (never email).
export const authorSelect = { id: true, username: true, avatarUrl: true };

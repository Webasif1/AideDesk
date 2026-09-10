// Shared paging parser.
//
// Every list endpoint previously did `(Number(page) - 1) * Number(limit)` on raw
// query input, so `?page=0` produced skip:-10 — which MongoDB rejects outright,
// surfacing to the user as a 500 — and `?limit=100000` dumped an entire
// collection in one response. Both are fixed here rather than in five places.

const toInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

/** Clamp an integer query param into [min, max], falling back on garbage input. */
export const clampInt = (value, { min, max, fallback }) =>
  Math.min(max, Math.max(min, toInt(value, fallback)));

/**
 * @returns {{page:number, limit:number, skip:number}} always safe for Mongo
 */
export const parsePaging = (query = {}, { defaultLimit = 20, maxLimit = 100 } = {}) => {
  // Number.MAX_SAFE_INTEGER as the page ceiling keeps skip finite without
  // capping legitimate deep paging.
  const page = clampInt(query.page, { min: 1, max: Number.MAX_SAFE_INTEGER, fallback: 1 });
  const limit = clampInt(query.limit, { min: 1, max: maxLimit, fallback: defaultLimit });
  return { page, limit, skip: (page - 1) * limit };
};

/** Pagination envelope shared by every list response. */
export const pageMeta = (total, { page, limit }) => ({
  page,
  limit,
  total,
  pages: Math.max(1, Math.ceil(total / limit)),
});

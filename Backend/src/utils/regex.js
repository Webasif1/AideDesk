// Escape user input before it goes into a MongoDB $regex.
//
// Without this, a search for "c++" or "(" is either a syntax error or, worse, a
// pattern the user controls — "(a+)+$" against a long string is a catastrophic
// backtracking DoS. Everything here is a literal.
export const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

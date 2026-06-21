// lib/cookieOptions.js
export const COOKIE_NAME = "token";

export const cookieOptions = {
  httpOnly: true, // JavaScript in the browser can't read this cookie — blocks XSS token theft
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict", // cookie isn't sent on cross-site requests — blocks CSRF
  path: "/", // available on every route
  maxAge: 60 * 60 * 24 * 7, // 7 days, in seconds (matches JWT_EXPIRES_IN)
};
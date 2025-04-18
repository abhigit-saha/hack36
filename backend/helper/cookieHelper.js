import { serialize, parse } from 'cookie';

export const setCookie = (res, name, value, options = {}) => {
  const cookie = serialize(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    ...options,
  });

  res.setHeader('Set-Cookie', cookie);
};

export const getCookie = (req, name) => {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  return cookies[name] || null;
};

export const clearCookie = (res, name) => {
  res.setHeader('Set-Cookie', serialize(name, '', { maxAge: -1, path: '/' }));
};

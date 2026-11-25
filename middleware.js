import { createHmac, timingSafeEqual } from 'node:crypto';
import { next } from '@vercel/functions';

export const config = {
  matcher: ['/admin', '/admin.html'],
  runtime: 'nodejs',
};

const AUTH_COOKIE_NAME = 'dekastro_admin_auth';
const AUTH_COOKIE_MAX_AGE = 604800;

function unauthorized() {
  return new Response('Unauthorized: Access Denied', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="De Kastro Admin"',
    },
  });
}

function getAuthCookieSignature(password, expiresAt) {
  return createHmac('sha256', password)
    .update(`${AUTH_COOKIE_NAME}=verified.${expiresAt}`)
    .digest('hex');
}

function hasValidAuthCookie(request, password) {
  const cookieHeader = request.headers.get('cookie') || '';

  return cookieHeader.split(';').some((cookie) => {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name !== AUTH_COOKIE_NAME) {
      return false;
    }

    const value = valueParts.join('=');
    const [status, expiry, signature, ...extraParts] = value.split('.');
    if (
      status !== 'verified' ||
      !/^\d+$/.test(expiry || '') ||
      !/^[a-f0-9]{64}$/i.test(signature || '') ||
      extraParts.length > 0
    ) {
      return false;
    }

    const expiresAt = Number(expiry);
    const now = Math.floor(Date.now() / 1000);
    if (expiresAt <= now || expiresAt > now + AUTH_COOKIE_MAX_AGE) {
      return false;
    }

    const expectedSignature = Buffer.from(
      getAuthCookieSignature(password, expiresAt),
      'hex',
    );
    const suppliedSignature = Buffer.from(signature, 'hex');
    return timingSafeEqual(expectedSignature, suppliedSignature);
  });
}

function getAuthCookieValue(password) {
  const expiresAt = Math.floor(Date.now() / 1000) + AUTH_COOKIE_MAX_AGE;
  const signature = getAuthCookieSignature(password, expiresAt);
  return `verified.${expiresAt}.${signature}`;
}

export default function middleware(request) {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    throw new Error('Set ADMIN_USERNAME and ADMIN_PASSWORD in the Vercel project environment variables.');
  }

  if (expectedPassword.length < 16) {
    throw new Error('ADMIN_PASSWORD must be at least 16 characters long.');
  }

  if (hasValidAuthCookie(request, expectedPassword)) {
    return next();
  }

  const authorization = request.headers.get('authorization') || '';
  const match = /^Basic\s+([A-Za-z0-9+/]+={0,2})$/i.exec(authorization);

  if (!match) {
    return unauthorized();
  }

  const decodedCredentials = Buffer.from(match[1], 'base64').toString('utf8');
  const separator = decodedCredentials.indexOf(':');

  if (separator < 0) {
    return unauthorized();
  }

  const user = decodedCredentials.slice(0, separator);
  const password = decodedCredentials.slice(separator + 1);

  if (user !== expectedUser || password !== expectedPassword) {
    return unauthorized();
  }

  const response = next();
  response.headers.append(
    'Set-Cookie',
    `${AUTH_COOKIE_NAME}=${getAuthCookieValue(expectedPassword)}; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
  );
  return response;
}

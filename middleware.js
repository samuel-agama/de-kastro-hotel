import { next } from '@vercel/functions';

export const config = {
  matcher: ['/admin.html'],
  runtime: 'nodejs',
};

function unauthorized() {
  return new Response('Unauthorized: Access Denied', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
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

  return next();
}

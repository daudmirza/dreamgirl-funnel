import { rewrite } from '@vercel/edge';

export const config = {
  matcher: '/',
};

export default function middleware(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)ab-variant=([ab])/);
  let variant = match?.[1];
  const isNewVisitor = !variant;

  if (isNewVisitor) {
    variant = Math.random() < 0.5 ? 'a' : 'b';
  }

  const url = new URL(request.url);
  url.pathname = variant === 'b' ? '/b-index.html' : '/index.html';

  const response = rewrite(url);

  if (isNewVisitor) {
    response.headers.append(
      'Set-Cookie',
      `ab-variant=${variant}; Path=/; Max-Age=2592000; SameSite=Lax`
    );
  }

  return response;
}

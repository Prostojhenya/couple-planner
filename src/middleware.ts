import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Полностью отключаем server-side редиректы
  // Вся логика аутентификации обрабатывается на client-side
  // Это решает проблему с PWA и бесконечными редиректами
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/auth/:path*'],
};

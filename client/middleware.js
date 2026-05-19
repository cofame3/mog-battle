export function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. Пропускаем статику, API и файлы
  if (
    pathname.includes('.') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static')
  ) {
    return;
  }

  // 2. SEO нормализация слешей (/ru/ -> /ru)
  if (pathname.endsWith('/') && pathname !== '/') {
    url.pathname = pathname.slice(0, -1);
    return new Response(null, {
      status: 301,
      headers: { 'Location': url.toString() }
    });
  }

  // 3. Защита поисковых роботов от IP-редиректа
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /bot|google|yandex|baidu|bing|spider|crawl/i.test(userAgent);

  if (isBot) {
    return;
  }

  // Получаем куку языка
  const cookieHeader = request.headers.get('cookie') || '';
  let mogLang = null;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith('mog_lang=')) {
      mogLang = cookie.substring('mog_lang='.length);
      break;
    }
  }

  const isRuPath = pathname === '/ru' || pathname.startsWith('/ru/');

  // 4. Геолокация / Роутинг
  if (!isRuPath) {
    if (mogLang === 'ru') {
      url.pathname = `/ru${pathname === '/' ? '' : pathname}`;
      return new Response(null, {
        status: 307,
        headers: { 'Location': url.toString() }
      });
    } else if (!mogLang) {
      const country = request.headers.get('x-vercel-ip-country') || '';
      const cisCountries = ['RU', 'BY', 'KZ', 'UA', 'AM', 'AZ', 'GE', 'KG', 'MD', 'TJ', 'TM', 'UZ'];
      
      if (cisCountries.includes(country.toUpperCase())) {
        url.pathname = `/ru${pathname === '/' ? '' : pathname}`;
        
        // Безопасная ручная сборка ответа с редиректом И установкой куки
        return new Response(null, {
          status: 307,
          headers: {
            'Location': url.toString(),
            'Set-Cookie': 'mog_lang=ru; Path=/; Max-Age=31536000; SameSite=Lax'
          }
        });
      }
    }
  }

  // Если редирект не нужен — middleware просто пропускает запрос дальше
}

'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';
import { GA_TRACKING_ID, pageview } from '@/lib/gtag';

export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      pageview(pathname);
    }
  }, [pathname]);

  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              stream_id: '11450036506',
              site_name: 'TFlash',
              site_url: 'https://tflash.site',
              send_page_view: true,
              cookie_domain: 'tflash.site',
              cookie_flags: 'SameSite=None;Secure',
            });
          `,
        }}
      />
    </>
  );
}

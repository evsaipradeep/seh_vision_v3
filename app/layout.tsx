import type {Metadata, Viewport} from 'next';
import './globals.css';
import '@/lib/suppressTFLiteLogs';

export const metadata: Metadata = {
  title: 'Sankara Digital Vision Screening - Sankara Eye Hospital',
  description: 'Child-friendly visual acuity (tumbling-E) and colour vision digital screening application for Sankara Eye Hospital school eye-screening programs.',
  openGraph: {
    title: 'Sankara Digital Vision Screening',
    description: 'Standardized digital vision screening for school eye health programs by Sankara Eye Hospital.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sankara Digital Vision Screening',
    description: 'Standardized digital vision screening for school eye health programs by Sankara Eye Hospital.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ea580c',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  function isTfliteText(t) {
                    if (!t) return false;
                    var s = typeof t === 'string' ? t : (t && t.message ? t.message : String(t));
                    return s.indexOf('TensorFlow Lite') !== -1 ||
                           s.indexOf('XNNPACK') !== -1 ||
                           s.indexOf('delegate for CPU') !== -1 ||
                           s.trim().indexOf('INFO:') === 0;
                  }
                  function isTflite(args) {
                    if (!args || !args.length) return false;
                    for (var i = 0; i < args.length; i++) {
                      if (isTfliteText(args[i])) return true;
                    }
                    return false;
                  }

                  // Console Hooks (silently suppress without redirecting to console.info)
                  var origErr = console.error.bind(console);
                  console.error = function() {
                    if (isTflite(arguments)) return;
                    origErr.apply(console, arguments);
                  };

                  var origWarn = console.warn.bind(console);
                  console.warn = function() {
                    if (isTflite(arguments)) return;
                    origWarn.apply(console, arguments);
                  };

                  // 3. Error Event Listeners
                  window.addEventListener('error', function(e) {
                    if (isTfliteText(e && e.message)) {
                      e.preventDefault();
                      e.stopImmediatePropagation();
                    }
                  }, true);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="h-full antialiased bg-[#FFFDF9] text-slate-900 selection:bg-orange-100 selection:text-orange-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

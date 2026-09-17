/**
 * TensorFlow Lite & MediaPipe WASM Log Sanitizer
 * 
 * MediaPipe's underlying TensorFlow Lite C++ runtime prints delegate initialization
 * messages (such as "INFO: Created TensorFlow Lite XNNPACK delegate for CPU.") to stderr.
 * In WebAssembly (Emscripten), stderr output is routed to console.error by default.
 * 
 * This module hooks into console.error, console.warn, and unhandled rejection listeners
 * to cleanly discard benign informational delegate messages without interfering with
 * MediaPipe's internal ModuleFactory loader.
 */

export function isTfliteInfoMessage(args: any[]): boolean {
  if (!args || args.length === 0) return false;
  for (let i = 0; i < args.length; i++) {
    const item = args[i];
    if (typeof item === 'string') {
      if (
        item.includes('TensorFlow Lite') ||
        item.includes('XNNPACK') ||
        item.includes('delegate for CPU') ||
        item.trim().startsWith('INFO:')
      ) {
        return true;
      }
    } else if (item && typeof item.message === 'string') {
      if (
        item.message.includes('TensorFlow Lite') ||
        item.message.includes('XNNPACK') ||
        item.message.includes('delegate for CPU') ||
        item.message.trim().startsWith('INFO:')
      ) {
        return true;
      }
    }
  }
  return false;
}

export function installTfliteFilter(): void {
  if (typeof window === 'undefined') return;

  const win = window as any;

  // Wrap console.error and console.warn to silently discard benign delegate logs
  // CRITICAL: Do NOT define or mutate window.Module / self.Module, as MediaPipe Tasks Vision
  // depends on self.Module being undefined to pass its internally configured loader object.
  if (!win.__tflite_filter_installed) {
    win.__tflite_filter_installed = true;

    const originalConsoleError = console.error.bind(console);
    console.error = function (...args: any[]) {
      if (isTfliteInfoMessage(args)) {
        return; // Silently suppress benign TFLite informational delegate message
      }
      originalConsoleError(...args);
    };

    const originalConsoleWarn = console.warn.bind(console);
    console.warn = function (...args: any[]) {
      if (isTfliteInfoMessage(args)) {
        return; // Silently suppress
      }
      originalConsoleWarn(...args);
    };

    // Prevent any uncaught error events from tripping on TFLite INFO strings
    window.addEventListener(
      'error',
      (event: ErrorEvent) => {
        const msg = event?.message || '';
        if (typeof msg === 'string' && (
          msg.includes('TensorFlow Lite') ||
          msg.includes('XNNPACK') ||
          msg.includes('delegate for CPU') ||
          msg.trim().startsWith('INFO:')
        )) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true
    );

    window.addEventListener(
      'unhandledrejection',
      (event: PromiseRejectionEvent) => {
        const reason = event?.reason;
        const msg = typeof reason === 'string' ? reason : (reason?.message || '');
        if (typeof msg === 'string' && (
          msg.includes('TensorFlow Lite') ||
          msg.includes('XNNPACK') ||
          msg.includes('delegate for CPU') ||
          msg.trim().startsWith('INFO:')
        )) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true
    );
  }
}

// Auto-run immediately when imported on client
if (typeof window !== 'undefined') {
  installTfliteFilter();
}

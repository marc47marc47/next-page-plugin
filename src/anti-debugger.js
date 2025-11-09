(function() {
  'use strict';
  console.log('[Anime Next] Anti-debugger script loaded.');

  // --- Prevent Function-based debugger with a Proxy ---
  try {
    const originalFunction = window.Function;
    const functionHandler = {
      construct(target, args) {
        const source = args[args.length - 1] || '';
        if (typeof source === 'string' && source.includes('debugger')) {
          const newSource = source.replace(/debugger/g, '/* debugger disabled */');
          args[args.length - 1] = newSource;
        }
        return new target(...args);
      },
      apply(target, thisArg, args) {
        const source = args[args.length - 1] || '';
        if (typeof source === 'string' && source.includes('debugger')) {
          const newSource = source.replace(/debugger/g, '/* debugger disabled */');
          args[args.length - 1] = newSource;
        }
        return target.apply(thisArg, args);
      }
    };
    window.Function = new Proxy(originalFunction, functionHandler);
  } catch (e) {
    console.error('[Anime Next] Failed to apply Function proxy:', e);
  }

  // --- Override setInterval ---
  const originalSetInterval = window.setInterval;
  window.setInterval = function(handler, ...args) {
    if (typeof handler === 'function') {
      const handlerStr = handler.toString();
      if (handlerStr.includes('debugger')) {
        return -1;
      }
    } else if (typeof handler === 'string' && handler.includes('debugger')) {
      return -1;
    }
    return originalSetInterval(handler, ...args);
  };

  // --- Override setTimeout ---
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = function(handler, ...args) {
    if (typeof handler === 'function') {
      const handlerStr = handler.toString();
      if (handlerStr.includes('debugger')) {
        return -1;
      }
    } else if (typeof handler === 'string' && handler.includes('debugger')) {
      return -1;
    }
    return originalSetTimeout(handler, ...args);
  };

  // --- Override eval ---
  const originalEval = window.eval;
  window.eval = function(script) {
    if (typeof script === 'string' && script.includes('debugger')) {
      const newScript = script.replace(/debugger/g, '/* debugger disabled */');
      return originalEval(newScript);
    }
    return originalEval(script);
  };

  console.log('[Anime Next] Anti-debugger protection enabled.');
})();

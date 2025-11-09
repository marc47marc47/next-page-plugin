(function() {
  'use strict';
  console.log('[Anime Next] Anti-DevTools detection script loaded.');

  // ==================== 1. 只阻止 debugger 相關的 Function 構造 ====================

  const OriginalFunction = window.Function;
  window.Function = new Proxy(OriginalFunction, {
    construct(target, args) {
      const source = args[args.length - 1] || '';
      if (typeof source === 'string' && source.includes('debugger')) {
        const newSource = source.replace(/debugger/g, '/* debugger blocked */');
        args[args.length - 1] = newSource;
      }
      return new target(...args);
    },
    apply(target, thisArg, args) {
      const source = args[args.length - 1] || '';
      if (typeof source === 'string' && source.includes('debugger')) {
        const newSource = source.replace(/debugger/g, '/* debugger blocked */');
        args[args.length - 1] = newSource;
      }
      return target.apply(thisArg, args);
    }
  });

  // ==================== 2. 只阻止包含 debugger 的定時器 ====================

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

  // ==================== 3. 只清理包含 debugger 的 eval ====================

  const originalEval = window.eval;
  window.eval = function(script) {
    if (typeof script === 'string' && script.includes('debugger')) {
      const newScript = script.replace(/debugger/g, '/* debugger blocked */');
      return originalEval(newScript);
    }
    return originalEval(script);
  };

  // ==================== 4. 視窗大小偽裝（可選，較安全的版本）====================

  // 只有在差異非常大時才覆寫（避免破壞正常功能）
  try {
    const originalOuterWidth = window.outerWidth;
    const originalOuterHeight = window.outerHeight;
    const widthDiff = originalOuterWidth - window.innerWidth;
    const heightDiff = originalOuterHeight - window.innerHeight;

    // 只有在差異超過 200px 時才覆寫（表示 DevTools 可能開啟）
    if (widthDiff > 200 || heightDiff > 200) {
      Object.defineProperty(window, 'outerWidth', {
        get: function() {
          return window.innerWidth;
        },
        configurable: true
      });
      Object.defineProperty(window, 'outerHeight', {
        get: function() {
          return window.innerHeight;
        },
        configurable: true
      });
    }
  } catch (e) {
    // 忽略錯誤，不影響正常運作
  }

  // ==================== 5. 隱藏特定的 DevTools 檢測變數 ====================

  // 只隱藏明確用於檢測的變數，不影響其他功能
  const detectorVariables = ['Firebug'];

  detectorVariables.forEach(varName => {
    try {
      if (typeof window[varName] === 'undefined') {
        Object.defineProperty(window, varName, {
          get: function() {
            return undefined;
          },
          set: function() {},
          configurable: true
        });
      }
    } catch (e) {
      // 忽略
    }
  });

  // ==================== 6. 清理 Error stack trace（只移除擴充功能痕跡）====================

  const OriginalError = Error;
  window.Error = new Proxy(OriginalError, {
    construct: function(target, args) {
      const error = new target(...args);

      try {
        const originalStack = error.stack;

        Object.defineProperty(error, 'stack', {
          get: function() {
            if (!originalStack) return originalStack;

            // 只移除擴充功能相關的行，保留其他所有內容
            return originalStack
              .split('\n')
              .filter(line => !line.includes('chrome-extension://'))
              .filter(line => !line.includes('anti-devtools'))
              .filter(line => !line.includes('anti-debugger'))
              .join('\n');
          },
          configurable: true
        });
      } catch (e) {
        // 如果無法修改 stack，保持原樣
      }

      return error;
    }
  });

  // 保留所有靜態方法和屬性（不使用 setPrototypeOf 以避免循環引用）
  // 直接複製靜態方法
  if (OriginalError.captureStackTrace) {
    window.Error.captureStackTrace = OriginalError.captureStackTrace;
  }
  if (OriginalError.stackTraceLimit !== undefined) {
    window.Error.stackTraceLimit = OriginalError.stackTraceLimit;
  }
  // 複製其他可能的靜態屬性
  for (const key in OriginalError) {
    if (OriginalError.hasOwnProperty(key)) {
      try {
        window.Error[key] = OriginalError[key];
      } catch (e) {
        // 忽略無法複製的屬性
      }
    }
  }

  console.log('[Anime Next] Anti-DevTools detection enabled.');

})();

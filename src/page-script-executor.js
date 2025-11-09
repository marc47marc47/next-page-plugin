// 頁面腳本執行器 - 在頁面上下文中運行
// 這個腳本會被注入到頁面中，監聽來自 content script 的指令

(function() {
  'use strict';

  // 監聽來自 content script 的執行請求
  document.addEventListener('__animeNext_executeCode__', function(event) {
    const { code, type } = event.detail;

    try {
      if (type === 'function') {
        // 執行函數調用
        const match = code.match(/^(\w+)\s*\((.*)\)$/);
        if (match) {
          const functionName = match[1];
          const argsString = match[2];

          if (typeof window[functionName] === 'function') {
            let args = [];
            if (argsString.trim()) {
              try {
                args = JSON.parse(`[${argsString}]`);
              } catch (e) {
                args = [];
              }
            }

            window[functionName](...args);

            // 發送成功事件
            document.dispatchEvent(new CustomEvent('__animeNext_executeResult__', {
              detail: { success: true }
            }));
          } else {
            // 函數不存在
            document.dispatchEvent(new CustomEvent('__animeNext_executeResult__', {
              detail: { success: false, error: 'Function not found: ' + functionName }
            }));
          }
        }
      } else if (type === 'code') {
        // 直接執行代碼
        (new Function(code))();

        document.dispatchEvent(new CustomEvent('__animeNext_executeResult__', {
          detail: { success: true }
        }));
      }
    } catch (error) {
      // 發送錯誤事件
      document.dispatchEvent(new CustomEvent('__animeNext_executeResult__', {
        detail: { success: false, error: error.message }
      }));
    }
  });

  // 標記腳本已載入
  window.__animeNextExecutorLoaded__ = true;

})();

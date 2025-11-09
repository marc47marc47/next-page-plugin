# CSP 繞過解決方案

## 問題
Chrome 擴充功能的 Content Script 無法直接執行 `javascript:` 連結或使用 `eval()`，因為受到 Content Security Policy (CSP) 限制。

## 解決方案
使用 **CustomEvent 通訊機制** 在頁面上下文和 Content Script 之間傳遞訊息。

## 架構

```
┌─────────────────────┐         ┌──────────────────────┐
│  Content Script     │         │  Page Context        │
│  (content.js)       │         │  (頁面的 window)     │
│                     │         │                      │
│  1. 找到按鈕        │         │                      │
│  2. 提取 href       │         │                      │
│  3. 發送事件 →──────┼────────→│  4. 接收事件         │
│                     │         │  5. 執行函數         │
│  7. 接收結果 ←──────┼────────←│  6. 回傳結果         │
└─────────────────────┘         └──────────────────────┘
```

## 文件說明

### 1. `page-script-executor.js`
- 在頁面上下文中運行
- 監聽 `__animeNext_executeCode__` 事件
- 執行 JavaScript 代碼
- 發送 `__animeNext_executeResult__` 事件回傳結果

### 2. `content.js`
- 包含 `executeInPageContext(code, type)` 函數
- 使用 CustomEvent 與頁面通訊
- 自動載入 page-script-executor.js
- 處理超時和錯誤

## 使用方式

### 測試步驟

1. **重新載入擴充功能**
   ```
   chrome://extensions/ → 找到「Anime Next」→ 🔄 重新載入
   ```

2. **打開測試頁面**
   ```
   file:///C:/Users/marc4/js/anime-next/test-button-finder.html
   ```

3. **按鍵盤方向鍵測試**
   - 右鍵 → 執行 nextPage()
   - 左鍵 → 執行 prevPage()

### 預期 Console 輸出

```
[Anime Next] 開始初始化...
[Anime Next] 頁面執行器已載入
[Anime Next] 找到按鈕 (文字/腳本): next
[Anime Next] 智能點擊 - {tag: 'a', href: 'javascript:nextPage();', hasOnclick: false}
[Anime Next] 處理 javascript: 連結
[Anime Next] JavaScript 代碼: nextPage()
[Anime Next] 偵測到函數調用，在頁面上下文中執行...
[Anime Next] 代碼執行成功
[Test] nextPage() called, now on page 2
```

## 技術細節

### 為什麼 CustomEvent 可以繞過 CSP？

1. **CustomEvent 是 DOM API**，不受 CSP 的 `script-src` 限制
2. **事件在不同上下文間傳遞數據**，不涉及代碼執行
3. **page-script-executor.js 通過 src 屬性載入**，屬於 `chrome-extension://` 來源，被 CSP 允許

### 安全性

這個方法是安全的，因為：
- ✅ 只在用戶授權的擴充功能中運行
- ✅ 只執行來自可信來源（按鈕的 href 或 onclick）的代碼
- ✅ 不允許任意代碼注入
- ✅ 有完整的錯誤處理和超時機制

## 故障排除

### 如果按鈕沒有反應

1. **檢查 Console 是否有錯誤**
2. **確認執行器已載入**
   ```javascript
   console.log(window.__animeNextExecutorLoaded__); // 應該是 true
   ```
3. **手動測試函數是否存在**
   ```javascript
   console.log(typeof nextPage); // 應該是 'function'
   ```

### 如果仍然有 CSP 錯誤

某些網站的 CSP 可能特別嚴格，阻止載入外部腳本。在這種情況下：
- 檢查網站的 CSP header
- 考慮使用 declarativeNetRequest API 修改 CSP（需要額外權限）

## 支援的按鈕類型

| 類型 | 範例 | 是否支援 |
|------|------|---------|
| javascript: 連結 | `<a href="javascript:nextPage()">` | ✅ |
| onclick 屬性 | `<button onclick="nextPage()">` | ✅ |
| 普通連結 | `<a href="/page/2">` | ✅ |
| 事件監聽器 | `addEventListener('click', ...)` | ✅ |

## 版本歷史

- **v1.0**: 初始版本，使用 eval（失敗，CSP 阻止）
- **v2.0**: 使用 script injection（失敗，CSP 阻止）
- **v3.0**: 使用 CustomEvent 通訊機制（成功！）

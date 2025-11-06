# Anime Next - 開發文件

## 專案概述

### 專案名稱
**Anime Next** - 智能鍵盤導航擴充功能

### 版本資訊
- **當前版本**: v1.0.0
- **最後更新**: 2024-11-07
- **Manifest 版本**: Chrome Extension Manifest V3

### 專案目標
建立一個全功能的 Chrome/Edge 瀏覽器擴充功能，透過智能的四層導航策略，讓使用者能夠在任何類型的分頁網站上使用鍵盤方向鍵進行導航，大幅提升瀏覽體驗。

### 核心特色
- 🎯 四層智能導航策略，適應所有類型的分頁網站
- 🌍 多語言支援（英、中、日、韓、西、法、德）
- ⚡ 高效能，低延遲（< 100ms）
- 🎨 可選的視覺回饋效果
- 🔧 完整的自訂配置選項
- 📦 輕量級設計，不影響網頁效能

---

## 技術架構

### 四層導航策略

```
┌─────────────────────────────────────────┐
│  用戶按下方向鍵 (← 或 →)                  │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  第 1 層：按鈕導航 (Button Navigation)    │
│  • 透過 ID 查找按鈕                       │
│  • 透過 Class 查找按鈕                    │
│  • 透過 Data 屬性查找                     │
│  • 支援自訂按鈕 ID                        │
└─────────────────┬───────────────────────┘
                  ↓ 找不到按鈕
┌─────────────────────────────────────────┐
│  第 2 層：URL 參數導航                    │
│  • 讀取 URL 中的頁碼參數                  │
│  • 計算目標頁碼 (±1)                      │
│  • 構建新 URL 並導航                      │
│  • 支援自訂參數名稱                       │
└─────────────────┬───────────────────────┘
                  ↓ URL 沒有頁碼參數
┌─────────────────────────────────────────┐
│  第 3 層：智能連結掃描                    │
│  • 掃描所有 <a> 標籤                      │
│  • 提取包含頁碼的連結                     │
│  • 推斷當前頁碼                           │
│  • 導航到目標頁碼的連結                   │
└─────────────────┬───────────────────────┘
                  ↓ 沒有分頁連結
┌─────────────────────────────────────────┐
│  第 4 層：Load More 按鈕檢測              │
│  • 掃描 button 和 link 元素               │
│  • 多語言關鍵字匹配                       │
│  • Class/ID 模式匹配                      │
│  • 自動點擊 Load More 按鈕                │
└─────────────────┬───────────────────────┘
                  ↓
         ✅ 導航成功 or ❌ 所有方法失敗
```

### 技術棧

- **開發語言**: JavaScript (ES6+)
- **擴充功能標準**: Chrome Extension Manifest V3
- **依賴**: 無外部依賴（純 Vanilla JavaScript）
- **最低瀏覽器版本**:
  - Chrome: 88+
  - Edge: 88+

### 核心組件架構

```
┌──────────────────────────────────────────────┐
│  Browser (Chrome/Edge)                       │
├──────────────────────────────────────────────┤
│  Extension Framework (Manifest V3)           │
├────────┬─────────────────┬───────────────────┤
│        │                 │                   │
│  [1]   │   [2]          │   [3]             │
│ Back-  │ Content        │ Popup             │
│ ground │ Script         │ UI                │
│ ────── │ ────────       │ ─────             │
│ 狀態   │ 核心邏輯       │ 設定介面          │
│ 管理   │ 四層導航       │ 使用者配置        │
│        │ 事件處理       │                   │
│        │                 │                   │
└────────┴─────────────────┴───────────────────┘
         ↓                 ↓
┌──────────────────────────────────────────────┐
│  Chrome Storage API (同步設定)                │
└──────────────────────────────────────────────┘
```

---

## 檔案結構

```
anime-next/
├── manifest.json                  # 擴充功能配置檔案
├── content.js                    # 內容腳本（核心邏輯，900+ 行）
├── background.js                 # 背景服務腳本
├── popup.html                    # 彈出視窗 UI
├── popup.js                      # 彈出視窗邏輯（260+ 行）
│
├── icons/                        # 圖示資源
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── styles/                       # 樣式檔案
│   └── content.css              # 內容腳本樣式（視覺回饋）
│
├── test/                         # 測試頁面
│   ├── test-page.html           # 基本按鈕導航測試
│   ├── custom-id-test.html      # 自訂 ID 測試
│   ├── url-navigation-test.html # URL 參數導航測試
│   ├── href-scan-test.html      # 連結掃描測試
│   └── load-more-test.html      # Load More 檢測測試
│
├── docs/                         # 文件資料夾
│   ├── README.md                # 專案說明
│   ├── DEVELOP.md               # 開發文件（本檔案）
│   ├── INSTALL.md               # 安裝指南
│   ├── TESTING.md               # 測試指南
│   ├── COMPATIBILITY.md         # 相容性說明
│   ├── CUSTOM-ID-GUIDE.md       # 自訂 ID 指南
│   ├── URL-NAVIGATION-GUIDE.md  # URL 導航指南
│   ├── HREF-SCAN-GUIDE.md       # 連結掃描指南
│   ├── LOAD-MORE-GUIDE.md       # Load More 指南
│   └── NAVIGATION-STRATEGIES.md # 導航策略總覽
│
├── Edge載入說明.txt             # Edge 瀏覽器載入說明
├── 快速安裝指南.txt             # 快速安裝指南
└── TODO.md                      # 開發待辦事項
```

---

## 核心模組詳解

### 1. Content Script (content.js)

**職責**: 注入到所有網頁，處理鍵盤事件和執行導航邏輯

#### 主要功能模組

```javascript
// 1. 配置管理
const CONFIG = {
  BUTTON_SELECTORS: { ... },
  DISABLED_CLASS: 'disabled',
  CACHE_TIMEOUT: 5000,
  DEBOUNCE_DELAY: 50
};

// 2. 設定狀態
let settings = {
  enabled: true,
  visualFeedback: true,
  customNextIds: [],
  customPrevIds: [],
  urlNavigation: true,
  urlParamName: 'page',
  hrefScan: true,
  loadMore: true
};

// 3. 按鈕快取
let buttonCache = {
  next: null,
  previous: null,
  lastUpdate: 0
};
```

#### 核心函數

##### 第 1 層：按鈕導航

```javascript
/**
 * 查找分頁按鈕（多策略）
 * @param {string} type - 'next' 或 'previous'
 * @returns {HTMLElement|null}
 */
function findButton(type) {
  // 策略 0: 自訂 ID
  // 策略 1: 預設 ID
  // 策略 2: Class 選擇器
  // 策略 3: Data 屬性
}

/**
 * 點擊下一頁按鈕
 * 包含四層策略的完整邏輯
 */
function clickNextButton() {
  // 1. 嘗試按鈕導航
  // 2. 嘗試 URL 參數導航
  // 3. 嘗試連結掃描
  // 4. 嘗試 Load More
}

/**
 * 點擊上一頁按鈕
 */
function clickPreviousButton() {
  // 類似 clickNextButton
  // 但上一頁不使用 Load More
}
```

##### 第 2 層：URL 參數導航

```javascript
/**
 * 獲取當前 URL 的頁碼
 * @returns {number|null}
 */
function getCurrentPageNumber() {
  // 解析 URL 參數
  // 返回頁碼或 null
}

/**
 * 導航到指定頁碼
 * @param {number} pageNumber
 */
function navigateToPage(pageNumber) {
  // 構建新 URL
  // 執行頁面跳轉
}

/**
 * 導航到下一頁（URL 方式）
 * @returns {boolean} 是否成功
 */
function navigateToNextPage() {
  // 當前頁 +1
  // 跳轉到新頁
}

/**
 * 導航到上一頁（URL 方式）
 * @returns {boolean} 是否成功
 */
function navigateToPreviousPage() {
  // 當前頁 -1
  // 跳轉到新頁
}
```

##### 第 3 層：智能連結掃描

```javascript
/**
 * 從 URL 字串提取頁碼
 * @param {string} url
 * @returns {number|null}
 */
function extractPageNumber(url) {
  // 方法 1: URL API
  // 方法 2: 正則表達式
}

/**
 * 掃描頁面中所有包含頁碼的連結
 * @returns {Array<{url, pageNumber, element, text}>}
 */
function scanPageLinks() {
  // 獲取所有 <a> 標籤
  // 過濾包含頁碼的連結
  // 轉換為絕對路徑
}

/**
 * 查找指定頁碼的連結
 * @param {number} targetPage
 * @returns {string|null}
 */
function findLinkByPageNumber(targetPage) {
  // 掃描連結
  // 匹配目標頁碼
}

/**
 * 通過連結導航到下一頁
 * @returns {boolean}
 */
function navigateToNextPageByHref() {
  // 推斷當前頁碼
  // 查找下一頁連結
  // 執行導航
}

/**
 * 通過連結導航到上一頁
 * @returns {boolean}
 */
function navigateToPreviousPageByHref() {
  // 推斷當前頁碼
  // 查找上一頁連結
  // 執行導航
}
```

##### 第 4 層：Load More 按鈕檢測

```javascript
/**
 * 掃描 Load More 按鈕（多語言、多策略）
 * @returns {HTMLElement|null}
 */
function findLoadMoreButton() {
  // 關鍵字列表（7+ 種語言）
  const loadMoreKeywords = [
    'load more', 'show more', 'view more',
    '載入更多', '顯示更多', '查看更多',
    'もっと見る', '더 보기',
    'ver más', 'voir plus', 'mehr laden'
  ];

  // 策略 1: button 元素
  // 策略 2: link 元素
  // 策略 3: class/id 模式
}

/**
 * 點擊 Load More 按鈕
 * @returns {boolean}
 */
function clickLoadMoreButton() {
  // 查找按鈕
  // 添加視覺回饋
  // 執行點擊
}
```

##### 輔助功能

```javascript
/**
 * 檢查元素是否為輸入類型
 * @param {HTMLElement} element
 * @returns {boolean}
 */
function isInputElement(element) {
  // 檢查 tag name
  // 檢查 contenteditable
}

/**
 * 添加視覺回饋效果
 * @param {HTMLElement} button
 */
function addVisualFeedback(button) {
  // 添加 CSS class
  // 600ms 後移除
}

/**
 * 更新按鈕快取
 */
function updateButtonCache() {
  // 搜尋按鈕
  // 更新快取
  // 記錄時間戳
}

/**
 * 清除按鈕快取
 */
function clearButtonCache() {
  // 重置快取
}
```

##### 事件處理

```javascript
/**
 * 處理鍵盤事件（主入口）
 * @param {KeyboardEvent} event
 */
function handleKeyDown(event) {
  // 檢查擴充功能是否啟用
  // 檢查焦點是否在輸入框
  // 處理 ArrowLeft/ArrowRight
}

/**
 * 設定 MutationObserver
 * 監聽 DOM 變化，自動更新按鈕快取
 */
function setupMutationObserver() {
  // 觀察 childList
  // 觀察 attributes
  // 過濾分頁相關變化
}

/**
 * 設定訊息監聽器
 * 接收來自 popup 的設定更新
 */
function setupMessageListener() {
  // 監聽 updateSettings
  // 監聽 getStatus
  // 監聽 clearCache
}

/**
 * 設定儲存監聽器
 * 即時同步設定變更
 */
function setupStorageListener() {
  // 監聽 enabled
  // 監聽 visualFeedback
  // 監聽 urlNavigation
  // 監聽 hrefScan
  // 監聽 loadMore
}
```

##### 初始化與清理

```javascript
/**
 * 初始化擴充功能
 */
async function init() {
  // 載入設定
  // 初始化快取
  // 設定 MutationObserver
  // 添加事件監聽器
  // 設定訊息監聽器
  // 設定儲存監聽器
}

/**
 * 清理資源
 */
function cleanup() {
  // 斷開 MutationObserver
  // 清除計時器
  // 清除快取
}
```

### 2. Popup UI (popup.html & popup.js)

**職責**: 提供使用者設定介面

#### UI 組件

```html
<!-- 狀態指示 -->
<div class="status">
  <div class="status-dot active"></div>
  <span class="status-text">擴充功能已啟用</span>
</div>

<!-- 主要設定 -->
<div class="setting-item">
  <div class="setting-header">
    <span class="setting-title">啟用鍵盤導航</span>
    <label class="toggle-switch">
      <input type="checkbox" id="enable-toggle" checked>
      <span class="slider"></span>
    </label>
  </div>
</div>

<!-- 視覺回饋設定 -->
<div class="setting-item">...</div>

<!-- URL 參數導航設定 -->
<div class="setting-item">...</div>

<!-- 智能連結掃描設定 -->
<div class="setting-item">...</div>

<!-- Load More 檢測設定 -->
<div class="setting-item">...</div>

<!-- 自訂按鈕 ID 設定 -->
<div class="setting-item">
  <textarea id="custom-next-ids"></textarea>
  <textarea id="custom-prev-ids"></textarea>
  <button id="save-custom-ids-btn">儲存自訂 ID</button>
</div>
```

#### Popup 邏輯

```javascript
// DOM 元素引用
const elements = {
  enableToggle: ...,
  visualFeedbackToggle: ...,
  urlNavigationToggle: ...,
  urlParamName: ...,
  hrefScanToggle: ...,
  loadMoreToggle: ...,
  customNextIds: ...,
  customPrevIds: ...,
  saveCustomIdsBtn: ...
};

// 預設設定
const DEFAULT_SETTINGS = {
  enabled: true,
  visualFeedback: true,
  customNextIds: [],
  customPrevIds: [],
  urlNavigation: true,
  urlParamName: 'page',
  hrefScan: true,
  loadMore: true
};

/**
 * 載入設定
 */
async function loadSettings() {
  const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  // 更新 UI
}

/**
 * 儲存設定
 */
async function saveSettings(settings) {
  await chrome.storage.sync.set(settings);
  // 通知所有分頁
}

/**
 * 通知內容腳本更新設定
 */
async function notifyContentScripts(settings) {
  const tabs = await chrome.tabs.query({});
  // 發送訊息到所有分頁
}

/**
 * 更新狀態顯示
 */
function updateStatus(enabled) {
  // 更新狀態圖示和文字
}

/**
 * 顯示通知訊息
 */
function showNotification(message, type = 'success') {
  // 顯示彈出通知
  // 3秒後自動消失
}

/**
 * 儲存自訂 ID
 */
async function saveCustomIds() {
  // 解析 textarea 內容
  // 儲存到設定
}

/**
 * 重置設定
 */
async function resetSettings() {
  // 確認對話框
  // 恢復預設值
}
```

### 3. Background Service Worker (background.js)

**職責**: 管理擴充功能的全域狀態

```javascript
/**
 * 監聽擴充功能安裝事件
 */
chrome.runtime.onInstalled.addListener((details) => {
  // 首次安裝
  if (details.reason === 'install') {
    // 設定預設值
  }
  // 更新
  if (details.reason === 'update') {
    // 遷移舊設定
  }
});

/**
 * 監聽圖示點擊事件（可選）
 */
chrome.action.onClicked.addListener((tab) => {
  // 開啟 popup 或執行動作
});
```

---

## 資料流與通訊

### 1. 設定同步流程

```
┌──────────┐      saveSettings()      ┌──────────────────┐
│  Popup   │ ──────────────────────> │ Chrome Storage   │
│   UI     │                          │      API         │
└──────────┘                          └──────────────────┘
     │                                         │
     │ notifyContentScripts()                 │
     ↓                                         ↓
┌──────────┐      chrome.tabs.sendMessage    ┌──────────────────┐
│ Content  │ <──────────────────────────────│  All Tabs        │
│ Scripts  │                                 │                  │
└──────────┘      storage.onChanged          └──────────────────┘
     ↑
     └─────────────────────────────────────────────┘
                自動監聽並更新
```

### 2. 導航執行流程

```
用戶按鍵
    ↓
handleKeyDown()
    ↓
檢查 settings.enabled
    ↓
檢查 isInputElement()
    ↓
clickNextButton() / clickPreviousButton()
    ↓
┌─ 第 1 層: findButton()
│  ├─ 成功 → button.click() → ✅
│  └─ 失敗 ↓
├─ 第 2 層: navigateToNextPage()
│  ├─ 成功 → window.location.href = newUrl → ✅
│  └─ 失敗 ↓
├─ 第 3 層: navigateToNextPageByHref()
│  ├─ 成功 → window.location.href = linkUrl → ✅
│  └─ 失敗 ↓
└─ 第 4 層: clickLoadMoreButton()
   ├─ 成功 → button.click() → ✅
   └─ 失敗 → ❌ 所有方法失敗
```

---

## API 參考

### Chrome Extension API 使用

#### chrome.storage.sync

```javascript
// 讀取
chrome.storage.sync.get(keys, callback);
chrome.storage.sync.get({ key: defaultValue });

// 寫入
chrome.storage.sync.set({ key: value });

// 監聽變更
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    // 處理變更
  }
});
```

#### chrome.runtime

```javascript
// 發送訊息
chrome.runtime.sendMessage({ action: 'updateSettings', settings: {...} });

// 監聽訊息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 處理訊息
  sendResponse({ received: true });
  return false; // 或 true（如果異步）
});
```

#### chrome.tabs

```javascript
// 查詢所有分頁
chrome.tabs.query({}, (tabs) => {
  tabs.forEach(tab => {
    // 處理每個分頁
  });
});

// 發送訊息到分頁
chrome.tabs.sendMessage(tabId, message, (response) => {
  // 處理回應
});
```

### 內部 API

#### 導航 API

```javascript
// 第 1 層：按鈕導航
findButton(type: 'next' | 'previous'): HTMLElement | null
clickNextButton(): void
clickPreviousButton(): void

// 第 2 層：URL 參數導航
getCurrentPageNumber(): number | null
navigateToPage(pageNumber: number): void
navigateToNextPage(): boolean
navigateToPreviousPage(): boolean

// 第 3 層：連結掃描
extractPageNumber(url: string): number | null
scanPageLinks(): Array<{url, pageNumber, element, text}>
findLinkByPageNumber(targetPage: number): string | null
navigateToNextPageByHref(): boolean
navigateToPreviousPageByHref(): boolean

// 第 4 層：Load More
findLoadMoreButton(): HTMLElement | null
clickLoadMoreButton(): boolean
```

#### 快取管理 API

```javascript
updateButtonCache(): void
clearButtonCache(): void
getCachedButton(type: 'next' | 'previous'): HTMLElement | null
```

#### 工具函數 API

```javascript
isInputElement(element: HTMLElement): boolean
addVisualFeedback(button: HTMLElement): void
```

---

## 性能優化策略

### 1. 按鈕快取機制

**問題**: 每次按鍵都搜尋按鈕會影響性能

**解決方案**:
```javascript
// 快取結構
let buttonCache = {
  next: null,        // 快取的按鈕元素
  previous: null,
  lastUpdate: 0      // 最後更新時間戳
};

// 快取策略
const CACHE_TIMEOUT = 5000; // 5秒過期

function getCachedButton(type) {
  const now = Date.now();

  // 檢查快取是否過期
  if (now - buttonCache.lastUpdate > CACHE_TIMEOUT) {
    updateButtonCache();
  }

  // 檢查快取的元素是否還在 DOM 中
  if (buttonCache[type] && !document.contains(buttonCache[type])) {
    updateButtonCache();
  }

  return buttonCache[type];
}
```

**效果**:
- ✅ 減少 DOM 查詢次數
- ✅ 降低 CPU 使用率
- ✅ 提升響應速度

### 2. MutationObserver 智能監聽

**問題**: DOM 變化時快取可能失效

**解決方案**:
```javascript
const mutationObserver = new MutationObserver((mutations) => {
  let shouldUpdateCache = false;

  for (const mutation of mutations) {
    // 只關注分頁相關的變化
    if (isPaginationRelated(mutation)) {
      shouldUpdateCache = true;
      break;
    }
  }

  if (shouldUpdateCache) {
    clearButtonCache();
    updateButtonCache();
  }
});

mutationObserver.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'disabled', 'data-dt-idx']
});
```

**效果**:
- ✅ 自動檢測分頁結構變化
- ✅ 及時更新快取
- ✅ 過濾無關的 DOM 變化

### 3. 防抖處理

**問題**: 快速連續按鍵可能導致重複執行

**解決方案**:
```javascript
let debounceTimer = null;
const DEBOUNCE_DELAY = 50; // 50ms

function handleKeyDownDebounced(event) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    handleKeyDownImmediate(event);
  }, DEBOUNCE_DELAY);
}
```

**注意**: 目前實作中，方向鍵直接執行（不使用防抖），因為用戶期望即時響應。

### 4. 選擇器優化

**策略 1**: 使用最高效的選擇器
```javascript
// ✅ 優秀：直接 ID 查找（最快）
document.getElementById('table-list_next');

// ⚠️ 一般：Class 選擇器
document.querySelector('.paginate_button.next');

// ❌ 避免：複雜的選擇器
document.querySelector('div > ul > li > a.next');
```

**策略 2**: 提前返回
```javascript
function findButton(type) {
  // 策略 0: 自訂 ID（最快）
  let button = findByCustomId(type);
  if (button) return button;  // 立即返回

  // 策略 1: 預設 ID
  button = findByDefaultId(type);
  if (button) return button;  // 立即返回

  // ...繼續其他策略
}
```

### 5. 記憶體管理

**策略 1**: 不緩存大量資料
```javascript
// ❌ 錯誤：緩存所有連結
let allLinksCache = document.querySelectorAll('a');

// ✅ 正確：按需掃描
function scanPageLinks() {
  const links = [];
  const allLinks = document.querySelectorAll('a[href]');
  // 處理...
  return links; // 函數結束後自動釋放
}
```

**策略 2**: 及時清理
```javascript
window.addEventListener('beforeunload', () => {
  cleanup(); // 頁面卸載時清理資源
});
```

---

## 開發工作流

### 1. 環境設置

```bash
# 克隆或創建專案
mkdir anime-next
cd anime-next

# 創建基本結構
mkdir icons styles test docs
touch manifest.json content.js background.js popup.html popup.js
```

### 2. 開發流程

#### Phase 1: 核心功能開發

1. **建立 manifest.json**
   ```json
   {
     "manifest_version": 3,
     "name": "Anime Next",
     "version": "1.0.0",
     "permissions": ["storage", "activeTab"],
     "content_scripts": [...],
     "action": { "default_popup": "popup.html" }
   }
   ```

2. **實作 content.js**
   - ✅ 基礎鍵盤事件監聽
   - ✅ 第 1 層：按鈕導航
   - ✅ 輸入元素檢測
   - ✅ 按鈕快取機制

3. **實作 popup UI**
   - ✅ 基本設定介面
   - ✅ 開關控制
   - ✅ 狀態顯示

#### Phase 2: 進階功能開發

4. **第 2 層：URL 參數導航**
   - ✅ URL 解析
   - ✅ 頁碼提取
   - ✅ URL 構建和導航
   - ✅ 自訂參數名稱

5. **第 3 層：智能連結掃描**
   - ✅ 連結掃描邏輯
   - ✅ 頁碼提取演算法
   - ✅ 當前頁碼推斷
   - ✅ 連結導航

6. **第 4 層：Load More 檢測**
   - ✅ 多語言關鍵字支援
   - ✅ 多策略檢測
   - ✅ 按鈕點擊邏輯

#### Phase 3: 優化與完善

7. **視覺回饋**
   - ✅ CSS 動畫效果
   - ✅ 可選配置

8. **自訂功能**
   - ✅ 自訂按鈕 ID
   - ✅ 自訂 URL 參數名稱
   - ✅ 各層策略開關

9. **MutationObserver**
   - ✅ DOM 變化監聽
   - ✅ 智能快取更新

#### Phase 4: 測試與文件

10. **測試頁面**
    - ✅ test-page.html（基本測試）
    - ✅ custom-id-test.html（自訂 ID）
    - ✅ url-navigation-test.html（URL 導航）
    - ✅ href-scan-test.html（連結掃描）
    - ✅ load-more-test.html（Load More）

11. **文件編寫**
    - ✅ README.md
    - ✅ INSTALL.md
    - ✅ TESTING.md
    - ✅ COMPATIBILITY.md
    - ✅ 各功能詳細指南

### 3. 測試方法

#### 本地測試

```bash
# Chrome/Edge
1. 開啟 chrome://extensions/ 或 edge://extensions/
2. 啟用「開發人員模式」
3. 點擊「載入未封裝項目」
4. 選擇專案資料夾
5. 重新載入擴充功能（修改後）
```

#### 測試案例

```
✅ 基本功能測試
   - 在有分頁的網頁按左右鍵
   - 檢查按鈕是否被點擊

✅ 輸入元素測試
   - 在輸入框中按左右鍵（應該不觸發）
   - 在 textarea 中按左右鍵（應該不觸發）

✅ URL 導航測試
   - 在有 ?page=N 的網頁測試
   - 檢查 URL 是否正確變化

✅ 連結掃描測試
   - 在只有連結的分頁網頁測試
   - 檢查是否正確導航

✅ Load More 測試
   - 在無限滾動網頁測試
   - 檢查是否自動點擊 Load More

✅ 快取測試
   - 動態添加/移除分頁按鈕
   - 檢查快取是否正確更新

✅ 設定同步測試
   - 修改 popup 設定
   - 檢查是否即時生效
```

#### 性能測試

```javascript
// 測試響應時間
console.time('navigation');
clickNextButton();
console.timeEnd('navigation'); // 應該 < 100ms

// 測試記憶體使用
// Chrome DevTools > Memory > Take Snapshot
// 檢查是否有記憶體洩漏
```

### 4. 調試技巧

#### Console 日誌

```javascript
// 在 content.js 中大量使用 console.log
console.log('[Anime Next] 找到按鈕:', button);
console.log('[Anime Next] 當前頁碼:', currentPage);
console.log('[Anime Next] 掃描到連結:', links.length);
```

#### Chrome DevTools

```
1. Elements 面板
   - 檢查按鈕元素結構
   - 查看 CSS 樣式

2. Console 面板
   - 查看日誌輸出
   - 手動執行函數測試

3. Sources 面板
   - 設置斷點調試
   - 逐步執行程式碼

4. Performance 面板
   - 記錄性能數據
   - 分析瓶頸

5. Memory 面板
   - 檢測記憶體洩漏
   - 分析記憶體使用
```

---

## 部署與發布

### 版本規劃

#### v1.0.0（當前版本）
- ✅ 四層完整導航策略
- ✅ 多語言支援（7+ 種語言）
- ✅ 完整的設定介面
- ✅ 視覺回饋效果
- ✅ 自訂功能
- ✅ 測試頁面
- ✅ 完整文件

#### v1.1.0（計劃中）
- ⬜ 統計功能（使用次數、成功率）
- ⬜ 更多的視覺主題
- ⬜ 快捷鍵自訂
- ⬜ 匯入/匯出設定

#### v1.2.0（未來）
- ⬜ 網站白名單/黑名單
- ⬜ 智能學習功能
- ⬜ 雲端同步設定
- ⬜ 多瀏覽器支援（Firefox）

### 打包發布

#### 準備清單

```bash
✅ 檢查 manifest.json 版本號
✅ 更新 README.md
✅ 更新 CHANGELOG.md
✅ 測試所有功能
✅ 檢查 console 是否有錯誤
✅ 準備圖示（16x16, 48x48, 128x128）
✅ 準備宣傳圖片（1280x800 或 640x400）
✅ 撰寫商店描述
```

#### 打包步驟

```bash
# 1. 清理開發檔案
rm -rf .git
rm -rf node_modules
rm TODO.md

# 2. 創建 ZIP 檔案
zip -r anime-next-v1.0.0.zip . -x "*.git*" "node_modules/*" "*.DS_Store"

# 3. 驗證 ZIP 內容
unzip -l anime-next-v1.0.0.zip
```

#### Chrome Web Store 發布

```
1. 前往 Chrome Web Store Developer Dashboard
2. 點擊「新增項目」
3. 上傳 ZIP 檔案
4. 填寫商店資訊
   - 名稱：Anime Next - 鍵盤導航
   - 簡短描述：使用鍵盤方向鍵輕鬆導航網頁分頁
   - 詳細描述：（參考 README.md）
   - 類別：生產力
   - 語言：中文（繁體）、English
5. 上傳宣傳圖片和截圖
6. 設定隱私權政策（如需要）
7. 提交審核
```

#### Edge Add-ons 發布

```
類似 Chrome Web Store，前往 Microsoft Edge Add-ons
```

---

## 最佳實踐

### 程式碼風格

```javascript
// 1. 使用 ES6+ 語法
const button = findButton('next');
const links = scanPageLinks();

// 2. 明確的函數命名
function clickNextButton() { ... }  // ✅ 清楚
function next() { ... }             // ❌ 不清楚

// 3. 添加 JSDoc 註釋
/**
 * 查找分頁按鈕
 * @param {string} type - 'next' 或 'previous'
 * @returns {HTMLElement|null} 找到的按鈕或 null
 */
function findButton(type) { ... }

// 4. 錯誤處理
try {
  const result = await chrome.storage.sync.get(keys);
} catch (error) {
  console.error('[Anime Next] 錯誤:', error);
}

// 5. 常數使用大寫
const CACHE_TIMEOUT = 5000;
const CONFIG = { ... };
```

### 安全考量

```javascript
// 1. 避免 eval()
// ❌ 不安全
eval(userInput);

// ✅ 安全
const value = JSON.parse(safeString);

// 2. 驗證使用者輸入
function saveCustomIds(input) {
  const ids = input
    .split('\n')
    .map(id => id.trim())
    .filter(id => id.length > 0 && id.length < 100); // 限制長度
}

// 3. 使用 Content Security Policy
// manifest.json 中已設定適當的 CSP

// 4. 不儲存敏感資訊
// 不收集使用者的瀏覽歷史或個人資料
```

### 性能考量

```javascript
// 1. 避免頻繁的 DOM 操作
// ❌ 低效
for (let i = 0; i < 1000; i++) {
  document.getElementById('list').innerHTML += '<li>item</li>';
}

// ✅ 高效
const html = [];
for (let i = 0; i < 1000; i++) {
  html.push('<li>item</li>');
}
document.getElementById('list').innerHTML = html.join('');

// 2. 使用事件委派
// ❌ 每個按鈕都綁定事件
buttons.forEach(btn => btn.addEventListener('click', handler));

// ✅ 在父元素上綁定一個事件
parent.addEventListener('click', (e) => {
  if (e.target.matches('button')) {
    handler(e);
  }
});

// 3. 及時清理資源
window.addEventListener('beforeunload', cleanup);
```

---

## 故障排除

### 常見問題

#### 1. 擴充功能不工作

**症狀**: 按方向鍵沒有反應

**排查步驟**:
```
1. 檢查擴充功能是否啟用
   - 前往 chrome://extensions/
   - 確認 Anime Next 已啟用

2. 檢查 popup 設定
   - 點擊擴充功能圖示
   - 確認「啟用鍵盤導航」已開啟

3. 檢查 Console 是否有錯誤
   - 按 F12 開啟 DevTools
   - 查看 Console 面板

4. 重新載入擴充功能
   - 在擴充功能頁面點擊「重新載入」
```

#### 2. 按鈕找不到

**症狀**: Console 顯示「找不到按鈕」

**排查步驟**:
```
1. 檢查按鈕是否存在
   - 在 DevTools Elements 面板搜尋按鈕

2. 檢查按鈕的 ID 或 class
   - 確認是否與預設選擇器匹配

3. 使用自訂 ID 功能
   - 在 popup 中添加按鈕的實際 ID

4. 嘗試其他導航策略
   - 啟用 URL 參數導航
   - 啟用連結掃描
```

#### 3. URL 導航不工作

**症狀**: URL 沒有變化

**排查步驟**:
```
1. 檢查 URL 格式
   - 確認 URL 包含頁碼參數（如 ?page=3）

2. 檢查參數名稱
   - 在 popup 中確認「URL 參數名稱」設定正確

3. 檢查 Console 日誌
   - 查看是否有「URL 中沒有找到頁碼參數」的訊息

4. 嘗試手動修改 URL
   - 確認網站支援 URL 參數分頁
```

#### 4. Load More 不觸發

**症狀**: 無限滾動網站沒有載入更多

**排查步驟**:
```
1. 檢查按鈕文字
   - 確認按鈕文字包含支援的關鍵字

2. 檢查按鈕可見性
   - 確認按鈕沒有被 CSS 隱藏

3. 檢查 Console 日誌
   - 查看「找到 Load More 按鈕」或「未找到」的訊息

4. 手動測試按鈕
   - 用滑鼠點擊看是否正常工作
```

### Debug 模式

在 content.js 開頭添加：

```javascript
const DEBUG = true;

function log(...args) {
  if (DEBUG) {
    console.log('[Anime Next DEBUG]', ...args);
  }
}

// 使用
log('當前頁碼:', currentPage);
log('找到的按鈕:', button);
```

---

## 貢獻指南

### 開發環境要求

- Node.js: 16+ (如需使用開發工具)
- Chrome/Edge: 88+
- Git: 2.0+
- 編輯器: VS Code (推薦)

### 提交規範

```bash
# Commit Message 格式
<type>(<scope>): <subject>

# 類型
feat: 新功能
fix: 修復 bug
docs: 文件更新
style: 程式碼格式
refactor: 重構
test: 測試相關
chore: 其他修改

# 範例
feat(navigation): 新增 Load More 按鈕檢測
fix(cache): 修復按鈕快取失效問題
docs(readme): 更新安裝說明
```

### Pull Request 流程

```
1. Fork 專案
2. 創建功能分支 (git checkout -b feature/AmazingFeature)
3. 提交變更 (git commit -m 'feat: Add amazing feature')
4. 推送到分支 (git push origin feature/AmazingFeature)
5. 開啟 Pull Request
```

---

## 授權與版權

### 授權資訊
- **授權類型**: MIT License
- **版權所有**: © 2024 Anime Next Team

### 使用限制
- ✅ 商業使用
- ✅ 修改
- ✅ 分發
- ✅ 私人使用

### 責任聲明
本擴充功能按「現狀」提供，不提供任何形式的保證。

---

## 聯絡資訊

### 支援渠道
- **GitHub Issues**: 回報 bug 和功能請求
- **GitHub Discussions**: 一般討論和問題
- **Email**: （如有需要可添加）

### 有用連結
- [Chrome Extension 文件](https://developer.chrome.com/docs/extensions/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [測試頁面集合](./test/)

---

## 附錄

### A. 支援的網站類型

```
✅ DataTables 表格
✅ Bootstrap Pagination
✅ jQuery UI Pagination
✅ 自訂分頁組件
✅ URL 參數分頁網站
✅ 連結式分頁網站
✅ 無限滾動網站
✅ Load More 按鈕網站
```

### B. 瀏覽器相容性

```
✅ Chrome 88+
✅ Edge 88+
⬜ Firefox (計劃中)
⬜ Safari (計劃中)
```

### C. 關鍵字支援列表

```javascript
// Load More 關鍵字（完整列表）
const loadMoreKeywords = [
  // 英文
  'load more', 'load next', 'show more', 'view more',
  'see more', 'more', 'next page', 'load additional',

  // 中文
  '載入更多', '查看更多', '顯示更多', '更多', '下一頁',
  '加载更多', '查看更多', '显示更多', // 簡體

  // 日文
  'もっと見る', 'もっと読む', '続きを見る',

  // 韓文
  '더 보기', '더보기', '다음',

  // 西班牙文
  'ver más', 'cargar más', 'mostrar más',

  // 法文
  'voir plus', 'charger plus', 'afficher plus',

  // 德文
  'mehr laden', 'mehr anzeigen', 'mehr sehen',

  // 葡萄牙文
  'ver mais', 'carregar mais', 'mostrar mais'
];
```

### D. 選擇器優先級

```
優先級（從高到低）:

1. 自訂 ID（用戶配置）
   document.getElementById(customId)

2. 預設 ID
   document.getElementById('table-list_next')

3. Class 選擇器
   document.querySelector('.paginate_button.next')

4. Data 屬性
   document.querySelector('[data-dt-idx="next"]')

5. URL 參數導航
   window.location.href = newUrl

6. 連結掃描
   找到並點擊包含頁碼的連結

7. Load More 檢測
   找到並點擊 Load More 按鈕
```

---

## 版本歷史

| 版本 | 日期 | 主要變更 |
|------|------|----------|
| 1.0.0 | 2024-11-07 | 初始發布<br>- 四層導航策略<br>- 多語言支援<br>- 完整設定介面<br>- 測試頁面<br>- 完整文件 |

---

**最後更新**: 2024-11-07
**文件版本**: 1.0.0
**維護者**: Anime Next Development Team

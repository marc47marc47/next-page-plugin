# Anime Next 開發待辦事項

> 本文檔列出 Claude 可以協助執行的具體開發任務
> 建立日期：2025-11-06
> 專案版本：v1.0.0

---

## 📋 任務總覽

- **Phase 1**: 基礎功能實作 (核心功能) ✅
- **Phase 2**: 進階功能實作 (可選功能)
- **Phase 3**: 優化與測試
- **Phase 4**: 文檔與發布準備

---

## Phase 1: 基礎功能實作 🎯

### 1.1 環境設置與目錄結構

#### ✅ Task 1.1.1: 建立目錄結構
**描述**: 建立專案所需的資料夾結構

**執行指令**:
```bash
mkdir -p icons styles
```

**驗證標準**:
- [ ] `icons/` 目錄已建立
- [ ] `styles/` 目錄已建立

---

#### ✅ Task 1.1.2: 建立 manifest.json
**描述**: 建立 Chrome 擴充功能的配置檔

**檔案路徑**: `manifest.json`

**內容規格**:
```json
{
  "manifest_version": 3,
  "name": "Anime Next - 鍵盤導航",
  "version": "1.0.0",
  "description": "使用鍵盤左右鍵控制網頁上一頁/下一頁",
  "permissions": ["activeTab"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

**驗證標準**:
- [ ] manifest_version 設為 3
- [ ] 包含 activeTab 權限
- [ ] content_scripts 設定正確
- [ ] 圖示路徑已定義

**參考文檔**: [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)

---

### 1.2 核心功能實作

#### ✅ Task 1.2.1: 建立 content.js - 基礎結構
**描述**: 建立內容腳本的基本架構

**檔案路徑**: `content.js`

**實作項目**:
1. 建立 IIFE (立即調用函數表達式) 避免全域污染
2. 定義基本常數和配置
3. 建立主要函數框架

**程式碼結構**:
```javascript
(function() {
  'use strict';

  // 配置常數
  const CONFIG = {
    BUTTON_SELECTORS: {
      NEXT_ID: 'table-list_next',
      PREVIOUS_ID: 'table-list_previous',
      NEXT_CLASS: 'paginate_button.next',
      PREVIOUS_CLASS: 'paginate_button.previous'
    },
    DISABLED_CLASS: 'disabled'
  };

  // 主要邏輯將在後續任務中添加

})();
```

**驗證標準**:
- [ ] 使用 IIFE 包裝程式碼
- [ ] 使用 'use strict' 模式
- [ ] 定義配置常數

---

#### ✅ Task 1.2.2: 實作 isInputElement 函數
**描述**: 檢查元素是否為輸入類型元素

**功能需求**:
- 檢查元素標籤名稱 (input, textarea, select)
- 檢查元素是否為 contenteditable

**程式碼**:
```javascript
/**
 * 檢查元素是否為輸入類型元素
 * @param {HTMLElement} element - 要檢查的元素
 * @returns {boolean} 如果是輸入元素返回 true
 */
function isInputElement(element) {
  if (!element) return false;

  const tagName = element.tagName.toLowerCase();
  const isEditable = element.isContentEditable;

  return ['input', 'textarea', 'select'].includes(tagName) || isEditable;
}
```

**測試案例**:
- [ ] `<input>` 元素返回 true
- [ ] `<textarea>` 元素返回 true
- [ ] `<select>` 元素返回 true
- [ ] contenteditable 元素返回 true
- [ ] `<div>` 元素返回 false

**參考**: DEVELOP.md FR-4: 智能啟用/停用

---

#### ✅ Task 1.2.3: 實作 findButton 函數
**描述**: 使用多重策略查找分頁按鈕

**功能需求**:
- 策略 1: 透過 ID 查找
- 策略 2: 透過 class 查找
- 策略 3: 透過 data-dt-idx 屬性查找

**程式碼**:
```javascript
/**
 * 查找分頁按鈕
 * @param {string} type - 按鈕類型 ('next' 或 'previous')
 * @returns {HTMLElement|null} 找到的按鈕元素或 null
 */
function findButton(type) {
  // 策略 1: 透過 ID 查找
  const idMap = {
    'next': CONFIG.BUTTON_SELECTORS.NEXT_ID,
    'previous': CONFIG.BUTTON_SELECTORS.PREVIOUS_ID
  };
  let button = document.getElementById(idMap[type]);

  if (button) {
    console.log(`[Anime Next] 找到按鈕 (ID): ${type}`);
    return button;
  }

  // 策略 2: 透過 class 查找
  const classSelector = type === 'next'
    ? CONFIG.BUTTON_SELECTORS.NEXT_CLASS
    : CONFIG.BUTTON_SELECTORS.PREVIOUS_CLASS;
  button = document.querySelector(`.${classSelector}`);

  if (button) {
    console.log(`[Anime Next] 找到按鈕 (Class): ${type}`);
    return button;
  }

  // 策略 3: 透過 data 屬性查找
  button = document.querySelector(`[data-dt-idx="${type}"]`);

  if (button) {
    console.log(`[Anime Next] 找到按鈕 (Data): ${type}`);
    return button;
  }

  return null;
}
```

**驗證標準**:
- [ ] 能透過 ID 查找按鈕
- [ ] 能透過 class 查找按鈕
- [ ] 能透過 data-dt-idx 查找按鈕
- [ ] 找不到按鈕時返回 null
- [ ] 添加適當的 console.log 用於除錯

**參考**: DEVELOP.md FR-2: 自動識別分頁按鈕

---

#### ✅ Task 1.2.4: 實作點擊按鈕函數
**描述**: 實作 clickNextButton 和 clickPreviousButton 函數

**功能需求**:
- 查找按鈕
- 檢查按鈕是否存在且未停用
- 模擬點擊事件

**程式碼**:
```javascript
/**
 * 點擊下一頁按鈕
 */
function clickNextButton() {
  const button = findButton('next');

  if (!button) {
    console.log('[Anime Next] 找不到下一頁按鈕');
    return;
  }

  if (button.classList.contains(CONFIG.DISABLED_CLASS)) {
    console.log('[Anime Next] 下一頁按鈕已停用');
    return;
  }

  console.log('[Anime Next] 點擊下一頁按鈕');
  button.click();
}

/**
 * 點擊上一頁按鈕
 */
function clickPreviousButton() {
  const button = findButton('previous');

  if (!button) {
    console.log('[Anime Next] 找不到上一頁按鈕');
    return;
  }

  if (button.classList.contains(CONFIG.DISABLED_CLASS)) {
    console.log('[Anime Next] 上一頁按鈕已停用');
    return;
  }

  console.log('[Anime Next] 點擊上一頁按鈕');
  button.click();
}
```

**驗證標準**:
- [ ] 正確查找按鈕
- [ ] 檢查 disabled 狀態
- [ ] 正確模擬點擊
- [ ] 添加適當的日誌輸出

**參考**: DEVELOP.md FR-3: 模擬點擊事件

---

#### ✅ Task 1.2.5: 實作鍵盤事件監聽器
**描述**: 監聽鍵盤事件並觸發相應動作

**功能需求**:
- 監聽 keydown 事件
- 檢查是否在輸入元素中
- 處理 ArrowLeft 和 ArrowRight 按鍵

**程式碼**:
```javascript
/**
 * 處理鍵盤事件
 * @param {KeyboardEvent} event - 鍵盤事件
 */
function handleKeyDown(event) {
  // 如果焦點在輸入元素中，不處理
  if (isInputElement(event.target)) {
    return;
  }

  // 處理左右方向鍵
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      clickPreviousButton();
      break;

    case 'ArrowRight':
      event.preventDefault();
      clickNextButton();
      break;
  }
}

// 初始化：添加事件監聽器
function init() {
  document.addEventListener('keydown', handleKeyDown);
  console.log('[Anime Next] 鍵盤導航已啟用');
}

// 啟動擴充功能
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

**驗證標準**:
- [ ] 正確監聽 keydown 事件
- [ ] 排除輸入元素的按鍵
- [ ] 呼叫 preventDefault() 防止預設行為
- [ ] 正確映射按鍵到動作
- [ ] 在 DOMContentLoaded 後初始化

**參考**: DEVELOP.md FR-1: 鍵盤事件監聽

---

#### ✅ Task 1.2.6: 整合完整的 content.js
**描述**: 將所有函數整合成完整的 content.js 檔案

**驗證標準**:
- [ ] 所有函數都包含在 IIFE 中
- [ ] 程式碼結構清晰
- [ ] 包含適當的註解
- [ ] 添加版本資訊和授權聲明

**完整檔案結構**:
```javascript
/**
 * Anime Next - 鍵盤導航擴充功能
 * Content Script
 *
 * @version 1.0.0
 * @description 使用鍵盤左右鍵控制網頁上一頁/下一頁
 */

(function() {
  'use strict';

  // 配置
  const CONFIG = { ... };

  // 工具函數
  function isInputElement(element) { ... }
  function findButton(type) { ... }

  // 動作函數
  function clickNextButton() { ... }
  function clickPreviousButton() { ... }

  // 事件處理
  function handleKeyDown(event) { ... }

  // 初始化
  function init() { ... }

  // 啟動
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
```

---

### 1.3 測試準備

#### ✅ Task 1.3.1: 建立測試說明文檔
**描述**: 建立 TESTING.md 文檔，說明如何測試擴充功能

**檔案路徑**: `TESTING.md`

**內容包括**:
1. 如何在 Chrome 中載入擴充功能
2. 測試案例清單
3. 預期行為說明
4. 故障排除指南

**參考**: DEVELOP.md 測試方法章節

---

#### ✅ Task 1.3.2: 建立測試用 HTML 頁面
**描述**: 建立簡單的測試頁面，包含分頁按鈕

**檔案路徑**: `test/test-page.html`

**內容包括**:
- 模擬的分頁按鈕
- 輸入框測試區域
- 測試指引

---

## Phase 2: 進階功能實作 🚀

### 2.1 視覺回饋功能

#### ⬜ Task 2.1.1: 建立 content.css
**描述**: 建立樣式檔案，提供視覺回饋

**檔案路徑**: `styles/content.css`

**功能需求**:
- 按鈕點擊時的高亮效果
- 平滑的過渡動畫

**程式碼範例**:
```css
/* 按鈕點擊動畫 */
@keyframes anime-next-highlight {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.anime-next-clicked {
  animation: anime-next-highlight 0.6s ease-out;
}
```

**更新 manifest.json**:
```json
"content_scripts": [
  {
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "css": ["styles/content.css"],
    "run_at": "document_idle"
  }
]
```

---

#### ⬜ Task 2.1.2: 在 content.js 中添加視覺回饋
**描述**: 修改點擊函數，添加視覺效果

**更新內容**:
```javascript
function addVisualFeedback(button) {
  button.classList.add('anime-next-clicked');

  setTimeout(() => {
    button.classList.remove('anime-next-clicked');
  }, 600);
}

// 在 clickNextButton 和 clickPreviousButton 中呼叫
button.click();
addVisualFeedback(button);
```

---

### 2.2 設定介面

#### ⬜ Task 2.2.1: 建立 popup.html
**描述**: 建立彈出視窗 UI

**檔案路徑**: `popup.html`

**功能需求**:
- 開關切換按鈕
- 簡潔的 UI 設計

---

#### ⬜ Task 2.2.2: 建立 popup.js
**描述**: 實作彈出視窗邏輯

**檔案路徑**: `popup.js`

**功能需求**:
- 讀取/儲存設定到 chrome.storage
- 與 content.js 通訊

---

#### ⬜ Task 2.2.3: 建立 background.js
**描述**: 實作背景服務

**檔案路徑**: `background.js`

**功能需求**:
- 管理擴充功能的啟用狀態
- 處理訊息傳遞

---

### 2.3 智能識別增強

#### ⬜ Task 2.3.1: 擴展按鈕識別策略
**描述**: 支援更多類型的分頁組件

**新增選擇器**:
- Bootstrap Pagination
- Material UI Pagination
- 其他常見框架

---

#### ⬜ Task 2.3.2: 實作 MutationObserver
**描述**: 監聽 DOM 變化，處理動態載入的按鈕

**程式碼框架**:
```javascript
const observer = new MutationObserver((mutations) => {
  // 檢查是否有新的分頁按鈕出現
  // 更新按鈕快取
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
```

---

## Phase 3: 優化與測試 ⚡

### 3.1 效能優化

#### ⬜ Task 3.1.1: 實作按鈕快取機制
**描述**: 快取按鈕元素引用，減少 DOM 查詢

**實作方式**:
```javascript
let buttonCache = {
  next: null,
  previous: null,
  lastUpdate: 0
};

const CACHE_TIMEOUT = 5000; // 5 秒

function getCachedButton(type) {
  const now = Date.now();

  if (now - buttonCache.lastUpdate > CACHE_TIMEOUT) {
    // 快取過期，重新查找
    buttonCache.next = findButton('next');
    buttonCache.previous = findButton('previous');
    buttonCache.lastUpdate = now;
  }

  return buttonCache[type];
}
```

---

#### ⬜ Task 3.1.2: 優化事件監聽
**描述**: 使用防抖 (debounce) 技術優化事件處理

---

### 3.2 相容性測試

#### ⬜ Task 3.2.1: 建立相容性測試清單
**描述**: 測試不同網站的相容性

**測試網站**:
- [ ] DataTables 範例網站
- [ ] Bootstrap 文檔網站
- [ ] 動漫網站 (實際使用場景)
- [ ] GitHub (測試輸入框排除)

---

#### ⬜ Task 3.2.2: 記錄測試結果
**描述**: 在 TESTING.md 中記錄測試結果和問題

---

## Phase 4: 文檔與發布準備 📦

### 4.1 文檔撰寫

#### ⬜ Task 4.1.1: 更新 README.md
**描述**: 撰寫完整的 README 文檔

**內容包括**:
- 功能說明
- 安裝方法
- 使用指南
- 截圖示範
- 常見問題

---

#### ⬜ Task 4.1.2: 建立 CHANGELOG.md
**描述**: 記錄版本變更歷史

---

#### ⬜ Task 4.1.3: 建立 LICENSE
**描述**: 選擇並添加開源授權

**建議授權**: MIT License

---

### 4.2 圖示準備

#### ⚠️ Task 4.2.1: 圖示設計指南
**描述**: 提供圖示設計規格和建議

**注意**: Claude 無法建立圖片檔案，需要使用者自行準備或使用線上工具生成

**規格要求**:
- 16x16 像素 (工具列圖示)
- 48x48 像素 (擴充功能管理頁面)
- 128x128 像素 (Chrome Web Store)
- 格式: PNG
- 背景: 透明

**設計建議**:
- 使用簡單的鍵盤或箭頭圖示
- 使用專案主色調
- 確保在小尺寸下清晰可辨

**線上工具**:
- [Canva](https://www.canva.com/)
- [Figma](https://www.figma.com/)
- [Icon Generator](https://www.favicon-generator.org/)

---

### 4.3 發布準備

#### ⬜ Task 4.3.1: 建立發布檢查清單
**描述**: 建立 RELEASE_CHECKLIST.md

**內容包括**:
- [ ] 所有功能測試通過
- [ ] 文檔完整
- [ ] 圖示已準備
- [ ] manifest.json 資訊正確
- [ ] 無 console.log (生產環境)
- [ ] 程式碼已壓縮 (可選)

---

#### ⬜ Task 4.3.2: 準備 Chrome Web Store 資料
**描述**: 準備發布到 Chrome Web Store 所需的資料

**需要的資料**:
- 詳細說明 (中英文)
- 螢幕截圖 (1280x800 或 640x400)
- 宣傳圖片 (440x280)
- 小型宣傳圖片 (128x128)

---

## 附錄

### A. 快速開始指令

```bash
# Phase 1 快速開始
mkdir -p icons styles test

# 建立基本檔案
touch manifest.json content.js TESTING.md

# 初始化 Git (可選)
git init
echo "node_modules/" > .gitignore
```

### B. 除錯技巧

**在 Chrome 中除錯**:
1. 前往 `chrome://extensions/`
2. 找到 Anime Next 擴充功能
3. 點擊「背景頁面」或「檢查檢視」
4. 開啟 Console 查看日誌

**常見問題**:
- 擴充功能未啟動：檢查 manifest.json 格式
- 按鈕無法點擊：檢查選擇器是否正確
- 在輸入框中仍觸發：檢查 isInputElement 邏輯

### C. 效能指標

**目標指標**:
- 鍵盤回應時間: < 100ms
- 記憶體使用: < 5MB
- CPU 使用: < 1% (閒置時)

---

## 🎯 下一步行動

### 立即開始 (Phase 1)
1. 執行 Task 1.1.1: 建立目錄結構
2. 執行 Task 1.1.2: 建立 manifest.json
3. 執行 Task 1.2.1-1.2.6: 實作 content.js

### 建議順序
1. 完成 Phase 1 所有任務
2. 在 Chrome 中測試基本功能
3. 根據測試結果調整
4. 逐步添加 Phase 2 進階功能

---

## 📝 注意事項

1. **每完成一個任務，請在對應的 checkbox 打勾 ✅**
2. **遇到問題時，記錄在任務描述下方**
3. **建議每完成一個 Phase 就進行完整測試**
4. **圖示檔案需要使用者自行準備（Claude 無法建立圖片）**
5. **發布到 Chrome Web Store 需要開發者帳號（一次性支付 $5 USD）**

---

**文檔版本**: 1.0.0
**最後更新**: 2025-11-06
**維護者**: Claude & 開發團隊

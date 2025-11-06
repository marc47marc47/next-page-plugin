# URL 參數導航功能使用指南

## 功能概述

URL 參數導航功能允許 Anime Next 擴充功能在頁面沒有實際的 next/prev 按鈕時，自動通過修改 URL 中的頁碼參數來實現分頁導航。

## 適用場景

這個功能特別適用於以下類型的網站：

- 使用 URL 參數進行分頁的網站（如 `?page=3`）
- 沒有提供實際的上一頁/下一頁按鈕的網站
- 使用 JavaScript 動態生成內容但分頁邏輯基於 URL 參數的網站

### 範例網站

- `https://missav123.com/dm155/makers/Nanpa%20JAPAN?page=3`
- `https://example.com/products?page=5`
- `https://example.com/articles?p=10`

## 功能特點

### 1. 自動備用機制

當 Anime Next 找不到實際的分頁按鈕時，會自動嘗試使用 URL 參數導航：

- 按下 `→` 鍵：自動將 `page=3` 改為 `page=4`
- 按下 `←` 鍵：自動將 `page=3` 改為 `page=2`

### 2. 自訂參數名稱

不同網站可能使用不同的參數名稱：

- `page` （最常見）
- `p`
- `pg`
- `pageNum`
- 等等...

你可以在擴充功能設定中自訂參數名稱。

### 3. 智能防護

- 自動防止導航到小於 1 的頁碼
- 檢查 URL 中是否存在頁碼參數
- 不會干擾有實際按鈕的網站

## 如何使用

### 步驟 1: 啟用功能

1. 點擊瀏覽器工具列上的 Anime Next 圖示
2. 找到「URL 參數導航」設定項
3. 確保開關是開啟狀態（預設為開啟）

### 步驟 2: 設定參數名稱

1. 在同一設定區域中，找到「URL 參數名稱」輸入框
2. 輸入目標網站使用的參數名稱（預設為 `page`）
3. 按下 Enter 鍵或切換到其他輸入框以儲存

### 步驟 3: 測試功能

1. 開啟測試頁面：
   - 點擊擴充功能 popup 中的「測試頁面」按鈕
   - 或直接開啟 `chrome-extension://[your-extension-id]/test/url-navigation-test.html`

2. 或訪問一個使用 URL 參數分頁的實際網站

3. 使用鍵盤左右方向鍵進行導航：
   - `←` 鍵：上一頁
   - `→` 鍵：下一頁

## 設定說明

### URL 參數導航開關

- **位置**：擴充功能 popup → URL 參數導航
- **預設值**：啟用
- **作用**：控制是否啟用 URL 參數導航功能

### URL 參數名稱

- **位置**：擴充功能 popup → URL 參數名稱
- **預設值**：`page`
- **作用**：指定網站 URL 中使用的分頁參數名稱

#### 常見參數名稱範例

| 網站類型 | 參數名稱 | 範例 URL |
|---------|---------|----------|
| 一般網站 | `page` | `?page=3` |
| 論壇 | `p` | `?p=5` |
| 商城 | `pageNum` | `?pageNum=2` |
| 文章列表 | `pg` | `?pg=10` |

## 工作原理

### 導航流程

```
1. 使用者按下左/右方向鍵
   ↓
2. 擴充功能嘗試尋找實際的分頁按鈕
   ↓
3. 如果找不到按鈕 + URL 參數導航功能已啟用
   ↓
4. 讀取當前 URL 中的頁碼參數
   ↓
5. 計算目標頁碼（+1 或 -1）
   ↓
6. 修改 URL 並導航到新頁面
```

### 程式碼示例

```javascript
// 獲取當前頁碼
const url = new URL(window.location.href);
const currentPage = parseInt(url.searchParams.get('page'), 10);

// 導航到下一頁
url.searchParams.set('page', (currentPage + 1).toString());
window.location.href = url.toString();
```

## 與按鈕導航的整合

URL 參數導航是一個**備用機制**，不會替代現有的按鈕導航功能：

1. **優先使用按鈕**：如果頁面有實際的 next/prev 按鈕，會優先點擊按鈕
2. **自動備用**：只有在找不到按鈕時，才會使用 URL 參數導航
3. **無縫切換**：使用者無需手動切換模式

## 常見問題

### Q1: 為什麼按下方向鍵後沒有反應？

**可能原因：**
- URL 參數導航功能未啟用
- URL 中沒有頁碼參數
- 參數名稱設定不正確
- 當前頁面是第一頁且按下了左鍵

**解決方法：**
1. 檢查擴充功能設定，確保「URL 參數導航」已啟用
2. 檢查當前 URL 是否包含頁碼參數（如 `?page=3`）
3. 確認參數名稱設定正確（區分大小寫）
4. 打開瀏覽器控制台查看 console 日誌

### Q2: 如何知道使用了哪種導航方式？

打開瀏覽器開發者工具（F12），查看 Console 標籤頁：

- 如果看到 `[Anime Next] 點擊下一頁按鈕` → 使用了按鈕導航
- 如果看到 `[Anime Next] 嘗試使用 URL 參數導航` → 使用了 URL 參數導航

### Q3: 可以同時支援多個參數名稱嗎？

目前版本一次只能設定一個參數名稱。如果需要在不同網站使用不同參數名稱，需要手動切換設定。

### Q4: URL 參數導航會影響網站的原有功能嗎？

不會。URL 參數導航只是修改 URL 並重新載入頁面，與手動修改 URL 的效果相同，不會影響網站的正常功能。

## 測試頁面

擴充功能提供了一個專門的測試頁面來驗證 URL 參數導航功能：

### 如何訪問測試頁面

1. 點擊擴充功能圖示開啟 popup
2. 點擊「測試頁面」按鈕
3. 在新標籤中會開啟測試頁面

### 測試頁面特點

- 沒有實際的分頁按鈕（只有手動測試用的連結）
- 顯示當前頁碼和 URL
- 提供使用說明和功能特色
- 可以測試鍵盤導航功能

### 測試步驟

1. 開啟測試頁面
2. 按下右方向鍵 `→`
3. 觀察頁碼是否從 1 變為 2
4. 觀察 URL 是否從 `?page=1` 變為 `?page=2`
5. 按下左方向鍵 `←`
6. 觀察頁碼是否變回 1

## 實際應用範例

### 範例 1: missav123.com

```
初始 URL: https://missav123.com/dm155/makers/Nanpa%20JAPAN?page=3

按下 → 鍵：
新 URL: https://missav123.com/dm155/makers/Nanpa%20JAPAN?page=4

按下 ← 鍵：
新 URL: https://missav123.com/dm155/makers/Nanpa%20JAPAN?page=2
```

### 範例 2: 自訂參數名稱

假設某個網站使用 `p` 作為參數名稱：

```
1. 在設定中將「URL 參數名稱」改為 "p"
2. 訪問 https://example.com/articles?p=5
3. 按下 → 鍵
4. 導航到 https://example.com/articles?p=6
```

## 開發資訊

### 相關檔案

- `content.js`: 核心導航邏輯
- `popup.html`: 設定介面
- `popup.js`: 設定管理
- `test/url-navigation-test.html`: 測試頁面

### 主要函數

```javascript
// 獲取當前頁碼
getCurrentPageNumber()

// 導航到指定頁面
navigateToPage(pageNumber)

// 導航到下一頁
navigateToNextPage()

// 導航到上一頁
navigateToPreviousPage()
```

## 版本歷史

### v1.0.0 (2024-11-07)
- ✨ 新增 URL 參數導航功能
- ✨ 支援自訂參數名稱
- ✨ 添加專用測試頁面
- ✨ 與現有按鈕導航無縫整合

## 回報問題

如果您在使用 URL 參數導航功能時遇到問題，請提供以下資訊：

1. 網站 URL
2. 瀏覽器版本
3. 擴充功能版本
4. 控制台錯誤訊息（如有）
5. 預期行為 vs 實際行為

## 相關文件

- [安裝說明](INSTALL.md)
- [測試指南](TESTING.md)
- [相容性說明](COMPATIBILITY.md)
- [自訂 ID 指南](CUSTOM-ID-GUIDE.md)

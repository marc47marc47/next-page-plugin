# 智能連結掃描功能使用指南

## 功能概述

智能連結掃描（Href Scan）是 Anime Next 擴充功能的第三層導航備用機制。當頁面既沒有實際的分頁按鈕，URL 中也沒有頁碼參數時，擴充功能會自動掃描頁面中的所有連結，找出包含頁碼的連結並自動導航。

## 導航策略層級

Anime Next 使用三層導航策略，按照優先順序依次嘗試：

```
第 1 層：按鈕導航
   ↓ 找不到按鈕
第 2 層：URL 參數導航
   ↓ URL 中沒有頁碼參數
第 3 層：智能連結掃描 ← 本功能
```

## 適用場景

這個功能特別適用於以下類型的網站：

### 場景 1: 純連結式分頁
```html
<!-- 頁面沒有按鈕，只有連結列表 -->
<div class="pagination">
  <a href="/articles?page=1">1</a>
  <a href="/articles?page=2">2</a>
  <a href="/articles?page=3">3</a>
  <a href="/articles?page=4">4</a>
</div>
```

### 場景 2: 隱藏的分頁連結
```html
<!-- 連結被 CSS 隱藏，但存在於 DOM 中 -->
<div style="display: none;">
  <a href="?page=1">Previous</a>
  <a href="?page=3">Next</a>
</div>
```

### 場景 3: JavaScript 動態生成的連結
```html
<!-- JavaScript 生成的連結，沒有固定的 ID 或 class -->
<nav id="pagination-container">
  <!-- 連結由 JS 動態插入 -->
</nav>
```

## 工作原理

### 掃描流程

```javascript
1. 用戶按下方向鍵
   ↓
2. 嘗試尋找按鈕 → 失敗
   ↓
3. 嘗試 URL 參數導航 → 失敗（URL 中沒有 page 參數）
   ↓
4. 啟動智能連結掃描
   ↓
5. 掃描所有 <a href> 標籤
   ↓
6. 提取包含 page 參數的連結
   ↓
7. 從 URL 或連結中推斷當前頁碼
   ↓
8. 找到目標頁碼的連結
   ↓
9. 自動導航到該連結
```

### 核心算法

#### 1. 連結掃描

```javascript
function scanPageLinks() {
  const links = [];
  const allLinks = document.querySelectorAll('a[href]');

  for (const link of allLinks) {
    const href = link.getAttribute('href');

    // 檢查是否包含 page 參數
    if (href.toLowerCase().includes('page')) {
      const pageNumber = extractPageNumber(href);

      if (pageNumber !== null) {
        links.push({
          url: href,
          pageNumber: pageNumber,
          element: link
        });
      }
    }
  }

  return links;
}
```

#### 2. 頁碼提取

```javascript
function extractPageNumber(url) {
  // 方法 1: 使用 URL API
  const urlObj = new URL(url, window.location.origin);
  const pageParam = urlObj.searchParams.get('page');

  if (pageParam) {
    return parseInt(pageParam, 10);
  }

  // 方法 2: 正則表達式（備用）
  const regex = /[?&]page=(\d+)/i;
  const match = url.match(regex);

  if (match && match[1]) {
    return parseInt(match[1], 10);
  }

  return null;
}
```

#### 3. 當前頁碼推斷

```javascript
function inferCurrentPage() {
  // 優先從 URL 獲取
  let currentPage = getCurrentPageNumber();

  // 如果 URL 中沒有，從掃描的連結推斷
  if (currentPage === null) {
    const links = scanPageLinks();

    if (links.length > 0) {
      const pageNumbers = links.map(link => link.pageNumber).sort((a, b) => a - b);

      // 假設最小頁碼的前一頁是當前頁
      currentPage = pageNumbers[0] - 1;

      if (currentPage < 1) {
        currentPage = 1;
      }
    }
  }

  return currentPage;
}
```

## 功能特點

### 1. 智能推斷

- **從 URL 推斷**：優先從當前 URL 中獲取頁碼
- **從連結推斷**：如果 URL 中沒有，從頁面連結中推斷當前頁碼
- **邏輯判斷**：使用啟發式算法判斷當前頁碼

### 2. 路徑處理

- **相對路徑**：自動轉換為絕對路徑
- **絕對路徑**：直接使用
- **跨域檢查**：確保連結指向同一域名

### 3. 錯誤處理

- **URL 解析失敗**：降級使用正則表達式
- **找不到連結**：返回 false，不進行導航
- **無效頁碼**：過濾掉小於 1 的頁碼

## 使用方法

### 啟用功能

1. 點擊瀏覽器工具列上的 Anime Next 圖示
2. 找到「智能連結掃描」設定項
3. 確保開關是開啟狀態（預設為開啟）

### 測試功能

#### 方法 1: 使用測試頁面

1. 開啟測試頁面：`test/href-scan-test.html`
2. 按下方向鍵測試
3. 觀察頁面跳轉

#### 方法 2: 在實際網站測試

1. 訪問一個使用連結式分頁的網站
2. 打開瀏覽器控制台（F12）
3. 按下方向鍵
4. 查看控制台日誌

### 控制台日誌

成功掃描時，你會看到類似的日誌：

```
[Anime Next] 找不到下一頁按鈕
[Anime Next] 嘗試使用 URL 參數導航到下一頁
[Anime Next] URL 中沒有找到頁碼參數
[Anime Next] 嘗試掃描 href 連結到下一頁
[Anime Next] 掃描到 6 個包含頁碼的連結
[Anime Next] 推斷當前頁碼為: 3
[Anime Next] 找到第 4 頁的連結: ?page=4
[Anime Next] 導航到下一頁: ?page=4
```

掃描失敗時：

```
[Anime Next] 找不到下一頁按鈕
[Anime Next] 嘗試使用 URL 參數導航到下一頁
[Anime Next] URL 中沒有找到頁碼參數
[Anime Next] 嘗試掃描 href 連結到下一頁
[Anime Next] 掃描到 0 個包含頁碼的連結
[Anime Next] 無法確定當前頁碼
[Anime Next] 所有導航方法都失敗
```

## 性能優化

### 掃描效率

- **選擇器優化**：使用 `querySelectorAll('a[href]')` 直接選擇有 href 的連結
- **提前過濾**：只處理包含 page 關鍵字的連結
- **即時返回**：找到目標連結後立即返回

### 記憶體管理

- **不緩存連結**：每次掃描時重新獲取，避免過時數據
- **及時釋放**：掃描完成後不保留連結陣列
- **避免重複**：使用 `find()` 而非 `filter()` 減少遍歷

## 設定選項

### 智能連結掃描開關

- **位置**：擴充功能 popup → 智能連結掃描
- **預設值**：啟用
- **作用**：控制是否啟用 href 掃描功能

### 與其他設定的關聯

- **URL 參數名稱**：掃描時會使用此參數名稱來識別連結
- **啟用鍵盤導航**：總開關，關閉後所有導航功能都停用

## 常見問題

### Q1: 為什麼掃描功能沒有作用？

**可能原因：**
- 智能連結掃描功能未啟用
- 頁面中沒有包含 page 參數的連結
- URL 參數名稱設定不正確
- 連結是通過 JavaScript 事件處理而非 href 屬性實現

**解決方法：**
1. 檢查擴充功能設定，確保「智能連結掃描」已啟用
2. 打開控制台查看掃描日誌
3. 檢查頁面 HTML，確認是否有包含 page 參數的 `<a>` 標籤
4. 確認 URL 參數名稱設定正確

### Q2: 如何知道掃描到了多少連結？

打開瀏覽器控制台（F12），查看日誌：

```
[Anime Next] 掃描到 6 個包含頁碼的連結
```

### Q3: 掃描會影響頁面性能嗎？

不會明顯影響性能：
- 掃描僅在按下方向鍵時執行
- 使用高效的選擇器和過濾邏輯
- 通常在幾毫秒內完成

### Q4: 為什麼有時推斷的頁碼不正確？

推斷算法基於啟發式方法，在某些特殊情況下可能不準確：

**情況 1**：頁面只顯示當前頁前後的幾頁
```html
<!-- 當前在第 10 頁，但只顯示 8-12 頁 -->
<a href="?page=8">8</a>
<a href="?page=9">9</a>
<a href="?page=11">11</a>
<a href="?page=12">12</a>
```

**解決方案**：確保 URL 中包含頁碼參數，這樣就不需要推斷

### Q5: 支援哪些 URL 格式？

支援多種常見格式：

```
?page=3
?page=3&category=news
?category=news&page=3
/articles?page=3
/articles/page/3 (需要特殊處理，當前版本不支援)
```

## 實際應用範例

### 範例 1: 論壇分頁

```html
<!-- 典型的論壇分頁結構 -->
<div class="pagination">
  <a href="forum.php?page=1">1</a>
  <a href="forum.php?page=2">2</a>
  <span class="current">3</span>
  <a href="forum.php?page=4">4</a>
  <a href="forum.php?page=5">5</a>
</div>
```

**工作流程：**
1. 掃描到 4 個包含 page 的連結（1, 2, 4, 5）
2. 推斷當前頁為 3（連結中缺少的頁碼）
3. 按下 → 鍵，導航到 page=4
4. 按下 ← 鍵，導航到 page=2

### 範例 2: 產品列表

```html
<!-- 電商網站的產品列表分頁 -->
<nav aria-label="pagination">
  <a href="/products?category=electronics&page=1">First</a>
  <a href="/products?category=electronics&page=2">Previous</a>
  <a href="/products?category=electronics&page=4">Next</a>
  <a href="/products?category=electronics&page=10">Last</a>
</nav>
```

**工作流程：**
1. 掃描到 4 個包含 page 的連結（1, 2, 4, 10）
2. 推斷當前頁為 3
3. 按下 → 鍵，導航到 page=4

### 範例 3: 文章存檔

```html
<!-- 部落格文章存檔頁面 -->
<div class="archive-nav">
  <a href="/archive?year=2024&page=1" class="page-number">1</a>
  <a href="/archive?year=2024&page=2" class="page-number">2</a>
  <a href="/archive?year=2024&page=3" class="page-number active">3</a>
  <a href="/archive?year=2024&page=4" class="page-number">4</a>
</div>
```

**工作流程：**
1. 從 URL 獲取當前頁碼（如果 URL 是 `/archive?year=2024&page=3`）
2. 或從 active class 推斷當前頁為 3
3. 按下 → 鍵，導航到 page=4

## 進階技巧

### 自訂參數名稱

如果網站使用非標準的參數名稱（如 `p` 而非 `page`）：

1. 在設定中將「URL 參數名稱」改為 `p`
2. 掃描功能會自動使用新的參數名稱

### 調試技巧

在控制台中手動測試掃描功能：

```javascript
// 掃描所有連結
const allLinks = document.querySelectorAll('a[href]');
const pageLinks = Array.from(allLinks).filter(link =>
  link.href.toLowerCase().includes('page')
);

console.log('找到的分頁連結：', pageLinks);
```

## 與其他功能的整合

### 導航優先順序

```
1. 按鈕導航（優先級最高）
   - 快速、準確
   - 觸發網站的原生事件

2. URL 參數導航
   - 適用於無按鈕的情況
   - 需要 URL 中有 page 參數

3. 智能連結掃描（備用方案）
   - 最後的保障
   - 適應性最強
```

### 完整導航流程

```javascript
function navigate(direction) {
  // 1. 嘗試按鈕
  const button = findButton(direction);
  if (button && !button.disabled) {
    button.click();
    return true;
  }

  // 2. 嘗試 URL 參數
  if (settings.urlNavigation) {
    const success = navigateByUrlParam(direction);
    if (success) return true;
  }

  // 3. 嘗試連結掃描
  if (settings.hrefScan) {
    const success = navigateByHrefScan(direction);
    if (success) return true;
  }

  // 所有方法都失敗
  console.log('無法導航');
  return false;
}
```

## 限制與注意事項

### 技術限制

1. **JavaScript 事件處理的按鈕**
   - 如果分頁是通過 JavaScript 事件而非 href 實現，無法掃描

2. **動態載入的連結**
   - 如果連結在按鍵時才動態生成，可能掃描不到

3. **URL 格式限制**
   - 目前只支援查詢參數格式（`?page=3`）
   - 不支援路徑格式（`/page/3`）

### 最佳實踐

1. **優先使用按鈕導航**
   - 最可靠的方式
   - 如果網站有按鈕，應優先配置按鈕 ID

2. **確保 URL 包含頁碼**
   - URL 參數導航比掃描更快、更準確
   - 推薦網站在 URL 中保留 page 參數

3. **適當的降級策略**
   - 三層策略確保最大相容性
   - 可根據需要關閉某些策略

## 開發資訊

### 相關檔案

- `content.js`: 核心掃描邏輯
  - `scanPageLinks()`: 掃描連結
  - `extractPageNumber()`: 提取頁碼
  - `findLinkByPageNumber()`: 查找目標連結
  - `navigateToNextPageByHref()`: 下一頁導航
  - `navigateToPreviousPageByHref()`: 上一頁導航

- `popup.html`: 設定介面
- `popup.js`: 設定管理
- `test/href-scan-test.html`: 測試頁面

### API 參考

```javascript
// 掃描頁面連結
scanPageLinks(): Array<{url, pageNumber, element, text}>

// 提取頁碼
extractPageNumber(url: string): number|null

// 找到指定頁碼的連結
findLinkByPageNumber(targetPage: number): string|null

// 導航到下一頁
navigateToNextPageByHref(): boolean

// 導航到上一頁
navigateToPreviousPageByHref(): boolean
```

## 版本歷史

### v1.0.0 (2024-11-07)
- ✨ 新增智能連結掃描功能
- ✨ 支援自動推斷當前頁碼
- ✨ 處理相對路徑和絕對路徑
- ✨ 添加專用測試頁面
- ✨ 整合到三層導航策略

## 回報問題

如果您在使用智能連結掃描功能時遇到問題，請提供：

1. 網站 URL
2. 頁面 HTML 結構（分頁相關部分）
3. 控制台日誌
4. 預期行為 vs 實際行為

## 相關文件

- [URL 參數導航指南](URL-NAVIGATION-GUIDE.md)
- [自訂 ID 指南](CUSTOM-ID-GUIDE.md)
- [測試指南](TESTING.md)
- [相容性說明](COMPATIBILITY.md)

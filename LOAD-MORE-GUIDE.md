# Load More 按鈕檢測功能使用指南

## 功能概述

Load More 按鈕檢測是 Anime Next 擴充功能的**第四層導航策略**。當頁面沒有傳統的分頁按鈕、URL 中沒有頁碼參數、也沒有分頁連結時，擴充功能會自動搜尋並點擊「載入更多」(Load More) 類型的按鈕，實現無限滾動網站的鍵盤導航。

## 四層導航策略

Anime Next 現在採用完整的四層導航策略：

```
🎯 第 1 層：按鈕導航 (Button Navigation)
   ↓ 找不到按鈕
🔄 第 2 層：URL 參數導航 (URL Parameter Navigation)
   ↓ URL 沒有頁碼參數
🔍 第 3 層：智能連結掃描 (Href Link Scanning)
   ↓ 沒有分頁連結
⚡ 第 4 層：Load More 按鈕檢測 ← 本功能
```

## 適用場景

這個功能特別適用於以下類型的網站：

### 場景 1: 社交媒體動態

```html
<!-- Facebook、Twitter 等社交媒體的無限滾動 -->
<div class="feed">
  <!-- 動態內容 -->
</div>
<button class="load-more-btn">Load More Posts</button>
```

### 場景 2: 圖片/影片網站

```html
<!-- Instagram、Pinterest 等圖片網站 -->
<div class="gallery">
  <!-- 圖片網格 -->
</div>
<button id="show-more">Show More Images</button>
```

### 場景 3: 電商產品列表

```html
<!-- 亞馬遜、淘寶等電商網站的無限滾動 -->
<div class="product-list">
  <!-- 產品卡片 -->
</div>
<a href="#" class="view-more-products">View More Products</a>
```

### 場景 4: 新聞/部落格網站

```html
<!-- Medium、部落格等內容網站 -->
<div class="articles">
  <!-- 文章列表 -->
</div>
<button class="load-next-page">載入更多文章</button>
```

## 工作原理

### 檢測流程

```
1. 用戶按下 → 鍵
   ↓
2. 前三層策略都失敗
   ↓
3. 啟動 Load More 按鈕檢測
   ↓
4. 策略 1：掃描所有 button 元素
   ↓
5. 策略 2：掃描所有 a 連結
   ↓
6. 策略 3：查找特定 class/id 的元素
   ↓
7. 檢查文字內容是否包含關鍵字
   ↓
8. 驗證元素是否可見和可用
   ↓
9. 點擊找到的按鈕
   ↓
10. 添加視覺回饋效果
```

### 核心算法

#### 1. 關鍵字匹配

支援多語言關鍵字：

```javascript
const loadMoreKeywords = [
  // 英文
  'load more', 'load next', 'show more', 'view more', 'see more', 'more', 'next page',

  // 中文
  '載入更多', '查看更多', '顯示更多', '更多', '下一頁',

  // 日文
  'もっと見る',

  // 韓文
  '더 보기',

  // 西班牙文
  'ver más',

  // 法文
  'voir plus',

  // 德文
  'mehr laden'
];
```

#### 2. 元素掃描

```javascript
function findLoadMoreButton() {
  // 策略 1: 掃描按鈕元素
  const buttons = document.querySelectorAll(
    'button, input[type="button"], input[type="submit"], [role="button"]'
  );

  for (const button of buttons) {
    const text = button.textContent.trim().toLowerCase();
    const value = button.value?.toLowerCase() || '';
    const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
    const title = button.getAttribute('title')?.toLowerCase() || '';

    const allText = `${text} ${value} ${ariaLabel} ${title}`;

    // 檢查是否包含關鍵字
    for (const keyword of loadMoreKeywords) {
      if (allText.includes(keyword)) {
        // 檢查可見性和可用性
        if (!button.disabled && button.offsetParent !== null) {
          return button;
        }
      }
    }
  }

  // 策略 2: 掃描連結元素
  const links = document.querySelectorAll('a[href]');
  // ...類似邏輯

  // 策略 3: 使用 class/id 選擇器
  const commonSelectors = [
    '[class*="load-more"]',
    '[class*="show-more"]',
    '[id*="load-more"]',
    // ...更多選擇器
  ];
  // ...
}
```

#### 3. 可見性檢查

```javascript
// 檢查元素是否可見
if (element.offsetParent !== null && !element.disabled) {
  // 元素可見且可用
  return element;
}
```

## 功能特點

### 1. 多策略檢測

- **文字匹配**：檢查按鈕的文字內容
- **屬性檢查**：檢查 aria-label、title 等屬性
- **選擇器匹配**：使用常見的 class 和 id 模式

### 2. 多語言支援

支援 7+ 種語言的常見表達方式：
- 英文：Load More, Show More
- 中文：載入更多、顯示更多
- 日文：もっと見る
- 韓文：더 보기
- 西班牙文：ver más
- 法文：voir plus
- 德文：mehr laden

### 3. 智能過濾

- **可見性檢查**：只選擇可見的元素
- **可用性檢查**：排除 disabled 的按鈕
- **優先級排序**：button 元素優先於連結

### 4. 視覺回饋

- 點擊按鈕時自動添加動畫效果
- 可以在設定中開關視覺回饋

## 使用方法

### 啟用功能

1. 點擊瀏覽器工具列上的 Anime Next 圖示
2. 找到「Load More 檢測」設定項
3. 確保開關是開啟狀態（預設為開啟）

### 測試功能

#### 方法 1: 使用測試頁面

```
1. 開啟測試頁面：test/load-more-test.html
2. 按下鍵盤 → 鍵
3. 觀察是否自動點擊「載入更多」按鈕
4. 查看內容是否增加
```

#### 方法 2: 在實際網站測試

```
1. 訪問一個使用無限滾動的網站
2. 打開瀏覽器控制台（F12）
3. 按下 → 鍵
4. 查看控制台日誌和頁面反應
```

### 控制台日誌

成功檢測時：

```
[Anime Next] 找不到下一頁按鈕
[Anime Next] 嘗試使用 URL 參數導航到下一頁
[Anime Next] URL 中沒有找到頁碼參數
[Anime Next] 嘗試掃描 href 連結到下一頁
[Anime Next] 掃描到 0 個包含頁碼的連結
[Anime Next] 無法確定當前頁碼
[Anime Next] 嘗試點擊 Load More 按鈕
[Anime Next] 找到 Load More 按鈕 (button): <button>
[Anime Next] 點擊 Load More 按鈕
```

檢測失敗時：

```
[Anime Next] 找不到下一頁按鈕
[Anime Next] 嘗試使用 URL 參數導航到下一頁
[Anime Next] URL 中沒有找到頁碼參數
[Anime Next] 嘗試掃描 href 連結到下一頁
[Anime Next] 掃描到 0 個包含頁碼的連結
[Anime Next] 嘗試點擊 Load More 按鈕
[Anime Next] 未找到 Load More 按鈕
[Anime Next] 所有導航方法都失敗
```

## 支援的按鈕類型

### HTML 結構範例

#### 類型 1: 標準 button 元素

```html
<button class="load-more">Load More</button>
<button id="show-more-btn">Show More</button>
<button type="button">載入更多</button>
```

#### 類型 2: Input button

```html
<input type="button" value="Load More">
<input type="submit" value="View More Posts">
```

#### 類型 3: 連結按鈕

```html
<a href="#" class="load-more-link">Load More</a>
<a href="javascript:void(0)" id="view-more">View More</a>
```

#### 類型 4: DIV/SPAN with role="button"

```html
<div role="button" class="load-more-btn">Load More</div>
<span role="button" onclick="loadMore()">Show More</span>
```

#### 類型 5: 帶有特定 class 的元素

```html
<div class="load-more-wrapper">
  <button>Load More Posts</button>
</div>

<button class="btn btn-primary load-more-button">
  More Articles
</button>
```

## 檢測策略詳解

### 策略 1: 文字內容匹配

檢查元素的：
- `textContent`：元素的文字內容
- `value`：input 元素的值
- `aria-label`：無障礙標籤
- `title`：標題屬性

```javascript
const text = button.textContent.trim().toLowerCase();
const value = button.value?.toLowerCase() || '';
const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
const title = button.getAttribute('title')?.toLowerCase() || '';

const allText = `${text} ${value} ${ariaLabel} ${title}`;

// 檢查是否包含任何關鍵字
for (const keyword of loadMoreKeywords) {
  if (allText.includes(keyword)) {
    // 找到匹配
  }
}
```

### 策略 2: Class 和 ID 模式匹配

常見的命名模式：

```javascript
const commonSelectors = [
  '[class*="load-more"]',      // class 包含 "load-more"
  '[class*="loadmore"]',       // class 包含 "loadmore"
  '[class*="load_more"]',      // class 包含 "load_more"
  '[class*="show-more"]',      // class 包含 "show-more"
  '[class*="showmore"]',       // class 包含 "showmore"
  '[class*="view-more"]',      // class 包含 "view-more"
  '[class*="viewmore"]',       // class 包含 "viewmore"
  '[id*="load-more"]',         // id 包含 "load-more"
  '[id*="loadmore"]',          // id 包含 "loadmore"
  '[id*="load_more"]',         // id 包含 "load_more"
  '[data-action*="load"]',     // data-action 包含 "load"
  '[data-action*="more"]'      // data-action 包含 "more"
];
```

### 策略 3: 優先級排序

1. **Button 元素**：最優先
2. **連結元素**：其次
3. **Class/ID 匹配**：最後備用

## 性能考量

### 掃描效率

- **選擇器優化**：使用高效的 CSS 選擇器
- **提前返回**：找到第一個匹配就停止
- **可見性快速檢查**：`offsetParent !== null`

### 記憶體使用

- **不緩存按鈕**：每次重新掃描
- **及時釋放**：掃描完成後不保留引用

### 執行頻率

- **按需執行**：只在按下 → 鍵時執行
- **前提條件**：前三層策略都失敗後才執行

## 常見問題

### Q1: 為什麼按下 → 鍵沒有載入更多內容？

**可能原因：**
- Load More 功能未啟用
- 按鈕的文字不包含支援的關鍵字
- 按鈕被 CSS 隱藏或 disabled
- 按鈕是通過 JavaScript 事件綁定的，沒有實際的 button 元素

**解決方法：**
1. 檢查擴充功能設定，確保「Load More 檢測」已啟用
2. 打開控制台查看日誌
3. 檢查頁面是否真的有 Load More 按鈕
4. 如果按鈕文字是其他語言，可能需要添加支援

### Q2: 擴充功能點擊了錯誤的按鈕怎麼辦？

**可能原因：**
- 頁面有多個包含關鍵字的按鈕
- 優先級設定導致選擇了錯誤的元素

**解決方法：**
1. 暫時停用 Load More 檢測功能
2. 回報問題，提供網站 URL 和頁面結構
3. 考慮使用自訂按鈕 ID 功能（如果有固定 ID）

### Q3: 支援哪些語言的按鈕？

目前支援：
- ✅ 英文
- ✅ 中文（繁體/簡體）
- ✅ 日文
- ✅ 韓文
- ✅ 西班牙文
- ✅ 法文
- ✅ 德文

其他語言可以透過修改程式碼添加。

### Q4: Load More 按鈕檢測會影響性能嗎？

**影響極小：**
- 只在前三層策略都失敗時執行
- 使用高效的選擇器和演算法
- 通常在幾毫秒內完成

### Q5: 可以自訂關鍵字嗎？

目前版本不支援自訂關鍵字，但您可以：
1. 修改 `content.js` 中的 `loadMoreKeywords` 陣列
2. 添加您需要的關鍵字
3. 重新載入擴充功能

## 實際應用範例

### 範例 1: 社交媒體

```html
<!-- Twitter/Facebook 類型 -->
<div class="timeline">
  <!-- 動態內容 -->
</div>

<button class="timeline-load-more">
  Show more tweets
</button>
```

**工作流程：**
1. 按下 → 鍵
2. 檢測到 "show more" 關鍵字
3. 自動點擊按鈕
4. 新內容載入

### 範例 2: 圖片網站

```html
<!-- Pinterest/Instagram 類型 -->
<div class="image-grid">
  <!-- 圖片卡片 -->
</div>

<a href="#" class="load-more-images" onclick="loadMore()">
  載入更多圖片
</a>
```

**工作流程：**
1. 按下 → 鍵
2. 檢測到 "載入更多" 關鍵字
3. 點擊連結
4. AJAX 載入新圖片

### 範例 3: 電商網站

```html
<!-- Amazon/淘寶類型 -->
<div class="product-container">
  <!-- 商品列表 -->
</div>

<button id="view-more-products" class="btn-primary">
  View More Products
</button>
```

**工作流程：**
1. 按下 → 鍵
2. 通過 id 和文字內容雙重匹配
3. 點擊按鈕
4. 載入更多商品

### 範例 4: 新聞網站

```html
<!-- Medium/部落格類型 -->
<section class="article-list">
  <!-- 文章卡片 -->
</section>

<div class="load-more-container">
  <button type="button" data-action="load-more">
    Load Next Page
  </button>
</div>
```

**工作流程：**
1. 按下 → 鍵
2. 通過 data-action 和文字匹配
3. 點擊按鈕
4. 載入下一頁文章

## 與其他策略的整合

### 完整導航流程

```javascript
function clickNextButton() {
  // 1. 嘗試找按鈕
  const button = findButton('next');
  if (button && !button.disabled) {
    button.click();
    return;
  }

  // 2. 嘗試 URL 參數導航
  if (navigateToNextPage()) return;

  // 3. 嘗試 href 掃描
  if (navigateToNextPageByHref()) return;

  // 4. 嘗試 Load More 按鈕
  if (clickLoadMoreButton()) return;

  // 所有方法都失敗
  console.log('無法導航');
}
```

### 策略優先級

1. **按鈕導航** - 最可靠，優先使用
2. **URL 參數** - 適用於傳統分頁
3. **Href 掃描** - 適用於連結式分頁
4. **Load More** - 適用於無限滾動

## 限制與注意事項

### 技術限制

1. **JavaScript 事件綁定**
   - 如果按鈕沒有實際的 HTML 元素，只是通過 JavaScript 監聽滾動事件，無法檢測

2. **動態生成的按鈕**
   - 如果按鈕在按鍵時才生成，可能掃描不到

3. **隱藏的按鈕**
   - 使用 `display: none` 或 `visibility: hidden` 的按鈕會被過濾

4. **特殊命名**
   - 如果按鈕文字使用非常規表達方式，可能無法識別

### 最佳實踐

1. **確保按鈕可見**
   - Load More 按鈕應該是可見且可點擊的

2. **使用標準命名**
   - 使用常見的命名方式（如 "Load More"）

3. **添加語義屬性**
   - 使用 `role="button"`、`aria-label` 等提高可訪問性

4. **測試相容性**
   - 在實際網站測試前，先使用測試頁面驗證

## 開發資訊

### 相關檔案

- `content.js`: 核心檢測邏輯
  - `findLoadMoreButton()`: 搜尋按鈕
  - `clickLoadMoreButton()`: 點擊按鈕

- `popup.html`: 設定介面
- `popup.js`: 設定管理
- `test/load-more-test.html`: 測試頁面

### API 參考

```javascript
// 查找 Load More 按鈕
findLoadMoreButton(): HTMLElement|null

// 點擊 Load More 按鈕
clickLoadMoreButton(): boolean

// 支援的關鍵字列表
const loadMoreKeywords = [
  'load more', 'show more', 'view more', ...
];
```

### 自訂關鍵字

如果需要添加新的關鍵字：

```javascript
// 在 content.js 中修改
const loadMoreKeywords = [
  // 現有關鍵字...
  'load more',

  // 添加您的關鍵字
  'your custom keyword',
  '您的自訂關鍵字',
];
```

## 測試指南

### 測試步驟

1. **開啟測試頁面**
   ```
   file:///path/to/test/load-more-test.html
   ```

2. **驗證初始狀態**
   - 頁面顯示 8 個項目
   - 有一個「載入更多」按鈕

3. **測試鍵盤導航**
   - 按下 → 鍵
   - 觀察按鈕是否被自動點擊

4. **驗證功能**
   - 檢查是否載入了新內容
   - 檢查狀態欄數據是否更新
   - 檢查控制台日誌

5. **測試多次載入**
   - 連續按 → 鍵多次
   - 確認每次都能正確載入

### 預期結果

```
✅ 按下 → 鍵後，自動點擊「載入更多」按鈕
✅ 新內容成功載入並顯示
✅ 狀態欄正確更新
✅ 控制台有正確的日誌
✅ 視覺回饋效果正常
```

## 版本歷史

### v1.0.0 (2024-11-07)
- ✨ 新增 Load More 按鈕檢測功能
- ✨ 支援 7+ 種語言
- ✨ 三種檢測策略
- ✨ 完整的測試頁面
- ✨ 整合到四層導航系統

## 回報問題

如果您在使用 Load More 功能時遇到問題，請提供：

1. 網站 URL
2. 按鈕的 HTML 結構
3. 按鈕的文字內容
4. 控制台日誌
5. 預期行為 vs 實際行為

## 相關文件

- [導航策略總覽](NAVIGATION-STRATEGIES.md)
- [URL 參數導航指南](URL-NAVIGATION-GUIDE.md)
- [智能連結掃描指南](HREF-SCAN-GUIDE.md)
- [測試指南](TESTING.md)

---

## 結語

Load More 按鈕檢測功能是 Anime Next 導航策略的最後一道防線，確保即使在使用無限滾動的現代化網站上，也能享受鍵盤導航的便利。結合前三層策略，Anime Next 現在能夠適應幾乎所有類型的分頁網站！

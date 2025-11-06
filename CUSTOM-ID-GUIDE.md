# 自訂按鈕 ID 使用指南

> 擴充更多網站的支援 - 讓 Anime Next 在任何分頁網站上運作

**版本**: v1.1.0
**更新日期**: 2025-11-06

---

## 📖 功能說明

預設情況下，Anime Next 支援以下按鈕 ID：

- **下一頁**：`table-list_next`（DataTables 預設）
- **上一頁**：`table-list_previous`（DataTables 預設）

但許多網站使用不同的按鈕 ID。透過 **自訂按鈕 ID** 功能，您可以：

✅ 新增任何網站的分頁按鈕 ID
✅ 支援多個不同的按鈕 ID
✅ 讓鍵盤導航功能在更多網站上運作

---

## 🎯 如何使用

### 步驟 1: 找到網站的按鈕 ID

#### 方法 A: 使用開發者工具（推薦）

1. 在分頁按鈕上**按右鍵** → 選擇「**檢查元素**」或「**Inspect**」
2. 在開發者工具中，您會看到類似這樣的 HTML：

```html
<button id="next-page-btn" class="pagination-next">
  下一頁
</button>
```

3. 找到 `id="..."` 的部分，這就是按鈕的 ID
4. 記下這個 ID：`next-page-btn`

#### 方法 B: 查看網站原始碼

1. 在網頁上按下 `Ctrl + U`（Windows）或 `Cmd + Option + U`（Mac）
2. 搜尋分頁按鈕相關的關鍵字（例如：`next`、`prev`、`pagination`）
3. 找到按鈕的 `id` 屬性

---

### 步驟 2: 在擴充功能中設定自訂 ID

1. 點擊瀏覽器工具列的 **Anime Next** 擴充功能圖示
2. 找到「**自訂按鈕 ID**」區域
3. 在對應的欄位中輸入您找到的 ID：
   - **下一頁按鈕 ID**：輸入下一頁按鈕的 ID
   - **上一頁按鈕 ID**：輸入上一頁按鈕的 ID
4. 如果有多個 ID，**每行輸入一個**：

```
next-page-btn
pagination-next
btn-next
```

5. 點擊「**💾 儲存自訂 ID**」按鈕
6. 看到「已儲存 X 個下一頁 ID 和 X 個上一頁 ID」的提示訊息

---

### 步驟 3: 重新載入網頁並測試

1. 重新整理目標網頁（按 `F5`）
2. 確保焦點不在輸入框中（點擊頁面空白處）
3. 按下鍵盤的 **← 或 →** 方向鍵
4. 測試是否能正常切換分頁

---

## 🧪 測試範例

我們提供了一個測試頁面來幫助您理解和測試自訂 ID 功能。

### 開啟測試頁面

1. 點擊擴充功能圖示
2. 點擊「**測試頁面**」按鈕
3. 或直接在瀏覽器開啟：`test/custom-id-test.html`

### 測試步驟

測試頁面使用以下自訂 ID：

- **下一頁按鈕 ID**：`my-next-button`
- **上一頁按鈕 ID**：`my-prev-button`

請依照測試頁面上的指示進行測試。

---

## 💡 實際應用範例

### 範例 1: Bootstrap Pagination

如果網站使用 Bootstrap 的分頁組件：

```html
<button id="next-page" class="page-link">Next</button>
<button id="prev-page" class="page-link">Previous</button>
```

**設定方式**：
- 下一頁 ID：`next-page`
- 上一頁 ID：`prev-page`

---

### 範例 2: 多種可能的 ID

有些網站在不同頁面使用不同的 ID，您可以一次加入多個：

**下一頁按鈕 ID**：
```
next-page-btn
pagination-next
btn-next
nextPageButton
```

**上一頁按鈕 ID**：
```
prev-page-btn
pagination-prev
btn-prev
prevPageButton
```

擴充功能會依序搜尋這些 ID，找到第一個存在的按鈕就會使用。

---

### 範例 3: 常見的按鈕 ID 模式

以下是一些常見的按鈕 ID 命名模式：

| 類型 | 下一頁 | 上一頁 |
|------|--------|--------|
| 簡短型 | `next`, `next-btn` | `prev`, `prev-btn` |
| 描述型 | `next-page`, `next-page-button` | `prev-page`, `previous-page-button` |
| 駝峰式 | `nextPage`, `nextButton` | `prevPage`, `previousButton` |
| 帶前綴 | `btn-next`, `pagination-next` | `btn-prev`, `pagination-prev` |

---

## 🔍 除錯技巧

### 問題 1: 設定了自訂 ID 但沒有作用

**檢查步驟**：

1. 按 `F12` 開啟開發者工具
2. 切換到 **Console** 分頁
3. 重新整理頁面
4. 查看是否有以下訊息：

```
[Anime Next] 設定已載入: {enabled: true, visualFeedback: true, customNextIds: Array(X), customPrevIds: Array(X)}
```

5. 確認 `customNextIds` 和 `customPrevIds` 陣列中有您設定的 ID

6. 查看是否有找到按鈕的訊息：

```
[Anime Next] 找到按鈕 (自訂 ID): next - your-custom-id
```

---

### 問題 2: 不確定按鈕的 ID 是什麼

**解決方法**：

1. 在按鈕上按右鍵 → 檢查元素
2. 在 HTML 標籤中找 `id="..."`
3. 如果沒有 `id` 屬性，該按鈕可能使用 class 或其他方式識別
4. 目前版本只支援透過 `id` 屬性查找按鈕

---

### 問題 3: Console 顯示「找不到按鈕」

可能原因：

1. **ID 輸入錯誤**：檢查是否有拼寫錯誤或多餘的空格
2. **按鈕是動態載入的**：等待頁面完全載入後再測試
3. **按鈕沒有 ID 屬性**：該網站的按鈕可能使用其他識別方式

---

## ⚙️ 進階技巧

### 優先順序

按鈕搜尋的優先順序：

1. **自訂 ID**（最優先）
2. 預設 ID（`table-list_next`、`table-list_previous`）
3. 預設 class（`paginate_button.next`、`paginate_button.previous`）
4. Data 屬性（`data-dt-idx`）

自訂 ID 會優先被搜尋，因此即使網站同時有預設 ID 和自訂 ID，也會優先使用您設定的自訂 ID。

---

### 多個 ID 的搜尋邏輯

如果您設定了多個 ID：

```
next-page-btn
pagination-next
btn-next
```

擴充功能會：

1. 先嘗試找 `next-page-btn`
2. 如果找不到，再找 `pagination-next`
3. 如果還是找不到，再找 `btn-next`
4. 找到第一個存在的按鈕就停止搜尋

這讓您可以在不同網站使用相同的設定。

---

### 按鈕快取機制

- 找到的按鈕會被快取 **5 秒鐘**
- 5 秒後會自動重新搜尋
- 如果 DOM 結構改變（例如切換分頁），會立即清除快取並重新搜尋

---

## 🆘 疑難排解

### 重置自訂 ID

如果您想清除所有自訂 ID：

1. 開啟擴充功能設定
2. 清空兩個文字框的內容
3. 點擊「💾 儲存自訂 ID」
4. 或直接點擊「重置設定」按鈕（會重置所有設定）

---

### 匯出/備份您的設定

設定會自動儲存在 Chrome/Edge 的同步儲存空間中。

如果您：
- 登入了 Google/Microsoft 帳號
- 開啟了「同步」功能

您的設定會自動同步到其他裝置。

---

## 📊 限制與注意事項

### 目前只支援透過 ID 查找

- ✅ 支援：`<button id="next-btn">`
- ❌ 不支援：`<button class="next-btn">`（沒有 ID 屬性）

未來版本可能會加入支援透過 class 或其他選擇器查找按鈕。

### ID 必須是唯一的

- 每個按鈕的 ID 在同一個頁面上必須是唯一的
- 如果有多個元素使用相同的 ID，只會找到第一個

### 按鈕必須是可點擊的

- 按鈕必須能夠接收點擊事件
- 被 CSS 隱藏的按鈕（`display: none`）可能無法運作

---

## 🎉 成功案例

使用自訂 ID 功能後，您可以在以下類型的網站使用鍵盤導航：

✅ 電商網站的商品列表分頁
✅ 論壇的文章列表分頁
✅ 搜尋引擎的結果頁面
✅ 後台管理系統的資料表格
✅ 任何有分頁的網站（只要按鈕有 ID）

---

## 🔄 版本更新

**v1.1.0 新功能**：
- ✨ 新增自訂按鈕 ID 功能
- ✨ 支援多個 ID 的優先搜尋
- ✨ 提供測試頁面（custom-id-test.html）
- 📝 新增完整的使用指南

---

## 📞 需要幫助？

如果您在使用自訂 ID 功能時遇到問題：

1. 查看本指南的「除錯技巧」章節
2. 使用測試頁面確認功能是否正常
3. 檢查開發者工具的 Console 訊息
4. 確認您輸入的 ID 與網站實際的 ID 相符

---

**祝使用愉快！** 🎮

如有任何建議或問題，歡迎回報！

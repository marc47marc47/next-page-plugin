# Anime Next - 測試指南

> 本文檔說明如何測試 Anime Next Chrome 擴充功能

---

## 📦 在 Chrome 中載入擴充功能

### 步驟 1: 啟用開發人員模式

1. 開啟 Chrome 瀏覽器
2. 在網址列輸入 `chrome://extensions/` 並按 Enter
3. 在右上角找到「開發人員模式」開關並啟用

### 步驟 2: 載入未封裝的擴充功能

1. 點擊左上角的「載入未封裝項目」按鈕
2. 瀏覽並選擇 `anime-next` 專案資料夾
3. 確認擴充功能已出現在列表中，並且狀態為「已啟用」

### 步驟 3: 驗證安裝

- 確認擴充功能圖示出現在瀏覽器工具列（如果圖示檔案存在）
- 檢查擴充功能卡片上沒有錯誤訊息
- 記下擴充功能的 ID（用於除錯）

---

## ✅ 測試案例

### Test Case 1: 基本分頁導航

**目標**: 驗證左右方向鍵可以觸發分頁按鈕

**測試步驟**:
1. 開啟測試頁面 `test/test-page.html` 或任何有 DataTables 分頁的網站
2. 確保焦點不在任何輸入框中（點擊頁面空白處）
3. 按下鍵盤右方向鍵 (→)
4. 觀察是否切換到下一頁

**預期結果**:
- ✅ 頁面切換到下一頁
- ✅ Console 顯示 `[Anime Next] 找到按鈕 (ID/Class/Data): next`
- ✅ Console 顯示 `[Anime Next] 點擊下一頁按鈕`

**測試步驟（上一頁）**:
1. 按下鍵盤左方向鍵 (←)
2. 觀察是否切換到上一頁

**預期結果**:
- ✅ 頁面切換到上一頁
- ✅ Console 顯示相應的日誌訊息

---

### Test Case 2: 輸入框中的按鍵不觸發導航

**目標**: 驗證在輸入框中按左右鍵時不會觸發分頁

**測試步驟**:
1. 開啟測試頁面
2. 點擊任何 `<input>` 輸入框使其獲得焦點
3. 按下左方向鍵或右方向鍵
4. 觀察頁面是否保持不變

**預期結果**:
- ✅ 頁面不會切換
- ✅ 游標在輸入框中正常移動
- ✅ Console 沒有 Anime Next 的日誌

**測試元素類型**:
- [ ] `<input type="text">`
- [ ] `<textarea>`
- [ ] `<select>`
- [ ] `contenteditable` 元素

---

### Test Case 3: 沒有分頁按鈕的頁面

**目標**: 驗證在沒有分頁按鈕的頁面上不會出錯

**測試步驟**:
1. 開啟任何沒有分頁按鈕的網頁（例如：Google 首頁）
2. 按下左右方向鍵

**預期結果**:
- ✅ 沒有錯誤訊息
- ✅ Console 顯示 `[Anime Next] 找不到下一頁/上一頁按鈕`
- ✅ 瀏覽器正常運作

---

### Test Case 4: 已停用的按鈕

**目標**: 驗證已停用的按鈕不會被點擊

**測試步驟**:
1. 開啟測試頁面並導航到第一頁
2. 確認「上一頁」按鈕已停用（有 `disabled` class）
3. 按下左方向鍵

**預期結果**:
- ✅ 頁面不會切換
- ✅ Console 顯示 `[Anime Next] 上一頁按鈕已停用`

**同樣測試最後一頁的「下一頁」按鈕**:
1. 導航到最後一頁
2. 確認「下一頁」按鈕已停用
3. 按下右方向鍵

**預期結果**:
- ✅ 頁面不會切換
- ✅ Console 顯示 `[Anime Next] 下一頁按鈕已停用`

---

### Test Case 5: 不同的分頁組件

**目標**: 驗證擴充功能與不同類型的分頁組件相容

**測試網站**:

1. **DataTables 官方範例**
   - 網址: https://datatables.net/examples/basic_init/zero_configuration.html
   - 預期: ✅ 左右鍵可以切換分頁

2. **Bootstrap 文檔**
   - 網址: https://getbootstrap.com/docs/5.3/components/pagination/
   - 預期: 可能無法直接切換（需要實際有功能的分頁）

3. **GitHub Issues 頁面**
   - 網址: https://github.com/any-repo/issues
   - 預期: 測試在輸入框（搜尋框）中不觸發

---

## 🔧 除錯指南

### 如何查看 Console 日誌

**方法 1: 在特定網頁上除錯**
1. 開啟要測試的網頁
2. 按 F12 或右鍵選擇「檢查」
3. 切換到「Console」分頁
4. 按下左右方向鍵，觀察日誌輸出

**方法 2: 檢查擴充功能背景頁面**
1. 前往 `chrome://extensions/`
2. 找到 Anime Next 擴充功能
3. 點擊「檢查檢視」（如果有背景頁面）

### 常見問題排除

#### 問題 1: 擴充功能未載入

**症狀**: 在 `chrome://extensions/` 頁面上看到錯誤

**可能原因**:
- `manifest.json` 格式錯誤
- 檔案路徑不正確

**解決方法**:
1. 檢查 `manifest.json` 是否為有效的 JSON 格式
2. 確認 `content.js` 檔案存在於正確位置
3. 點擊「重新載入」按鈕重新載入擴充功能

---

#### 問題 2: 按鍵無反應

**症狀**: 按下左右方向鍵時沒有任何反應

**可能原因**:
- 焦點在輸入框中
- 網頁沒有分頁按鈕
- JavaScript 錯誤

**解決方法**:
1. 確認焦點不在輸入框中（點擊頁面空白處）
2. 開啟 Console 檢查是否有錯誤訊息
3. 檢查 Console 是否顯示 `[Anime Next] 鍵盤導航已啟用`
4. 如果沒有，重新整理頁面或重新載入擴充功能

---

#### 問題 3: 找不到分頁按鈕

**症狀**: Console 顯示「找不到下一頁/上一頁按鈕」

**可能原因**:
- 網頁使用不同的分頁組件
- 按鈕選擇器不匹配

**解決方法**:
1. 使用開發者工具檢查分頁按鈕的 HTML 結構
2. 確認按鈕的 ID、class 或 data 屬性
3. 如果需要，更新 `content.js` 中的 `CONFIG.BUTTON_SELECTORS`

**範例**:
```javascript
// 在 content.js 的 CONFIG 中添加新的選擇器
BUTTON_SELECTORS: {
  NEXT_ID: 'table-list_next',
  PREVIOUS_ID: 'table-list_previous',
  NEXT_CLASS: 'paginate_button.next',
  PREVIOUS_CLASS: 'paginate_button.previous',
  // 新增其他選擇器
  NEXT_ALT_CLASS: 'your-custom-next-class',
  PREVIOUS_ALT_CLASS: 'your-custom-previous-class'
}
```

---

#### 問題 4: 與網頁原有功能衝突

**症狀**: 網頁原本的左右鍵功能無法使用

**可能原因**:
- `event.preventDefault()` 阻止了預設行為

**解決方法**:
1. 如果需要保留網頁原有功能，可以在 `content.js` 中添加條件判斷
2. 或者移除特定網站的匹配規則

---

## 📊 效能測試

### 測試指標

1. **鍵盤回應時間**
   - 目標: < 100ms
   - 測試: 使用 `console.time()` 和 `console.timeEnd()` 測量

2. **記憶體使用**
   - 目標: < 5MB
   - 測試: Chrome 工作管理員 (Shift + Esc)

3. **CPU 使用**
   - 目標: < 1% (閒置時)
   - 測試: Chrome 工作管理員

### 效能測試步驟

1. 開啟 Chrome 工作管理員 (Shift + Esc)
2. 找到擴充功能的行項目
3. 記錄記憶體和 CPU 使用情況
4. 在測試頁面上進行多次按鍵操作
5. 觀察資源使用是否在目標範圍內

---

## 🧪 測試檢查清單

### Phase 1 基本功能測試

- [ ] 安裝擴充功能成功
- [ ] 右方向鍵可以觸發下一頁
- [ ] 左方向鍵可以觸發上一頁
- [ ] 在 input 輸入框中不觸發
- [ ] 在 textarea 文字區域中不觸發
- [ ] 在 select 下拉選單中不觸發
- [ ] 在 contenteditable 元素中不觸發
- [ ] 沒有分頁按鈕時不出錯
- [ ] 已停用的按鈕不會被點擊
- [ ] Console 日誌正確顯示

### 相容性測試

- [ ] DataTables 分頁正常運作
- [ ] 測試頁面正常運作
- [ ] GitHub (測試輸入框排除)
- [ ] 其他常用網站

### 效能測試

- [ ] 鍵盤回應時間 < 100ms
- [ ] 記憶體使用 < 5MB
- [ ] CPU 使用 < 1% (閒置時)
- [ ] 長時間使用無記憶體洩漏

---

## 🐛 回報問題

如果您在測試過程中發現問題，請記錄以下資訊：

1. **環境資訊**
   - Chrome 版本
   - 作業系統
   - 擴充功能版本

2. **重現步驟**
   - 詳細描述如何重現問題
   - 提供測試網址（如果可能）

3. **實際結果**
   - 發生了什麼

4. **預期結果**
   - 應該發生什麼

5. **錯誤訊息**
   - Console 錯誤訊息
   - 截圖（如果相關）

---

## 📝 測試記錄範本

```
測試日期: YYYY-MM-DD
測試者: [姓名]
擴充功能版本: 1.0.0
Chrome 版本: [版本號]

測試結果:
- Test Case 1: ✅ 通過
- Test Case 2: ✅ 通過
- Test Case 3: ✅ 通過
- Test Case 4: ❌ 失敗 - [原因]
- Test Case 5: ✅ 通過

問題記錄:
1. [描述問題]
2. [描述問題]

建議改進:
1. [建議]
2. [建議]
```

---

## 🚀 Phase 3: 優化功能測試

### Test Case 6: 按鈕快取機制

**目標**: 驗證按鈕快取機制正確運作

**測試步驟**:
1. 開啟測試頁面
2. 開啟 Console
3. 按下右方向鍵
4. 檢查 Console 是否顯示 `[Anime Next] 按鈕快取已更新`
5. 在 5 秒內再次按下右方向鍵
6. 觀察是否直接使用快取（不會再次顯示「找到按鈕」的日誌）

**預期結果**:
- ✅ 初次按鍵時更新快取
- ✅ 快取期間內重複按鍵直接使用快取
- ✅ 快取過期後自動重新查找按鈕
- ✅ Console 顯示 `[Anime Next] 快取狀態: { hasNext: true, hasPrevious: true }`

**測試快取失效**:
1. 使用開發者工具刪除分頁按鈕元素
2. 按下方向鍵
3. 檢查是否顯示 `[Anime Next] 快取的按鈕已失效，重新查找`

---

### Test Case 7: MutationObserver 動態更新

**目標**: 驗證 MutationObserver 能正確偵測 DOM 變化

**測試步驟**:
1. 開啟測試頁面
2. 開啟 Console
3. 使用開發者工具修改分頁按鈕的 HTML 結構（例如：移除後再添加）
4. 觀察 Console 是否顯示 `[Anime Next] 偵測到分頁結構變化，更新快取`

**預期結果**:
- ✅ 偵測到分頁按鈕被移除
- ✅ 偵測到分頁按鈕被添加
- ✅ 偵測到分頁按鈕的 class 屬性變化
- ✅ 自動更新快取
- ✅ 按鍵功能仍然正常運作

**測試步驟（動態載入場景）**:
1. 開啟一個使用 AJAX 載入分頁的網站
2. 切換分頁觸發 AJAX 請求
3. 等待新的分頁按鈕載入
4. 按下方向鍵測試功能

**預期結果**:
- ✅ MutationObserver 偵測到新的按鈕
- ✅ 自動更新快取
- ✅ 方向鍵功能正常運作

---

### Test Case 8: 設定即時更新

**目標**: 驗證設定變更能即時生效

**測試步驟**:
1. 開啟測試頁面
2. 點擊工具列的擴充功能圖示，開啟設定彈出視窗
3. 關閉「啟用鍵盤導航」開關
4. 在測試頁面按下方向鍵
5. 觀察是否不觸發分頁切換

**預期結果**:
- ✅ 關閉功能後，方向鍵不觸發分頁
- ✅ Console 顯示 `[Anime Next] 擴充功能已停用`
- ✅ 網頁的預設方向鍵行為恢復

**測試視覺回饋開關**:
1. 開啟「啟用鍵盤導航」
2. 關閉「視覺回饋效果」
3. 按下方向鍵切換分頁
4. 觀察按鈕是否沒有動畫效果

**預期結果**:
- ✅ 分頁功能正常運作
- ✅ 按鈕沒有顯示動畫效果

---

### Test Case 9: 多分頁同步設定

**目標**: 驗證設定在多個分頁間同步

**測試步驟**:
1. 開啟兩個測試頁面分頁（分頁 A 和分頁 B）
2. 在分頁 A 中開啟設定彈出視窗
3. 關閉「啟用鍵盤導航」
4. 切換到分頁 B
5. 按下方向鍵
6. 觀察是否不觸發分頁切換

**預期結果**:
- ✅ 分頁 B 也收到設定更新
- ✅ 兩個分頁的功能狀態一致
- ✅ Console 顯示 `[Anime Next] 設定已更新`

---

### Test Case 10: 資源清理

**目標**: 驗證資源正確清理，無記憶體洩漏

**測試步驟**:
1. 開啟 Chrome 工作管理員 (Shift + Esc)
2. 記錄擴充功能的初始記憶體使用量
3. 開啟測試頁面
4. 連續按下方向鍵 100 次
5. 重新整理頁面 10 次
6. 觀察記憶體使用量變化

**預期結果**:
- ✅ 記憶體使用量保持穩定（< 5MB）
- ✅ 沒有明顯的記憶體洩漏
- ✅ MutationObserver 正確斷開連接
- ✅ 事件監聽器正確清理

**測試頁面卸載**:
1. 開啟測試頁面
2. 開啟 Console
3. 關閉分頁
4. 檢查 Console 是否顯示 `[Anime Next] 資源已清理`

---

## 🧪 Phase 3 測試檢查清單

### 效能優化測試

- [ ] 按鈕快取機制正常運作
- [ ] 快取過期時自動更新
- [ ] 快取失效時正確處理
- [ ] MutationObserver 正確偵測 DOM 變化
- [ ] 動態載入的按鈕能正確識別
- [ ] 防抖機制運作正常（如果啟用）
- [ ] 記憶體使用保持穩定
- [ ] 無記憶體洩漏

### 設定管理測試

- [ ] 設定即時更新生效
- [ ] 啟用/停用開關正常運作
- [ ] 視覺回饋開關正常運作
- [ ] 多分頁設定同步正常
- [ ] Chrome Storage 同步正常
- [ ] 設定重置功能正常

### 進階功能測試

- [ ] Popup UI 正常顯示
- [ ] Background Service Worker 正常運作
- [ ] 訊息傳遞機制正常
- [ ] 狀態指示器正確顯示
- [ ] 測試頁面快速開啟功能正常

---

## 📈 效能基準測試

### 快取效能測試

**測試方法**:
```javascript
// 在 Console 中執行
console.time('Button lookup');
// 按下方向鍵
console.timeEnd('Button lookup');
```

**目標基準**:
- 初次查找: < 10ms
- 快取查找: < 1ms

### MutationObserver 效能測試

**測試方法**:
1. 開啟 Chrome Performance Profiler
2. 開始錄製
3. 在測試頁面上多次切換分頁（觸發 DOM 變化）
4. 停止錄製
5. 分析 MutationObserver 的執行時間

**目標基準**:
- 每次 mutation 處理時間: < 5ms
- 不應阻塞主執行緒

---

## 🔍 進階除錯技巧

### 檢查快取狀態

在 Console 中執行:
```javascript
chrome.runtime.sendMessage({
  action: 'getStatus'
}, (response) => {
  console.log('擴充功能狀態:', response);
  console.log('快取資訊:', response.cacheInfo);
});
```

### 手動清除快取

在 Console 中執行:
```javascript
chrome.runtime.sendMessage({
  action: 'clearCache'
}, (response) => {
  console.log('快取已清除:', response);
});
```

### 監聽設定變更

在 Console 中執行:
```javascript
chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log('設定變更:', changes, 'in', areaName);
});
```

---

## 📚 相容性測試

完整的相容性測試清單請參閱 [COMPATIBILITY.md](COMPATIBILITY.md) 文檔。

**快速測試網站**:
1. [DataTables Examples](https://datatables.net/examples/) - 主要目標
2. [測試頁面](test/test-page.html) - 本地測試
3. [GitHub Issues](https://github.com/microsoft/vscode/issues) - 實際網站測試

---

**文檔版本**: 1.0.0
**最後更新**: 2025-11-06

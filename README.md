# 🎮 Anime Next

一個智能的 Chrome 擴充功能，使用鍵盤方向鍵輕鬆導航網頁分頁。支援多種分頁類型，包括傳統按鈕、URL 參數、智能連結掃描和 Load More 按鈕。

> **A smart Chrome extension for easy webpage pagination navigation using keyboard arrow keys. Supports multiple pagination types including traditional buttons, URL parameters, intelligent link scanning, and Load More buttons.**

---

## ✨ 功能特色 Features

### 🎯 四層智能導航系統 Four-Layer Navigation System

1. **傳統按鈕檢測** - Traditional Button Detection
   - 自動識別「下一頁」/「上一頁」按鈕
   - 支援多種 ID、Class 和文字內容
   - 按鈕快取機制提升效能

2. **URL 參數導航** - URL Parameter Navigation
   - 當頁面無實體按鈕時，自動修改 URL 參數
   - 支援自訂參數名稱（預設：`page`）
   - 範例：`?page=3` → `?page=4`

3. **智能連結掃描** - Intelligent Link Scanning
   - 掃描頁面中的分頁連結
   - 自動推斷頁碼並找到對應連結
   - 支援相對和絕對路徑

4. **Load More 檢測** - Load More Detection
   - 自動偵測「載入更多」按鈕
   - 支援 7+ 種語言（中、英、日、韓等）
   - 適用於無限滾動類型網站

### 🌐 多語言支援 Multi-Language Support

**按鈕文字識別：**
- 🇬🇧 英文：Next Page, Previous Page, Load More
- 🇨🇳 繁體中文：下一頁、上一頁、載入更多
- 🇨🇳 簡體中文：下一页、上一页、加载更多
- 🇯🇵 日文：次へ、前へ、もっと見る
- 🇰🇷 韓文：다음、이전、더 보기
- 🇪🇸 西班牙文：Siguiente、Anterior、Ver más
- 🇫🇷 法文：Suivant、Précédent、Voir plus
- 🇩🇪 德文：Weiter、Zurück、Mehr laden

**JavaScript 函數支援：**
- `javascript:nextPage()` / `javascript:prevPage()`
- `onclick="goNext()"` / `onclick="goPrev()"`
- 以及更多常見的分頁函數名稱

### ⚙️ 進階功能 Advanced Features

- ✅ **智能按鈕識別** - 通過文字、ID、Class、JavaScript 連結多重匹配
- ✅ **CSP 繞過技術** - 使用 CustomEvent 通訊機制執行頁面 JavaScript
- ✅ **反除錯保護** - 自動繞過網站的 DevTools 偵測和 debugger 陷阱
- ✅ **優先級排序** - 智能區分"頁面"和"章節"導航按鈕
- ✅ **視覺回饋動畫** - 可選的按鈕點擊效果
- ✅ **自訂按鈕 ID** - 支援添加網站特定的按鈕識別
- ✅ **設定同步** - 所有分頁共享設定
- ✅ **效能優化** - 按鈕快取、DOM 變更監控
- ✅ **完整測試套件** - 包含多個測試頁面

---

## 📦 安裝方式 Installation

### 方法 1：從原始碼安裝（開發者模式）

1. **下載專案**
   ```bash
   git clone https://github.com/yourusername/anime-next.git
   cd anime-next
   ```

2. **開啟 Chrome 擴充功能頁面**
   - 在瀏覽器輸入 `chrome://extensions/`
   - 或點選「更多工具」→「擴充功能」

3. **啟用開發人員模式**
   - 點選右上角的「開發人員模式」切換開關

4. **載入擴充功能**
   - 點選「載入未封裝項目」
   - 選擇專案資料夾
   - 完成！圖示會出現在工具列

### 方法 2：從 Chrome Web Store 安裝（即將推出）

> Coming soon to Chrome Web Store

---

## 🚀 使用方式 Usage

### 基本操作 Basic Operations

| 按鍵 Key | 功能 Function |
|---------|--------------|
| `←` 左方向鍵 | 上一頁 Previous Page |
| `→` 右方向鍵 | 下一頁 Next Page |

### 導航策略順序 Navigation Strategy Order

當您按下方向鍵時，擴充功能會依序嘗試以下策略：

```
按下 → 鍵
    ↓
1️⃣ 尋找傳統「下一頁」按鈕
    ↓ (找不到)
2️⃣ 檢查 URL 是否包含頁碼參數 (如 ?page=3)
    ↓ (沒有)
3️⃣ 掃描頁面中的分頁連結
    ↓ (沒有)
4️⃣ 尋找「載入更多」按鈕
    ↓
✅ 成功導航
```

### 範例網站 Example Websites

這些類型的網站都能正常運作：

1. **傳統分頁按鈕**
   ```html
   <a id="table-list_next">下一頁</a>
   <button class="next-page">Next</button>
   ```

2. **URL 參數分頁**
   ```
   https://example.com/items?page=3
   https://example.com/products?p=5&sort=date
   ```

3. **連結分頁**
   ```html
   <a href="/items?page=2">2</a>
   <a href="/items?page=3">3</a>
   <a href="/items?page=4">4</a>
   ```

4. **無限滾動**
   ```html
   <button class="load-more">載入更多</button>
   <a href="#" id="show-more">Load More</a>
   ```

---

## ⚙️ 設定選項 Configuration

點選工具列的擴充功能圖示開啟設定面板：

### 主要設定 Main Settings

| 設定項目 | 說明 | 預設值 |
|---------|------|--------|
| **啟用鍵盤導航** | 啟用/停用整個擴充功能 | ✅ 開啟 |
| **視覺回饋效果** | 按鈕點擊時顯示動畫 | ✅ 開啟 |

### 導航策略設定 Navigation Strategy Settings

| 設定項目 | 說明 | 預設值 |
|---------|------|--------|
| **URL 參數導航** | 當沒有按鈕時使用 URL 參數 | ✅ 開啟 |
| **URL 參數名稱** | URL 中的頁碼參數名稱 | `page` |
| **智能連結掃描** | 掃描並使用分頁連結 | ✅ 開啟 |
| **Load More 檢測** | 偵測並點擊載入更多按鈕 | ✅ 開啟 |

### 自訂按鈕 ID Custom Button IDs

您可以新增自訂的按鈕 ID 來支援更多網站：

```
下一頁按鈕 ID：
my-next-button
next-page-btn
pagination-next

上一頁按鈕 ID：
my-prev-button
prev-page-btn
pagination-prev
```

預設已包含的 ID：
- `table-list_next` / `table-list_previous`

---

## 🧪 測試頁面 Test Pages

擴充功能包含完整的測試頁面，用於驗證各項功能：

| 測試頁面 | 測試內容 | 檔案路徑 |
|---------|---------|---------|
| **基本測試** | 傳統按鈕檢測 | `test/test-page.html` |
| **URL 導航測試** | URL 參數修改 | `test/url-navigation-test.html` |
| **連結掃描測試** | 智能連結偵測 | `test/href-scan-test.html` |
| **Load More 測試** | 載入更多按鈕 | `test/load-more-test.html` |

### 如何開啟測試頁面

1. **從設定面板**：點選「測試頁面」按鈕
2. **直接開啟**：在瀏覽器輸入 `chrome-extension://[擴充功能ID]/test/test-page.html`
3. **本地開啟**：直接用瀏覽器開啟專案中的 HTML 檔案

---

## 🎨 視覺效果 Visual Effects

當啟用視覺回饋時，點擊按鈕會顯示：

- 🟢 綠色光暈動畫
- 📦 短暫的邊框高亮
- ⚡ 流暢的過渡效果

可在設定面板中關閉此功能以獲得更隱密的體驗。

---

## 📚 文件導覽 Documentation

| 文件 | 說明 |
|-----|------|
| [DEVELOP.md](DEVELOP.md) | 完整開發文件（1500+ 行） |
| [README-CSP-SOLUTION.md](README-CSP-SOLUTION.md) | CSP 繞過解決方案技術文檔 ⭐ NEW |
| [URL-NAVIGATION-GUIDE.md](URL-NAVIGATION-GUIDE.md) | URL 參數導航指南 |
| [HREF-SCAN-GUIDE.md](HREF-SCAN-GUIDE.md) | 連結掃描指南 |
| [LOAD-MORE-GUIDE.md](LOAD-MORE-GUIDE.md) | Load More 檢測指南 |
| [NAVIGATION-STRATEGIES.md](NAVIGATION-STRATEGIES.md) | 導航策略總覽 |

---

## 🏗️ 技術架構 Technical Architecture

```
┌─────────────────────────────────────────┐
│          Keyboard Event Listener         │
│           (Arrow Keys ← →)              │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Navigation Strategy Manager         │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐   ┌──────────────┐
│  Settings    │   │  Button      │
│  Manager     │   │  Cache       │
└──────────────┘   └──────────────┘
                 │
     ┌───────────┼───────────┬───────────┐
     ▼           ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Layer 1 │ │ Layer 2 │ │ Layer 3 │ │ Layer 4 │
│ Smart   │ │   URL   │ │  Href   │ │  Load   │
│ Button  │ │  Param  │ │  Scan   │ │  More   │
│ Detect  │ │ (CSP)   │ │         │ │         │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│   Smart Click Handler (smartClick)       │
│  ┌────────────────────────────────────┐  │
│  │ 1. onclick 屬性執行                │  │
│  │ 2. javascript: 連結 (CustomEvent)  │  │
│  │ 3. 普通連結導航                    │  │
│  │ 4. MouseEvent 派發                 │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│     Page Script Executor (CSP Bypass)    │
│  ┌────────────────────────────────────┐  │
│  │ Content Script → CustomEvent       │  │
│  │       ↓                            │  │
│  │ Page Context → Execute Function    │  │
│  │       ↓                            │  │
│  │ CustomEvent ← Return Result        │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### 核心技術 Core Technologies

- **Manifest V3** - Chrome 擴充功能最新版本
- **Vanilla JavaScript** - 無外部相依套件
- **CustomEvent API** - 跨上下文通訊（CSP 繞過）
- **Proxy Pattern** - Error 和 Function 攔截
- **Chrome Storage API** - 設定同步
- **MutationObserver** - DOM 變更監控
- **CSS Animations** - 視覺回饋效果

### 關鍵技術特點

1. **CSP 繞過機制**
   - 使用 CustomEvent 在 Content Script 和 Page Context 之間通訊
   - 避免直接使用 `eval()` 或 `new Function()`
   - 詳見 [README-CSP-SOLUTION.md](README-CSP-SOLUTION.md)

2. **智能按鈕識別**
   - 多重匹配策略：ID → Class → Data 屬性 → 文字內容 → JavaScript 連結
   - 優先級排序：優先匹配"頁面"而非"章節"
   - 排除機制：自動過濾不相關的按鈕

3. **反除錯保護**
   - Function Proxy：攔截並移除 `debugger` 語句
   - DevTools 偵測繞過：隱藏視窗大小差異、Firebug 變數等
   - Error Stack 清理：移除擴充功能痕跡

---

## 🔧 疑難排解 Troubleshooting

### 問題：按下方向鍵沒有反應

**可能原因與解決方法：**

1. **擴充功能未啟用**
   - 開啟設定面板檢查「啟用鍵盤導航」是否開啟

2. **焦點在輸入框中**
   - 點擊頁面其他地方移除輸入框焦點
   - 擴充功能會自動忽略輸入框、文字區域等元素

3. **頁面未完全載入**
   - 等待頁面完全載入後再試
   - 查看瀏覽器控制台是否有錯誤訊息

4. **網站不相容**
   - 某些網站可能使用特殊的分頁機制
   - 嘗試新增自訂按鈕 ID

### 問題：URL 導航不正確

**解決方法：**

1. 檢查 URL 參數名稱設定是否正確
2. 確認網站使用的參數名稱（如 `page`、`p`、`pageNum` 等）
3. 在設定中修改「URL 參數名稱」

### 問題：Load More 按鈕未被偵測

**解決方法：**

1. 確認「Load More 檢測」功能已啟用
2. 檢查按鈕文字是否包含支援的關鍵字
3. 查看瀏覽器控制台的日誌訊息

### 檢視日誌 View Logs

開啟瀏覽器開發者工具（F12）查看詳細日誌：

```javascript
[Anime Next] Extension loaded
[Anime Next] Settings loaded: {...}
[Anime Next] Button found: <button class="next">
[Anime Next] Navigating to next page...
```

---

## 🤝 貢獻指南 Contributing

歡迎貢獻！請參閱 [DEVELOP.md](DEVELOP.md) 了解開發細節。

### 開發流程

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

### 測試

```bash
# 載入擴充功能到 Chrome
# 開啟測試頁面驗證功能
# 檢查控制台日誌
```

---

## 📝 版本歷史 Version History

### v2.0.0 (Current)

**🎯 智能按鈕識別系統**
- ✨ 新增智能文字匹配：支援「下一頁」、「Next Page」等多語言按鈕
- ✨ JavaScript 連結支援：可執行 `javascript:nextPage()` 類型的連結
- ✨ 優先級排序：自動區分「上一頁」vs「上一章」，選擇正確按鈕
- ✨ 多重匹配策略：文字、ID、Class、onclick、href 全方位搜尋

**🔒 反除錯與安全**
- 🛡️ CSP 繞過技術：使用 CustomEvent 通訊機制執行頁面 JavaScript
- 🛡️ 反 DevTools 偵測：自動繞過網站的開發者工具檢測
- 🛡️ 反 debugger 陷阱：移除所有 debugger 語句，防止強制暫停
- 🛡️ 修復 Error Proxy：解決循環引用問題，確保正常運作

**⚡ 效能與體驗**
- 🎨 減少 Debug 訊息：清理過多的 console.log，保持 Console 清爽
- ⚡ 頁面腳本執行器：智能載入並快取，提升執行效率
- 📚 完整技術文檔：新增 CSP 解決方案說明文件

**🧪 測試與文檔**
- 📄 新增測試頁面：按鈕查找測試、Error 修正測試
- 📚 技術文檔：README-CSP-SOLUTION.md 詳細說明實現原理

### v1.0.0

- ✨ 四層智能導航系統
- 🌐 多語言 Load More 支援（7+ 語言）
- ⚙️ 完整的設定面板
- 🎨 視覺回饋效果
- 🧪 完整測試套件
- 📚 詳細文件

---

## 📄 授權條款 License

MIT License - 詳見 [LICENSE](LICENSE) 檔案

---

## 🔗 相關連結 Links

- **GitHub Repository**: [anime-next](https://github.com/yourusername/anime-next)
- **問題回報**: [GitHub Issues](https://github.com/yourusername/anime-next/issues)
- **開發文件**: [DEVELOP.md](DEVELOP.md)

---

## 💡 使用提示 Tips

1. **快速測試**：使用內建測試頁面驗證功能
2. **自訂支援**：新增常用網站的按鈕 ID 以提升相容性
3. **效能優化**：啟用按鈕快取可減少 DOM 查詢
4. **除錯模式**：開啟控制台查看詳細運作日誌

---

**Made with ❤️ for better web browsing experience**

**讓網頁瀏覽更輕鬆！🚀**

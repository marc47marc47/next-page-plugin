/**
 * Anime Next - 鍵盤導航擴充功能
 * Content Script
 *
 * @version 1.0.0
 * @description 使用鍵盤左右鍵控制網頁上一頁/下一頁
 */

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
    DISABLED_CLASS: 'disabled',
    CACHE_TIMEOUT: 5000, // 快取過期時間（毫秒）
    DEBOUNCE_DELAY: 50  // 防抖延遲（毫秒）
  };

  // 設定狀態
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

  // 按鈕快取
  let buttonCache = {
    next: null,
    previous: null,
    lastUpdate: 0
  };

  // 防抖計時器
  let debounceTimer = null;

  // MutationObserver 實例
  let mutationObserver = null;

  /**
   * 載入設定
   */
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get({
        enabled: true,
        visualFeedback: true,
        customNextIds: [],
        customPrevIds: [],
        urlNavigation: true,
        urlParamName: 'page',
        hrefScan: true,
        loadMore: true
      });

      settings = result;
      console.log('[Anime Next] 設定已載入:', settings);

      // 當自訂 ID 更新時，清除快取以重新搜尋按鈕
      clearButtonCache();
    } catch (error) {
      console.error('[Anime Next] 載入設定失敗:', error);
    }
  }

  /**
   * 獲取 URL 中的頁碼參數
   * @returns {number|null} 當前頁碼，如果不存在則返回 null
   */
  function getCurrentPageNumber() {
    try {
      const url = new URL(window.location.href);
      const pageParam = url.searchParams.get(settings.urlParamName);

      if (pageParam) {
        const pageNum = parseInt(pageParam, 10);
        if (!isNaN(pageNum) && pageNum > 0) {
          return pageNum;
        }
      }
    } catch (error) {
      console.error('[Anime Next] 解析 URL 失敗:', error);
    }

    return null;
  }

  /**
   * 通過修改 URL 參數導航到指定頁面
   * @param {number} pageNumber - 目標頁碼
   */
  function navigateToPage(pageNumber) {
    if (pageNumber < 1) {
      console.log('[Anime Next] 頁碼不能小於 1');
      return;
    }

    try {
      const url = new URL(window.location.href);
      url.searchParams.set(settings.urlParamName, pageNumber.toString());

      console.log(`[Anime Next] 導航到頁面 ${pageNumber}: ${url.toString()}`);
      window.location.href = url.toString();
    } catch (error) {
      console.error('[Anime Next] URL 導航失敗:', error);
    }
  }

  /**
   * 使用 URL 參數導航到下一頁
   * @returns {boolean} 是否成功導航
   */
  function navigateToNextPage() {
    if (!settings.urlNavigation) {
      return false;
    }

    const currentPage = getCurrentPageNumber();
    if (currentPage === null) {
      console.log('[Anime Next] URL 中沒有找到頁碼參數');
      return false;
    }

    navigateToPage(currentPage + 1);
    return true;
  }

  /**
   * 使用 URL 參數導航到上一頁
   * @returns {boolean} 是否成功導航
   */
  function navigateToPreviousPage() {
    if (!settings.urlNavigation) {
      return false;
    }

    const currentPage = getCurrentPageNumber();
    if (currentPage === null) {
      console.log('[Anime Next] URL 中沒有找到頁碼參數');
      return false;
    }

    if (currentPage <= 1) {
      console.log('[Anime Next] 已經是第一頁');
      return false;
    }

    navigateToPage(currentPage - 1);
    return true;
  }

  /**
   * 從 URL 字串中提取頁碼參數
   * @param {string} url - URL 字串
   * @returns {number|null} 頁碼，如果不存在則返回 null
   */
  function extractPageNumber(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      const pageParam = urlObj.searchParams.get(settings.urlParamName);

      if (pageParam) {
        const pageNum = parseInt(pageParam, 10);
        if (!isNaN(pageNum) && pageNum > 0) {
          return pageNum;
        }
      }
    } catch (error) {
      // 如果 URL 解析失敗，嘗試用正則表達式
      try {
        const paramName = settings.urlParamName;
        const regex = new RegExp(`[?&]${paramName}=(\\d+)`, 'i');
        const match = url.match(regex);

        if (match && match[1]) {
          const pageNum = parseInt(match[1], 10);
          if (!isNaN(pageNum) && pageNum > 0) {
            return pageNum;
          }
        }
      } catch (e) {
        console.error('[Anime Next] 提取頁碼失敗:', e);
      }
    }

    return null;
  }

  /**
   * 掃描頁面中所有包含 page 參數的連結
   * @returns {Array} 連結物件陣列，每個物件包含 {url, pageNumber, element}
   */
  function scanPageLinks() {
    const links = [];
    const allLinks = document.querySelectorAll('a[href]');

    for (const link of allLinks) {
      const href = link.getAttribute('href');

      if (!href) continue;

      // 檢查 href 是否包含 page 參數
      if (href.toLowerCase().includes(settings.urlParamName.toLowerCase())) {
        const pageNumber = extractPageNumber(href);

        if (pageNumber !== null) {
          // 將相對路徑轉換為絕對路徑
          let absoluteUrl;
          try {
            absoluteUrl = new URL(href, window.location.href).href;
          } catch (e) {
            absoluteUrl = href;
          }

          links.push({
            url: absoluteUrl,
            pageNumber: pageNumber,
            element: link,
            text: link.textContent.trim()
          });
        }
      }
    }

    console.log(`[Anime Next] 掃描到 ${links.length} 個包含頁碼的連結`);
    return links;
  }

  /**
   * 從掃描的連結中找到指定頁碼的 URL
   * @param {number} targetPage - 目標頁碼
   * @returns {string|null} 找到的 URL，如果不存在則返回 null
   */
  function findLinkByPageNumber(targetPage) {
    if (!settings.hrefScan) {
      return null;
    }

    const links = scanPageLinks();

    // 尋找目標頁碼的連結
    const targetLink = links.find(link => link.pageNumber === targetPage);

    if (targetLink) {
      console.log(`[Anime Next] 找到第 ${targetPage} 頁的連結:`, targetLink.url);
      return targetLink.url;
    }

    console.log(`[Anime Next] 未找到第 ${targetPage} 頁的連結`);
    return null;
  }

  /**
   * 使用 href 掃描導航到下一頁
   * @returns {boolean} 是否成功導航
   */
  function navigateToNextPageByHref() {
    if (!settings.hrefScan) {
      return false;
    }

    // 先嘗試從當前 URL 獲取頁碼
    let currentPage = getCurrentPageNumber();

    // 如果 URL 中沒有頁碼，嘗試從掃描的連結中推斷
    if (currentPage === null) {
      const links = scanPageLinks();
      if (links.length > 0) {
        // 找出最小的頁碼作為當前頁碼
        const pageNumbers = links.map(link => link.pageNumber).sort((a, b) => a - b);
        currentPage = pageNumbers[0] - 1; // 假設最小頁碼的前一頁是當前頁

        if (currentPage < 1) {
          currentPage = 1;
        }

        console.log(`[Anime Next] 推斷當前頁碼為: ${currentPage}`);
      }
    }

    if (currentPage === null) {
      console.log('[Anime Next] 無法確定當前頁碼');
      return false;
    }

    const nextPageUrl = findLinkByPageNumber(currentPage + 1);

    if (nextPageUrl) {
      console.log(`[Anime Next] 導航到下一頁: ${nextPageUrl}`);
      window.location.href = nextPageUrl;
      return true;
    }

    return false;
  }

  /**
   * 使用 href 掃描導航到上一頁
   * @returns {boolean} 是否成功導航
   */
  function navigateToPreviousPageByHref() {
    if (!settings.hrefScan) {
      return false;
    }

    // 先嘗試從當前 URL 獲取頁碼
    let currentPage = getCurrentPageNumber();

    // 如果 URL 中沒有頁碼，嘗試從掃描的連結中推斷
    if (currentPage === null) {
      const links = scanPageLinks();
      if (links.length > 0) {
        // 找出最小的頁碼作為參考
        const pageNumbers = links.map(link => link.pageNumber).sort((a, b) => a - b);
        currentPage = pageNumbers[0] + 1; // 假設最小頁碼的後一頁是當前頁

        console.log(`[Anime Next] 推斷當前頁碼為: ${currentPage}`);
      }
    }

    if (currentPage === null || currentPage <= 1) {
      console.log('[Anime Next] 無法導航到上一頁');
      return false;
    }

    const prevPageUrl = findLinkByPageNumber(currentPage - 1);

    if (prevPageUrl) {
      console.log(`[Anime Next] 導航到上一頁: ${prevPageUrl}`);
      window.location.href = prevPageUrl;
      return true;
    }

    return false;
  }

  /**
   * 掃描頁面中的 "Load More" 類型按鈕
   * @returns {HTMLElement|null} 找到的按鈕元素或 null
   */
  function findLoadMoreButton() {
    if (!settings.loadMore) {
      return null;
    }

    // 常見的 "Load More" 文字變體（支援多語言）
    const loadMoreKeywords = [
      'load more',
      'load next',
      'show more',
      'view more',
      'see more',
      'more',
      'next page',
      '載入更多',
      '查看更多',
      '顯示更多',
      '更多',
      '下一頁',
      'もっと見る',
      '더 보기',
      'ver más',
      'voir plus',
      'mehr laden'
    ];

    // 策略 1: 查找按鈕元素（button、input[type="button"]、input[type="submit"]）
    const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"]');

    for (const button of buttons) {
      const text = button.textContent.trim().toLowerCase();
      const value = button.value ? button.value.toLowerCase() : '';
      const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
      const title = button.getAttribute('title')?.toLowerCase() || '';

      // 檢查文字內容
      const allText = `${text} ${value} ${ariaLabel} ${title}`;

      for (const keyword of loadMoreKeywords) {
        if (allText.includes(keyword)) {
          // 檢查按鈕是否可見和可用
          if (!button.disabled && button.offsetParent !== null) {
            console.log(`[Anime Next] 找到 Load More 按鈕 (button):`, button);
            return button;
          }
        }
      }
    }

    // 策略 2: 查找連結元素
    const links = document.querySelectorAll('a[href]');

    for (const link of links) {
      const text = link.textContent.trim().toLowerCase();
      const ariaLabel = link.getAttribute('aria-label')?.toLowerCase() || '';
      const title = link.getAttribute('title')?.toLowerCase() || '';

      const allText = `${text} ${ariaLabel} ${title}`;

      for (const keyword of loadMoreKeywords) {
        if (allText.includes(keyword)) {
          // 檢查連結是否可見
          if (link.offsetParent !== null) {
            console.log(`[Anime Next] 找到 Load More 連結 (link):`, link);
            return link;
          }
        }
      }
    }

    // 策略 3: 查找包含特定 class 或 id 的元素
    const commonSelectors = [
      '[class*="load-more"]',
      '[class*="loadmore"]',
      '[class*="load_more"]',
      '[class*="show-more"]',
      '[class*="showmore"]',
      '[class*="view-more"]',
      '[class*="viewmore"]',
      '[id*="load-more"]',
      '[id*="loadmore"]',
      '[id*="load_more"]',
      '[data-action*="load"]',
      '[data-action*="more"]'
    ];

    for (const selector of commonSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          // 確保元素是可點擊的
          if (element.offsetParent !== null && !element.disabled) {
            console.log(`[Anime Next] 找到 Load More 元素 (selector):`, element);
            return element;
          }
        }
      } catch (e) {
        // 忽略無效的選擇器
      }
    }

    console.log('[Anime Next] 未找到 Load More 按鈕');
    return null;
  }

  /**
   * 點擊 Load More 按鈕
   * @returns {boolean} 是否成功點擊
   */
  function clickLoadMoreButton() {
    if (!settings.loadMore) {
      return false;
    }

    const button = findLoadMoreButton();

    if (!button) {
      console.log('[Anime Next] 找不到 Load More 按鈕');
      return false;
    }

    try {
      console.log('[Anime Next] 點擊 Load More 按鈕');

      // 添加視覺回饋
      if (settings.visualFeedback) {
        addVisualFeedback(button);
      }

      // 點擊按鈕
      button.click();

      return true;
    } catch (error) {
      console.error('[Anime Next] 點擊 Load More 按鈕失敗:', error);
      return false;
    }
  }

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

  /**
   * 查找分頁按鈕（基礎版本）
   * @param {string} type - 按鈕類型 ('next' 或 'previous')
   * @returns {HTMLElement|null} 找到的按鈕元素或 null
   */
  function findButtonDirect(type) {
    let button = null;

    // 策略 0: 透過自訂 ID 查找
    const customIds = type === 'next' ? settings.customNextIds : settings.customPrevIds;
    if (customIds && customIds.length > 0) {
      for (const customId of customIds) {
        button = document.getElementById(customId);
        if (button) {
          console.log(`[Anime Next] 找到按鈕 (自訂 ID): ${type} - ${customId}`);
          return button;
        }
      }
    }

    // 策略 1: 透過預設 ID 查找
    const idMap = {
      'next': CONFIG.BUTTON_SELECTORS.NEXT_ID,
      'previous': CONFIG.BUTTON_SELECTORS.PREVIOUS_ID
    };
    button = document.getElementById(idMap[type]);

    if (button) {
      console.log(`[Anime Next] 找到按鈕 (預設 ID): ${type}`);
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

    // 策略 4: 透過文字內容和 JavaScript 連結查找
    button = findButtonByTextAndScript(type);

    if (button) {
      console.log(`[Anime Next] 找到按鈕 (文字/腳本): ${type}`);
      return button;
    }

    return null;
  }

  /**
   * 透過文字內容和 JavaScript 函數名稱查找按鈕
   * @param {string} type - 按鈕類型 ('next' 或 'previous')
   * @returns {HTMLElement|null} 找到的按鈕元素或 null
   */
  function findButtonByTextAndScript(type) {
    // 定義搜尋關鍵字（支援多語言）- 按優先級排序
    const keywords = {
      next: [
        // 中文（優先匹配"頁"而不是"章"）
        '下一頁', '下一页', '下頁', '下页',
        // 英文
        'next page', 'next',
        // 日文
        '次のページ', '次へ', '次',
        // 韓文
        '다음 페이지', '다음',
        // 符號
        '>', '>>', '›', '»', '→', '▶', '▷',
        // 其他（優先級較低）
        '下一章', '下一集', 'next chapter'
      ],
      previous: [
        // 中文（優先匹配"頁"而不是"章"）
        '上一頁', '上一页', '上頁', '上页',
        // 英文
        'previous page', 'prev page', 'previous', 'prev',
        // 日文
        '前のページ', '前へ', '前',
        // 韓文
        '이전 페이지', '이전',
        // 符號
        '<', '<<', '‹', '«', '←', '◀', '◁',
        // 其他（優先級較低）
        '上一章', '上一集', 'previous chapter', 'prev chapter'
      ]
    };

    // 定義 JavaScript 函數名稱模式
    const scriptPatterns = {
      next: [
        'nextPage', 'next_page', 'goNext', 'go_next',
        'nextChapter', 'next_chapter', 'pageNext', 'page_next'
      ],
      previous: [
        'prevPage', 'prev_page', 'previousPage', 'previous_page',
        'goPrev', 'go_prev', 'goPrevious', 'go_previous',
        'prevChapter', 'prev_chapter', 'pagePrev', 'page_prev'
      ]
    };

    const searchKeywords = keywords[type];
    const searchScripts = scriptPatterns[type];

    // 1. 查找所有可能是按鈕的元素
    const candidates = [
      ...document.querySelectorAll('a[href]'),
      ...document.querySelectorAll('button'),
      ...document.querySelectorAll('input[type="button"]'),
      ...document.querySelectorAll('input[type="submit"]'),
      ...document.querySelectorAll('[onclick]'),
      ...document.querySelectorAll('[role="button"]'),
      ...document.querySelectorAll('span[onclick]'),
      ...document.querySelectorAll('div[onclick]')
    ];

    // 用於排除的關鍵字（例如：章節導航）
    const excludeKeywords = {
      next: ['上一章', '上一集', 'previous chapter', 'prev chapter', '前の章'],
      previous: ['下一章', '下一集', 'next chapter', '次の章']
    };

    const excludeWords = excludeKeywords[type === 'next' ? 'previous' : 'next'];

    // 收集所有匹配的候選元素
    const matches = [];

    for (const element of candidates) {
      // 檢查元素是否可見和可用
      if (element.offsetParent === null || element.disabled) {
        continue;
      }

      // 獲取元素的各種屬性
      const text = element.textContent?.trim().toLowerCase() || '';
      const title = element.getAttribute('title')?.toLowerCase() || '';
      const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
      const href = element.getAttribute('href')?.toLowerCase() || '';
      const onclick = element.getAttribute('onclick')?.toLowerCase() || '';
      const id = element.id?.toLowerCase() || '';
      const className = element.className?.toLowerCase() || '';

      // 合併所有文字內容
      const allText = `${text} ${title} ${ariaLabel}`;
      const allScript = `${href} ${onclick}`;
      const allIdentifiers = `${id} ${className}`;

      // 檢查是否包含排除關鍵字（例如：如果找"下一頁"，排除包含"上一章"的）
      let shouldExclude = false;
      for (const excludeWord of excludeWords) {
        if (allText.includes(excludeWord.toLowerCase())) {
          shouldExclude = true;
          break;
        }
      }

      if (shouldExclude) {
        continue;
      }

      // 檢查是否匹配文字關鍵字
      for (let i = 0; i < searchKeywords.length; i++) {
        const keyword = searchKeywords[i];
        const keywordLower = keyword.toLowerCase();

        // 精確匹配文字內容（避免誤判）
        if (allText === keywordLower ||
            allText.includes(` ${keywordLower} `) ||
            allText.startsWith(keywordLower + ' ') ||
            allText.endsWith(' ' + keywordLower) ||
            text === keywordLower) {

          // 記錄匹配的元素和優先級（索引越小優先級越高）
          matches.push({
            element: element,
            priority: i,
            type: 'text'
          });
          break;
        }
      }

      // 檢查是否匹配 JavaScript 函數
      for (let i = 0; i < searchScripts.length; i++) {
        const pattern = searchScripts[i];
        const patternLower = pattern.toLowerCase();

        if (allScript.includes(patternLower) || allScript.includes(`${patternLower}()`)) {
          matches.push({
            element: element,
            priority: i,
            type: 'script'
          });
          break;
        }
      }

      // 檢查 ID 和 class 名稱
      for (let i = 0; i < searchScripts.length; i++) {
        const pattern = searchScripts[i];
        const patternLower = pattern.toLowerCase();

        if (allIdentifiers.includes(patternLower)) {
          matches.push({
            element: element,
            priority: i + 100, // ID/class 優先級略低於文字和腳本
            type: 'identifier'
          });
          break;
        }
      }
    }

    // 如果有多個匹配，返回優先級最高的（priority 最小的）
    if (matches.length > 0) {
      matches.sort((a, b) => a.priority - b.priority);
      return matches[0].element;
    }

    return null;
  }

  /**
   * 更新按鈕快取
   */
  function updateButtonCache() {
    const now = Date.now();

    buttonCache.next = findButtonDirect('next');
    buttonCache.previous = findButtonDirect('previous');
    buttonCache.lastUpdate = now;

    console.log('[Anime Next] 按鈕快取已更新', {
      hasNext: !!buttonCache.next,
      hasPrevious: !!buttonCache.previous
    });
  }

  /**
   * 獲取快取的按鈕（帶自動更新）
   * @param {string} type - 按鈕類型 ('next' 或 'previous')
   * @returns {HTMLElement|null} 找到的按鈕元素或 null
   */
  function getCachedButton(type) {
    const now = Date.now();

    // 如果快取過期或為空，重新查找
    if (now - buttonCache.lastUpdate > CONFIG.CACHE_TIMEOUT || !buttonCache.next || !buttonCache.previous) {
      updateButtonCache();
    }

    return buttonCache[type];
  }

  /**
   * 查找分頁按鈕（帶快取）
   * @param {string} type - 按鈕類型 ('next' 或 'previous')
   * @returns {HTMLElement|null} 找到的按鈕元素或 null
   */
  function findButton(type) {
    // 先嘗試從快取獲取
    let button = getCachedButton(type);

    // 如果快取的按鈕不在 DOM 中，清除快取並重新查找
    if (button && !document.contains(button)) {
      console.log(`[Anime Next] 快取的按鈕已失效，重新查找: ${type}`);
      buttonCache[type] = null;
      button = findButtonDirect(type);
      buttonCache[type] = button;
    }

    return button;
  }

  /**
   * 清除按鈕快取
   */
  function clearButtonCache() {
    buttonCache.next = null;
    buttonCache.previous = null;
    buttonCache.lastUpdate = 0;
    console.log('[Anime Next] 按鈕快取已清除');
  }

  /**
   * 添加視覺回饋效果
   * @param {HTMLElement} button - 要添加效果的按鈕元素
   */
  function addVisualFeedback(button) {
    // 只有在啟用視覺回饋時才添加效果
    if (!settings.visualFeedback) {
      return;
    }

    // 添加動畫 class
    button.classList.add('anime-next-clicked');

    // 600ms 後移除 class（與 CSS 動畫時長一致）
    setTimeout(() => {
      button.classList.remove('anime-next-clicked');
    }, 600);
  }

  /**
   * 頁面執行器是否已載入
   */
  let pageExecutorLoaded = false;

  /**
   * 載入頁面腳本執行器
   */
  function loadPageExecutor() {
    if (pageExecutorLoaded) {
      return;
    }

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('page-script-executor.js');
    script.onload = function() {
      pageExecutorLoaded = true;
      console.log('[Anime Next] 頁面執行器已載入');
      this.remove();
    };
    script.onerror = function() {
      console.error('[Anime Next] 頁面執行器載入失敗');
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  }

  /**
   * 在頁面上下文中執行 JavaScript 代碼（繞過 CSP）
   * @param {string} code - 要執行的 JavaScript 代碼
   * @param {string} type - 代碼類型 ('function' 或 'code')
   * @returns {Promise<boolean>} 是否執行成功
   */
  function executeInPageContext(code, type = 'code') {
    return new Promise((resolve, reject) => {
      // 確保執行器已載入
      if (!pageExecutorLoaded && !window.__animeNextExecutorLoaded__) {
        loadPageExecutor();

        // 等待執行器載入
        const checkInterval = setInterval(() => {
          if (window.__animeNextExecutorLoaded__) {
            clearInterval(checkInterval);
            pageExecutorLoaded = true;
            executeInPageContext(code, type).then(resolve).catch(reject);
          }
        }, 100);

        // 超時處理
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('頁面執行器載入超時'));
        }, 3000);

        return;
      }

      // 監聽執行結果
      const resultHandler = (event) => {
        document.removeEventListener('__animeNext_executeResult__', resultHandler);

        if (event.detail.success) {
          resolve(true);
        } else {
          console.error('[Anime Next] 代碼執行失敗:', event.detail.error);
          reject(new Error(event.detail.error));
        }
      };

      document.addEventListener('__animeNext_executeResult__', resultHandler);

      // 發送執行請求
      document.dispatchEvent(new CustomEvent('__animeNext_executeCode__', {
        detail: { code, type }
      }));

      // 超時處理
      setTimeout(() => {
        document.removeEventListener('__animeNext_executeResult__', resultHandler);
        reject(new Error('代碼執行超時'));
      }, 2000);
    });
  }

  /**
   * 智能點擊按鈕（處理各種類型的按鈕）
   * @param {HTMLElement} button - 要點擊的按鈕元素
   * @returns {Promise<boolean>} 是否成功執行點擊
   */
  async function smartClick(button) {
    if (!button) {
      return false;
    }

    try {
      // 添加視覺回饋
      addVisualFeedback(button);

      const tagName = button.tagName.toLowerCase();
      const href = button.getAttribute('href');
      const onclick = button.getAttribute('onclick');

      // 策略 1: 處理 onclick 屬性（最優先，因為最常用）
      if (onclick) {

        try {
          // 直接執行 onclick 函數
          if (typeof button.onclick === 'function') {
            const event = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            });
            button.onclick.call(button, event);
            return true;
          }

          // 如果 onclick 是字串，透過頁面上下文執行
          if (typeof onclick === 'string') {
            await executeInPageContext(onclick, 'code');
            return true;
          }
        } catch (e) {
          console.error('[Anime Next] 執行 onclick 失敗:', e);
          // 繼續嘗試其他方法
        }
      }

      // 策略 2: 處理 javascript: 連結
      if (href && href.trim().toLowerCase().startsWith('javascript:')) {
        try {
          // 提取 JavaScript 代碼
          let jsCode = href.substring('javascript:'.length).trim();

          // 移除結尾的分號
          if (jsCode.endsWith(';')) {
            jsCode = jsCode.slice(0, -1);
          }

          // 檢查是否是函數調用
          const functionCallMatch = jsCode.match(/^(\w+)\s*\((.*)\)$/);

          if (functionCallMatch) {
            // 使用 'function' 類型執行
            await executeInPageContext(jsCode, 'function');
            return true;
          }

          // 如果不是函數調用，直接在頁面上下文中執行
          await executeInPageContext(jsCode, 'code');
          return true;
        } catch (e) {
          console.error('[Anime Next] 處理 javascript 連結失敗:', e);
          // 繼續嘗試其他方法
        }
      }

      // 策略 3: 處理普通連結
      if (tagName === 'a' && href && href !== '#' && !href.startsWith('javascript:')) {
        // 檢查是否是相對路徑或絕對路徑
        if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/')) {
          window.location.href = href;
          return true;
        } else {
          // 相對路徑，轉換為絕對路徑
          const absoluteUrl = new URL(href, window.location.href).href;
          window.location.href = absoluteUrl;
          return true;
        }
      }

      // 策略 4: 使用原生點擊事件（處理事件監聽器）
      // 創建並派發真實的點擊事件
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        button: 0,
        buttons: 1,
        clientX: 0,
        clientY: 0
      });

      button.dispatchEvent(clickEvent);

      // 也嘗試標準的 click() 方法
      button.click();

      return true;
    } catch (e) {
      console.error('[Anime Next] 智能點擊失敗:', e);

      // 最後的備用方案：嘗試標準 click
      try {
        button.click();
        return true;
      } catch (e2) {
        console.error('[Anime Next] 備用點擊也失敗:', e2);
        return false;
      }
    }
  }

  /**
   * 獲取元素的 CSS 選擇器
   * @param {HTMLElement} element - 目標元素
   * @returns {string} CSS 選擇器
   */
  function getCssSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }

    const path = [];
    let current = element;

    while (current.parentElement) {
      let selector = current.tagName.toLowerCase();

      if (current.className) {
        const classes = current.className.trim().split(/\s+/).filter(c => c);
        if (classes.length > 0) {
          selector += '.' + classes.join('.');
        }
      }

      // 如果有多個相同的兄弟元素，添加 nth-child
      const siblings = Array.from(current.parentElement.children).filter(
        e => e.tagName === current.tagName
      );

      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }

      path.unshift(selector);

      // 如果路徑已經足夠具體，停止
      if (document.querySelectorAll(path.join(' > ')).length === 1) {
        break;
      }

      current = current.parentElement;

      // 限制深度，避免過長
      if (path.length > 5) {
        break;
      }
    }

    return path.join(' > ');
  }

  /**
   * 點擊下一頁按鈕
   */
  function clickNextButton() {
    const button = findButton('next');

    if (!button) {
      console.log('[Anime Next] 找不到下一頁按鈕');

      // 策略 1: 嘗試使用 URL 參數導航
      if (settings.urlNavigation) {
        console.log('[Anime Next] 嘗試使用 URL 參數導航到下一頁');
        const urlNavSuccess = navigateToNextPage();
        if (urlNavSuccess) {
          return;
        }
      }

      // 策略 2: 嘗試掃描 href 連結
      if (settings.hrefScan) {
        console.log('[Anime Next] 嘗試掃描 href 連結到下一頁');
        const hrefNavSuccess = navigateToNextPageByHref();
        if (hrefNavSuccess) {
          return;
        }
      }

      // 策略 3: 嘗試點擊 Load More 按鈕
      if (settings.loadMore) {
        console.log('[Anime Next] 嘗試點擊 Load More 按鈕');
        const loadMoreSuccess = clickLoadMoreButton();
        if (loadMoreSuccess) {
          return;
        }
      }

      console.log('[Anime Next] 所有導航方法都失敗');
      return;
    }

    if (button.classList.contains(CONFIG.DISABLED_CLASS)) {
      console.log('[Anime Next] 下一頁按鈕已停用');
      return;
    }

    smartClick(button);
  }

  /**
   * 點擊上一頁按鈕
   */
  function clickPreviousButton() {
    const button = findButton('previous');

    if (!button) {
      console.log('[Anime Next] 找不到上一頁按鈕');

      // 策略 1: 嘗試使用 URL 參數導航
      if (settings.urlNavigation) {
        console.log('[Anime Next] 嘗試使用 URL 參數導航到上一頁');
        const urlNavSuccess = navigateToPreviousPage();
        if (urlNavSuccess) {
          return;
        }
      }

      // 策略 2: 嘗試掃描 href 連結
      if (settings.hrefScan) {
        console.log('[Anime Next] 嘗試掃描 href 連結到上一頁');
        const hrefNavSuccess = navigateToPreviousPageByHref();
        if (hrefNavSuccess) {
          return;
        }
      }

      console.log('[Anime Next] 所有導航方法都失敗');
      return;
    }

    if (button.classList.contains(CONFIG.DISABLED_CLASS)) {
      console.log('[Anime Next] 上一頁按鈕已停用');
      return;
    }

    smartClick(button);
  }

  /**
   * 防抖處理的鍵盤事件
   * @param {KeyboardEvent} event - 鍵盤事件
   */
  function handleKeyDownDebounced(event) {
    // 清除之前的計時器
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // 設定新的計時器
    debounceTimer = setTimeout(() => {
      handleKeyDownImmediate(event);
    }, CONFIG.DEBOUNCE_DELAY);
  }

  /**
   * 處理鍵盤事件（立即執行）
   * @param {KeyboardEvent} event - 鍵盤事件
   */
  function handleKeyDownImmediate(event) {
    // 檢查擴充功能是否啟用
    if (!settings.enabled) {
      return;
    }

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

  /**
   * 處理鍵盤事件（主要入口）
   * @param {KeyboardEvent} event - 鍵盤事件
   */
  function handleKeyDown(event) {
    // 對於方向鍵，我們直接執行而不使用防抖
    // 因為使用者期望即時回應
    handleKeyDownImmediate(event);
  }

  /**
   * 設定 MutationObserver 監聽 DOM 變化
   */
  function setupMutationObserver() {
    // 如果已經存在，先斷開連接
    if (mutationObserver) {
      mutationObserver.disconnect();
    }

    // 建立新的 observer
    mutationObserver = new MutationObserver((mutations) => {
      // 檢查是否有分頁相關的變化
      let shouldUpdateCache = false;

      for (const mutation of mutations) {
        // 如果有新增或移除節點
        if (mutation.type === 'childList') {
          // 檢查是否涉及分頁按鈕
          const addedNodes = Array.from(mutation.addedNodes);
          const removedNodes = Array.from(mutation.removedNodes);

          const hasPaginationChange = [...addedNodes, ...removedNodes].some(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) return false;

            const element = node;
            // 檢查是否為分頁相關元素
            return (
              element.classList?.contains('paginate_button') ||
              element.classList?.contains('pagination') ||
              element.querySelector?.('.paginate_button') ||
              element.querySelector?.('[data-dt-idx]')
            );
          });

          if (hasPaginationChange) {
            shouldUpdateCache = true;
            break;
          }
        }

        // 如果有屬性變化（如 class 或 disabled）
        if (mutation.type === 'attributes') {
          const target = mutation.target;
          if (
            target.classList?.contains('paginate_button') ||
            target.hasAttribute?.('data-dt-idx')
          ) {
            shouldUpdateCache = true;
            break;
          }
        }
      }

      // 如果需要更新快取
      if (shouldUpdateCache) {
        console.log('[Anime Next] 偵測到分頁結構變化，更新快取');
        clearButtonCache();
        updateButtonCache();
      }
    });

    // 開始觀察
    mutationObserver.observe(document.body, {
      childList: true,     // 監聽子節點變化
      subtree: true,       // 監聽所有後代節點
      attributes: true,    // 監聽屬性變化
      attributeFilter: ['class', 'disabled', 'data-dt-idx'] // 只監聽特定屬性
    });

    console.log('[Anime Next] MutationObserver 已啟動');
  }

  /**
   * 監聽來自 background 或 popup 的訊息
   */
  function setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('[Anime Next] 收到訊息:', message);

      switch (message.action) {
        case 'updateSettings':
          // 更新設定
          if (message.settings) {
            settings = { ...settings, ...message.settings };
            console.log('[Anime Next] 設定已更新:', settings);

            // 如果擴充功能被停用，顯示提示
            if (!settings.enabled) {
              console.log('[Anime Next] 擴充功能已停用');
            } else {
              console.log('[Anime Next] 擴充功能已啟用');
            }
          }
          sendResponse({ received: true });
          break;

        case 'getStatus':
          // 回傳目前狀態
          sendResponse({
            enabled: settings.enabled,
            visualFeedback: settings.visualFeedback,
            cacheInfo: {
              hasNext: !!buttonCache.next,
              hasPrevious: !!buttonCache.previous,
              age: Date.now() - buttonCache.lastUpdate
            }
          });
          break;

        case 'clearCache':
          // 清除快取
          clearButtonCache();
          sendResponse({ success: true });
          break;

        default:
          console.warn('[Anime Next] 未知的訊息動作:', message.action);
          sendResponse({ error: 'Unknown action' });
      }

      return false;
    });
  }

  /**
   * 監聽儲存變更
   */
  function setupStorageListener() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync') {
        console.log('[Anime Next] 儲存區域變更:', changes);

        if (changes.enabled) {
          settings.enabled = changes.enabled.newValue;
          console.log('[Anime Next] 啟用狀態已變更:', settings.enabled);
        }

        if (changes.visualFeedback) {
          settings.visualFeedback = changes.visualFeedback.newValue;
          console.log('[Anime Next] 視覺回饋設定已變更:', settings.visualFeedback);
        }

        if (changes.urlNavigation) {
          settings.urlNavigation = changes.urlNavigation.newValue;
          console.log('[Anime Next] URL 參數導航設定已變更:', settings.urlNavigation);
        }

        if (changes.urlParamName) {
          settings.urlParamName = changes.urlParamName.newValue;
          console.log('[Anime Next] URL 參數名稱已變更:', settings.urlParamName);
        }

        if (changes.hrefScan) {
          settings.hrefScan = changes.hrefScan.newValue;
          console.log('[Anime Next] Href 掃描設定已變更:', settings.hrefScan);
        }

        if (changes.loadMore) {
          settings.loadMore = changes.loadMore.newValue;
          console.log('[Anime Next] Load More 設定已變更:', settings.loadMore);
        }
      }
    });
  }

  /**
   * 注入反除錯腳本
   */
  function injectAntiDebuggerScript() {
    try {
      // 注入反 DevTools 偵測腳本（必須最先執行）
      const antiDetectionScript = document.createElement('script');
      antiDetectionScript.src = chrome.runtime.getURL('anti-devtools-detection.js');
      antiDetectionScript.type = 'text/javascript';
      (document.head || document.documentElement).prepend(antiDetectionScript);
      console.log('[Anime Next] Anti-DevTools detection script injected.');

      // 注入反 debugger 腳本
      const antiDebuggerScript = document.createElement('script');
      antiDebuggerScript.src = chrome.runtime.getURL('anti-debugger.js');
      antiDebuggerScript.type = 'text/javascript';
      (document.head || document.documentElement).prepend(antiDebuggerScript);
      console.log('[Anime Next] Anti-debugger script injected.');
    } catch (e) {
      console.error('[Anime Next] Failed to inject anti-debugger scripts:', e);
    }
  }

  /**
   * 初始化：添加事件監聽器
   */
  async function init() {
    console.log('[Anime Next] 開始初始化...');

    // 注入反除錯腳本
    injectAntiDebuggerScript();

    // 載入頁面腳本執行器
    loadPageExecutor();

    // 載入設定
    await loadSettings();

    // 初始化按鈕快取
    updateButtonCache();

    // 設定 MutationObserver
    setupMutationObserver();

    // 添加鍵盤事件監聽器
    document.addEventListener('keydown', handleKeyDown);

    // 設定訊息監聽器
    setupMessageListener();

    // 設定儲存監聽器
    setupStorageListener();

    console.log('[Anime Next] 鍵盤導航已啟用');
    console.log('[Anime Next] 目前設定:', settings);
    console.log('[Anime Next] 快取狀態:', {
      hasNext: !!buttonCache.next,
      hasPrevious: !!buttonCache.previous
    });
  }

  /**
   * 清理資源
   */
  function cleanup() {
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    clearButtonCache();
    console.log('[Anime Next] 資源已清理');
  }

  // 監聽頁面卸載事件，清理資源
  window.addEventListener('beforeunload', cleanup);

  // 啟動擴充功能
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

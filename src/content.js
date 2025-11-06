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

    console.log('[Anime Next] 點擊下一頁按鈕');
    button.click();
    addVisualFeedback(button);
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

    console.log('[Anime Next] 點擊上一頁按鈕');
    button.click();
    addVisualFeedback(button);
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
   * 初始化：添加事件監聽器
   */
  async function init() {
    console.log('[Anime Next] 開始初始化...');

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

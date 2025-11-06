/**
 * Anime Next - Popup Script
 * 彈出視窗邏輯
 *
 * @version 1.0.0
 */

(function() {
  'use strict';

  // DOM 元素
  const elements = {
    enableToggle: document.getElementById('enable-toggle'),
    visualFeedbackToggle: document.getElementById('visual-feedback-toggle'),
    urlNavigationToggle: document.getElementById('url-navigation-toggle'),
    urlParamName: document.getElementById('url-param-name'),
    hrefScanToggle: document.getElementById('href-scan-toggle'),
    loadMoreToggle: document.getElementById('load-more-toggle'),
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    resetBtn: document.getElementById('reset-btn'),
    testBtn: document.getElementById('test-btn'),
    helpLink: document.getElementById('help-link'),
    feedbackLink: document.getElementById('feedback-link'),
    notification: document.getElementById('notification'),
    customNextIds: document.getElementById('custom-next-ids'),
    customPrevIds: document.getElementById('custom-prev-ids'),
    saveCustomIdsBtn: document.getElementById('save-custom-ids-btn')
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
    try {
      const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);

      // 更新 UI
      elements.enableToggle.checked = result.enabled;
      elements.visualFeedbackToggle.checked = result.visualFeedback;
      elements.urlNavigationToggle.checked = result.urlNavigation;
      elements.urlParamName.value = result.urlParamName || 'page';
      elements.hrefScanToggle.checked = result.hrefScan;
      elements.loadMoreToggle.checked = result.loadMore;

      // 載入自訂 ID（將陣列轉換為每行一個的文字）
      elements.customNextIds.value = (result.customNextIds || []).join('\n');
      elements.customPrevIds.value = (result.customPrevIds || []).join('\n');

      updateStatus(result.enabled);

      console.log('[Popup] 設定已載入:', result);
    } catch (error) {
      console.error('[Popup] 載入設定失敗:', error);
      showNotification('載入設定失敗', 'error');
    }
  }

  /**
   * 儲存設定
   * @param {Object} settings - 要儲存的設定
   */
  async function saveSettings(settings) {
    try {
      await chrome.storage.sync.set(settings);
      console.log('[Popup] 設定已儲存:', settings);

      // 通知所有分頁更新設定
      notifyContentScripts(settings);

      showNotification('設定已儲存');
    } catch (error) {
      console.error('[Popup] 儲存設定失敗:', error);
      showNotification('儲存設定失敗', 'error');
    }
  }

  /**
   * 通知所有內容腳本更新設定
   * @param {Object} settings - 新的設定
   */
  async function notifyContentScripts(settings) {
    try {
      const tabs = await chrome.tabs.query({});

      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateSettings',
          settings: settings
        }).catch(() => {
          // 忽略無法傳送訊息的分頁（如 chrome:// 頁面）
        });
      }
    } catch (error) {
      console.error('[Popup] 通知內容腳本失敗:', error);
    }
  }

  /**
   * 更新狀態顯示
   * @param {boolean} enabled - 是否啟用
   */
  function updateStatus(enabled) {
    if (enabled) {
      elements.statusDot.classList.remove('inactive');
      elements.statusDot.classList.add('active');
      elements.statusText.textContent = '擴充功能已啟用';
    } else {
      elements.statusDot.classList.remove('active');
      elements.statusDot.classList.add('inactive');
      elements.statusText.textContent = '擴充功能已停用';
    }
  }

  /**
   * 顯示通知訊息
   * @param {string} message - 訊息內容
   * @param {string} type - 訊息類型 ('success' 或 'error')
   */
  function showNotification(message, type = 'success') {
    elements.notification.textContent = message;
    elements.notification.style.background = type === 'success' ? '#4caf50' : '#f44336';
    elements.notification.classList.add('show');

    setTimeout(() => {
      elements.notification.classList.remove('show');
    }, 3000);
  }

  /**
   * 重置所有設定
   */
  async function resetSettings() {
    if (confirm('確定要重置所有設定為預設值嗎？')) {
      await saveSettings(DEFAULT_SETTINGS);
      await loadSettings();
      showNotification('設定已重置');
    }
  }

  /**
   * 開啟測試頁面
   */
  function openTestPage() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('test/test-page.html')
    });
  }

  /**
   * 儲存自訂按鈕 ID
   */
  async function saveCustomIds() {
    try {
      // 從 textarea 取得文字，分割成陣列，並過濾空行
      const nextIds = elements.customNextIds.value
        .split('\n')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      const prevIds = elements.customPrevIds.value
        .split('\n')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      // 儲存到 Chrome Storage
      await saveSettings({
        customNextIds: nextIds,
        customPrevIds: prevIds
      });

      console.log('[Popup] 自訂 ID 已儲存:', { nextIds, prevIds });
      showNotification(`已儲存 ${nextIds.length} 個下一頁 ID 和 ${prevIds.length} 個上一頁 ID`);
    } catch (error) {
      console.error('[Popup] 儲存自訂 ID 失敗:', error);
      showNotification('儲存失敗', 'error');
    }
  }

  /**
   * 初始化事件監聽器
   */
  function initEventListeners() {
    // 啟用/停用切換
    elements.enableToggle.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      saveSettings({ enabled });
      updateStatus(enabled);
    });

    // 視覺回饋切換
    elements.visualFeedbackToggle.addEventListener('change', (e) => {
      const visualFeedback = e.target.checked;
      saveSettings({ visualFeedback });
    });

    // URL 參數導航切換
    elements.urlNavigationToggle.addEventListener('change', (e) => {
      const urlNavigation = e.target.checked;
      saveSettings({ urlNavigation });
    });

    // URL 參數名稱改變
    elements.urlParamName.addEventListener('change', (e) => {
      const urlParamName = e.target.value.trim() || 'page';
      saveSettings({ urlParamName });
      showNotification(`URL 參數名稱已更新為 "${urlParamName}"`);
    });

    // Href 掃描切換
    elements.hrefScanToggle.addEventListener('change', (e) => {
      const hrefScan = e.target.checked;
      saveSettings({ hrefScan });
    });

    // Load More 切換
    elements.loadMoreToggle.addEventListener('change', (e) => {
      const loadMore = e.target.checked;
      saveSettings({ loadMore });
    });

    // 重置按鈕
    elements.resetBtn.addEventListener('click', resetSettings);

    // 測試按鈕
    elements.testBtn.addEventListener('click', openTestPage);

    // 使用說明連結
    elements.helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({
        url: chrome.runtime.getURL('TESTING.md')
      });
    });

    // 回報問題連結
    elements.feedbackLink.addEventListener('click', (e) => {
      e.preventDefault();
      // 可以改為您的 GitHub Issues 頁面
      showNotification('請在 GitHub 上回報問題');
    });

    // 儲存自訂 ID 按鈕
    elements.saveCustomIdsBtn.addEventListener('click', saveCustomIds);
  }

  /**
   * 初始化
   */
  async function init() {
    console.log('[Popup] 初始化彈出視窗');

    await loadSettings();
    initEventListeners();

    console.log('[Popup] 彈出視窗已就緒');
  }

  // 當 DOM 載入完成後初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

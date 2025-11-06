/**
 * Anime Next - Background Service Worker
 * 背景服務
 *
 * @version 1.0.0
 */

(function() {
  'use strict';

  // 預設設定
  const DEFAULT_SETTINGS = {
    enabled: true,
    visualFeedback: true
  };

  /**
   * 擴充功能安裝時執行
   */
  chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('[Background] 擴充功能已安裝/更新', details);

    if (details.reason === 'install') {
      // 首次安裝，設定預設值
      await chrome.storage.sync.set(DEFAULT_SETTINGS);
      console.log('[Background] 預設設定已建立');

      // 開啟歡迎頁面（可選）
      // chrome.tabs.create({
      //   url: chrome.runtime.getURL('test/test-page.html')
      // });
    } else if (details.reason === 'update') {
      // 更新時的處理
      console.log('[Background] 擴充功能已更新至新版本');
    }
  });

  /**
   * 擴充功能啟動時執行
   */
  chrome.runtime.onStartup.addListener(() => {
    console.log('[Background] 擴充功能已啟動');
  });

  /**
   * 監聽來自 content script 或 popup 的訊息
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Background] 收到訊息:', message, 'from:', sender);

    switch (message.action) {
      case 'getSettings':
        // 獲取設定
        chrome.storage.sync.get(DEFAULT_SETTINGS).then(sendResponse);
        return true; // 保持訊息通道開啟以進行非同步回應

      case 'updateSettings':
        // 更新設定
        chrome.storage.sync.set(message.settings).then(() => {
          sendResponse({ success: true });
        }).catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
        return true;

      case 'reportError':
        // 記錄錯誤
        console.error('[Background] 來自 content script 的錯誤:', message.error);
        sendResponse({ received: true });
        return false;

      default:
        console.warn('[Background] 未知的訊息動作:', message.action);
        sendResponse({ error: 'Unknown action' });
        return false;
    }
  });

  /**
   * 監聽儲存變更
   */
  chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log('[Background] 儲存區域變更:', areaName, changes);

    // 可以在這裡處理設定變更的副作用
    if (changes.enabled) {
      console.log('[Background] 啟用狀態已變更:', changes.enabled.newValue);
    }

    if (changes.visualFeedback) {
      console.log('[Background] 視覺回饋設定已變更:', changes.visualFeedback.newValue);
    }
  });

  /**
   * 監聽分頁更新（可選）
   */
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // 當分頁載入完成時
    if (changeInfo.status === 'complete') {
      console.log('[Background] 分頁載入完成:', tab.url);

      // 可以在這裡檢查特定網站並執行特殊邏輯
    }
  });

  /**
   * 處理快捷鍵命令（如果有定義）
   */
  chrome.commands?.onCommand.addListener((command) => {
    console.log('[Background] 快捷鍵命令:', command);

    switch (command) {
      case 'toggle-extension':
        // 切換擴充功能啟用狀態
        toggleExtension();
        break;

      default:
        console.warn('[Background] 未知的命令:', command);
    }
  });

  /**
   * 切換擴充功能啟用狀態
   */
  async function toggleExtension() {
    try {
      const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
      const newEnabled = !settings.enabled;

      await chrome.storage.sync.set({ enabled: newEnabled });

      // 通知所有內容腳本
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateSettings',
          settings: { enabled: newEnabled }
        }).catch(() => {
          // 忽略無法傳送訊息的分頁
        });
      }

      console.log('[Background] 擴充功能狀態已切換:', newEnabled);
    } catch (error) {
      console.error('[Background] 切換狀態失敗:', error);
    }
  }

  // 初始化
  console.log('[Background] 背景服務已載入');

})();

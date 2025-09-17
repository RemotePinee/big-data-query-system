/**
 * 页面标题管理工具
 * 专门处理微信内置浏览器的标题更新问题
 */

import { isWechatEnvironment } from './wechat.js'
import { getPublicSettings } from '@/api/systemSettings'

class TitleManager {
  constructor() {
    this.isWechat = isWechatEnvironment()
    this.titleQueue = []
    this.isUpdating = false
    this.lastTitle = ''
    this.retryCount = 0
    this.maxRetries = 3
    this.systemTitle = '' // 系统设置的统一标题
    this.loadSystemTitle() // 加载系统标题
  }

  /**
   * 加载系统设置的标题
   */
  async loadSystemTitle() {
    try {
      const response = await getPublicSettings()
      if (response.data && response.data.systemTitle) {
        this.systemTitle = response.data.systemTitle
        // 如果已经设置了系统标题，立即应用
        if (this.systemTitle && document.title !== this.systemTitle) {
          this.setTitle(this.systemTitle, true)
        }
      }
    } catch (error) {
      console.warn('获取系统标题失败:', error)
    }
  }

  /**
   * 设置页面标题
   * @param {string} title 页面标题
   * @param {boolean} force 是否强制更新
   */
  setTitle(title, force = false) {
    // 如果设置了系统标题，优先使用系统标题
    const finalTitle = this.systemTitle || title
    
    if (!finalTitle || (finalTitle === this.lastTitle && !force)) {
      return
    }

    this.lastTitle = finalTitle

    if (this.isWechat) {
      this.setWechatTitle(finalTitle)
    } else {
      this.setNormalTitle(finalTitle)
    }
  }

  /**
   * 设置普通浏览器标题
   * @param {string} title 页面标题
   */
  setNormalTitle(title) {
    document.title = title
  }

  /**
   * 设置微信环境下的标题
   * @param {string} title 页面标题
   */
  setWechatTitle(title) {
    // 方法1: 直接设置
    document.title = title

    // 方法2: 使用iframe刷新（微信环境的经典解决方案）
    this.refreshTitleWithIframe(title)

    // 方法3: 延迟重试机制
    this.scheduleRetry(title)
  }

  /**
   * 使用iframe刷新标题（微信浏览器特有方法）
   * @param {string} title 页面标题
   */
  refreshTitleWithIframe(title) {
    try {
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.style.width = '1px'
      iframe.style.height = '1px'
      iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
        </head>
        <body></body>
        </html>
      `)
      
      document.body.appendChild(iframe)
      
      setTimeout(() => {
        document.title = title
        document.body.removeChild(iframe)
      }, 100)
    } catch (error) {
      console.warn('iframe标题刷新失败:', error)
    }
  }

  /**
   * 延迟重试机制
   * @param {string} title 页面标题
   */
  scheduleRetry(title) {
    // 清除之前的重试
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
    }

    this.retryTimer = setTimeout(() => {
      if (document.title !== title && this.retryCount < this.maxRetries) {
        this.retryCount++
        console.log(`标题重试第${this.retryCount}次:`, title)
        document.title = title
        this.scheduleRetry(title)
      } else {
        this.retryCount = 0
      }
    }, 500)
  }

  /**
   * 强制刷新标题
   * @param {string} title 页面标题
   */
  forceRefresh(title) {
    this.setTitle(title, true)
  }

  /**
   * 监听页面可见性变化，在页面重新可见时刷新标题
   */
  setupVisibilityListener() {
    if (typeof document.hidden !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.lastTitle) {
          // 页面重新可见时，强制刷新标题
          setTimeout(() => {
            this.forceRefresh(this.lastTitle)
          }, 100)
        }
      })
    }
  }

  /**
   * 监听微信环境下的特殊事件
   */
  setupWechatListeners() {
    if (!this.isWechat) return

    // 监听微信内置浏览器的特殊事件
    window.addEventListener('WeixinJSBridgeReady', () => {
      if (this.lastTitle) {
        this.forceRefresh(this.lastTitle)
      }
    })

    // 监听页面焦点事件
    window.addEventListener('focus', () => {
      if (this.lastTitle) {
        setTimeout(() => {
          this.forceRefresh(this.lastTitle)
        }, 200)
      }
    })

    // 监听页面滚动事件（微信环境下有时需要用户交互才能更新标题）
    let scrollTimer = null
    window.addEventListener('scroll', () => {
      if (scrollTimer) clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        if (this.lastTitle && document.title !== this.lastTitle) {
          document.title = this.lastTitle
        }
      }, 100)
    }, { passive: true })
  }

  /**
   * 初始化标题管理器
   */
  init() {
    this.setupVisibilityListener()
    this.setupWechatListeners()
    
    // 微信环境下的额外初始化
    if (this.isWechat) {
      // 延迟执行，确保页面完全加载
      setTimeout(() => {
        if (this.lastTitle) {
          this.forceRefresh(this.lastTitle)
        }
      }, 1000)
    }
  }
}

// 创建全局实例
const titleManager = new TitleManager()

// 导出便捷方法
export const setPageTitle = (title, force = false) => {
  titleManager.setTitle(title, force)
}

export const forceRefreshTitle = (title) => {
  titleManager.forceRefresh(title)
}

export const initTitleManager = async () => {
  await titleManager.loadSystemTitle()
  titleManager.init()
}

export default titleManager
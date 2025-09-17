// 全局favicon管理工具
export class FaviconManager {
  private static instance: FaviconManager;
  private currentFavicon: string = '';
  private loadPromise: Promise<void> | null = null;

  private constructor() {
    // 监听localStorage变化，实现跨页面同步
    window.addEventListener('storage', (e) => {
      if (e.key === 'favicon_updated') {
        this.loadAndUpdateFavicon();
      }
    });
  }

  public static getInstance(): FaviconManager {
    if (!FaviconManager.instance) {
      FaviconManager.instance = new FaviconManager();
    }
    return FaviconManager.instance;
  }

  // 更新favicon
  public updateFavicon(iconUrl: string): void {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || 
                 document.getElementById('favicon') as HTMLLinkElement ||
                 document.createElement('link');
    
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.id = 'favicon';
    
    // 处理URL - 使用相对路径，让前端代理处理
    if (iconUrl.startsWith('http')) {
      link.href = iconUrl;
    } else {
      // 直接使用相对路径，由前端代理转发到后端
      link.href = iconUrl;
    }
    
    // 如果link元素不在head中，添加到head
    if (!document.head.contains(link)) {
      document.head.appendChild(link);
    }
    
    this.currentFavicon = iconUrl;
    
    // 通知其他页面更新
    localStorage.setItem('favicon_updated', Date.now().toString());
    localStorage.setItem('current_favicon', iconUrl);
  }

  // 从systemSettings store获取favicon，避免重复请求
  public updateFaviconFromSettings(settings: any): void {
    if (settings && settings.favicon) {
      this.updateFavicon(settings.favicon);
    } else {
      // 使用默认图标
      this.updateFavicon('/vite.svg');
    }
  }

  // 从服务器加载并更新favicon（仅在必要时使用）
  public async loadAndUpdateFavicon(): Promise<void> {
    // 如果正在加载中，返回现有的Promise
    if (this.loadPromise) return this.loadPromise;
    
    // 如果已经有favicon，不需要重复加载
    if (this.currentFavicon) return;
    
    this.loadPromise = (async () => {
      try {
        const response = await fetch('/api/system-settings/public');
        const data = await response.json();
        
        if (data.code === 200 && data.data.favicon) {
          this.updateFavicon(data.data.favicon);
        } else {
          // 使用默认图标
          this.updateFavicon('/vite.svg');
        }
      } catch (error) {
        console.log('加载自定义favicon失败，使用默认图标');
        this.updateFavicon('/vite.svg');
      } finally {
        this.loadPromise = null;
      }
    })();
    
    return this.loadPromise;
  }

  // 初始化favicon（优先使用缓存，避免重复请求）
  public async init(): Promise<void> {
    // 先检查localStorage中是否有缓存的favicon
    const cachedFavicon = localStorage.getItem('current_favicon');
    if (cachedFavicon) {
      this.updateFavicon(cachedFavicon);
      return; // 有缓存就不需要再请求了
    }
    
    // 使用默认图标，等待systemSettings store加载完成后再更新
    this.updateFavicon('/vite.svg');
  }

  // 获取当前favicon
  public getCurrentFavicon(): string {
    return this.currentFavicon;
  }
}

// 导出单例实例
export const faviconManager = FaviconManager.getInstance();
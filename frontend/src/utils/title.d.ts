/**
 * 页面标题管理工具类型声明
 */

export interface TitleManager {
  /**
   * 设置页面标题
   * @param title 页面标题
   * @param force 是否强制更新
   */
  setTitle(title: string, force?: boolean): void;

  /**
   * 强制刷新标题
   * @param title 页面标题
   */
  forceRefresh(title: string): void;

  /**
   * 初始化标题管理器
   */
  init(): void;
}

/**
 * 设置页面标题的便捷方法
 * @param title 页面标题
 * @param force 是否强制更新
 */
export declare function setPageTitle(title: string, force?: boolean): void;

/**
 * 强制刷新标题的便捷方法
 * @param title 页面标题
 */
export declare function forceRefreshTitle(title: string): void;

/**
 * 初始化标题管理器的便捷方法
 */
export declare function initTitleManager(): void;

/**
 * 默认导出的标题管理器实例
 */
declare const titleManager: TitleManager;
export default titleManager;
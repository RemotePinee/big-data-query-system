// Jest 全局类型定义
import '@types/jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledWith(...args: any[]): R;
    }
  }
}

export {};

// 设备检测工具
export const isMobile = (): boolean => {
  const userAgent = navigator.userAgent;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // 检查用户代理
  if (mobileRegex.test(userAgent)) {
    return true;
  }
  
  // 检查屏幕宽度 - 主要判断依据
  if (window.innerWidth <= 768) {
    return true;
  }
  
  // 对于宽度大于768的设备，即使有触摸支持也认为是PC端
  // 这样可以避免PC端触摸屏被误判
  return false;
};

// 获取设备类型
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  
  if (width <= 768) {
    return 'mobile';
  } else if (width <= 1024) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

// 监听设备方向变化
export const onOrientationChange = (callback: () => void) => {
  window.addEventListener('orientationchange', callback);
  window.addEventListener('resize', callback);
};

// 移除方向变化监听
export const offOrientationChange = (callback: () => void) => {
  window.removeEventListener('orientationchange', callback);
  window.removeEventListener('resize', callback);
};
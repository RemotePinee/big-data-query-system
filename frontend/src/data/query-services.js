// 统一的查询服务数据管理
// 移动端和PC端共享此数据源，通过平台配置控制功能差异

// 默认查询服务数据
const defaultQueryServices = [
  {
    id: 1,
    name: '企业工商信息查询',
    description: '查询企业注册信息、经营状态、股东信息等',
    icon: 'fas fa-building',
    iconClass: 'business-icon',
    category: 'business',
    price: 29.9,
    originalPrice: 39.9,
    usage: 1234,
    isHot: true,
    features: ['基本信息', '股东信息', '经营状态', '变更记录'],
    platforms: {
      mobile: {
        enabled: true,
        features: {
          advancedSearch: false,
          bulkQuery: false,
          exportData: true,
          realTimeUpdate: true
        },
        uiConfig: {
          showDescription: true,
          showPrice: true,
          cardLayout: 'compact'
        }
      },
      pc: {
        enabled: true,
        features: {
          advancedSearch: true,
          bulkQuery: true,
          exportData: true,
          realTimeUpdate: true
        },
        uiConfig: {
          showDescription: true,
          showPrice: true,
          cardLayout: 'detailed'
        }
      }
    }
  },
  {
    id: 2,
    name: '个人征信报告',
    description: '获取个人信用记录和征信评分',
    icon: 'fas fa-user-shield',
    iconClass: 'credit-icon',
    category: 'personal',
    price: 19.9,
    originalPrice: 29.9,
    usage: 2156,
    isHot: true,
    features: ['信用评分', '借贷记录', '逾期信息', '查询记录'],
    platforms: {
      mobile: {
        enabled: true,
        features: {
          advancedSearch: false,
          bulkQuery: false,
          exportData: false,
          realTimeUpdate: true
        },
        uiConfig: {
          showDescription: true,
          showPrice: true,
          cardLayout: 'compact'
        }
      },
      pc: {
        enabled: true,
        features: {
          advancedSearch: true,
          bulkQuery: false,
          exportData: true,
          realTimeUpdate: true
        },
        uiConfig: {
          showDescription: true,
          showPrice: true,
          cardLayout: 'detailed'
        }
      }
    }
  },
  {
    id: 3,
    name: '房产信息查询',
    description: '查询房产证信息、交易记录、抵押状态',
    icon: 'fas fa-home',
    iconClass: 'property-icon',
    category: 'property',
    price: 39.9,
    originalPrice: 49.9,
    usage: 876,
    isHot: false,
    features: ['产权信息', '交易记录', '抵押状态', '评估价值'],
    platforms: {
      mobile: {
        enabled: true,
        features: {
          advancedSearch: false,
          bulkQuery: false,
          exportData: true,
          realTimeUpdate: false
        },
        uiConfig: {
          showDescription: true,
          showPrice: true,
          cardLayout: 'compact'
        }
      },
      pc: {
        enabled: true,
        features: {
          advancedSearch: true,
          bulkQuery: true,
          exportData: true,
          realTimeUpdate: true
        },
        uiConfig: {
          showDescription: true,
          showPrice: true,
          cardLayout: 'detailed'
        }
      }
    }
  },
  {
    id: 4,
    name: '车辆信息查询',
    description: '查询车辆登记信息、违章记录、保险状态',
    icon: 'fas fa-car',
    iconClass: 'vehicle-icon',
    category: 'vehicle',
    price: 24.9,
    originalPrice: 34.9,
    usage: 1543,
    isHot: true,
    features: ['登记信息', '违章记录', '保险状态', '年检记录'],
    platforms: {
      mobile: {
        enabled: true,
        features: {
          advancedSearch: false,
          bulkQuery: false,
          exportData: true,
          realTimeUpdate: true
        },
        uiConfig: {
          showDescription: true,
          showPrice: true,
          cardLayout: 'compact'
        }
      },
      pc: {
        enabled: true,
        features: {
          advancedSearch: true,
          bulkQuery: true,
          exportData: true,
          realTimeUpdate: true
        },
        uiConfig: {
          showDescription: true,
          showPrice: true,
          cardLayout: 'detailed'
        }
      }
    }
  },
  {
    id: 5,
    name: '学历认证查询',
    description: '验证学历证书真实性和学籍信息',
    icon: 'fas fa-graduation-cap',
    iconClass: 'education-icon',
    category: 'education',
    price: 15.9,
    originalPrice: 25.9,
    usage: 987,
    isHot: false,
    features: ['学历验证', '学籍信息', '毕业证书', '学位证书'],
    platforms: {
      mobile: {
        enabled: true,
        features: {
          advancedSearch: false,
          bulkQuery: false,
          exportData: false,
          realTimeUpdate: true
        },
        uiConfig: {
          showDescription: true,
          showPrice: true,
          cardLayout: 'compact'
        }
      },
      pc: {
        enabled: true,
        features: {
          advancedSearch: true,
          bulkQuery: true,
          exportData: true,
          realTimeUpdate: true
        },
        uiConfig: {
          showDescription: true,
          showPrice: true,
          cardLayout: 'detailed'
        }
      }
    }
  },
  {
    id: 6,
    name: '司法案件查询',
    description: '查询法院判决书、执行信息、涉诉记录',
    icon: 'fas fa-gavel',
    iconClass: 'legal-icon',
    category: 'legal',
    price: 49.9,
    originalPrice: 59.9,
    usage: 654,
    isHot: false,
    features: ['判决书', '执行信息', '涉诉记录', '失信记录'],
    platforms: {
      mobile: {
        enabled: true,
        features: {
          advancedSearch: false,
          bulkQuery: false,
          exportData: false,
          realTimeUpdate: false
        },
        uiConfig: {
          showDescription: true,
          showPrice: true,
          cardLayout: 'compact'
        }
      },
      pc: {
        enabled: true,
        features: {
          advancedSearch: true,
          bulkQuery: true,
          exportData: true,
          realTimeUpdate: true
        },
        uiConfig: {
          showDescription: true,
          showPrice: true,
          cardLayout: 'detailed'
        }
      }
    }
  }
];

// 从localStorage加载保存的数据，如果没有则使用默认数据
function loadQueryServices() {
  try {
    const saved = localStorage.getItem('queryServices');
    if (saved) {
      const parsedData = JSON.parse(saved);
      // 验证数据结构
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      }
    }
  } catch (error) {
    console.warn('加载保存的查询服务数据失败，使用默认数据:', error);
  }
  return defaultQueryServices;
}

// 导出当前查询服务数据
export const queryServices = loadQueryServices();

export const categories = [
  { id: 'all', name: '全部', icon: 'fas fa-th-large' },
  { id: 'business', name: '企业查询', icon: 'fas fa-building' },
  { id: 'personal', name: '个人查询', icon: 'fas fa-user' },
  { id: 'property', name: '房产查询', icon: 'fas fa-home' },
  { id: 'vehicle', name: '车辆查询', icon: 'fas fa-car' },
  { id: 'education', name: '学历查询', icon: 'fas fa-graduation-cap' },
  { id: 'legal', name: '司法查询', icon: 'fas fa-gavel' }
];

// 获取指定平台的查询服务
export function getServicesForPlatform(platform = 'mobile') {
  return queryServices.filter(service => 
    service.platforms[platform] && service.platforms[platform].enabled
  ).map(service => ({
    ...service,
    // 根据平台配置调整显示的功能
    platformFeatures: service.platforms[platform].features,
    uiConfig: service.platforms[platform].uiConfig
  }));
}

// 获取平台功能差异
export function getPlatformDifferences(serviceId) {
  const service = queryServices.find(s => s.id === serviceId);
  if (!service) return null;

  const mobileFeatures = service.platforms.mobile.features;
  const pcFeatures = service.platforms.pc.features;
  
  const differences = {
    mobile: [],
    pc: []
  };

  // 分析功能差异
  Object.keys(pcFeatures).forEach(feature => {
    if (pcFeatures[feature] && !mobileFeatures[feature]) {
      differences.mobile.push(`移动端不支持${getFeatureName(feature)}`);
      differences.pc.push(`PC端支持${getFeatureName(feature)}`);
    }
  });

  // 添加UI差异说明
  differences.mobile.push('移动端界面更简洁，适合触摸操作');
  differences.pc.push('PC端界面更详细，显示更多信息');

  return differences;
}

// 功能名称映射
function getFeatureName(key) {
  const names = {
    advancedSearch: '高级搜索功能',
    bulkQuery: '批量查询功能',
    exportData: '数据导出功能',
    realTimeUpdate: '实时更新功能'
  };
  return names[key] || key;
}

// 同步平台配置
export function syncPlatformConfig(serviceId, fromPlatform, toPlatform) {
  const service = queryServices.find(s => s.id === serviceId);
  if (!service) return false;

  service.platforms[toPlatform].features = {
    ...service.platforms[fromPlatform].features
  };
  
  return true;
}
import { Router, Request, Response } from 'express';

const router = Router();

// 获取所有平台配置
router.get('/', async (req: Request, res: Response) => {
  try {
    // 模拟数据，实际应该从数据库获取
    const configs = [
      {
        id: 1,
        name: '企业工商信息查询',
        code: 'enterprise_info',
        category: '企业信息',
        subCategory: '工商信息',
        description: '查询企业的工商注册信息、经营状态等',
        price: 10.00,
        icon: 'fas fa-building',
        mobile: true,
        pc: true,
        queryItem: {
          category: '企业信息'
        }
      },
      {
        id: 2,
        name: '个人征信报告',
        code: 'personal_credit',
        category: '征信信息',
        subCategory: '个人征信',
        description: '获取个人详细征信报告',
        price: 25.00,
        icon: 'fas fa-chart-line',
        mobile: true,
        pc: true,
        queryItem: {
          category: '征信信息'
        }
      },
      {
        id: 3,
        name: '房产信息查询',
        code: 'property_info',
        category: '个人信息',
        subCategory: '房产信息',
        description: '查询房产登记、抵押等信息',
        price: 15.00,
        icon: 'fas fa-home',
        mobile: false,
        pc: true,
        queryItem: {
          category: '个人信息'
        }
      },
      {
        id: 4,
        name: '车辆信息查询',
        code: 'vehicle_info',
        category: '车辆信息',
        subCategory: '车辆档案',
        description: '查询车辆登记、违章等信息',
        price: 12.00,
        icon: 'fas fa-car',
        mobile: true,
        pc: true,
        queryItem: {
          category: '车辆信息'
        }
      },
      {
        id: 5,
        name: '学历认证查询',
        code: 'education_verify',
        category: '个人信息',
        subCategory: '学历信息',
        description: '验证学历证书真伪',
        price: 8.00,
        icon: 'fas fa-graduation-cap',
        mobile: true,
        pc: false,
        queryItem: {
          category: '个人信息'
        }
      },
      {
        id: 6,
        name: '司法案件查询',
        code: 'legal_case',
        category: '司法信息',
        subCategory: '案件信息',
        description: '查询相关司法案件信息',
        price: 20.00,
        icon: 'fas fa-gavel',
        mobile: false,
        pc: true,
        queryItem: {
          category: '司法信息'
        }
      }
    ];
    
    res.json({
      code: 200,
      message: '获取平台配置成功',
      data: configs
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取平台配置失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 获取特定平台的查询项目
router.get('/platform/:platform', async (req: Request, res: Response) => {
  try {
    const { platform } = req.params;
    
    if (!['mobile', 'pc'].includes(platform)) {
      return res.status(400).json({
        code: 400,
        message: '无效的平台参数，只支持 mobile 或 pc'
      });
    }
    
    // 模拟数据，实际应该从数据库获取
    const allItems = [
      {
        id: 1,
        name: '企业工商信息查询',
        code: 'enterprise_info',
        category: '企业信息',
        subCategory: '工商信息',
        description: '查询企业的工商注册信息、经营状态等',
        price: 10.00,
        basePrice: 12.00,
        icon: 'fas fa-building',
        iconClass: 'success',
        features: platform === 'mobile' 
          ? ['快速查询', '移动优化', '基础信息'] 
          : ['详细报告', '批量处理', '数据导出', '高级筛选'],
        usage: Math.floor(Math.random() * 5000) + 1000,
        isHot: true,
        displayOrder: 1,
        mobile: true,
        pc: true
      },
      {
        id: 2,
        name: '个人征信报告',
        code: 'personal_credit',
        category: '征信信息',
        subCategory: '个人征信',
        description: '获取个人详细征信报告',
        price: 25.00,
        basePrice: 30.00,
        icon: 'fas fa-chart-line',
        iconClass: 'primary',
        features: platform === 'mobile' 
          ? ['快速查询', '移动优化', '基础征信'] 
          : ['详细报告', '历史记录', '数据分析', '风险评估'],
        usage: Math.floor(Math.random() * 3000) + 500,
        isHot: false,
        displayOrder: 2,
        mobile: true,
        pc: true
      },
      {
        id: 4,
        name: '车辆信息查询',
        code: 'vehicle_info',
        category: '车辆信息',
        subCategory: '车辆档案',
        description: '查询车辆登记、违章等信息',
        price: 12.00,
        basePrice: 15.00,
        icon: 'fas fa-car',
        iconClass: 'warning',
        features: platform === 'mobile' 
          ? ['快速查询', '违章查询', '移动优化'] 
          : ['详细档案', '批量查询', '违章分析', '数据导出'],
        usage: Math.floor(Math.random() * 4000) + 800,
        isHot: true,
        displayOrder: 3,
        mobile: true,
        pc: true
      }
    ];
    
    // 根据平台过滤项目
    const platformItems = allItems.filter(item => {
      if (platform === 'mobile') {
        return item.mobile;
      } else {
        return item.pc;
      }
    });
    
    // 如果是PC端，添加PC端专有项目
    if (platform === 'pc') {
      platformItems.push(
        {
          id: 3,
          name: '房产信息查询',
          code: 'property_info',
          category: '个人信息',
          subCategory: '房产信息',
          description: '查询房产登记、抵押等信息',
          price: 15.00,
          basePrice: 18.00,
          icon: 'fas fa-home',
          iconClass: 'info',
          features: ['详细档案', '产权查询', '抵押信息', '交易记录'],
          usage: Math.floor(Math.random() * 2000) + 300,
          isHot: false,
          displayOrder: 4,
          mobile: false,
          pc: true
        },
        {
          id: 6,
          name: '司法案件查询',
          code: 'legal_case',
          category: '司法信息',
          subCategory: '案件信息',
          description: '查询相关司法案件信息',
          price: 20.00,
          basePrice: 25.00,
          icon: 'fas fa-gavel',
          iconClass: 'error',
          features: ['案件详情', '判决书查询', '执行信息', '法律分析'],
          usage: Math.floor(Math.random() * 1500) + 200,
          isHot: false,
          displayOrder: 5,
          mobile: false,
          pc: true
        }
      );
    }
    
    // 如果是移动端，添加移动端专有项目
    if (platform === 'mobile') {
      platformItems.push({
        id: 5,
        name: '学历认证查询',
        code: 'education_verify',
        category: '个人信息',
        subCategory: '学历信息',
        description: '验证学历证书真伪',
        price: 8.00,
        basePrice: 10.00,
        icon: 'fas fa-graduation-cap',
        iconClass: 'secondary',
        features: ['快速验证', '证书查询', '移动优化'],
        usage: Math.floor(Math.random() * 2500) + 400,
        isHot: true,
        displayOrder: 4,
        mobile: true,
        pc: false
      });
    }
    
    // 按显示顺序排序
    platformItems.sort((a, b) => a.displayOrder - b.displayOrder);
    
    res.json({
      code: 200,
      message: `获取${platform === 'mobile' ? '移动端' : 'PC端'}查询项目成功`,
      data: platformItems
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取平台查询项目失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 获取特定查询项目的平台配置
router.get('/query/:queryId', async (req: Request, res: Response) => {
  try {
    const { queryId } = req.params;
    
    // 模拟数据
    const configs = [
      {
        id: 1,
        queryItemId: parseInt(queryId),
        platform: 'mobile',
        isEnabled: true,
        features: {
          advancedSearch: false,
          bulkQuery: false,
          exportData: true,
          realTimeUpdate: true
        },
        differences: [
          '移动端不支持高级搜索功能',
          '移动端不支持批量查询',
          '移动端界面更简洁，适合触摸操作'
        ]
      },
      {
        id: 2,
        queryItemId: parseInt(queryId),
        platform: 'pc',
        isEnabled: true,
        features: {
          advancedSearch: true,
          bulkQuery: true,
          exportData: true,
          realTimeUpdate: true
        },
        differences: [
          'PC端支持完整的高级搜索功能',
          'PC端支持批量查询和数据导出',
          'PC端界面更详细，显示更多信息'
        ]
      }
    ];
    
    res.json({
      code: 200,
      message: '获取查询项目配置成功',
      data: configs
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '获取平台配置失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 创建或更新平台配置
router.post('/', async (req: Request, res: Response) => {
  try {
    const configData = req.body;
    
    // 这里应该保存到数据库
    console.log('保存平台配置:', configData);
    
    res.json({
      code: 200,
      message: '平台配置保存成功',
      data: { id: Date.now(), ...configData }
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '保存平台配置失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router;
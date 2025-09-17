import { Request, Response } from 'express';
import { PlatformConfigModel } from '../models/platform-config.model';
import { QueryItemModel } from '../models/query-item.model';

export class PlatformConfigController {
  // 获取指定平台的查询项目
  static async getQueryItemsByPlatform(req: Request, res: Response) {
    try {
      const { platform } = req.params;
      
      if (!['mobile', 'pc'].includes(platform)) {
        return res.status(400).json({
          code: 400,
          message: '无效的平台参数'
        });
      }
      
      const queryItems = await PlatformConfigModel.findByPlatform(platform as 'mobile' | 'pc');
      
      // 格式化数据，添加平台特有功能
      const formattedItems = queryItems.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        category: item.category,
        subCategory: item.sub_category,
        description: item.description,
        price: item.effectivePrice,
        basePrice: item.price,
        icon: this.getIconByCategory(item.category),
        iconClass: this.getIconClassByCategory(item.category),
        features: platform === 'mobile' ? item.mobileFeatures : item.pcFeatures,
        platformFeatures: {
          mobile: item.mobileFeatures,
          pc: item.pcFeatures
        },
        usage: Math.floor(Math.random() * 20000) + 1000, // 模拟使用次数
        isHot: Math.random() > 0.7, // 随机设置热门标签
        displayOrder: item.display_order || 0
      }));
      
      // 按显示顺序和分类排序
      formattedItems.sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        return a.category.localeCompare(b.category);
      });
      
      res.status(200).json({
        code: 200,
        message: '获取查询项目成功',
        data: formattedItems
      });
    } catch (error) {
      console.error('获取平台查询项目失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取查询项目失败'
      });
    }
  }
  
  // 获取平台差异对比（管理员用）
  static async getPlatformDifferences(req: Request, res: Response) {
    try {
      const differences = await PlatformConfigModel.getPlatformDifferences();
      
      res.status(200).json({
        code: 200,
        message: '获取平台差异对比成功',
        data: differences
      });
    } catch (error) {
      console.error('获取平台差异对比失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取平台差异对比失败'
      });
    }
  }
  
  // 更新平台配置（管理员用）
  static async updatePlatformConfig(req: Request, res: Response) {
    try {
      const { queryItemId } = req.params;
      const configData = req.body;
      
      // 验证查询项目是否存在
      const queryItem = await QueryItemModel.findById(parseInt(queryItemId));
      if (!queryItem) {
        return res.status(404).json({
          code: 404,
          message: '查询项目不存在'
        });
      }
      
      // 处理特性数据
      if (configData.mobileFeatures && typeof configData.mobileFeatures === 'object') {
        configData.mobileFeatures = JSON.stringify(configData.mobileFeatures);
      }
      if (configData.pcFeatures && typeof configData.pcFeatures === 'object') {
        configData.pcFeatures = JSON.stringify(configData.pcFeatures);
      }
      
      const success = await PlatformConfigModel.update(parseInt(queryItemId), configData);
      
      if (success) {
        res.status(200).json({
          code: 200,
          message: '更新平台配置成功'
        });
      } else {
        res.status(500).json({
          code: 500,
          message: '更新平台配置失败'
        });
      }
    } catch (error) {
      console.error('更新平台配置失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，更新平台配置失败'
      });
    }
  }
  
  // 获取所有平台配置（管理员用）
  static async getAllPlatformConfigs(req: Request, res: Response) {
    try {
      const configs = await PlatformConfigModel.findAllForAdmin();
      
      res.status(200).json({
        code: 200,
        message: '获取所有平台配置成功',
        data: configs
      });
    } catch (error) {
      console.error('获取所有平台配置失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误，获取所有平台配置失败'
      });
    }
  }
  
  // 根据分类获取图标
  private static getIconByCategory(category: string): string {
    const iconMap: { [key: string]: string } = {
      '个人信息': 'fas fa-id-card',
      '企业信息': 'fas fa-building',
      '通信信息': 'fas fa-mobile-alt',
      '车辆信息': 'fas fa-car',
      '金融信息': 'fas fa-credit-card',
      '网络信息': 'fas fa-globe',
      '司法信息': 'fas fa-gavel',
      '征信信息': 'fas fa-chart-line'
    };
    
    return iconMap[category] || 'fas fa-search';
  }
  
  // 根据分类获取图标样式类
  private static getIconClassByCategory(category: string): string {
    const classMap: { [key: string]: string } = {
      '个人信息': 'primary',
      '企业信息': 'success',
      '通信信息': 'warning',
      '车辆信息': 'error',
      '金融信息': 'secondary',
      '网络信息': 'info',
      '司法信息': 'dark',
      '征信信息': 'primary'
    };
    
    return classMap[category] || 'primary';
  }
}
import { pool } from '../config/database';

export interface PlatformConfig {
  id?: number;
  queryItemId: number;
  platform: 'mobile' | 'pc' | 'both';
  isEnabled: boolean;
  displayOrder: number;
  mobileFeatures?: string; // JSON字符串，存储移动端特有功能
  pcFeatures?: string; // JSON字符串，存储PC端特有功能
  mobilePrice?: number; // 移动端价格（如果不同）
  pcPrice?: number; // PC端价格（如果不同）
  createdAt?: Date;
  updatedAt?: Date;
}

export class PlatformConfigModel {
  // 创建平台配置
  static async create(config: PlatformConfig): Promise<number> {
    try {
      const [result]: any = await pool.execute(
        `INSERT INTO platform_configs (query_item_id, platform, is_enabled, display_order, mobile_features, pc_features, mobile_price, pc_price) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          config.queryItemId,
          config.platform,
          config.isEnabled !== undefined ? config.isEnabled : true,
          config.displayOrder || 0,
          config.mobileFeatures || null,
          config.pcFeatures || null,
          config.mobilePrice || null,
          config.pcPrice || null
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('创建平台配置失败:', error);
      throw error;
    }
  }
  
  // 获取指定平台的查询项目
  static async findByPlatform(platform: 'mobile' | 'pc'): Promise<any[]> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT 
          qi.*,
          pc.platform,
          pc.is_enabled as platform_enabled,
          pc.display_order,
          pc.mobile_features,
          pc.pc_features,
          pc.mobile_price,
          pc.pc_price
         FROM query_items qi
         LEFT JOIN platform_configs pc ON qi.id = pc.query_item_id
         WHERE qi.is_active = 1 
         AND (pc.platform = ? OR pc.platform = 'both' OR pc.platform IS NULL)
         AND (pc.is_enabled = 1 OR pc.is_enabled IS NULL)
         ORDER BY pc.display_order ASC, qi.category, qi.name`,
        [platform]
      );
      
      return rows.map((row: any) => ({
        ...row,
        mobileFeatures: row.mobile_features ? JSON.parse(row.mobile_features) : null,
        pcFeatures: row.pc_features ? JSON.parse(row.pc_features) : null,
        effectivePrice: platform === 'mobile' ? (row.mobile_price || row.price) : (row.pc_price || row.price)
      }));
    } catch (error) {
      console.error('获取平台查询项目失败:', error);
      throw error;
    }
  }
  
  // 获取所有平台配置（管理员用）
  static async findAllForAdmin(): Promise<any[]> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT 
          qi.*,
          pc.id as config_id,
          pc.platform,
          pc.is_enabled as platform_enabled,
          pc.display_order,
          pc.mobile_features,
          pc.pc_features,
          pc.mobile_price,
          pc.pc_price
         FROM query_items qi
         LEFT JOIN platform_configs pc ON qi.id = pc.query_item_id
         ORDER BY qi.category, qi.name`
      );
      
      return rows.map((row: any) => ({
        ...row,
        mobileFeatures: row.mobile_features ? JSON.parse(row.mobile_features) : null,
        pcFeatures: row.pc_features ? JSON.parse(row.pc_features) : null
      }));
    } catch (error) {
      console.error('获取所有平台配置失败:', error);
      throw error;
    }
  }
  
  // 更新平台配置
  static async update(queryItemId: number, configData: Partial<PlatformConfig>): Promise<boolean> {
    try {
      // 先检查是否存在配置
      const [existing]: any = await pool.execute(
        `SELECT id FROM platform_configs WHERE query_item_id = ?`,
        [queryItemId]
      );
      
      if (existing.length > 0) {
        // 更新现有配置
        const updateFields = Object.keys(configData).map(key => {
          const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          return `${dbField} = ?`;
        });
        
        const values = Object.values(configData);
        values.push(queryItemId);
        
        const [result]: any = await pool.execute(
          `UPDATE platform_configs SET ${updateFields.join(', ')} WHERE query_item_id = ?`,
          values
        );
        
        return result.affectedRows > 0;
      } else {
        // 创建新配置
        const newConfig = { queryItemId, ...configData } as PlatformConfig;
        await this.create(newConfig);
        return true;
      }
    } catch (error) {
      console.error('更新平台配置失败:', error);
      throw error;
    }
  }
  
  // 删除平台配置
  static async delete(queryItemId: number): Promise<boolean> {
    try {
      const [result]: any = await pool.execute(
        `DELETE FROM platform_configs WHERE query_item_id = ?`,
        [queryItemId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('删除平台配置失败:', error);
      throw error;
    }
  }
  
  // 获取平台差异对比
  static async getPlatformDifferences(): Promise<any[]> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT 
          qi.id,
          qi.name,
          qi.category,
          qi.price as base_price,
          pc.platform,
          pc.mobile_features,
          pc.pc_features,
          pc.mobile_price,
          pc.pc_price,
          pc.is_enabled as platform_enabled
         FROM query_items qi
         LEFT JOIN platform_configs pc ON qi.id = pc.query_item_id
         WHERE qi.is_active = 1
         ORDER BY qi.category, qi.name`
      );
      
      // 按查询项目分组，显示平台差异
      const grouped = rows.reduce((acc: any, row: any) => {
        if (!acc[row.id]) {
          acc[row.id] = {
            id: row.id,
            name: row.name,
            category: row.category,
            basePrice: row.base_price,
            platforms: {}
          };
        }
        
        if (row.platform) {
          acc[row.id].platforms[row.platform] = {
            enabled: row.platform_enabled,
            features: {
              mobile: row.mobile_features ? JSON.parse(row.mobile_features) : null,
              pc: row.pc_features ? JSON.parse(row.pc_features) : null
            },
            pricing: {
              mobile: row.mobile_price,
              pc: row.pc_price
            }
          };
        }
        
        return acc;
      }, {});
      
      return Object.values(grouped);
    } catch (error) {
      console.error('获取平台差异对比失败:', error);
      throw error;
    }
  }
}
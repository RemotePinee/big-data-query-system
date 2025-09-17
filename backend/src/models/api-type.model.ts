import { pool } from '../config/database';

export interface ApiType {
  id?: number;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ApiTypeModel {
  // 创建API类型
  static async create(apiType: ApiType): Promise<number> {
    try {
      const [result]: any = await pool.execute(
        `INSERT INTO api_types (code, name, description, is_active)
         VALUES (?, ?, ?, ?)`,
        [
          apiType.code,
          apiType.name,
          apiType.description || null,
          apiType.isActive !== undefined ? apiType.isActive : true
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('创建API类型失败:', error);
      throw error;
    }
  }

  // 获取所有API类型
  static async findAll(): Promise<ApiType[]> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT * FROM api_types ORDER BY name`
      );
      
      return rows.map((row: any) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        description: row.description,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error('获取API类型列表失败:', error);
      throw error;
    }
  }

  // 根据ID获取API类型
  static async findById(id: number): Promise<ApiType | null> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT * FROM api_types WHERE id = ?`,
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0];
      return {
        id: row.id,
        code: row.code,
        name: row.name,
        description: row.description,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error('获取API类型失败:', error);
      throw error;
    }
  }

  // 更新API类型
  static async update(id: number, apiTypeData: Partial<ApiType>): Promise<boolean> {
    try {
      // 构建更新语句
      const updateFields = Object.keys(apiTypeData).map(key => {
        // 转换驼峰命名为下划线命名
        const dbKey = key === 'isActive' ? 'is_active' : key;
        return `${dbKey} = ?`;
      });
      
      const values = Object.values(apiTypeData);
      values.push(id); // 添加WHERE条件的值
      
      const [result]: any = await pool.execute(
        `UPDATE api_types SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新API类型失败:', error);
      throw error;
    }
  }

  // 检查API类型是否被使用
  static async checkDependencies(code: string): Promise<{ hasApiConfigs: boolean; hasQueryItems: boolean; hasOrders: boolean }> {
    try {
      // 检查是否有API配置使用此类型
      const [apiConfigRows]: any = await pool.execute(
        `SELECT COUNT(*) as count FROM api_configs WHERE type = ? AND is_active = 1`,
        [code]
      );
      const hasApiConfigs = apiConfigRows[0].count > 0;

      // 检查是否有查询项目通过API配置使用此类型
      const [queryItemRows]: any = await pool.execute(
        `SELECT COUNT(*) as count FROM query_items qi 
         JOIN api_configs ac ON qi.api_config_id = ac.id 
         WHERE ac.type = ? AND qi.is_active = 1`,
        [code]
      );
      const hasQueryItems = queryItemRows[0].count > 0;

      // 检查是否有订单通过查询项目使用此类型
      const [orderRows]: any = await pool.execute(
        `SELECT COUNT(*) as count FROM orders o
         JOIN query_items qi ON o.query_item_id = qi.id
         JOIN api_configs ac ON qi.api_config_id = ac.id
         WHERE ac.type = ?`,
        [code]
      );
      const hasOrders = orderRows[0].count > 0;

      return { hasApiConfigs, hasQueryItems, hasOrders };
    } catch (error) {
      console.error('检查API类型依赖失败:', error);
      throw error;
    }
  }

  // 删除API类型（硬删除）
  static async delete(id: number): Promise<boolean> {
    try {
      const [result]: any = await pool.execute(
        `DELETE FROM api_types WHERE id = ?`,
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('删除API类型失败:', error);
      throw error;
    }
  }

  // 软删除API类型（保留原方法以备需要）
  static async softDelete(id: number): Promise<boolean> {
    try {
      const [result]: any = await pool.execute(
        `UPDATE api_types SET is_active = 0 WHERE id = ?`,
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('软删除API类型失败:', error);
      throw error;
    }
  }

  // 根据代码获取API类型
  static async findByCode(code: string): Promise<ApiType | null> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT * FROM api_types WHERE code = ?`,
        [code]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0];
      return {
        id: row.id,
        code: row.code,
        name: row.name,
        description: row.description,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error('获取API类型失败:', error);
      throw error;
    }
  }
}
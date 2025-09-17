import { pool } from '../config/database';

export interface QueryItem {
  id?: number;
  name: string;
  code: string;
  category: string;
  category_name?: string; // 添加分类名称字段
  subCategory?: string;
  price: number;
  description?: string;
  apiConfigId: number;
  paramsSchema: string; // JSON字符串
  resultSchema: string; // JSON字符串
  isActive: boolean;
  platforms?: string; // JSON字符串，存储平台可见性配置
  homepage_visible?: string; // JSON字符串，存储首页可见性配置
  features?: string | null; // JSON字符串，存储项目特性
  icon?: string; // 图标类名
  iconClass?: string; // 图标颜色类
  iconColor?: string; // 图标颜色
  placeholder?: string; // 占位符文本
  createdAt?: Date;
  updatedAt?: Date;
}

export class QueryItemModel {
  // 创建查询项目
  static async create(queryItem: QueryItem): Promise<number> {
    try {
      const [result]: any = await pool.execute(
        `INSERT INTO query_items (name, code, category, sub_category, price, description, api_config_id, params_schema, result_schema, is_active, features, icon, icon_class, icon_color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          queryItem.name,
          queryItem.code,
          queryItem.category,
          queryItem.subCategory || null,
          queryItem.price,
          queryItem.description || null,
          queryItem.apiConfigId,
          queryItem.paramsSchema,
          queryItem.resultSchema,
          queryItem.isActive !== undefined ? queryItem.isActive : true,
          queryItem.features || null,
          queryItem.icon || 'fas fa-search',
          queryItem.iconClass || 'primary',
          queryItem.iconColor || '#409EFF'
        ]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('创建查询项目失败:', error);
      throw error;
    }
  }
  
  // 获取所有查询项目（包含分类名称）
  static async findAllWithCategoryName(category?: string): Promise<QueryItem[]> {
    try {
      let query = `
        SELECT 
          qi.*,
          ac.name as api_config_name,
          qc.name as category_name
        FROM query_items qi
        LEFT JOIN api_configs ac ON qi.api_config_id = ac.id
        LEFT JOIN query_categories qc ON qi.category = qc.id
        WHERE qi.is_active = 1
      `;
      const params: any[] = [];
      
      if (category) {
        query += ` AND qi.category = ?`;
        params.push(category);
      }
      
      query += ` ORDER BY qi.category, qi.sub_category, qi.name`;
      
      const [rows]: any = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('获取查询项目失败:', error);
      throw error;
    }
  }
  
  // 获取所有查询项目（管理员）
  static async findAllForAdmin(): Promise<QueryItem[]> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT 
          qi.*,
          ac.name as api_config_name
        FROM query_items qi
        LEFT JOIN api_configs ac ON qi.api_config_id = ac.id
        ORDER BY qi.category, qi.sub_category, qi.name`
      );
      return rows;
    } catch (error) {
      console.error('获取查询项目失败:', error);
      throw error;
    }
  }
  
  // 通过ID查找查询项目
  static async findById(id: number): Promise<QueryItem | null> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT id, name, code, category, sub_category as subCategory, price, description, 
                api_config_id as apiConfigId, params_schema as paramsSchema, 
                result_schema as resultSchema, is_active as isActive, platforms, 
                homepage_visible, features, icon, icon_class as iconClass, 
                icon_color as iconColor, placeholder,
                created_at as createdAt, updated_at as updatedAt
         FROM query_items WHERE id = ?`,
        [id]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('查找查询项目失败:', error);
      throw error;
    }
  }
  
  // 通过代码查找查询项目
  static async findByCode(code: string): Promise<QueryItem | null> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT * FROM query_items WHERE code = ?`,
        [code]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('查找查询项目失败:', error);
      throw error;
    }
  }
  
  // 更新查询项目
  static async update(id: number, queryItemData: Partial<QueryItem>): Promise<boolean> {
    try {
      // 构建更新语句
      const updateFields = Object.keys(queryItemData).map(key => {
        // 转换驼峰命名为下划线命名
        const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        return `${dbField} = ?`;
      });
      
      const values = Object.values(queryItemData);
      values.push(id); // 添加WHERE条件的值
      
      const [result]: any = await pool.execute(
        `UPDATE query_items SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新查询项目失败:', error);
      throw error;
    }
  }
  
  // 删除查询项目（硬删除）
  static async delete(id: number): Promise<boolean> {
    try {
      const [result]: any = await pool.execute(
        `DELETE FROM query_items WHERE id = ?`,
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('删除查询项目失败:', error);
      throw error;
    }
  }
  
  // 获取查询项目分类
  static async getCategories(): Promise<any[]> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT * FROM query_categories ORDER BY id`
      );
      return rows;
    } catch (error) {
      console.error('获取查询项目分类失败:', error);
      throw error;
    }
  }
  
  // 通过ID获取查询分类
  static async getCategoryById(id: string): Promise<any> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT * FROM query_categories WHERE id = ?`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('获取查询分类失败:', error);
      throw error;
    }
  }
  
  // 创建查询分类
  static async createCategory(category: {id: string, name: string, description: string, icon?: string}): Promise<boolean> {
    try {
      const [result]: any = await pool.execute(
        `INSERT INTO query_categories (id, name, description, icon) VALUES (?, ?, ?, ?)`,
        [category.id, category.name, category.description, category.icon || null]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('创建查询分类失败:', error);
      throw error;
    }
  }
  
  // 更新查询分类
  static async updateCategory(id: string, data: {name: string, description: string, icon?: string}): Promise<boolean> {
    try {
      const [result]: any = await pool.execute(
        `UPDATE query_categories SET name = ?, description = ?, icon = ? WHERE id = ?`,
        [data.name, data.description, data.icon || null, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新查询分类失败:', error);
      throw error;
    }
  }
  
  // 删除查询分类
  static async deleteCategory(id: string): Promise<boolean> {
    try {
      const [result]: any = await pool.execute(
        `DELETE FROM query_categories WHERE id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('删除查询分类失败:', error);
      throw error;
    }
  }
  
  // 根据分类获取查询项目
  static async findByCategory(category: string): Promise<QueryItem[]> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT * FROM query_items WHERE category = ? AND is_active = 1`,
        [category]
      );
      return rows;
    } catch (error) {
      console.error('获取分类查询项目失败:', error);
      throw error;
    }
  }
  
  // 更新平台可见性配置
  static async updatePlatforms(id: number, platformsData: string): Promise<boolean> {
    try {
      const [result]: any = await pool.execute(
        `UPDATE query_items SET platforms = ? WHERE id = ?`,
        [platformsData, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新平台可见性配置失败:', error);
      throw error;
    }
  }
  
  // 更新首页可见性配置
  static async updateHomepageVisibility(id: number, homepageData: string): Promise<boolean> {
    try {
      const [result]: any = await pool.execute(
        `UPDATE query_items SET homepage_visible = ? WHERE id = ?`,
        [homepageData, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('更新首页可见性配置失败:', error);
      throw error;
    }
  }
}
import { Request, Response } from 'express';
import { ApiTypeModel, ApiType } from '../models/api-type.model';

export class ApiTypeController {
  // 获取所有API类型
  static async getApiTypes(req: Request, res: Response) {
    try {
      const { page = 1, size = 10 } = req.query;
      
      // 获取所有API类型
      const allApiTypes = await ApiTypeModel.findAll();
      
      // 分页处理
      const pageNum = parseInt(page as string);
      const sizeNum = parseInt(size as string);
      const total = allApiTypes.length;
      const startIndex = (pageNum - 1) * sizeNum;
      const endIndex = startIndex + sizeNum;
      const paginatedApiTypes = allApiTypes.slice(startIndex, endIndex);
      
      res.status(200).json({
        success: true,
        code: 200,
        message: '获取API类型列表成功',
        data: paginatedApiTypes,
        pagination: {
          page: pageNum,
          size: sizeNum,
          total,
          totalPages: Math.ceil(total / sizeNum)
        }
      });
    } catch (error) {
      console.error('获取API类型列表失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '服务器错误，获取API类型列表失败'
      });
    }
  }
  
  // 获取单个API类型
  static async getApiTypeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const apiType = await ApiTypeModel.findById(parseInt(id));
      
      if (!apiType) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'API类型不存在'
        });
      }
      
      res.status(200).json({
        success: true,
        code: 200,
        message: '获取API类型成功',
        data: apiType
      });
    } catch (error) {
      console.error('获取API类型失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '服务器错误，获取API类型失败'
      });
    }
  }
  
  // 创建API类型
  static async createApiType(req: Request, res: Response) {
    try {
      const { code, name, description, isActive } = req.body;
      
      // 验证必填字段
      if (!code || !name) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: '必填字段不能为空：code, name'
        });
      }
      
      // 检查代码是否已存在
      const existingType = await ApiTypeModel.findByCode(code);
      if (existingType) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: 'API类型代码已存在'
        });
      }
      
      const apiTypeData: ApiType = {
        code,
        name,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true
      };
      
      const apiTypeId = await ApiTypeModel.create(apiTypeData);
      
      res.status(201).json({
        success: true,
        code: 201,
        message: '创建API类型成功',
        data: {
          id: apiTypeId,
          ...apiTypeData
        }
      });
    } catch (error) {
      console.error('创建API类型失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '服务器错误，创建API类型失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
  
  // 更新API类型
  static async updateApiType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { code, name, description, isActive } = req.body;
      
      // 查找API类型
      const apiType = await ApiTypeModel.findById(parseInt(id));
      
      if (!apiType) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'API类型不存在'
        });
      }
      
      // 如果要更新代码，检查是否与其他记录冲突
      if (code && code !== apiType.code) {
        const existingType = await ApiTypeModel.findByCode(code);
        if (existingType && existingType.id !== parseInt(id)) {
          return res.status(400).json({
            success: false,
            code: 400,
            message: 'API类型代码已存在'
          });
        }
      }
      
      // 更新API类型
      const apiTypeData: Partial<ApiType> = {};
      
      if (code !== undefined) apiTypeData.code = code;
      if (name !== undefined) apiTypeData.name = name;
      if (description !== undefined) apiTypeData.description = description;
      if (isActive !== undefined) apiTypeData.isActive = isActive;
      
      await ApiTypeModel.update(parseInt(id), apiTypeData);
      
      res.status(200).json({
        success: true,
        code: 200,
        message: '更新API类型成功',
        data: {
          id: parseInt(id),
          ...apiType,
          ...apiTypeData
        }
      });
    } catch (error) {
      console.error('更新API类型失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '服务器错误，更新API类型失败'
      });
    }
  }

  // 删除API类型
  static async deleteApiType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // 查找API类型
      const apiType = await ApiTypeModel.findById(parseInt(id));
      
      if (!apiType) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: 'API类型不存在'
        });
      }
      
      // 检查依赖关系
      const dependencies = await ApiTypeModel.checkDependencies(apiType.code);
      
      if (dependencies.hasApiConfigs || dependencies.hasQueryItems || dependencies.hasOrders) {
        let message = '无法删除该API类型，因为它正在被以下内容使用：';
        const usedBy = [];
        
        if (dependencies.hasApiConfigs) {
          usedBy.push('API配置');
        }
        if (dependencies.hasQueryItems) {
          usedBy.push('查询项目');
        }
        if (dependencies.hasOrders) {
          usedBy.push('历史订单');
        }
        
        message += usedBy.join('、');
        message += '。请先删除相关依赖项或联系管理员。';
        
        return res.status(400).json({
          success: false,
          code: 400,
          message: message,
          data: {
            dependencies: {
              hasApiConfigs: dependencies.hasApiConfigs,
              hasQueryItems: dependencies.hasQueryItems,
              hasOrders: dependencies.hasOrders
            }
          }
        });
      }
      
      // 执行硬删除
      await ApiTypeModel.delete(parseInt(id));
      
      res.status(200).json({
        success: true,
        code: 200,
        message: '删除API类型成功'
      });
    } catch (error) {
      console.error('删除API类型失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '服务器错误，删除API类型失败'
      });
    }
  }
}
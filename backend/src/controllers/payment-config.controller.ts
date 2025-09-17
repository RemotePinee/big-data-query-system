import { Request, Response } from 'express';
import { PaymentConfigModel, PaymentConfig } from '../models/payment-config.model';
import axios from 'axios';

export class PaymentConfigController {
  // 获取所有支付配置
  static async getAll(req: Request, res: Response) {
    try {
      const configs = await PaymentConfigModel.findAll();
      res.json({
        code: 200,
        message: '获取支付配置成功',
        data: configs
      });
    } catch (error) {
      console.error('获取支付配置失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取支付配置失败'
      });
    }
  }

  // 根据ID获取支付配置
  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const config = await PaymentConfigModel.findById(id);
      
      if (!config) {
        return res.status(404).json({
          code: 404,
          message: '支付配置不存在'
        });
      }

      res.json({
        code: 200,
        message: '获取支付配置成功',
        data: config
      });
    } catch (error) {
      console.error('获取支付配置失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取支付配置失败'
      });
    }
  }

  // 创建支付配置
  static async create(req: Request, res: Response) {
    try {
      const configData = req.body;
      
      // 检查配置代码是否已存在
      const existingConfig = await PaymentConfigModel.findByCode(configData.code);
      if (existingConfig) {
        return res.status(400).json({
          code: 400,
          message: '配置代码已存在'
        });
      }

      const configId = await PaymentConfigModel.create(configData);
      
      res.status(201).json({
        code: 201,
        message: '创建支付配置成功',
        data: { id: configId }
      });
    } catch (error) {
      console.error('创建支付配置失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建支付配置失败'
      });
    }
  }

  // 更新支付配置
  static async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const success = await PaymentConfigModel.update(id, updateData);
      
      if (!success) {
        return res.status(404).json({
          code: 404,
          message: '支付配置不存在或更新失败'
        });
      }

      res.json({
        code: 200,
        message: '更新支付配置成功'
      });
    } catch (error) {
      console.error('更新支付配置失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新支付配置失败'
      });
    }
  }

  // 删除支付配置
  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      const success = await PaymentConfigModel.delete(id);
      
      if (!success) {
        return res.status(404).json({
          code: 404,
          message: '支付配置不存在或删除失败'
        });
      }

      res.json({
        code: 200,
        message: '删除支付配置成功'
      });
    } catch (error) {
      console.error('删除支付配置失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除支付配置失败'
      });
    }
  }

  // 切换激活状态
  static async toggleActive(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      const success = await PaymentConfigModel.toggleActive(id);
      
      if (!success) {
        return res.status(404).json({
          code: 404,
          message: '支付配置不存在或切换失败'
        });
      }

      res.json({
        code: 200,
        message: '切换状态成功'
      });
    } catch (error) {
      console.error('切换状态失败:', error);
      res.status(500).json({
        code: 500,
        message: '切换状态失败'
      });
    }
  }

  // 测试支付配置
  static async testConfig(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const config = await PaymentConfigModel.findById(id);
      
      if (!config) {
        return res.status(404).json({
          code: 404,
          message: '支付配置不存在'
        });
      }

      // 验证配置参数的完整性
      const validationErrors: string[] = [];
      
      // 基础参数验证
      if (!config.name || config.name.trim() === '') {
        validationErrors.push('配置名称不能为空');
      }
      
      if (!config.code || config.code.trim() === '') {
        validationErrors.push('配置代码不能为空');
      }
      
      if (!config.type || config.type.trim() === '') {
        validationErrors.push('支付类型不能为空');
      }

      // 根据支付类型验证特定参数
      switch (config.type) {
        case 'alipay':
          if (!config.appId || config.appId.trim() === '') {
            validationErrors.push('支付宝AppId不能为空');
          }
          if (!config.apiKey || config.apiKey.trim() === '') {
            validationErrors.push('支付宝私钥不能为空');
          }
          break;
          
        case 'wechat':
          if (!config.appId || config.appId.trim() === '') {
            validationErrors.push('微信AppId不能为空');
          }
          if (!config.merchantId || config.merchantId.trim() === '') {
            validationErrors.push('微信商户号不能为空');
          }
          if (!config.apiKey || config.apiKey.trim() === '') {
            validationErrors.push('微信API密钥不能为空');
          }
          break;
          
        case 'epay':
          if (!config.merchantId || config.merchantId.trim() === '') {
            validationErrors.push('易支付商户ID不能为空');
          }
          if (!config.apiKey || config.apiKey.trim() === '') {
            validationErrors.push('易支付密钥不能为空');
          }
          if (!config.apiUrl || config.apiUrl.trim() === '') {
            validationErrors.push('易支付API地址不能为空');
          }
          // 验证URL格式
          try {
            if (config.apiUrl) {
              new URL(config.apiUrl);
            }
          } catch {
            validationErrors.push('易支付API地址格式不正确');
          }
          break;
          
        default:
          validationErrors.push(`不支持的支付类型: ${config.type}`);
      }

      // URL格式验证
      if (config.notifyUrl && config.notifyUrl.trim() !== '') {
        try {
          new URL(config.notifyUrl);
        } catch {
          validationErrors.push('回调地址格式不正确');
        }
      }
      
      if (config.returnUrl && config.returnUrl.trim() !== '') {
        try {
          new URL(config.returnUrl);
        } catch {
          validationErrors.push('返回地址格式不正确');
        }
      }

      // 如果有验证错误，返回失败
      if (validationErrors.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '配置参数验证失败',
          data: {
            configName: config.name,
            configType: config.type,
            testResult: 'failed',
            errors: validationErrors
          }
        });
      }

      // 对于易支付，尝试测试API连接
      if (config.type === 'epay' && config.apiUrl) {
        try {
          const testUrl = config.apiUrl.endsWith('/') ? config.apiUrl + 'api.php' : config.apiUrl + '/api.php';
          const response = await axios.post(testUrl, new URLSearchParams({
            act: 'query',
            pid: config.merchantId || '',
            key: config.apiKey || '',
            out_trade_no: 'test_' + Date.now()
          }), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: 10000, // 10秒超时
            validateStatus: () => true // 接受所有状态码，手动处理
          });
          
          // 检查响应状态
          if (response.status >= 400) {
            validationErrors.push(`API连接测试失败: HTTP ${response.status}`);
          } else {
            // 检查易支付API的响应格式
            const responseData = response.data;
            if (typeof responseData === 'string' && responseData.includes('error')) {
              // 如果返回包含error，可能是参数错误，但连接是通的
              console.log('易支付API连接成功，但参数可能有误:', responseData);
            }
          }
        } catch (error: any) {
          if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
              validationErrors.push(`API连接测试失败: 无法连接到服务器 (${error.code})`);
            } else if (error.code === 'ECONNABORTED') {
              validationErrors.push('API连接测试失败: 连接超时');
            } else {
              validationErrors.push(`API连接测试失败: ${error.message}`);
            }
          } else {
            validationErrors.push(`API连接测试失败: ${error.message}`);
          }
        }
      }

      // 最终结果
      if (validationErrors.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '配置测试失败',
          data: {
            configName: config.name,
            configType: config.type,
            testResult: 'failed',
            errors: validationErrors
          }
        });
      }
      
      res.json({
        code: 200,
        message: '配置测试通过',
        data: {
          configName: config.name,
          configType: config.type,
          testResult: 'success',
          message: '所有配置参数验证通过'
        }
      });
    } catch (error) {
      console.error('测试配置失败:', error);
      res.status(500).json({
        code: 500,
        message: '测试配置失败',
        data: {
          testResult: 'error',
          error: error instanceof Error ? error.message : '未知错误'
        }
      });
    }
  }
}
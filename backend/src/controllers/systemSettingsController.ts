import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

// 扩展Request接口以包含file属性
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname);
    const filename = `logo_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持图片文件格式'));
    }
  }
});

// 获取系统设置
export const getSystemSettings = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT setting_key, setting_value, setting_type FROM system_settings'
    );

    // 将设置转换为对象格式
    const settings: Record<string, any> = {};
    rows.forEach(row => {
      const key = row.setting_key;
      let value = row.setting_value;
      
      // 根据类型转换值
      switch (row.setting_type) {
        case 'json':
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = {};
          }
          break;
        case 'boolean':
          value = value === 'true' || value === '1';
          break;
        case 'number':
          value = parseFloat(value) || 0;
          break;
        default:
          // string 和 text 类型保持原样
          break;
      }
      
      // 转换键名为驼峰格式
      const camelKey = key.replace(/_([a-z])/g, (match: string, letter: string) => letter.toUpperCase());
      settings[camelKey] = value;
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: settings
    });
  } catch (error) {
    console.error('获取系统设置失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取系统设置失败'
    });
  }
};

// 更新系统设置
export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const settings = req.body;
    
    // 开始事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const [camelKey, value] of Object.entries(settings)) {
        // 将驼峰格式转换为下划线格式
        const dbKey = camelKey.replace(/([A-Z])/g, '_$1').toLowerCase();
        
        // 确定值的类型和格式
        let stringValue: string;
        let settingType = 'string';
        
        if (typeof value === 'object' && value !== null) {
          stringValue = JSON.stringify(value);
          settingType = 'json';
        } else if (typeof value === 'boolean') {
          stringValue = value ? 'true' : 'false';
          settingType = 'boolean';
        } else if (typeof value === 'number') {
          stringValue = value.toString();
          settingType = 'number';
        } else {
          stringValue = String(value || '');
          // 对于长文本，使用 text 类型
          if (stringValue.length > 255) {
            settingType = 'text';
          }
        }

        // 更新或插入设置
        await connection.execute<ResultSetHeader>(
          `INSERT INTO system_settings (setting_key, setting_value, setting_type) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           setting_value = VALUES(setting_value), 
           setting_type = VALUES(setting_type),
           updated_at = CURRENT_TIMESTAMP`,
          [dbKey, stringValue, settingType]
        );
      }

      await connection.commit();
      connection.release();

      res.json({
        code: 200,
        message: '设置保存成功'
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('更新系统设置失败:', error);
    res.status(500).json({
      code: 500,
      message: '保存设置失败'
    });
  }
};

// 上传Logo
export const uploadLogo = [
  upload.single('file'),
  async (req: MulterRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          code: 400,
          message: '请选择要上传的文件'
        });
      }

      // 生成文件访问URL
      const fileUrl = `/uploads/logos/${req.file.filename}`;

      res.json({
        code: 200,
        message: '上传成功',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error('上传Logo失败:', error);
      res.status(500).json({
        code: 500,
        message: '上传失败'
      });
    }
  }
];

// 获取公开的系统设置（用于前端显示）
export const getPublicSettings = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT setting_key, setting_value, setting_type 
       FROM system_settings 
       WHERE setting_key IN (
         'pc_logo', 'system_name', 'system_title', 'hero_title', 'hero_subtitle', 
         'service_description', 'service_phone', 'work_time', 
         'email', 'address', 'online_service', 'online_service_qr', 'copyright', 'icp', 'favicon',
         'query_service_agreement', 'payment_service_agreement', 'privacy_agreement'
       )`
    );

    // 将设置转换为对象格式
    const settings: Record<string, any> = {};
    rows.forEach(row => {
      const key = row.setting_key;
      let value = row.setting_value;
      
      // 根据类型转换值
      switch (row.setting_type) {
        case 'json':
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = {};
          }
          break;
        case 'boolean':
          value = value === 'true' || value === '1';
          break;
        case 'number':
          value = parseFloat(value) || 0;
          break;
        default:
          break;
      }
      
      // 转换键名为驼峰格式
      const camelKey = key.replace(/_([a-z])/g, (match: string, letter: string) => letter.toUpperCase());
      settings[camelKey] = value;
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: settings
    });
  } catch (error) {
    console.error('获取公开设置失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取设置失败'
    });
  }
};
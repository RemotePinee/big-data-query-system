import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import { updateQueryItems } from './update-query-items';

const initDatabase = async () => {
  try {
    console.log('开始初始化数据库表...');

    // 创建用户表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        avatar VARCHAR(255),
        balance DECIMAL(10,2) DEFAULT 0.00,
        role ENUM('user', 'admin') DEFAULT 'user',
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 创建API配置表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS api_configs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        type VARCHAR(50) DEFAULT 'other',
        base_url VARCHAR(255) NOT NULL,
        api_key VARCHAR(255),
        api_secret VARCHAR(255),
        token VARCHAR(255),
        headers JSON,
        request_method ENUM('GET', 'POST', 'PUT', 'DELETE') DEFAULT 'GET',
        request_format ENUM('json', 'form', 'query') DEFAULT 'json',
        response_format TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 如果表已存在，更新字段类型
    try {
      await pool.execute(`ALTER TABLE api_configs MODIFY COLUMN response_format TEXT`);
      // 检查type字段是否存在，如果不存在则添加
      const [columns] = await pool.execute(`SHOW COLUMNS FROM api_configs LIKE 'type'`);
      if ((columns as any[]).length === 0) {
        await pool.execute(`ALTER TABLE api_configs ADD COLUMN type VARCHAR(50) DEFAULT 'other' AFTER provider`);
      }
      
      // 检查request_params字段是否存在，如果不存在则添加
      const [requestParamsColumn] = await pool.execute(`SHOW COLUMNS FROM api_configs LIKE 'request_params'`);
      if ((requestParamsColumn as any[]).length === 0) {
        await pool.execute(`ALTER TABLE api_configs ADD COLUMN request_params JSON AFTER headers`);
        console.log('已添加request_params字段到api_configs表');
      }
      
      // 检查api_key_name字段是否存在，如果不存在则添加
      const [apiKeyNameColumn] = await pool.execute(`SHOW COLUMNS FROM api_configs LIKE 'api_key_name'`);
      if ((apiKeyNameColumn as any[]).length === 0) {
        await pool.execute(`ALTER TABLE api_configs ADD COLUMN api_key_name VARCHAR(100) DEFAULT 'X-API-KEY' AFTER api_key`);
        console.log('已添加api_key_name字段到api_configs表');
      }
      
      // 检查api_key_location字段是否存在，如果不存在则添加
      const [apiKeyLocationColumn] = await pool.execute(`SHOW COLUMNS FROM api_configs LIKE 'api_key_location'`);
      if ((apiKeyLocationColumn as any[]).length === 0) {
        await pool.execute(`ALTER TABLE api_configs ADD COLUMN api_key_location ENUM('header', 'query') DEFAULT 'header' AFTER api_key_name`);
        console.log('已添加api_key_location字段到api_configs表');
      }
      
      // 检查access_id字段是否存在，如果不存在则添加
      const [accessIdColumn] = await pool.execute(`SHOW COLUMNS FROM api_configs LIKE 'access_id'`);
      if ((accessIdColumn as any[]).length === 0) {
        await pool.execute(`ALTER TABLE api_configs ADD COLUMN access_id VARCHAR(255) AFTER token`);
        console.log('已添加access_id字段到api_configs表');
      }
    } catch (error) {
      // 忽略错误，可能是字段已经存在
      console.log('更新api_configs表字段时出现错误（可能字段已存在）:', error);
    }

    // 创建API类型表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS api_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 插入默认API类型
    const [apiTypeExists] = await pool.execute('SELECT id FROM api_types WHERE code = ?', ['person_info']);
    if ((apiTypeExists as any[]).length === 0) {
      await pool.execute(`
        INSERT INTO api_types (code, name, description) VALUES 
        ('person_info', '个人信息查询', '查询个人基本信息'),
        ('person_credit', '个人征信查询', '查询个人征信记录'),
        ('person_judicial', '个人司法查询', '查询个人司法信息'),
        ('person_company', '人企关联查询', '查询个人与企业关联信息'),
        ('marriage', '婚姻状况查询', '查询婚姻状况信息'),
        ('loan', '贷款记录查询', '查询贷款记录信息'),
        ('company_info', '企业信息查询', '查询企业基本信息'),
        ('company_judicial', '企业涉诉查询', '查询企业司法信息'),
        ('company_legal', '法人股东查询', '查询企业法人股东信息'),
        ('vehicle', '车辆信息查询', '查询车辆相关信息'),
        ('property', '房产信息查询', '查询房产相关信息'),
        ('education', '学历信息查询', '查询学历学籍信息'),
        ('communication', '通讯信息查询', '查询通讯相关信息'),
        ('other', '其他', '其他类型API')
      `);
    }

    // 创建查询项目表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS query_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        category VARCHAR(50) NOT NULL,
        sub_category VARCHAR(50),
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        api_config_id INT,
        params_schema JSON,
        result_schema JSON,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (api_config_id) REFERENCES api_configs(id)
      )
    `);

    // 检查并添加query_items表的缺失字段
    try {
      // 检查platforms字段是否存在，如果不存在则添加
      const [platformsColumn] = await pool.execute(`SHOW COLUMNS FROM query_items LIKE 'platforms'`);
      if ((platformsColumn as any[]).length === 0) {
        await pool.execute(`ALTER TABLE query_items ADD COLUMN platforms TEXT AFTER result_schema`);
        console.log('已添加platforms字段到query_items表');
      }

      // 检查icon字段是否存在，如果不存在则添加
      const [iconColumn] = await pool.execute(`SHOW COLUMNS FROM query_items LIKE 'icon'`);
      if ((iconColumn as any[]).length === 0) {
        await pool.execute(`ALTER TABLE query_items ADD COLUMN icon VARCHAR(100) DEFAULT 'fas fa-search' AFTER platforms`);
        console.log('已添加icon字段到query_items表');
      }

      // 检查icon_class字段是否存在，如果不存在则添加
      const [iconClassColumn] = await pool.execute(`SHOW COLUMNS FROM query_items LIKE 'icon_class'`);
      if ((iconClassColumn as any[]).length === 0) {
        await pool.execute(`ALTER TABLE query_items ADD COLUMN icon_class VARCHAR(50) DEFAULT 'primary' AFTER icon`);
        console.log('已添加icon_class字段到query_items表');
      }

      // 检查icon_color字段是否存在，如果不存在则添加
      const [iconColorColumn] = await pool.execute(`SHOW COLUMNS FROM query_items LIKE 'icon_color'`);
      if ((iconColorColumn as any[]).length === 0) {
        await pool.execute(`ALTER TABLE query_items ADD COLUMN icon_color VARCHAR(20) DEFAULT '#409EFF' AFTER icon_class`);
        console.log('已添加icon_color字段到query_items表');
      }

      // 检查placeholder字段是否存在，如果不存在则添加
    const [placeholderColumn] = await pool.execute(`SHOW COLUMNS FROM query_items LIKE 'placeholder'`);
    if ((placeholderColumn as any[]).length === 0) {
      await pool.execute(`ALTER TABLE query_items ADD COLUMN placeholder VARCHAR(255) AFTER icon_color`);
      console.log('已添加placeholder字段到query_items表');
    }

      // 检查features字段是否存在，如果不存在则添加
      const [featuresColumn] = await pool.execute(`SHOW COLUMNS FROM query_items LIKE 'features'`);
      if ((featuresColumn as any[]).length === 0) {
        await pool.execute(`ALTER TABLE query_items ADD COLUMN features JSON AFTER placeholder`);
        console.log('已添加features字段到query_items表');
        
        // 为现有数据添加默认特性
        await pool.execute(`UPDATE query_items SET features = JSON_ARRAY('基础查询') WHERE features IS NULL`);
        
        // 为不同类别的查询项目设置不同的默认特性
        await pool.execute(`UPDATE query_items SET features = JSON_ARRAY('企业信息', '工商数据', '实时查询') WHERE category = 'business'`);
        await pool.execute(`UPDATE query_items SET features = JSON_ARRAY('个人信息', '身份验证', '隐私保护') WHERE category = 'personal'`);
        await pool.execute(`UPDATE query_items SET features = JSON_ARRAY('房产信息', '产权查询', '权威数据') WHERE category = 'property'`);
        await pool.execute(`UPDATE query_items SET features = JSON_ARRAY('车辆信息', '车况查询', '官方数据') WHERE category = 'vehicle'`);
        await pool.execute(`UPDATE query_items SET features = JSON_ARRAY('学历信息', '学籍验证', '教育部认证') WHERE category = 'education'`);
        await pool.execute(`UPDATE query_items SET features = JSON_ARRAY('司法信息', '法律查询', '权威来源') WHERE category = 'legal'`);
        
        console.log('已为现有查询项目设置默认特性');
      }
    } catch (error) {
      console.log('更新query_items表字段时出现错误（可能字段已存在）:', error);
    }

    // 创建支付配置表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS payment_configs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        type ENUM('wechat', 'alipay', 'epay') NOT NULL,
        app_id VARCHAR(255),
        app_secret VARCHAR(255),
        merchant_id VARCHAR(255),
        api_key VARCHAR(255),
        private_key TEXT,
        public_key TEXT,
        api_url VARCHAR(255),
        notify_url VARCHAR(255),
        return_url VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 检查并添加缺失的字段
    try {
      // 检查api_url字段是否存在
      const [apiUrlColumn] = await pool.execute(`SHOW COLUMNS FROM payment_configs LIKE 'api_url'`);
      if ((apiUrlColumn as any[]).length === 0) {
        await pool.execute(`ALTER TABLE payment_configs ADD COLUMN api_url VARCHAR(255) AFTER api_key`);
        console.log('已添加api_url字段到payment_configs表');
      }

      // 检查private_key字段是否存在
      const [privateKeyColumn] = await pool.execute(`SHOW COLUMNS FROM payment_configs LIKE 'private_key'`);
      if ((privateKeyColumn as any[]).length === 0) {
        await pool.execute(`ALTER TABLE payment_configs ADD COLUMN private_key TEXT AFTER api_key`);
        console.log('已添加private_key字段到payment_configs表');
      }

      // 检查public_key字段是否存在
      const [publicKeyColumn] = await pool.execute(`SHOW COLUMNS FROM payment_configs LIKE 'public_key'`);
      if ((publicKeyColumn as any[]).length === 0) {
        await pool.execute(`ALTER TABLE payment_configs ADD COLUMN public_key TEXT AFTER private_key`);
        console.log('已添加public_key字段到payment_configs表');
      }
    } catch (error) {
      console.log('更新payment_configs表字段时出现错误:', error);
    }

    // 创建订单表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_no VARCHAR(50) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        query_item_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'paid', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
        payment_method VARCHAR(50),
        query_params JSON,
        query_result JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (query_item_id) REFERENCES query_items(id)
      )
    `);

    // 创建系统设置表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type ENUM('string', 'text', 'number', 'boolean', 'json') DEFAULT 'string',
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 插入默认数据
    // 检查是否已有管理员用户
    const [adminExists] = await pool.execute('SELECT id FROM users WHERE username = ?', ['admin']);
    if ((adminExists as any[]).length === 0) {
      // 生成密码哈希
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      const testPasswordHash = await bcrypt.hash('test123', 10);
      
      // 插入管理员用户
      await pool.execute(`
        INSERT INTO users (username, password, email, role) VALUES 
        ('admin', ?, 'admin@dashuju.com', 'admin')
      `, [adminPasswordHash]);
      
      // 插入测试用户
      await pool.execute(`
        INSERT INTO users (username, password, email, balance) VALUES 
        ('testuser', ?, 'test@dashuju.com', 100.00)
      `, [testPasswordHash]);
    }

    // 不再自动插入示例查询项目

    // 插入示例支付配置
    const [paymentExists] = await pool.execute('SELECT id FROM payment_configs WHERE code = ?', ['wechat']);
    if ((paymentExists as any[]).length === 0) {
      await pool.execute(`
        INSERT INTO payment_configs (name, code, type, is_active) VALUES 
        ('微信支付', 'wechat', 'wechat', TRUE),
        ('支付宝', 'alipay', 'alipay', TRUE)
      `);
    }

    // 插入默认系统设置
    const [settingsExists] = await pool.execute('SELECT id FROM system_settings WHERE setting_key = ?', ['system_name']);
    if ((settingsExists as any[]).length === 0) {
      await pool.execute(`
        INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES 
        ('system_name', '大数据查询平台', 'string', '系统名称'),
        ('system_title', '', 'string', '系统标题（移动端统一标题）'),
        ('pc_logo', '/logo.png', 'string', 'PC端Logo'),
        ('hero_title', '专业的数据查询服务', 'string', '首页标题'),
        ('hero_subtitle', '提供企业信息、个人征信、司法记录等多维度数据查询服务', 'string', '首页副标题'),
        ('service_description', '我们致力于为用户提供准确、及时、全面的数据查询服务，助力您的决策和业务发展。', 'text', '服务描述'),
        ('service_phone', '400-123-4567', 'string', '客服电话'),
        ('work_time', '工作日 9:00-18:00', 'string', '工作时间'),
        ('email', 'service@dashuju.com', 'string', '联系邮箱'),
        ('address', '北京市朝阳区xxx大厦', 'string', '公司地址'),
        ('online_service', 'true', 'boolean', '在线客服开关'),
        ('online_service_qr', '', 'string', '在线客服二维码'),
        ('copyright', '© 2024 大数据查询平台 版权所有', 'string', '版权信息'),
        ('query_service_agreement', '', 'string', '查询服务协议链接'),
        ('payment_service_agreement', '', 'string', '支付服务协议链接'),
        ('privacy_agreement', '', 'string', '隐私协议链接')
      `);
      console.log('已插入默认系统设置');
    }


    
    // 检查并添加icon字段
    try {
      const [columns]: any = await pool.execute(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'query_categories' 
        AND COLUMN_NAME = 'icon'
      `);
      
      if (columns.length === 0) {
        console.log('添加icon字段到query_categories表...');
        await pool.execute(`
          ALTER TABLE query_categories 
          ADD COLUMN icon VARCHAR(100) AFTER description
        `);
        console.log('icon字段添加成功');
      }
    } catch (error) {
      console.log('检查或添加icon字段时出错:', error);
    }
    
    console.log('数据库表初始化完成！');
    
    // 更新查询项目数据
    await updateQueryItems();
    
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return false;
  }
};

export { initDatabase };
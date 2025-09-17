-- 生产环境数据库初始化脚本
-- 生成时间: 2025-09-12T16:58:43.829Z

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 表结构: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `realName` varchar(100) DEFAULT NULL,
  `idCard` varchar(20) DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT '0.00',
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

-- 表结构: admin_users
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `role` varchar(20) DEFAULT 'admin' COMMENT '角色',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态 1启用 0禁用',
  `last_login_time` int(11) DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) DEFAULT NULL COMMENT '最后登录IP',
  `created_at` int(11) DEFAULT NULL COMMENT '创建时间',
  `updated_at` int(11) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员用户表';

-- 表结构: agent_users
DROP TABLE IF EXISTS `agent_users`;
CREATE TABLE `agent_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `company_name` varchar(100) DEFAULT NULL COMMENT '公司名称',
  `contact_person` varchar(50) DEFAULT NULL COMMENT '联系人',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `balance` decimal(10,2) DEFAULT '0.00' COMMENT '余额',
  `commission_rate` decimal(5,2) DEFAULT '0.00' COMMENT '佣金比例',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态 1启用 0禁用',
  `last_login_time` int(11) DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) DEFAULT NULL COMMENT '最后登录IP',
  `created_at` int(11) DEFAULT NULL COMMENT '创建时间',
  `updated_at` int(11) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='代理商用户表';

-- 表结构: regular_users
DROP TABLE IF EXISTS `regular_users`;
CREATE TABLE `regular_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL COMMENT '用户名',
  `phone` varchar(20) NOT NULL COMMENT '手机号',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `password` varchar(255) DEFAULT NULL COMMENT '密码',
  `balance` decimal(10,2) DEFAULT '0.00' COMMENT '余额',
  `agent_id` int(11) DEFAULT NULL COMMENT '代理商ID',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态 1启用 0禁用',
  `registration_time` datetime DEFAULT NULL COMMENT '注册时间',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `created_at` int(11) DEFAULT NULL COMMENT '创建时间',
  `updated_at` int(11) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  KEY `agent_id` (`agent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='普通用户表';

-- 表结构: api_configs
DROP TABLE IF EXISTS `api_configs`;
CREATE TABLE `api_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `provider` varchar(50) NOT NULL,
  `type` varchar(50) DEFAULT 'other',
  `base_url` varchar(255) NOT NULL,
  `api_key` varchar(255) DEFAULT NULL,
  `api_key_name` varchar(100) DEFAULT 'X-API-KEY',
  `api_key_location` enum('header','query') DEFAULT 'header',
  `api_secret` varchar(255) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `access_id` varchar(255) DEFAULT NULL,
  `headers` json DEFAULT NULL,
  `request_params` json DEFAULT NULL,
  `request_method` enum('GET','POST','PUT','DELETE') DEFAULT 'GET',
  `request_format` enum('json','form','query') DEFAULT 'json',
  `response_format` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `encryption_enabled` tinyint(1) DEFAULT '0',
  `encryption_type` varchar(20) DEFAULT 'none',
  `encryption_key` text,
  `encryption_mode` varchar(20) DEFAULT NULL,
  `encryption_padding` varchar(20) DEFAULT NULL,
  `encryption_encoding` varchar(20) DEFAULT NULL,
  `dynamic_params` text,
  `api_path` varchar(255) DEFAULT '' COMMENT 'API调用路径，如/query、/search等',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;

-- 表结构: api_types
DROP TABLE IF EXISTS `api_types`;
CREATE TABLE `api_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;

-- 表结构: query_categories
DROP TABLE IF EXISTS `query_categories`;
CREATE TABLE `query_categories` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `icon` varchar(255) DEFAULT NULL COMMENT '分类图标',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 表结构: query_items
DROP TABLE IF EXISTS `query_items`;
CREATE TABLE `query_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `sub_category` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text,
  `api_config_id` int(11) DEFAULT NULL,
  `params_schema` text,
  `result_schema` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `platforms` json DEFAULT NULL COMMENT '平台可见性配置（JSON格式）',
  `icon` varchar(100) DEFAULT 'fas fa-search' COMMENT '图标类名',
  `icon_class` varchar(50) DEFAULT 'primary' COMMENT '图标颜色类',
  `icon_color` varchar(20) DEFAULT '#409EFF' COMMENT '图标颜色',
  `placeholder` varchar(255) DEFAULT NULL,
  `homepage_visible` text COMMENT '首页可见性配置，JSON格式存储移动端和PC端的可见性设置',
  `features` text COMMENT '项目特性JSON格式存储',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `api_config_id` (`api_config_id`),
  KEY `fk_query_items_category` (`category`),
  CONSTRAINT `fk_query_items_category` FOREIGN KEY (`category`) REFERENCES `query_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `query_items_ibfk_1` FOREIGN KEY (`api_config_id`) REFERENCES `api_configs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;

-- 表结构: orders
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `query_item_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','processing','completed','failed','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `query_params` json DEFAULT NULL,
  `query_result` json DEFAULT NULL,
  `query_count` int(11) DEFAULT 0 COMMENT '查询次数',
  `query_status` enum('not_started','querying','completed','failed','max_attempts_reached') DEFAULT 'not_started' COMMENT '查询状态',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `paid_at` timestamp NULL DEFAULT NULL COMMENT '支付完成时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `user_id` (`user_id`),
  KEY `query_item_id` (`query_item_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`query_item_id`) REFERENCES `query_items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;

-- 表结构: payment_configs
DROP TABLE IF EXISTS `payment_configs`;
CREATE TABLE `payment_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` enum('wechat','alipay','epay') NOT NULL,
  `app_id` varchar(255) DEFAULT NULL,
  `app_secret` varchar(255) DEFAULT NULL,
  `merchant_id` varchar(255) DEFAULT NULL,
  `api_key` varchar(255) DEFAULT NULL,
  `private_key` text,
  `public_key` text,
  `api_url` varchar(255) DEFAULT NULL,
  `notify_url` varchar(255) DEFAULT NULL,
  `return_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payment_mode` enum('qrcode','redirect') DEFAULT 'redirect' COMMENT '支付模式：qrcode=扫码模式，redirect=跳转模式',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=188 DEFAULT CHARSET=utf8;

-- 表结构: platform_display_configs
DROP TABLE IF EXISTS `platform_display_configs`;
CREATE TABLE `platform_display_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `query_item_id` int(11) NOT NULL COMMENT '关联的查询项目ID',
  `display_name` varchar(100) NOT NULL COMMENT '展示名称',
  `display_description` text COMMENT '展示描述',
  `display_price` decimal(10,2) DEFAULT NULL COMMENT '展示价格',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价',
  `icon_class` varchar(100) DEFAULT 'fas fa-search' COMMENT '图标类名',
  `icon_color` varchar(50) DEFAULT '#409EFF' COMMENT '图标颜色',
  `icon_size` varchar(20) DEFAULT 'medium' COMMENT '图标大小',
  `is_hot` tinyint(1) DEFAULT '0' COMMENT '是否热门',
  `display_order` int(11) DEFAULT '999' COMMENT '显示顺序',
  `pc_enabled` tinyint(1) DEFAULT '1' COMMENT 'PC端是否启用',
  `mobile_enabled` tinyint(1) DEFAULT '1' COMMENT '移动端是否启用',
  `features` json DEFAULT NULL COMMENT '特性列表',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否激活',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_query_item` (`query_item_id`),
  CONSTRAINT `platform_display_configs_ibfk_1` FOREIGN KEY (`query_item_id`) REFERENCES `query_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COMMENT='平台展示配置表';

-- 表结构: query_history
DROP TABLE IF EXISTS `query_history`;
CREATE TABLE `query_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `order_id` int(11) NOT NULL COMMENT '订单ID',
  `query_item_id` int(11) NOT NULL COMMENT '查询项目ID',
  `query_params` text COMMENT '查询参数',
  `query_result` longtext COMMENT '查询结果',
  `status` varchar(20) DEFAULT 'success' COMMENT '状态',
  `created_at` int(11) DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `order_id` (`order_id`),
  KEY `query_item_id` (`query_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='查询历史表';

-- 表结构: query_results
DROP TABLE IF EXISTS `query_results`;
CREATE TABLE `query_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) NOT NULL,
  `query_item_id` int(11) NOT NULL,
  `api_config_id` int(11) NOT NULL,
  `status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `query_params` json DEFAULT NULL,
  `result` json DEFAULT NULL,
  `error_message` text,
  `api_response_time` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

-- 表结构: login_records
DROP TABLE IF EXISTS `login_records`;
CREATE TABLE `login_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `login_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `location` varchar(255) DEFAULT NULL,
  `status` enum('success','failed') DEFAULT 'success',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_login_time` (`user_id`,`login_time`),
  CONSTRAINT `login_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 表结构: system_settings
DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `setting_type` enum('string','text','number','boolean','json') DEFAULT 'string',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8;

-- 表结构: user_deletion_requests
DROP TABLE IF EXISTS `user_deletion_requests`;
CREATE TABLE `user_deletion_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `reason` text,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `request_time` datetime NOT NULL,
  `process_time` datetime DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `admin_note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `processed_by` (`processed_by`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_request_time` (`request_time`),
  CONSTRAINT `user_deletion_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_deletion_requests_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户注销申请表';

-- 表结构: user_security_settings
DROP TABLE IF EXISTS `user_security_settings`;
CREATE TABLE `user_security_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `login_protection` tinyint(1) DEFAULT '0',
  `sms_verification` tinyint(1) DEFAULT '0',
  `email_notification` tinyint(1) DEFAULT '1',
  `two_factor_auth` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_security` (`user_id`),
  CONSTRAINT `user_security_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- 初始数据
-- 管理员用户
INSERT INTO users (username, email, password, role, status) VALUES
('admin', 'admin@dashuju.com', '$2b$10$guqzyOJWjwZ.PC.NTEbiAePP85UfiR2.vdaH5FwsfHpac6L7iCm3i', 'admin', 'active');

-- 系统设置
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('system_name', '大数据查询系统', 'string', '系统名称'),
('pc_logo', NULL, 'string', 'PC端Logo'),
('hero_title', '一站式大数据查询', 'string', '首页标题'),
('hero_subtitle', '专业、安全、高效的数据查询服务平台', 'string', '首页副标题'),
('service_description', '提供个人信息查询、征信逾期、个人司法涉诉、人企关联、婚姻状况、贷款记录、企业查询等多种数据服务', 'string', '服务描述'),
('service_phone', '15887219007', 'string', '客服电话'),
('work_time', '周一至周五 9:00-18:00', 'string', '工作时间'),
('email', '614807355@qq.com', 'string', '联系邮箱'),
('address', '云南省昆明市晋宁区昆阳街道中和路561号', 'string', '公司地址'),
('online_service', '点击联系在线客服', 'string', '在线客服开关'),
('copyright', '大数据查询系统版权所有', 'string', '版权信息'),
('icp', '滇ICP备2023012724号', 'string', NULL),
('online_service_qr', '/uploads/logos/logo_1754931643560.jpg', 'string', '在线客服二维码');

SET FOREIGN_KEY_CHECKS = 1;

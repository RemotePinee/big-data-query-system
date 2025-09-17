import { pool } from '../config/database';

async function addIconFieldToCategories() {
  try {
    console.log('开始为查询分类表添加icon字段...');
    
    // 检查icon字段是否已存在
    const [columns]: any = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'dashuju' 
      AND TABLE_NAME = 'query_categories' 
      AND COLUMN_NAME = 'icon'
    `);
    
    if (columns.length > 0) {
      console.log('icon字段已存在，跳过添加');
      return;
    }
    
    // 添加icon字段
    await pool.execute(`
      ALTER TABLE query_categories 
      ADD COLUMN icon VARCHAR(50) DEFAULT NULL COMMENT '分类图标'
    `);
    
    console.log('icon字段添加成功');
    
    // 为现有分类添加默认图标
    const iconMap = {
      'person': 'User',
      'company': 'Office', 
      'vehicle': 'Van',
      'property': 'House',
      'education': 'School',
      'telecom': 'Phone',
      'communication': 'Phone'
    };
    
    console.log('开始为现有分类设置默认图标...');
    
    for (const [categoryId, iconName] of Object.entries(iconMap)) {
      await pool.execute(
        `UPDATE query_categories SET icon = ? WHERE id = ?`,
        [iconName, categoryId]
      );
      console.log(`设置分类 ${categoryId} 的图标为 ${iconName}`);
    }
    
    console.log('所有操作完成');
  } catch (error) {
    console.error('添加icon字段失败:', error);
    throw error;
  }
}

// 执行迁移
if (require.main === module) {
  addIconFieldToCategories()
    .then(() => {
      console.log('迁移完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('迁移失败:', error);
      process.exit(1);
    });
}

export { addIconFieldToCategories };
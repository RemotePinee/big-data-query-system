import { pool } from '../config/database';

const cleanAndInsertTestOrders = async () => {
  try {
    console.log('开始清理订单数据...');
    
    // 删除所有订单
    await pool.execute('DELETE FROM orders');
    console.log('已删除所有订单数据');
    
    // 重置自增ID
    await pool.execute('ALTER TABLE orders AUTO_INCREMENT = 1');
    console.log('已重置订单ID自增');
    
    // 获取现有用户和查询项目
    const [users] = await pool.execute('SELECT id FROM users LIMIT 2');
    const [queryItems] = await pool.execute('SELECT id FROM query_items LIMIT 2');
    
    if ((users as any[]).length === 0 || (queryItems as any[]).length === 0) {
      console.log('没有找到用户或查询项目，跳过插入测试订单');
      return;
    }
    
    const userId1 = (users as any[])[0].id;
    const userId2 = (users as any[]).length > 1 ? (users as any[])[1].id : userId1;
    const queryItemId1 = (queryItems as any[])[0].id;
    const queryItemId2 = (queryItems as any[]).length > 1 ? (queryItems as any[])[1].id : queryItemId1;
    
    // 插入测试订单数据
    const testOrders = [
      {
        order_no: 'ORD' + Date.now() + '001',
        user_id: userId1,
        query_item_id: queryItemId1,
        amount: 10.00,
        status: 'paid',
        payment_method: 'wechat',
        query_params: JSON.stringify({ name: '张三', idCard: '110101199001011234' }),
        query_result: JSON.stringify({ name: '张三', status: '正常' }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        order_no: 'ORD' + Date.now() + '002',
        user_id: userId2,
        query_item_id: queryItemId2,
        amount: 20.00,
        status: 'pending',
        payment_method: null,
        query_params: JSON.stringify({ name: '李四', idCard: '310101199101011234' }),
        query_result: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    for (const order of testOrders) {
      await pool.execute(
        `INSERT INTO orders 
         (order_no, user_id, query_item_id, amount, status, payment_method, query_params, query_result, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order.order_no,
          order.user_id,
          order.query_item_id,
          order.amount,
          order.status,
          order.payment_method,
          order.query_params,
          order.query_result,
          order.created_at,
          order.updated_at
        ]
      );
    }
    
    console.log('已插入测试订单数据:');
    console.log('- 订单1: ORD' + Date.now() + '001 (已支付, 微信)');
    console.log('- 订单2: ORD' + Date.now() + '002 (未支付)');
    
    // 验证插入的数据
    const [orders] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC');
    console.log('当前订单数据:', orders);
    
  } catch (error) {
    console.error('清理订单数据失败:', error);
  }
};

export { cleanAndInsertTestOrders };
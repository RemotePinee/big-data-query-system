import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model';
import { UserModel } from '../models/user.model';
import { QueryItemModel } from '../models/query-item.model';

export class StatisticsController {
  // 获取用户统计数据
  static async getUserStats(req: Request, res: Response) {
    try {
      // 设置禁用缓存的响应头
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      // 获取所有用户
      const allUsers = await UserModel.findAll();
      
      // 计算活跃用户数（普通用户）
      const activeUsers = allUsers.filter(user => user.role === 'user').length;
      
      // 计算管理员用户数
      const adminUsers = allUsers.filter(user => user.role === 'admin').length;
      
      // 计算今日新增用户
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayUsers = allUsers.filter(user => {
        if (!user.createdAt) return false;
        const userDate = new Date(user.createdAt);
        userDate.setHours(0, 0, 0, 0);
        return userDate.getTime() === today.getTime();
      });
      
      console.log('用户统计数据:', {
        totalUsers: allUsers.length,
        activeUsers: activeUsers,
        adminUsers: adminUsers,
        todayNewUsers: todayUsers.length
      });
      
      res.json({
        code: 200,
        message: '获取用户统计数据成功',
        data: {
          totalUsers: allUsers.length,
          activeUsers: activeUsers,
          adminUsers: adminUsers,
          todayNewUsers: todayUsers.length
        }
      });
    } catch (error) {
      console.error('获取用户统计数据失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取用户统计数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // 获取订单统计数据
  static async getOrderStats(req: Request, res: Response) {
    try {
      // 设置禁用缓存的响应头
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      // 获取所有订单
      const allOrders = await OrderModel.findAll();
      
      // 计算总收入（已支付的订单）
      const paidOrders = allOrders.filter(order => 
        order.status === 'paid'
      );
      const totalRevenue = paidOrders.reduce((sum, order) => {
        const amount = parseFloat(String(order.amount || '0'));
        return sum + amount;
      }, 0);
      
      // 计算已完成订单数（已支付的订单）
      const completedOrders = allOrders.filter(order => order.status === 'paid').length;
      
      // 计算待处理订单数（待支付和已支付）
      const pendingOrders = allOrders.filter(order => 
        order.status === 'pending' || order.status === 'paid'
      ).length;
      
      // 计算今日订单数
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = allOrders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
      
      console.log('订单统计数据:', {
        totalOrders: allOrders.length,
        totalRevenue: totalRevenue,
        completedOrders: completedOrders,
        pendingOrders: pendingOrders,
        todayOrders: todayOrders.length
      });
      
      res.json({
        code: 200,
        message: '获取订单统计数据成功',
        data: {
          totalOrders: allOrders.length,
          totalRevenue: totalRevenue,
          completedOrders: completedOrders,
          pendingOrders: pendingOrders,
          todayOrders: todayOrders.length
        }
      });
    } catch (error) {
      console.error('获取订单统计数据失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取订单统计数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // 获取仪表盘统计数据
  static async getDashboardStats(req: Request, res: Response) {
    try {
      // 设置禁用缓存的响应头
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      // 获取所有订单
      const allOrders = await OrderModel.findAll();
      
      // 获取所有用户
      const allUsers = await UserModel.findAll();
      
      // 计算今日订单数
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = allOrders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      // 计算昨日数据用于趋势对比
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayOrders = allOrders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === yesterday.getTime();
      });

      // 计算上周同期数据用于趋势对比
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      // 计算本周新增用户（过去7天）
      const thisWeekUsers = allUsers.filter(user => {
        if (!user.createdAt) return false;
        const userDate = new Date(user.createdAt);
        return userDate.getTime() >= lastWeek.getTime();
      });

      // 计算上周新增用户（7-14天前）
      const twoWeeksAgo = new Date(lastWeek);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
      const lastWeekNewUsers = allUsers.filter(user => {
        if (!user.createdAt) return false;
        const userDate = new Date(user.createdAt);
        return userDate.getTime() >= twoWeeksAgo.getTime() && userDate.getTime() < lastWeek.getTime();
      });

      // 计算本周新增订单（过去7天）
      const thisWeekOrders = allOrders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.getTime() >= lastWeek.getTime();
      });

      // 计算上周新增订单（7-14天前）
      const lastWeekNewOrders = allOrders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.getTime() >= twoWeeksAgo.getTime() && orderDate.getTime() < lastWeek.getTime();
      });

      // 计算本周收入（过去7天的已支付订单）
      const thisWeekPaidOrders = thisWeekOrders.filter(order => order.status === 'paid' || order.status === 'completed');
      const thisWeekRevenue = thisWeekPaidOrders.reduce((sum, order) => sum + parseFloat(String(order.amount || '0')), 0);

      // 计算上周收入（7-14天前的已支付订单）
      const lastWeekPaidOrders = lastWeekNewOrders.filter(order => order.status === 'paid' || order.status === 'completed');
      const lastWeekRevenue = lastWeekPaidOrders.reduce((sum, order) => sum + parseFloat(String(order.amount || '0')), 0);
      
      // 计算总收入（已支付订单：包括paid和completed状态）
      const paidOrders = allOrders.filter(order => order.status === 'paid' || order.status === 'completed');
      
      console.log('所有订单状态统计:', {
        total: allOrders.length,
        pending: allOrders.filter(o => o.status === 'pending').length,
        paid: allOrders.filter(o => o.status === 'paid').length,
        processing: allOrders.filter(o => o.status === 'processing').length,
        completed: allOrders.filter(o => o.status === 'completed').length,
        failed: allOrders.filter(o => o.status === 'failed').length,
        cancelled: allOrders.filter(o => o.status === 'cancelled').length
      });
      
      console.log('已支付订单样本:', paidOrders.slice(0, 3).map(order => ({
        id: order.id,
        orderNo: order.orderNo,
        amount: order.amount,
        status: order.status,
        amountType: typeof order.amount
      })));
      
      const totalRevenue = paidOrders.reduce((sum, order) => {
        const amount = parseFloat(String(order.amount || '0'));
        console.log(`订单 ${order.orderNo}: amount=${order.amount}, parsed=${amount}`);
        return sum + amount;
      }, 0);
      
      // 计算今日收入（包括paid和completed状态）
      const todayPaidOrders = todayOrders.filter(order => order.status === 'paid' || order.status === 'completed');
      const todayRevenue = todayPaidOrders.reduce((sum, order) => sum + parseFloat(String(order.amount || '0')), 0);
      
      console.log('统计数据:', {
        totalUsers: allUsers.length,
        totalOrders: allOrders.length,
        totalRevenue: totalRevenue,
        todayOrders: todayOrders.length,
        todayRevenue: todayRevenue,
        paidOrdersCount: paidOrders.length,
        thisWeekUsers: thisWeekUsers.length,
        lastWeekNewUsers: lastWeekNewUsers.length,
        thisWeekOrders: thisWeekOrders.length,
        lastWeekNewOrders: lastWeekNewOrders.length,
        thisWeekRevenue: thisWeekRevenue,
        lastWeekRevenue: lastWeekRevenue
      });

      // 计算趋势数据
      const calculateTrend = (current: number, previous: number): { percentage: number, direction: 'up' | 'down' | 'stable' } => {
        if (previous === 0) {
          return { percentage: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'stable' };
        }
        const percentage = Math.round(((current - previous) / previous) * 100);
        return {
          percentage: Math.abs(percentage),
          direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable'
        };
      };

      // 计算各项趋势
      const userTrend = calculateTrend(thisWeekUsers.length, lastWeekNewUsers.length);
      const orderTrend = calculateTrend(thisWeekOrders.length, lastWeekNewOrders.length);
      const revenueTrend = calculateTrend(thisWeekRevenue, lastWeekRevenue);
      const todayOrderTrend = calculateTrend(todayOrders.length, yesterdayOrders.length);
      
      res.json({
        code: 200,
        message: '获取统计数据成功',
        data: {
          totalUsers: allUsers.length,
          totalOrders: allOrders.length,
          totalRevenue: totalRevenue,
          todayOrders: todayOrders.length,
          todayRevenue: todayRevenue,
          trends: {
            users: userTrend,
            orders: orderTrend,
            revenue: revenueTrend,
            todayOrders: todayOrderTrend
          }
        }
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取统计数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // 获取订单统计图表数据
  static async getOrderChartData(req: Request, res: Response) {
    try {
      // 设置禁用缓存的响应头
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      const { type = 'week' } = req.query;
      const allOrders = await OrderModel.findAll();
      
      let chartData;
      
      if (type === 'week') {
        // 获取最近7天的数据
        const dates = [];
        const orders = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          
          const dayOrders = allOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= date && orderDate < nextDate;
          });
          
          dates.push(date.toLocaleDateString('zh-CN', { weekday: 'short' }));
          orders.push(dayOrders.length);
        }
        
        chartData = { dates, orders };
      } else {
        // 获取最近4周的数据
        const dates = [];
        const orders = [];
        
        for (let i = 3; i >= 0; i--) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() - i * 7);
          endDate.setHours(23, 59, 59, 999);
          
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);
          
          const weekOrders = allOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate <= endDate;
          });
          
          dates.push(`第${4-i}周`);
          orders.push(weekOrders.length);
        }
        
        chartData = { dates, orders };
      }
      
      res.json({
        code: 200,
        message: '获取订单图表数据成功',
        data: chartData
      });
    } catch (error) {
      console.error('获取订单图表数据失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取订单图表数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // 获取收入统计图表数据
  static async getRevenueChartData(req: Request, res: Response) {
    try {
      // 设置禁用缓存的响应头
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      const { type = 'week' } = req.query;
      const allOrders = await OrderModel.findAll();
      const paidOrders = allOrders.filter(order => order.status === 'paid' || order.status === 'completed');
      
      let chartData;
      
      if (type === 'week') {
        // 获取最近7天的数据
        const dates = [];
        const revenue = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          
          const dayOrders = paidOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= date && orderDate < nextDate;
          });
          
          const dayRevenue = dayOrders.reduce((sum, order) => sum + parseFloat(String(order.amount || '0')), 0);
          
          dates.push(date.toLocaleDateString('zh-CN', { weekday: 'short' }));
          revenue.push(dayRevenue); // 保持原始分单位，前端会转换
        }
        
        chartData = { dates, revenue };
      } else {
        // 获取最近4周的数据
        const dates = [];
        const revenue = [];
        
        for (let i = 3; i >= 0; i--) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() - i * 7);
          endDate.setHours(23, 59, 59, 999);
          
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);
          
          const weekOrders = paidOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate <= endDate;
          });
          
          const weekRevenue = weekOrders.reduce((sum, order) => sum + parseFloat(String(order.amount || '0')), 0);
          
          dates.push(`第${4-i}周`);
          revenue.push(weekRevenue); // 保持原始分单位，前端会转换
        }
        
        chartData = { dates, revenue };
      }
      
      res.json({
        code: 200,
        message: '获取收入图表数据成功',
        data: chartData
      });
    } catch (error) {
      console.error('获取收入图表数据失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取收入图表数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  // 获取最近订单
  static async getRecentOrders(req: Request, res: Response) {
    try {
      // 设置禁用缓存的响应头
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      const { limit = 10 } = req.query;
      const allOrders = await OrderModel.findAll();
      
      // 按创建时间倒序排列，取最近的订单
      const recentOrders = allOrders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, Number(limit));
      
      // 格式化订单数据，并获取用户名和查询项目名称
      const formattedOrders = await Promise.all(recentOrders.map(async (order) => {
        // 获取用户信息
        const user = await UserModel.findById(order.userId);
        const username = user?.username || '未知用户';
        
        // 获取查询项目信息
        const queryItem = await QueryItemModel.findById(order.queryItemId);
        const queryItemName = queryItem?.name || '查询项目';
        
        // 根据订单状态和支付方式确定显示的支付方式
        let displayPaymentMethod = '未支付';
        if (order.status === 'paid') {
          // 如果订单已支付，但支付方式为空，显示为"未知支付方式"
          displayPaymentMethod = order.paymentMethod || '未知支付方式';
        } else if (order.paymentMethod) {
          // 如果有支付方式但未支付，显示实际的支付方式
          displayPaymentMethod = order.paymentMethod;
        }
        
        return {
          id: order.id,
          orderNo: order.orderNo,
          username: username,
          queryItemId: order.queryItemId,
          queryItemName: queryItemName,
          amount: order.amount || 0,
          paymentMethod: displayPaymentMethod,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        };
      }));
      
      res.json({
        code: 200,
        message: '获取最近订单成功',
        data: formattedOrders
      });
    } catch (error) {
      console.error('获取最近订单失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取最近订单失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}
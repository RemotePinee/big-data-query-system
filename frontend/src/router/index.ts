import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { isMobile } from '@/utils/device';
// 导入标题管理工具
import { setPageTitle } from '@/utils/title';

const routes: Array<RouteRecordRaw> = [
  // 桌面端路由
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },

  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/query',
    name: 'Query',
    component: () => import('../views/Query.vue'),
    meta: { title: '数据查询', requiresAuth: true }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { title: '关于我们' }
  },
  {
    path: '/support',
    name: 'Support',
    component: () => import('../views/Support.vue'),
    meta: { title: '技术支持' }
  },
  {
    path: '/legal',
    name: 'Legal',
    component: () => import('../views/Legal.vue'),
    meta: { title: '法律声明' }
  },
  {
    path: '/query-result/:orderId',
    name: 'QueryResult',
    component: () => import('../views/QueryResult.vue'),
    meta: { title: '查询结果', requiresAuth: true }
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('../views/User.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/payment-success',
    name: 'PaymentSuccess',
    component: () => import('../views/PaymentSuccess.vue'),
    meta: { title: '支付成功', requiresAuth: true }
  },
  {
    path: '/payment/success',
    name: 'PaymentSuccessCallback',
    redirect: to => {
      // 将支付回调重定向到统一的支付成功页面，保留查询参数
      return {
        name: 'PaymentSuccess',
        query: to.query
      }
    },
    meta: { title: '支付成功' }
  },
  {
    path: '/payment/result',
    name: 'PaymentResult',
    redirect: to => {
      // 将支付结果重定向到统一的支付成功页面，保留查询参数
      return {
        name: 'PaymentSuccess',
        query: to.query
      }
    },
    meta: { title: '支付结果' }
  },
  {
    path: '/payment/:orderNo',
    name: 'Payment',
    component: () => import('../views/Payment.vue'),
    meta: { title: '支付订单', requiresAuth: true }
  },

  // 移动端路由
  {
    path: '/mobile',
    name: 'MobileLayout',
    component: () => import('../views/mobile/Layout.vue'),
    meta: { title: '移动端首页' },
    children: [
      {
        path: '',
        name: 'MobileIndex',
        redirect: '/mobile/home'
      },
      {
        path: 'home',
        name: 'MobileHome',
        component: () => import('../views/mobile/Home.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'query',
        name: 'MobileQuery',
        component: () => import('../views/mobile/Query.vue'),
        meta: { title: '数据查询' }
      },
      {
        path: 'profile',
        name: 'MobileProfile',
        component: () => import('../views/mobile/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      },
      {
        path: 'login',
        name: 'MobileLogin',
        component: () => import('../views/mobile/Login.vue'),
        meta: { title: '登录' }
      },
      {
        path: 'register',
        name: 'MobileRegister',
        component: () => import('../views/mobile/Register.vue'),
        meta: { title: '注册' }
      },

      {
        path: 'my-orders',
        name: 'MobileMyOrders',
        component: () => import('../views/mobile/MyOrders.vue'),
        meta: { title: '我的订单', requiresAuth: true }
      },
      {
        path: 'profile-edit',
        name: 'MobileProfileEdit',
        component: () => import('../views/mobile/ProfileEdit.vue'),
        meta: { title: '编辑资料', requiresAuth: true }
      },
      {
        path: 'security-settings',
        name: 'MobileSecuritySettings',
        component: () => import('../views/mobile/SecuritySettings.vue'),
        meta: { title: '安全设置', requiresAuth: true }
      },
      {
        path: 'query-history',
        name: 'MobileQueryHistory',
        component: () => import('../views/mobile/QueryHistory.vue'),
        meta: { title: '查询记录', requiresAuth: true }
      },
      {
        path: 'result/:orderNo',
        name: 'MobileResult',
        component: () => import('../views/mobile/Result.vue'),
        meta: { title: '查询结果', requiresAuth: true }
      },
      {
        path: 'payment/:orderNo',
        name: 'MobilePayment',
        component: () => import('../views/mobile/Payment.vue'),
        meta: { title: '订单支付', requiresAuth: true }
      },
      {
        path: 'payment/:orderNo/pay',
        name: 'MobilePaymentPay',
        component: () => import('../views/mobile/PaymentPay.vue'),
        meta: { title: '微信支付' }
      },
      {
        path: 'payment-success/:orderNo',
        name: 'MobilePaymentSuccess',
        component: () => import('../views/mobile/PaymentSuccess.vue'),
        meta: { title: '支付成功', requiresAuth: true }
      },
      {
        path: 'payment-success',
        name: 'MobilePaymentSuccessNoParam',
        component: () => import('../views/mobile/PaymentSuccess.vue'),
        meta: { title: '支付成功', requiresAuth: true }
      }
    ]
  },

  // 管理后台登录页面
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/AdminLogin.vue'),
    meta: { title: '管理后台登录' }
  },
  // 管理后台路由
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('../views/admin/Layout.vue'),
    meta: { title: '管理后台', requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { title: '管理后台首页', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/Users.vue'),
        meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'query-items',
        name: 'AdminQueryItems',
        component: () => import('../views/admin/QueryItems.vue'),
        meta: { title: '查询项目管理', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'api-config',
        name: 'AdminApiConfig',
        component: () => import('../views/admin/ApiConfig.vue'),
        meta: { title: 'API配置管理', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'api-types',
        name: 'AdminApiTypes',
        component: () => import('../views/admin/ApiTypes.vue'),
        meta: { title: 'API类型管理', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'payment-config',
        name: 'AdminPaymentConfig',
        component: () => import('../views/admin/PaymentConfig.vue'),
        meta: { title: '支付配置管理', requiresAuth: true, requiresAdmin: true }
      },

      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/Orders.vue'),
        meta: { title: '订单管理', requiresAuth: true, requiresAdmin: true }
      },

      {
        path: 'query-categories',
        name: 'AdminQueryCategories',
        component: () => import('../views/admin/QueryCategories.vue'),
        meta: { title: '查询分类管理', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'test',
        name: 'AdminTest',
        component: () => import('../views/admin/Test.vue'),
        meta: { title: 'API测试', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'system-settings',
        name: 'AdminSystemSettings',
        component: () => import('../views/admin/SystemSettings.vue'),
        meta: { title: '系统设置', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'deletion-requests',
        name: 'AdminDeletionRequests',
        component: () => import('../views/admin/DeletionRequests.vue'),
        meta: { title: '注销申请审核', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'test-radio',
        name: 'AdminTestRadio',
        component: () => import('../views/admin/TestRadio.vue'),
        meta: { title: '单选按钮测试', requiresAuth: true, requiresAdmin: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局前置守卫
router.beforeEach((to, _from, next) => {
  // 使用优化的标题设置方法
  const title = (to.meta?.title as string) || '大数据查询系统';
  setPageTitle(title);
  
  // 检查是否是支付回调页面 - 更宽松的检测条件
  const isPaymentCallback = (to.path === '/payment/success' || to.path === '/payment-success' || to.path.startsWith('/mobile/payment-success')) && 
                           (to.query.orderNo || to.query.out_trade_no || to.query.trade_status || 
                            to.query.pid || to.query.trade_no || to.query.amount);
  
  if (isPaymentCallback) {
    console.log('支付回调检测到:', { path: to.path, query: to.query });
    
    // 对于支付回调，直接通过，不进行设备重定向
    // 这样可以避免重定向循环和路由问题
    next();
    return;
  }
  
  // 使用同步导入的设备检测工具
  const mobile = isMobile();
  const isMobilePath = to.path.startsWith('/mobile');
  const isAdminPath = to.path.startsWith('/admin');
  
  // 如果是移动端设备且不在移动端路径，且不是管理后台，则跳转到移动端
  if (mobile && !isMobilePath && !isAdminPath) {
    const mobileRouteMap: Record<string, string> = {
      '/': '/mobile',
      '/register': '/mobile/register',
      '/query': '/mobile/query',
      '/user': '/mobile/profile',
      '/payment': '/mobile/payment',
      '/payment/success': '/mobile/payment-success',
      '/payment-success': '/mobile/payment-success',
      '/query-result': '/mobile/result'
    };
    
    const mobilePath = mobileRouteMap[to.path] || '/mobile';
    next({ path: mobilePath, query: to.query });
    return;
  }
  
  // 如果是桌面端设备且在移动端路径，则跳转到桌面端
  if (!mobile && isMobilePath) {
    const desktopRouteMap: Record<string, string> = {
      '/mobile': '/',
      '/mobile/register': '/register',
      '/mobile/query': '/query',
      '/mobile/profile': '/user',
      '/mobile/payment-success': '/payment-success'
    };
    
    const desktopPath = desktopRouteMap[to.path] || '/';
    next({ path: desktopPath, query: to.query });
    return;
  }
  
  // 检查是否需要登录权限
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否已登录
    const token = localStorage.getItem('token');
    if (!token) {
      // 如果需要管理员权限，跳转到管理后台登录页面
      if (to.matched.some(record => record.meta.requiresAdmin)) {
        next({
          path: '/admin/login',
          query: { redirect: to.fullPath }
        });
      } else {
        // PC端用户未登录时跳转到首页，移动端跳转到移动端登录页面
        const redirectPath = mobile ? '/mobile/login' : '/';
        next({
          path: redirectPath,
          query: mobile ? { redirect: to.fullPath } : {}
        });
      }
    } else {
      // 检查是否需要管理员权限
      if (to.matched.some(record => record.meta.requiresAdmin)) {
        try {
          const userInfoStr = localStorage.getItem('userInfo');
          let userInfo: { role?: string } = {};
          
          if (userInfoStr && userInfoStr !== 'undefined' && userInfoStr !== 'null') {
            userInfo = JSON.parse(userInfoStr);
          }
          
          if (userInfo.role !== 'admin') {
            // 非管理员访问管理页面，跳转到管理后台登录页面
            next({ 
              path: '/admin/login',
              query: { redirect: to.fullPath }
            });
          } else {
            next();
          }
        } catch (error) {
          console.warn('解析用户信息失败，跳转到管理后台登录页面:', error);
          localStorage.removeItem('userInfo');
          next({ 
            path: '/admin/login',
            query: { redirect: to.fullPath }
          });
        }
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router;
<template>
  <div class="support-page">
    <!-- 导航栏 -->
    <ModernNavbar />
    
    <!-- 主要内容 -->
    <div class="support-container">
      <!-- 英雄区域 -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">服务支持</h1>
          <p class="hero-subtitle">为您提供全方位的帮助和支持服务</p>
        </div>
      </section>

      <!-- 导航菜单 -->
      <section class="nav-section">
        <div class="container">
          <div class="nav-menu">
            <a href="#help" class="nav-item" :class="{ active: activeSection === 'help' }" @click="scrollToSection('help')">
              <el-icon><Document /></el-icon>
              <span>帮助中心</span>
            </a>
            <a href="#faq" class="nav-item" :class="{ active: activeSection === 'faq' }" @click="scrollToSection('faq')">
              <el-icon><QuestionFilled /></el-icon>
              <span>常见问题</span>
            </a>
            <a href="#" class="nav-item" @click.prevent="showOnlineService">
              <el-icon><ChatDotRound /></el-icon>
              <span>联系我们</span>
            </a>
          </div>
        </div>
      </section>

      <!-- 帮助中心 -->
      <section id="help" class="help-section">
        <div class="container">
          <h2 class="section-title">帮助中心</h2>
          <div class="help-grid">
            <div class="help-category" v-for="category in helpCategories" :key="category.title">
              <div class="category-header">
                <div class="category-icon">
                  <component :is="category.icon" />
                </div>
                <h3 class="category-title">{{ category.title }}</h3>
              </div>
              <div class="category-content">
                <div class="help-item" v-for="item in category.items" :key="item.title">
                  <h4 class="help-title">{{ item.title }}</h4>
                  <p class="help-description">{{ item.description }}</p>
                  <div class="help-steps" v-if="item.steps">
                    <ol>
                      <li v-for="step in item.steps" :key="step">{{ step }}</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 常见问题 -->
      <section id="faq" class="faq-section">
        <div class="container">
          <h2 class="section-title">常见问题</h2>
          <div class="faq-list">
            <div class="faq-item" v-for="(faq, index) in faqs" :key="index">
              <div class="faq-question" @click="toggleFaq(index)">
                <h3>{{ faq.question }}</h3>
                <el-icon class="faq-icon" :class="{ 'is-active': faq.isOpen }">
                  <ArrowDown />
                </el-icon>
              </div>
              <div class="faq-answer" :class="{ 'is-open': faq.isOpen }">
                <div class="faq-content">
                  <p v-for="paragraph in faq.answer" :key="paragraph">{{ paragraph }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 联系支持 -->
      <section class="contact-support-section">
        <div class="container">
          <div class="contact-support-content">
            <h2 class="section-title">需要更多帮助？</h2>
            <p class="contact-description">如果您在使用过程中遇到其他问题，请随时联系我们的客服团队</p>
            <div class="contact-actions">
              <el-button type="primary" size="large" @click="showOnlineService">
                <el-icon><ChatDotRound /></el-icon>
                在线客服
              </el-button>
              <el-button size="large">
                <el-icon><Phone /></el-icon>
                {{ contactInfo.phone }}
              </el-button>
            </div>
            <div class="contact-info">
              <div class="contact-item">
                <el-icon><Timer /></el-icon>
                <span>服务时间：{{ contactInfo.workTime }}</span>
              </div>
              <div class="contact-item">
                <el-icon><Message /></el-icon>
                <span>邮箱：{{ contactInfo.email }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 在线客服弹窗 -->
    <OnlineServiceDialog v-model="onlineServiceVisible" />
  </div>
</template>

<script setup>
import { ref, computed, markRaw, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useSystemSettingsStore } from '@/stores/systemSettings';
import { 
  DataAnalysis, Document, QuestionFilled, ChatDotRound, Phone, Message, 
  Timer, ArrowDown, Share, Link, User, Lock, Search, CreditCard
} from '@element-plus/icons-vue';
import ModernNavbar from '@/components/ModernNavbar.vue';
import OnlineServiceDialog from '@/components/OnlineServiceDialog.vue';

// 路由
const route = useRoute();

// 系统设置store
const systemSettingsStore = useSystemSettingsStore();

// 响应式数据
const onlineServiceVisible = ref(false);
const activeSection = ref('help');

// 计算属性
const contactInfo = computed(() => systemSettingsStore.getContactInfo());

// 帮助分类数据
const helpCategories = ref([
  {
    title: '新手入门',
    icon: markRaw(User),
    items: [
      {
        title: '如何注册账户',
        description: '快速注册并开始使用我们的服务',
        steps: [
          '点击页面右上角的"注册"按钮',
          '填写手机号码并获取验证码',
          '设置登录密码',
          '完成注册并登录'
        ]
      },
      {
        title: '账户安全设置',
        description: '保护您的账户安全',
        steps: [
          '登录后进入个人中心',
          '点击"安全设置"',
          '绑定邮箱和手机号',
          '定期修改密码'
        ]
      }
    ]
  },
  {
    title: '查询服务',
    icon: markRaw(Search),
    items: [
      {
        title: '如何进行数据查询',
        description: '详细的查询操作指南',
        steps: [
          '登录账户后进入查询页面',
          '选择需要查询的服务类型',
          '填写准确的查询信息',
          '确认订单并完成支付',
          '查看查询结果'
        ]
      },
      {
        title: '查询结果说明',
        description: '了解查询结果的含义和使用方法',
        steps: [
          '查询完成后会收到通知',
          '在个人中心查看详细结果',
          '结果有效期为7天',
          '可下载PDF格式报告'
        ]
      }
    ]
  },
  {
    title: '支付相关',
    icon: markRaw(CreditCard),
    items: [
      {
          title: '支付方式',
          description: '支持多种安全便捷的支付方式',
          steps: [
            '微信支付：扫码或在线支付',
            '支付宝：扫码或在线支付',
            '银行卡：支持主流银行卡',
            '支付完成后自动开始查询'
          ]
        }
    ]
  },
  {
    title: '数据安全',
    icon: markRaw(Lock),
    items: [
      {
        title: '隐私保护',
        description: '我们如何保护您的个人信息',
        steps: [
          '采用银行级加密技术',
          '严格的数据访问控制',
          '定期安全审计和检测',
          '不会泄露或出售用户数据'
        ]
      },
      {
        title: '数据存储',
        description: '了解数据存储和管理政策',
        steps: [
          '查询数据加密存储',
          '定期备份确保数据安全',
          '用户可随时删除个人数据',
          '遵循相关法律法规要求'
        ]
      }
    ]
  }
]);

// 常见问题数据
const faqs = ref([
  {
    question: '注册时收不到验证码怎么办？',
    answer: [
      '请检查手机号码是否输入正确。',
      '确认手机信号良好，短信功能正常。',
      '查看是否被手机安全软件拦截。',
      '如仍无法收到，请联系客服获取帮助。'
    ],
    isOpen: false
  },
  {
    question: '查询需要多长时间？',
    answer: [
      '大部分查询在支付完成后1-3分钟内完成。',
      '复杂查询可能需要5-10分钟。',
      '如超过30分钟未出结果，请联系客服。',
      '查询完成后会通过短信和站内消息通知您。'
    ],
    isOpen: false
  },
  {
    question: '查询失败了怎么办？',
    answer: [
      '请检查输入的信息是否准确无误。',
      '确认查询的数据在系统中存在。',
      '如确认信息无误但查询失败，可申请退款。',
      '联系客服获取详细的失败原因和解决方案。'
    ],
    isOpen: false
  },
  {
    question: '如何保证查询数据的准确性？',
    answer: [
      '我们的数据来源于权威官方渠道。',
      '采用多重验证机制确保数据准确性。',
      '定期更新数据库保持信息时效性。',
      '如发现数据错误，我们会及时更正并通知用户。'
    ],
    isOpen: false
  },
  {
    question: '个人信息会被泄露吗？',
    answer: [
      '我们严格遵守相关法律法规保护用户隐私。',
      '采用银行级加密技术保护数据传输。',
      '严格的内部权限管理，限制数据访问。',
      '不会向第三方出售或泄露用户信息。'
    ],
    isOpen: false
  },

  {
    question: '查询结果有效期是多久？',
    answer: [
      '查询结果在个人中心保存7天。',
      '7天内可随时查看和下载。',
      '建议及时下载保存重要查询结果。',
      '如需延长保存期限，请联系客服。'
    ],
    isOpen: false
  },
  {
    question: '支持哪些支付方式？',
    answer: [
      '支持微信支付、支付宝支付。',
      '支持主流银行的借记卡和信用卡。',
      '所有支付渠道均采用安全加密技术。',
      '支付完成后会立即开始查询处理。'
    ],
    isOpen: false
  }
]);

// 方法
const showOnlineService = () => {
  onlineServiceVisible.value = true;
};

const scrollToSection = (sectionId) => {
  activeSection.value = sectionId;
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const toggleFaq = (index) => {
  faqs.value[index].isOpen = !faqs.value[index].isOpen;
};

// 页面初始化
onMounted(async () => {
  await systemSettingsStore.fetchSettings();
  
  // 检查URL hash，自动滚动到对应部分
  nextTick(() => {
    if (route.hash) {
      const sectionId = route.hash.replace('#', '');
      if (sectionId === 'faq' || sectionId === 'help') {
        scrollToSection(sectionId);
      }
    }
  });
});
</script>

<style scoped>
/* 基础样式 */
.support-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1a1a1a;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 英雄区域 */
.hero-section {
  padding: 120px 0 80px;
  text-align: center;
  background: #000000;
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.hero-subtitle {
  font-size: 1.3rem;
  opacity: 0.8;
  margin: 0;
  font-weight: 500;
}

/* 导航菜单 */
.nav-section {
  padding: 40px 0;
  background: #f8f9fa;
  border-bottom: 1px solid #e5e5e5;
}

.nav-menu {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  background: #ffffff;
  border-radius: 8px;
  color: #666666;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid #e5e5e5;
  font-weight: 500;
}

.nav-item:hover,
.nav-item.active {
  background: #1a1a1a;
  color: #ffffff;
  transform: translateY(-2px);
  border-color: #1a1a1a;
}

/* 帮助中心 */
.help-section {
  padding: 80px 0;
  background: #ffffff;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  text-align: center;
  color: #1a1a1a;
  letter-spacing: -0.02em;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 40px;
}

.help-category {
  background: #ffffff;
  border-radius: 8px;
  padding: 30px;
  border: 1px solid #e5e5e5;
  transition: all 0.3s ease;
}

.help-category:hover {
  border-color: #1a1a1a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e5e5;
}

.category-icon {
  font-size: 2rem;
  color: #1a1a1a;
}

.category-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.help-item {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.help-item:last-child {
  margin-bottom: 0;
}

.help-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #1a1a1a;
}

.help-description {
  font-size: 1rem;
  color: #666666;
  margin-bottom: 15px;
  line-height: 1.6;
  font-weight: 400;
}

.help-steps ol {
  margin: 0;
  padding-left: 20px;
}

.help-steps li {
  margin-bottom: 8px;
  color: #666666;
  line-height: 1.5;
  font-weight: 400;
}

/* 常见问题 */
.faq-section {
  padding: 80px 0;
  background: #f8f9fa;
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e5e5e5;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item:hover {
  border-color: #1a1a1a;
}

.faq-question {
  padding: 25px 30px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
}

.faq-question:hover {
  background: #f8f9fa;
}

.faq-question h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

.faq-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
  color: #666666;
}

.faq-icon.is-active {
  transform: rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.faq-answer.is-open {
  max-height: 500px;
}

.faq-content {
  padding: 0 30px 25px;
  background: #f8f9fa;
}

.faq-content p {
  margin-bottom: 10px;
  color: #666666;
  line-height: 1.6;
  font-weight: 400;
}

.faq-content p:last-child {
  margin-bottom: 0;
}

/* 联系支持 */
.contact-support-section {
  padding: 80px 0;
  text-align: center;
  background: #000000;
  color: #ffffff;
}

.contact-support-content {
  max-width: 600px;
  margin: 0 auto;
}

.contact-support-section .section-title {
  color: #ffffff;
}

.contact-description {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 40px;
  line-height: 1.6;
  font-weight: 400;
}

.contact-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
}

.contact-info {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 400;
}

/* 页脚 */
.footer {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 60px 0 30px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
  margin-bottom: 40px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.footer-links-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #ffffff;
}

.footer-link {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  margin-bottom: 12px;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #ffffff;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-copyright {
  color: #999999;
  font-size: 13px;
  letter-spacing: 0.3px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-icp {
  color: #888888;
  font-size: 12px;
  opacity: 0.8;
}

.footer-social {
  display: flex;
  gap: 15px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #cccccc;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .nav-menu {
    gap: 20px;
  }
  
  .help-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .nav-menu {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .contact-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .contact-info {
    flex-direction: column;
    gap: 20px;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
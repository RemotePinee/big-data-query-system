<template>
  <div class="about-page">
    <!-- 导航栏 -->
    <ModernNavbar />
    
    <!-- 主要内容 -->
    <div class="about-container">
      <!-- 英雄区域 -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">关于我们</h1>
          <p class="hero-subtitle">专业、安全、高效的大数据查询服务平台</p>
        </div>
      </section>

      <!-- 公司介绍 -->
      <section class="company-intro">
        <div class="container">
          <div class="intro-content">
            <div class="intro-text">
              <h2 class="section-title">系统介绍</h2>
              <p class="intro-description">
                {{ systemSettingsStore.settings.systemName }}是一个专业的大数据查询平台，致力于为用户提供准确、及时、安全的数据查询服务。系统采用先进的技术架构和完善的数据安全保障体系，确保每一次查询都能为用户带来准确可靠的结果。
              </p>
              <p class="intro-description">
                平台始终坚持"数据驱动价值，服务创造未来"的理念，不断优化系统功能，提升查询体验，已为数万用户提供了高效便捷的数据查询服务，是您值得信赖的数据查询助手。
              </p>
            </div>
            <div class="intro-image">
              <div class="image-placeholder">
                <el-icon :size="80"><DataAnalysis /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 核心优势 -->
      <section class="advantages-section">
        <div class="container">
          <h2 class="section-title">核心优势</h2>
          <div class="advantages-grid">
            <div class="advantage-card" v-for="advantage in advantages" :key="advantage.title">
              <div class="advantage-icon">
                <el-icon><component :is="advantage.icon" /></el-icon>
              </div>
              <h3 class="advantage-title">{{ advantage.title }}</h3>
              <p class="advantage-description">{{ advantage.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 服务理念 -->
      <section class="philosophy-section">
        <div class="container">
          <div class="philosophy-content">
            <h2 class="section-title">服务理念</h2>
            <div class="philosophy-grid">
              <div class="philosophy-item">
                <div class="philosophy-icon">
                  <el-icon><Lock /></el-icon>
                </div>
                <h3>安全第一</h3>
                <p>采用银行级安全标准，全程加密传输，确保用户数据安全</p>
              </div>
              <div class="philosophy-item">
                <div class="philosophy-icon">
                  <el-icon><Star /></el-icon>
                </div>
                <h3>品质至上</h3>
                <p>严格的数据质量控制，确保查询结果的准确性和时效性</p>
              </div>
              <div class="philosophy-item">
                <div class="philosophy-icon">
                  <el-icon><User /></el-icon>
                </div>
                <h3>用户为本</h3>
                <p>以用户需求为导向，持续优化产品体验和服务质量</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 联系我们 -->
      <section class="contact-section">
        <div class="container">
          <h2 class="section-title">联系我们</h2>
          <div class="contact-grid">
            <div class="contact-item">
              <div class="contact-icon">
                <el-icon><Phone /></el-icon>
              </div>
              <div class="contact-info">
                <h3>客服热线</h3>
                <p>{{ contactInfo.phone }}</p>
                <span class="contact-time">{{ contactInfo.workTime }}</span>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">
                <el-icon><Message /></el-icon>
              </div>
              <div class="contact-info">
                <h3>邮箱地址</h3>
                <p>{{ contactInfo.email }}</p>
                <span class="contact-time">24小时内回复</span>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">
                <el-icon><Location /></el-icon>
              </div>
              <div class="contact-info">
                <h3>公司地址</h3>
                <p>{{ contactInfo.address }}</p>
                <span class="contact-time">欢迎实地考察</span>
              </div>
            </div>
          </div>
          
          <!-- FAQ部分 -->
          <div class="faq-section">
            <div class="faq-header">
              <h3>常见问题</h3>
              <p>为您解答关于我们服务的疑问</p>
            </div>
            
            <div class="faq-grid">
              <div class="faq-item" v-for="(faq, index) in faqList" :key="index">
                <div class="faq-question" @click="toggleFaq(index)">
                  <div class="question-content">
                    <div class="question-icon">
                      <i :class="faq.icon"></i>
                    </div>
                    <div class="question-text">
                      <h4>{{ faq.question }}</h4>
                    </div>
                  </div>
                  <div class="expand-icon" :class="{ 'expanded': faq.expanded }">
                    <i class="fas fa-chevron-down"></i>
                  </div>
                </div>
                <div class="faq-answer" :class="{ 'expanded': faq.expanded }">
                  <div class="answer-content">
                    <p v-html="faq.answer"></p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="faq-footer">
              <div class="contact-info-section">
                <h4>还有其他问题？</h4>
                <p>我们的客服团队随时为您提供帮助</p>
                <div class="contact-methods">
                  <div class="contact-method">
                    <i class="fas fa-phone"></i>
                    <span>{{ contactInfo.phone }}</span>
                  </div>
                  <div class="contact-method">
                    <i class="fas fa-clock"></i>
                    <span>{{ contactInfo.workTime }}</span>
                  </div>
                  <div class="contact-method">
                    <i class="fas fa-envelope"></i>
                    <span>{{ contactInfo.email }}</span>
                  </div>
                  <div class="contact-method contact-service" @click="showOnlineService">
                    <i class="fas fa-comments"></i>
                    <span>在线客服</span>
                    <i class="fas fa-external-link-alt contact-link-icon"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <el-icon :size="24"><DataAnalysis /></el-icon>
            <span>{{ systemSettingsStore.settings.systemName }}</span>
          </div>
          
          <div class="footer-links">
            <div class="footer-links-group">
              <h4 class="footer-links-title">快速链接</h4>
              <router-link to="/" class="footer-link">首页</router-link>
              <router-link to="/query" class="footer-link">数据查询</router-link>
              <router-link to="/about" class="footer-link">关于我们</router-link>
            </div>
            
            <div class="footer-links-group">
              <h4 class="footer-links-title">服务支持</h4>
              <router-link to="/support" class="footer-link">帮助中心</router-link>
              <router-link to="/support#faq" class="footer-link">常见问题</router-link>
              <a href="#" @click.prevent="showOnlineService" class="footer-link">联系我们</a>
            </div>
            
            <div class="footer-links-group">
              <h4 class="footer-links-title">法律信息</h4>
              <router-link to="/legal#terms" class="footer-link">服务条款</router-link>
              <router-link to="/legal#privacy" class="footer-link">隐私政策</router-link>
              <router-link to="/legal#disclaimer" class="footer-link">免责声明</router-link>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <div class="footer-copyright">
            <div>© {{ new Date().getFullYear() }} {{ systemSettingsStore.settings.copyright }}</div>
            <div v-if="systemSettingsStore.settings.icp" class="footer-icp">
              {{ systemSettingsStore.settings.icp }}
            </div>
          </div>
          <div class="footer-social">
            <a href="#" class="social-link"><el-icon><ChatDotRound /></el-icon></a>
            <a href="#" class="social-link"><el-icon><Share /></el-icon></a>
            <a href="#" class="social-link"><el-icon><Link /></el-icon></a>
          </div>
        </div>
      </div>
    </footer>

    <!-- 在线客服弹窗 -->
    <OnlineServiceDialog v-model="onlineServiceVisible" />
  </div>
</template>

<script setup>
import { ref, computed, markRaw, onMounted } from 'vue';
import { useSystemSettingsStore } from '@/stores/systemSettings';
import { 
  DataAnalysis, Star, User, Phone, Message, Location, 
  ChatDotRound, Share, Link, Lock, Timer, Connection
} from '@element-plus/icons-vue';
import ModernNavbar from '@/components/ModernNavbar.vue';
import OnlineServiceDialog from '@/components/OnlineServiceDialog.vue';

// 系统设置store
const systemSettingsStore = useSystemSettingsStore();

// 在线客服弹窗
const onlineServiceVisible = ref(false);

// 计算属性
const contactInfo = computed(() => systemSettingsStore.getContactInfo());

// 核心优势数据
const advantages = ref([
  {
    title: '数据准确可靠',
    description: '数据来源权威渠道，确保信息准确性和时效性',
    icon: markRaw(DataAnalysis)
  },
  {
    title: '安全保障',
    description: '全程加密传输，多重安全防护，保障数据安全',
    icon: markRaw(Lock)
  },
  {
    title: '快速响应',
    description: '查询结果秒级返回，高效便捷的服务体验',
    icon: markRaw(Timer)
  },
  {
    title: '专业服务',
    description: '专业的技术团队，提供7×24小时技术支持',
    icon: markRaw(Connection)
  },
  {
    title: '用户至上',
    description: '以用户需求为导向，持续优化产品体验',
    icon: markRaw(User)
  },
  {
    title: '品质保证',
    description: '严格的质量控制体系，确保服务品质稳定',
    icon: markRaw(Star)
  }
]);

// FAQ数据
const faqList = ref([
  {
    question: '你们的数据来源是什么？',
    answer: '我们的数据来源于<strong>权威官方渠道</strong>，确保数据的准确性和时效性。所有数据都经过严格的验证和审核流程。',
    icon: 'fas fa-database',
    expanded: false
  },
  {
    question: '如何保障数据安全？',
    answer: '我们采用<strong>银行级安全标准</strong>，全程加密传输，多重安全防护，严格遵守隐私保护规定，确保您的信息安全。',
    icon: 'fas fa-shield-alt',
    expanded: false
  },
  {
    question: '服务覆盖哪些地区？',
    answer: '我们的服务覆盖<strong>全国各省市</strong>，提供统一标准的数据查询服务，确保服务质量的一致性。',
    icon: 'fas fa-map-marked-alt',
    expanded: false
  },
  {
    question: '技术支持时间？',
    answer: '我们提供<strong>7×24小时技术支持</strong>，专业的技术团队随时为您解决问题，确保服务的连续性。',
    icon: 'fas fa-headset',
    expanded: false
  }
]);

// 方法
const showOnlineService = () => {
  console.log('=== 在线客服按钮被点击 ===');
  console.log('点击前弹窗状态:', onlineServiceVisible.value);
  onlineServiceVisible.value = true;
  console.log('点击后弹窗状态:', onlineServiceVisible.value);
  console.log('=== 在线客服事件处理完成 ===');
};

const toggleFaq = (index) => {
  faqList.value[index].expanded = !faqList.value[index].expanded;
};

// 页面初始化
onMounted(async () => {
  await systemSettingsStore.fetchSettings();
});
</script>

<style scoped>
/* 基础样式 */
.about-page {
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
  min-height: 330px;
  height: 330px;
  padding: 80px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #000000;
  color: #ffffff;
  box-sizing: border-box;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 500;
}

/* 公司介绍 */
.company-intro {
  padding: 80px 0;
  background: #f8f9fa;
}

.intro-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 60px;
  align-items: center;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #1a1a1a;
  letter-spacing: -0.02em;
}

.intro-description {
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  color: #666666;
  font-weight: 500;
}

.intro-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-placeholder {
  width: 200px;
  height: 200px;
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e5e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 核心优势 */
.advantages-section {
  padding: 80px 0;
  background: #ffffff;
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 50px;
}

.advantage-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 25px 15px;
  text-align: center;
  border: 1px solid #e5e5e5;
  transition: all 0.3s ease;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
}

.advantage-card:hover {
  transform: translateY(-4px);
  border-color: #1a1a1a;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.advantage-icon {
    margin-bottom: 12px;
    color: #1a1a1a;
    max-width: 100%;
    overflow: hidden;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .advantage-icon .el-icon {
    font-size: 2rem;
    width: 2rem;
    height: 2rem;
  }

.advantage-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: #1a1a1a;
}

.advantage-description {
  font-size: 0.8rem;
  line-height: 1.4;
  color: #666666;
  margin: 0;
  font-weight: 500;
}

/* 服务理念 */
.philosophy-section {
  padding: 80px 0;
  background: #f8f9fa;
}

.philosophy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-top: 50px;
}

.philosophy-item {
  text-align: center;
  padding: 30px;
}

.philosophy-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #1a1a1a;
}

.philosophy-item h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #1a1a1a;
}

.philosophy-item p {
  font-size: 1rem;
  line-height: 1.6;
  color: #666666;
  margin: 0;
  font-weight: 500;
}

/* 联系我们 */
.contact-section {
  padding: 80px 0;
  background: #ffffff;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 50px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background: #ffffff;
  border-radius: 8px;
  padding: 30px;
  border: 1px solid #e5e5e5;
  transition: all 0.3s ease;
}

.contact-item:hover {
  border-color: #1a1a1a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.contact-icon {
  font-size: 2rem;
  color: #1a1a1a;
  margin-top: 5px;
}

.contact-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #1a1a1a;
}

.contact-info p {
  font-size: 1.1rem;
  margin-bottom: 5px;
  color: #1a1a1a;
  font-weight: 500;
}

.contact-time {
  font-size: 0.9rem;
  color: #666666;
  font-weight: 500;
}

/* FAQ部分 */
.faq-section {
  margin-top: 60px;
  padding: 40px 0;
  border-top: 1px solid #e5e5e5;
}

.faq-header {
  text-align: center;
  margin-bottom: 40px;
}

.faq-header h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 10px;
  letter-spacing: -0.02em;
}

.faq-header p {
  color: #666666;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

.faq-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 40px;
}

.faq-item {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item:hover {
  border-color: #1a1a1a;
}

.faq-question {
  padding: 20px 24px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  transition: background-color 0.3s ease;
}

.faq-question:hover {
  background: #f8f9fa;
}

.question-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.question-icon {
  color: #1a1a1a;
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.question-text h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.expand-icon {
  color: #666666;
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: #f8f9fa;
}

.faq-answer.expanded {
  max-height: 200px;
}

.answer-content {
  padding: 20px 24px 24px 64px;
}

.answer-content p {
  color: #666666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
}

.faq-footer {
  text-align: center;
  padding: 40px 0;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 40px;
}

.contact-info-section h4 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 10px;
}

.contact-info-section p {
  color: #666666;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 30px;
}

.contact-methods {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666666;
  font-size: 0.95rem;
  font-weight: 500;
}

.contact-method i {
  color: #1a1a1a;
  width: 16px;
  text-align: center;
}

.contact-service {
  cursor: pointer;
  color: #409eff;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.contact-service:hover {
  color: #ffffff;
  background: #409eff;
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.contact-link-icon {
  font-size: 0.8rem;
  opacity: 0.6;
}

/* 页脚 */
.footer {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #ffffff;
  border-top: 1px solid #333333;
  padding: 60px 0 30px;
  position: relative;
  overflow: hidden;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #666, transparent);
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
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.footer-logo .el-icon {
  color: #ffffff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.footer-links-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #ffffff;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.footer-link {
  display: block;
  color: #cccccc;
  text-decoration: none;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  font-size: 14px;
  position: relative;
}

.footer-link:hover {
  color: #ffffff;
  transform: translateX(4px);
}

.footer-link::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 1px;
  background: #ffffff;
  transition: width 0.3s ease;
}

.footer-link:hover::before {
  width: 4px;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  border-top: 1px solid #333333;
  position: relative;
}

.footer-bottom::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #555, transparent);
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
  
  .intro-content {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
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
  
  .advantages-grid {
    grid-template-columns: 1fr;
  }
  
  .philosophy-grid {
    grid-template-columns: 1fr;
  }
  
  .contact-grid {
    grid-template-columns: 1fr;
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
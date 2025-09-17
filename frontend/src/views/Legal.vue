<template>
  <div class="legal-page">
    <!-- 导航栏 -->
    <ModernNavbar />
    
    <!-- 主要内容 -->
    <div class="legal-container">
      <!-- 英雄区域 -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">法律信息</h1>
          <p class="hero-subtitle">了解我们的服务条款、隐私政策和相关法律声明</p>
        </div>
      </section>

      <!-- 导航菜单 -->
      <section class="nav-section">
        <div class="container">
          <div class="nav-menu">
            <a href="#terms" class="nav-item" :class="{ active: activeSection === 'terms' }" @click="scrollToSection('terms')">
              <el-icon><Document /></el-icon>
              <span>服务条款</span>
            </a>
            <a href="#privacy" class="nav-item" :class="{ active: activeSection === 'privacy' }" @click="scrollToSection('privacy')">
              <el-icon><Lock /></el-icon>
              <span>隐私政策</span>
            </a>
            <a href="#disclaimer" class="nav-item" :class="{ active: activeSection === 'disclaimer' }" @click="scrollToSection('disclaimer')">
              <el-icon><Warning /></el-icon>
              <span>免责声明</span>
            </a>
          </div>
        </div>
      </section>

      <!-- 服务条款 -->
      <section id="terms" class="terms-section">
        <div class="container">
          <h2 class="section-title">服务条款</h2>
          <div class="legal-content">
            <div class="legal-item">
              <h3 class="legal-subtitle">1. 服务说明</h3>
              <div class="legal-text">
                <p>本平台为用户提供数据查询服务，包括但不限于个人信息查询、企业信息查询等服务。用户在使用本服务前，应仔细阅读并同意本服务条款的所有内容。</p>
                <p>我们保留随时修改或更新本服务条款的权利，修改后的条款将在网站上公布，用户继续使用服务即视为同意修改后的条款。</p>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">2. 用户责任</h3>
              <div class="legal-text">
                <p>用户在使用本服务时，应当：</p>
                <ul>
                  <li>提供真实、准确、完整的个人信息</li>
                  <li>妥善保管账户信息，不得将账户借给他人使用</li>
                  <li>遵守相关法律法规，不得利用本服务从事违法活动</li>
                  <li>尊重他人隐私，不得恶意查询他人信息</li>
                  <li>按照约定支付服务费用</li>
                </ul>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">3. 服务限制</h3>
              <div class="legal-text">
                <p>为保护用户隐私和维护服务秩序，我们对服务使用设置以下限制：</p>
                <ul>
                  <li>每个用户每日查询次数有限制</li>
                  <li>禁止批量查询或使用自动化工具</li>
                  <li>禁止恶意查询或骚扰他人</li>
                  <li>我们有权拒绝提供服务或终止用户账户</li>
                </ul>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">4. 知识产权</h3>
              <div class="legal-text">
                <p>本平台的所有内容，包括但不限于文字、图片、音频、视频、软件、程序、版面设计等，均受知识产权法保护。未经授权，任何人不得复制、传播、展示、镜像、上传、下载使用。</p>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">5. 费用与支付</h3>
              <div class="legal-text">
                <p>用户使用付费服务需要支付相应费用，费用标准以平台公示为准。支付完成后，服务立即生效。如因系统故障导致服务无法提供，我们将提供相应的技术支持。</p>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">6. 服务变更与终止</h3>
              <div class="legal-text">
                <p>我们保留随时修改、暂停或终止服务的权利。如因不可抗力或其他原因需要暂停服务，我们将提前通知用户。服务终止时，用户的相关权利义务不因此免除。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 隐私政策 -->
      <section id="privacy" class="privacy-section">
        <div class="container">
          <h2 class="section-title">隐私政策</h2>
          <div class="legal-content">
            <div class="legal-item">
              <h3 class="legal-subtitle">1. 信息收集</h3>
              <div class="legal-text">
                <p>我们收集的信息类型包括：</p>
                <ul>
                  <li>注册信息：手机号码、邮箱地址等</li>
                  <li>身份信息：为提供查询服务所需的身份验证信息</li>
                  <li>使用信息：访问日志、查询记录、支付记录等</li>
                  <li>设备信息：IP地址、浏览器类型、操作系统等</li>
                </ul>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">2. 信息使用</h3>
              <div class="legal-text">
                <p>我们使用收集的信息用于：</p>
                <ul>
                  <li>提供和改进我们的服务</li>
                  <li>验证用户身份，防止欺诈行为</li>
                  <li>处理支付和提供客户支持</li>
                  <li>发送服务相关通知</li>
                  <li>遵守法律法规要求</li>
                </ul>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">3. 信息保护</h3>
              <div class="legal-text">
                <p>我们采取多种安全措施保护您的个人信息：</p>
                <ul>
                  <li>使用SSL加密技术保护数据传输</li>
                  <li>采用防火墙和入侵检测系统</li>
                  <li>严格的员工访问控制和培训</li>
                  <li>定期安全审计和漏洞扫描</li>
                  <li>数据备份和灾难恢复机制</li>
                </ul>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">4. 信息共享</h3>
              <div class="legal-text">
                <p>我们不会出售、出租或以其他方式披露您的个人信息，除非：</p>
                <ul>
                  <li>获得您的明确同意</li>
                  <li>法律法规要求</li>
                  <li>保护我们的合法权益</li>
                  <li>与可信的第三方服务提供商合作（在严格保密协议下）</li>
                </ul>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">5. 用户权利</h3>
              <div class="legal-text">
                <p>您对个人信息享有以下权利：</p>
                <ul>
                  <li>查询和获取您的个人信息</li>
                  <li>更正不准确的个人信息</li>
                  <li>删除您的个人信息</li>
                  <li>限制或反对信息处理</li>
                  <li>数据可携带权</li>
                </ul>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">6. Cookie使用</h3>
              <div class="legal-text">
                <p>我们使用Cookie和类似技术来改善用户体验，包括记住登录状态、分析网站使用情况等。您可以通过浏览器设置控制Cookie的使用。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 免责声明 -->
      <section id="disclaimer" class="disclaimer-section">
        <div class="container">
          <h2 class="section-title">免责声明</h2>
          <div class="legal-content">
            <div class="legal-item">
              <h3 class="legal-subtitle">1. 服务性质</h3>
              <div class="legal-text">
                <p>本平台提供的查询服务仅供参考，不构成任何法律建议或保证。用户应当根据自己的判断和需要使用查询结果，并承担相应的风险和责任。</p>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">2. 数据准确性</h3>
              <div class="legal-text">
                <p>虽然我们努力确保数据的准确性和时效性，但由于数据来源的复杂性和更新的时间差，我们不能保证所有信息的绝对准确性。用户在使用查询结果时应当谨慎核实。</p>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">3. 服务可用性</h3>
              <div class="legal-text">
                <p>我们努力保证服务的连续性和稳定性，但不排除因以下原因导致的服务中断：</p>
                <ul>
                  <li>系统维护和升级</li>
                  <li>网络故障或通信中断</li>
                  <li>不可抗力因素</li>
                  <li>第三方服务提供商的问题</li>
                  <li>政府政策或法规变化</li>
                </ul>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">4. 责任限制</h3>
              <div class="legal-text">
                <p>在法律允许的最大范围内，我们对以下情况不承担责任：</p>
                <ul>
                  <li>因使用或无法使用本服务而导致的任何损失</li>
                  <li>第三方的行为或疏忽</li>
                  <li>数据传输过程中的错误或遗漏</li>
                  <li>用户设备或软件的问题</li>
                  <li>不可预见的技术问题</li>
                </ul>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">5. 第三方链接</h3>
              <div class="legal-text">
                <p>本平台可能包含指向第三方网站的链接，这些链接仅为方便用户而提供。我们不对第三方网站的内容、隐私政策或做法负责，用户访问第三方网站的风险由用户自行承担。</p>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">6. 争议解决</h3>
              <div class="legal-text">
                <p>因使用本服务产生的争议，双方应首先通过友好协商解决。协商不成的，任何一方均可向本公司所在地有管辖权的人民法院提起诉讼。</p>
              </div>
            </div>

            <div class="legal-item">
              <h3 class="legal-subtitle">7. 法律适用</h3>
              <div class="legal-text">
                <p>本声明的解释、效力及争议的解决均适用中华人民共和国法律。如本声明的任何条款被认定为无效或不可执行，其余条款仍然有效。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ部分 -->
      <section class="faq-section">
        <div class="container">
          <h2 class="section-title">常见问题</h2>
          <div class="faq-grid">
            <div 
              v-for="(faq, index) in faqList" 
              :key="index"
              class="faq-item"
              @click="toggleFaq(index)"
            >
              <div class="faq-question">
                <el-icon class="faq-icon">
                  <component :is="faq.icon" />
                </el-icon>
                <span class="faq-title">{{ faq.question }}</span>
                <el-icon class="faq-toggle" :class="{ 'expanded': faq.expanded }">
                  <ArrowDown />
                </el-icon>
              </div>
              <div class="faq-answer" v-show="faq.expanded">
                <p>{{ faq.answer }}</p>
              </div>
            </div>
          </div>

          <!-- 联系信息 -->
          <div class="contact-info">
            <h3 class="contact-title">需要更多帮助？</h3>
            <div class="contact-methods">
              <div class="contact-method">
                <el-icon><Phone /></el-icon>
                <div class="contact-details">
                  <div class="contact-label">客服热线</div>
                  <div class="contact-value">{{ contactInfo.phone }}</div>
                  <div class="contact-time">工作时间：{{ contactInfo.workTime }}</div>
                </div>
              </div>
              <div class="contact-method">
                <el-icon><Message /></el-icon>
                <div class="contact-details">
                  <div class="contact-label">邮箱咨询</div>
                  <div class="contact-value">{{ contactInfo.email }}</div>
                </div>
              </div>
              <div class="contact-method" @click="showOnlineService">
                <el-icon><ChatDotRound /></el-icon>
                <div class="contact-details">
                  <div class="contact-label">在线客服</div>
                  <div class="contact-value">点击开始对话</div>
                </div>
              </div>
            </div>
          </div>

          <div class="update-info">
            <p><strong>最后更新时间：</strong>{{ lastUpdateDate }}</p>
            <p><strong>生效时间：</strong>{{ effectiveDate }}</p>
          </div>
        </div>
      </section>
    </div>

    <!-- 在线客服弹窗 -->
    <OnlineServiceDialog 
      v-model:visible="onlineServiceVisible"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useSystemSettingsStore } from '@/stores/systemSettings';
import { 
  DataAnalysis, Document, Lock, Warning, ChatDotRound, Message, Share, Link,
  ArrowDown, Phone, QuestionFilled, InfoFilled
} from '@element-plus/icons-vue';
import ModernNavbar from '@/components/ModernNavbar.vue';
import OnlineServiceDialog from '@/components/OnlineServiceDialog.vue';

// 路由
const route = useRoute();

// 系统设置store
const systemSettingsStore = useSystemSettingsStore();

// 响应式数据
const onlineServiceVisible = ref(false);
const activeSection = ref('terms');

// FAQ数据
const faqList = ref([
  {
    question: '如何理解服务条款？',
    answer: '服务条款是您与我们之间的法律协议，规定了使用我们服务的权利和义务。建议您仔细阅读并理解所有条款内容。',
    icon: Document,
    expanded: false
  },
  {
    question: '个人信息如何被保护？',
    answer: '我们采用多层安全措施保护您的个人信息，包括SSL加密、防火墙保护、严格的访问控制等，确保您的隐私安全。',
    icon: Lock,
    expanded: false
  },
  {
    question: '服务中断时如何处理？',
    answer: '如遇服务中断，我们会尽快恢复服务并通过官方渠道通知用户。对于因系统维护导致的计划性中断，我们会提前公告。',
    icon: Warning,
    expanded: false
  },
  {
    question: '如何联系客服？',
    answer: '您可以通过在线客服、客服热线或邮箱联系我们。我们的客服团队将为您提供专业的帮助和支持。',
    icon: QuestionFilled,
    expanded: false
  },
  {
    question: '条款更新如何通知？',
    answer: '当我们更新法律条款时，会在网站显著位置发布公告，并通过邮件或站内消息通知注册用户。',
    icon: InfoFilled,
    expanded: false
  },
  {
    question: '争议如何解决？',
    answer: '如有争议，我们建议首先通过友好协商解决。协商不成的，可通过法律途径解决，适用中华人民共和国法律。',
    icon: Lock,
    expanded: false
  }
]);

// 计算属性
const contactInfo = computed(() => systemSettingsStore.getContactInfo());
const lastUpdateDate = ref('2024年1月1日');
const effectiveDate = ref('2024年1月1日');

// 方法
const showOnlineService = () => {
  onlineServiceVisible.value = true;
};

const toggleFaq = (index) => {
  faqList.value[index].expanded = !faqList.value[index].expanded;
};

const scrollToSection = (sectionId) => {
  activeSection.value = sectionId;
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// 页面初始化
onMounted(async () => {
  await systemSettingsStore.fetchSettings();
  
  // 检查URL hash，自动滚动到对应部分
  nextTick(() => {
    if (route.hash) {
      const sectionId = route.hash.replace('#', '');
      if (['terms', 'privacy', 'disclaimer'].includes(sectionId)) {
        scrollToSection(sectionId);
      }
    }
  });
});
</script>

<style scoped>
/* 基础样式 */
.legal-page {
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
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 300;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.8;
  margin: 0;
  font-weight: 300;
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
  font-weight: 300;
}

.nav-item:hover,
.nav-item.active {
  background: #1a1a1a;
  color: #ffffff;
  transform: translateY(-2px);
  border-color: #1a1a1a;
}

/* 法律内容通用样式 */
.terms-section,
.privacy-section,
.disclaimer-section {
  padding: 80px 0;
}

.terms-section {
  background: #ffffff;
}

.privacy-section {
  background: #f8f9fa;
}

.disclaimer-section {
  background: #ffffff;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 3rem;
  text-align: center;
  color: #1a1a1a;
  letter-spacing: -0.02em;
}

.legal-content {
  max-width: 900px;
  margin: 0 auto;
}

.legal-item {
  background: #ffffff;
  border-radius: 8px;
  padding: 40px;
  margin-bottom: 30px;
  border: 1px solid #e5e5e5;
  transition: all 0.3s ease;
}

.legal-item:hover {
  border-color: #1a1a1a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.legal-subtitle {
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 20px;
  color: #1a1a1a;
  padding-bottom: 10px;
  border-bottom: 2px solid #e5e5e5;
}

.legal-text {
  line-height: 1.8;
  color: #666666;
  font-weight: 300;
}

.legal-text p {
  margin-bottom: 15px;
}

.legal-text ul {
  margin: 15px 0;
  padding-left: 25px;
}

.legal-text li {
  margin-bottom: 8px;
  position: relative;
}

.legal-text li::marker {
  color: #999999;
}

/* FAQ部分 */
.faq-section {
  padding: 80px 0;
  background: #f8f9fa;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 60px;
}

.faq-item {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.faq-item:hover {
  border-color: #1a1a1a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.faq-question {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 15px;
}

.faq-icon {
  color: #1a1a1a;
  font-size: 20px;
  flex-shrink: 0;
}

.faq-title {
  flex: 1;
  font-weight: 400;
  color: #1a1a1a;
  font-size: 16px;
}

.faq-toggle {
  color: #666666;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.faq-toggle.expanded {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 20px 20px 55px;
  color: #666666;
  line-height: 1.6;
  font-weight: 300;
}

.faq-answer p {
  margin: 0;
}

/* 联系信息 */
.contact-info {
  margin-bottom: 40px;
}

.contact-title {
  font-size: 1.5rem;
  font-weight: 400;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 30px;
}

.contact-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  transition: all 0.3s ease;
  cursor: pointer;
}

.contact-method:hover {
  border-color: #1a1a1a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.contact-method .el-icon {
  color: #1a1a1a;
  font-size: 24px;
  flex-shrink: 0;
}

.contact-details {
  flex: 1;
}

.contact-label {
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.contact-value {
  color: #666666;
  font-weight: 300;
  margin-bottom: 2px;
}

.contact-time {
  color: #999999;
  font-size: 12px;
  font-weight: 300;
}

.update-info {
  background: #ffffff;
  border-radius: 8px;
  padding: 25px;
  border: 1px solid #e5e5e5;
  text-align: center;
}

.update-info p {
  margin: 8px 0;
  color: #666666;
  font-size: 0.95rem;
  font-weight: 300;
}

/* 页脚 */
.footer {
  background: #000000;
  border-top: 1px solid #333333;
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
  font-weight: 300;
  color: #ffffff;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.footer-links-title {
  font-size: 1.1rem;
  font-weight: 400;
  margin-bottom: 20px;
  color: #ffffff;
}

.footer-link {
  display: block;
  color: #cccccc;
  text-decoration: none;
  margin-bottom: 12px;
  transition: color 0.3s ease;
  font-weight: 300;
}

.footer-link:hover {
  color: #ffffff;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  border-top: 1px solid #333333;
}

.footer-copyright {
  color: #999999;
  font-size: 13px;
  letter-spacing: 0.3px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 300;
}

.footer-icp {
  color: #888888;
  font-size: 12px;
  opacity: 0.8;
  font-weight: 300;
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
  background: #333333;
  color: #cccccc;
  transition: all 0.3s ease;
  border: 1px solid #333333;
}

.social-link:hover {
  background: #ffffff;
  color: #000000;
  transform: translateY(-2px);
  border-color: #ffffff;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .nav-menu {
    gap: 20px;
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
  
  .legal-item {
    padding: 25px;
  }
  
  .contact-actions {
    flex-direction: column;
    align-items: center;
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
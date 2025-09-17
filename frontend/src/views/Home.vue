<template>
  <div class="home-page" :class="{'mobile': mobileDevice}">
    <!-- 背景装饰 -->
    <div class="modern-decoration modern-decoration-circle" style="top: 10%; right: 5%;"></div>
    <div class="modern-decoration modern-decoration-blob" style="bottom: 10%; left: 5%;"></div>
    
    <!-- 导航栏 -->
    <ModernNavbar />
    
    <!-- 主要内容 -->
    <div class="modern-container">
      <!-- 英雄区域 -->
      <section class="hero-section">
        <div class="hero-content modern-slide-up">
          <!-- 顶部标签 -->
          <div class="hero-badge">
            <div class="badge-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <span>{{ heroSubtitle }}</span>
          </div>
          
          <!-- 主标题区域 -->
          <div class="hero-title-section">
            <h1 class="hero-title">
              {{ heroTitle }}
            </h1>
            <div class="title-decoration">
              <div class="decoration-line"></div>
              <div class="decoration-dot"></div>
            </div>
          </div>
          
          <!-- 特色功能标签 -->
          <div class="hero-features">
            <div class="feature-tag">
              <span>实时查询</span>
            </div>
            <div class="feature-tag">
              <span>安全可靠</span>
            </div>
            <div class="feature-tag">
              <span>极速响应</span>
            </div>
          </div>
          
          <!-- 描述文本 -->
          <p class="hero-description">
            {{ serviceDescription }}
          </p>
          
          <!-- 数据统计 -->
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">1000+</div>
              <div class="stat-label">每日查询</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-number">99.9%</div>
              <div class="stat-label">准确率</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-number">24/7</div>
              <div class="stat-label">在线服务</div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="hero-actions">
            <div class="el-button--large modern-btn modern-btn-primary hero-primary-btn" size="large" @click="$router.push('/query')">
              <el-icon><Search /></el-icon>
              立即查询
              <div class="btn-glow"></div>
            </div>
            <div class="el-button--large modern-btn modern-btn-outline hero-outline-btn" size="large" @click="$router.push('/about')">
              <el-icon><InfoFilled /></el-icon>
              了解更多
            </div>
          </div>
          
          <!-- 底部装饰元素 -->
          <div class="hero-decorations">
            <div class="floating-element element-1">
              <el-icon><DataBoard /></el-icon>
            </div>
            <div class="floating-element element-2">
              <el-icon><Histogram /></el-icon>
            </div>
            <div class="floating-element element-3">
              <el-icon><PieChart /></el-icon>
            </div>
          </div>
        </div>
        <div class="hero-image modern-slide-up delay-200">
          <!-- 现代3D数据分析插画 -->
          <svg width="700" height="560" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景渐变 -->
            <defs>
              <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#000000;stop-opacity:0.1" />
                <stop offset="100%" style="stop-color:#000000;stop-opacity:0.1" />
              </linearGradient>
              <linearGradient id="platformGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#c0faa0" />
                <stop offset="100%" style="stop-color:#c0faa0" />
              </linearGradient>
              <linearGradient id="cardGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#c0faa0" />
                <stop offset="100%" style="stop-color:#c0faa0" />
              </linearGradient>
              <linearGradient id="cardGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#000000" />
                <stop offset="100%" style="stop-color:#000000" />
              </linearGradient>
              <linearGradient id="personGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#c0faa0" />
                <stop offset="100%" style="stop-color:#c0faa0" />
              </linearGradient>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.15"/>
              </filter>
            </defs>
            
            <!-- 背景装饰圆圈 -->
            <circle cx="80" cy="80" r="40" fill="url(#bgGradient)" opacity="0.6">
              <animateTransform attributeName="transform" type="rotate" values="0 80 80;360 80 80" dur="20s" repeatCount="indefinite"/>
            </circle>
            <circle cx="420" cy="100" r="30" fill="url(#bgGradient)" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" values="360 420 100;0 420 100" dur="15s" repeatCount="indefinite"/>
            </circle>
            
            <!-- 主平台 -->
            <ellipse cx="250" cy="320" rx="180" ry="40" fill="url(#platformGradient)" opacity="0.8" filter="url(#shadow)">
              <animateTransform attributeName="transform" type="scale" values="1;1.05;1" dur="4s" repeatCount="indefinite"/>
            </ellipse>
            
            <!-- 数据卡片1 -->
            <g transform="translate(150,200)">
              <rect x="0" y="0" width="60" height="80" rx="8" fill="url(#cardGradient1)" filter="url(#shadow)">
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-10;0,0" dur="3s" repeatCount="indefinite"/>
              </rect>
              <circle cx="30" cy="25" r="12" fill="white" opacity="0.9"/>
              <path d="M24 25 L30 31 L36 19" stroke="#4facfe" stroke-width="2" fill="none" stroke-linecap="round"/>
              <rect x="15" y="45" width="30" height="3" rx="1.5" fill="white" opacity="0.7"/>
              <rect x="15" y="52" width="20" height="3" rx="1.5" fill="white" opacity="0.5"/>
            </g>
            
            <!-- 数据卡片2 -->
            <g transform="translate(320,180)">
              <rect x="0" y="0" width="60" height="80" rx="8" fill="url(#cardGradient2)" filter="url(#shadow)">
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-8;0,0" dur="3.5s" repeatCount="indefinite" begin="1s"/>
              </rect>
              <circle cx="30" cy="25" r="12" fill="white" opacity="0.9"/>
              <rect x="26" y="21" width="8" height="8" fill="#a8edea"/>
              <rect x="15" y="45" width="30" height="3" rx="1.5" fill="white" opacity="0.7"/>
              <rect x="15" y="52" width="25" height="3" rx="1.5" fill="white" opacity="0.5"/>
            </g>
            
            <!-- 数据卡片3 -->
            <g transform="translate(200,160)">
              <rect x="0" y="0" width="60" height="80" rx="8" fill="url(#platformGradient)" filter="url(#shadow)">
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-12;0,0" dur="4s" repeatCount="indefinite" begin="2s"/>
              </rect>
              <circle cx="30" cy="25" r="12" fill="white" opacity="0.9"/>
              <path d="M22 29 L26 25 L30 29 L34 21 L38 25" stroke="#667eea" stroke-width="2" fill="none" stroke-linecap="round"/>
              <rect x="15" y="45" width="30" height="3" rx="1.5" fill="white" opacity="0.7"/>
              <rect x="15" y="52" width="22" height="3" rx="1.5" fill="white" opacity="0.5"/>
            </g>
            
            <!-- 3D人物 -->
            <g transform="translate(280,240)">
              <!-- 身体 -->
              <ellipse cx="0" cy="20" rx="15" ry="25" fill="url(#cardGradient1)" filter="url(#shadow)">
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="2s" repeatCount="indefinite"/>
              </ellipse>
              <!-- 头部 -->
              <circle cx="0" cy="-10" r="12" fill="url(#personGradient)" filter="url(#shadow)">
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-2;0,0" dur="2s" repeatCount="indefinite"/>
              </circle>
              <!-- 左臂 -->
              <ellipse cx="-20" cy="10" rx="6" ry="15" fill="url(#cardGradient1)" transform="rotate(-20)">
                <animateTransform attributeName="transform" type="rotate" values="-20;-30;-20" dur="2.5s" repeatCount="indefinite"/>
              </ellipse>
              <!-- 右臂 -->
              <ellipse cx="20" cy="10" rx="6" ry="15" fill="url(#cardGradient1)" transform="rotate(20)">
                <animateTransform attributeName="transform" type="rotate" values="20;30;20" dur="2.5s" repeatCount="indefinite" begin="1s"/>
              </ellipse>
            </g>
            
            <!-- 浮动几何元素 -->
            <g transform="translate(100,120)">
              <rect x="0" y="0" width="20" height="20" rx="4" fill="url(#cardGradient2)" filter="url(#shadow)" transform="rotate(45)">
                <animateTransform attributeName="transform" type="rotate" values="45;405;45" dur="8s" repeatCount="indefinite"/>
              </rect>
            </g>
            
            <g transform="translate(380,160)">
              <circle cx="0" cy="0" r="15" fill="url(#personGradient)" filter="url(#shadow)">
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-15;0,0" dur="6s" repeatCount="indefinite"/>
              </circle>
            </g>
            
            <g transform="translate(120,250)">
              <polygon points="0,-15 13,10 -13,10" fill="url(#platformGradient)" filter="url(#shadow)">
                <animateTransform attributeName="transform" type="rotate" values="0;360;0" dur="10s" repeatCount="indefinite"/>
              </polygon>
            </g>
            
            <!-- 数据连接线 -->
            <g opacity="0.6">
              <path d="M210 240 Q250 220 290 240" stroke="url(#cardGradient1)" stroke-width="2" fill="none" stroke-dasharray="5,5">
                <animate attributeName="stroke-dashoffset" values="0;-10;0" dur="2s" repeatCount="indefinite"/>
              </path>
              <path d="M180 240 Q220 200 260 220" stroke="url(#cardGradient2)" stroke-width="2" fill="none" stroke-dasharray="3,3">
                <animate attributeName="stroke-dashoffset" values="0;-6;0" dur="1.5s" repeatCount="indefinite"/>
              </path>
              <path d="M350 220 Q320 200 290 240" stroke="url(#platformGradient)" stroke-width="2" fill="none" stroke-dasharray="4,4">
                <animate attributeName="stroke-dashoffset" values="0;-8;0" dur="2.5s" repeatCount="indefinite"/>
              </path>
            </g>
            
            <!-- 数据粒子效果 -->
            <g opacity="0.8">
              <circle cx="200" cy="180" r="2" fill="#4facfe">
                <animateTransform attributeName="transform" type="translate" values="0,0;50,-20;100,0" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx="300" cy="200" r="2" fill="#a8edea">
                <animateTransform attributeName="transform" type="translate" values="0,0;-30,-15;-60,0" dur="2.5s" repeatCount="indefinite" begin="1s"/>
                <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" begin="1s"/>
              </circle>
              <circle cx="250" cy="160" r="2" fill="#667eea">
                <animateTransform attributeName="transform" type="translate" values="0,0;0,-30;0,-60" dur="4s" repeatCount="indefinite" begin="0.5s"/>
                <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" begin="0.5s"/>
              </circle>
            </g>
          </svg>
        </div>
      </section>
      
      <!-- 平台服务板块 -->
      <section class="platform-config-section">
        <h2 class="section-title modern-slide-up">数据查询服务</h2>
        <p class="section-description modern-slide-up">
          专业的数据查询服务，为您提供准确、快速、安全的信息查询体验
        </p>

        <!-- 平台服务列表 -->
        <div class="platform-services-grid" v-if="platformServices.length > 0">
          <div 
            v-for="(service, index) in platformServices" 
            :key="service.id" 
            class="platform-service-card modern-card modern-slide-up card-entrance"
            :class="[`delay-${index * 100}`, { 'hot-service': service.isHot }]"
            @click="handleServiceClick(service)"
          >
            <!-- 热门标签 -->
            <div v-if="service.isHot" class="hot-badge">
              <el-icon><Star /></el-icon>
              热门
            </div>
            
            <!-- 服务图标 -->
            <div class="service-icon-wrapper" :class="getIconWrapperClass(service.category)">
              <i 
                :class="[
                  service.icon || 'fas fa-search', 
                  'service-icon'
                ]"
                :style="{
                  fontSize: getIconSize(service.iconSize) || '32px',
                  color: service.iconColor || '#409EFF',
                  animation: getIconAnimation(service.iconAnimation)
                }"
              ></i>
            </div>
            
            <!-- 服务信息 -->
            <div class="service-info">
              <h3 class="service-name">{{ service.name }}</h3>
              <p class="service-description">{{ service.description }}</p>
              <div class="service-category" :class="getCategoryColorClass(service.category)">{{ getCategoryDisplayName(service.category) }}</div>
            </div>
            
            <!-- 价格信息 -->
            <div class="service-pricing">
              <span class="current-price">¥{{ formatAmount(service.price) }}</span>
              <span v-if="service.originalPrice && service.originalPrice > service.price" class="original-price">
                ¥{{ formatAmount(service.originalPrice) }}
              </span>
            </div>
            
            <!-- 服务特性 -->
            <div class="platform-features" v-if="service.features && service.features.length > 0">
              <div class="feature-list">
                <span 
                  v-for="(feature, idx) in service.features" 
                  :key="idx" 
                  class="feature-tag"
                  :class="getFeatureColorClass(idx)"
                >
                  {{ feature }}
                </span>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="service-actions">
              <el-button 
                type="primary" 
                size="default" 
                class="service-btn"
                @click.stop="startQuery(service)"
              >
                立即查询
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else class="empty-state modern-slide-up">
          <el-empty description="暂无可用的服务配置">
            <el-button type="primary" @click="refreshPlatformServices">刷新配置</el-button>
          </el-empty>
        </div>

      </section>
      
      <!-- 服务优势 -->
      <section class="advantages-section">
        <h2 class="section-title modern-slide-up">为什么选择我们</h2>
        <p class="section-description modern-slide-up">专业的数据服务，为您提供全方位的支持</p>
        
        <div class="advantages-grid">
          <div 
            v-for="(advantage, index) in advantages" 
            :key="index" 
            class="advantage-card modern-card modern-slide-up card-entrance"
            :class="`delay-${index * 100}`"
          >
            <div class="advantage-icon">
              <el-icon :size="32"><component :is="advantage.icon" /></el-icon>
            </div>
            <h3 class="advantage-title">{{ advantage.title }}</h3>
            <p class="advantage-description">{{ advantage.description }}</p>
          </div>
        </div>
      </section>
      
      <!-- 数据统计 -->
      <section class="stats-section modern-card">
        <h2 class="section-title modern-slide-up">数据服务能力</h2>
        <p class="section-description modern-slide-up">强大的数据处理能力，为您提供高效服务</p>
        
        <div class="stats-grid">
          <div class="stat-item modern-slide-up">
            <div class="stat-number">10亿+</div>
            <div class="stat-label">数据记录</div>
          </div>
          <div class="stat-item modern-slide-up delay-100">
            <div class="stat-number">99.9%</div>
            <div class="stat-label">数据准确率</div>
          </div>
          <div class="stat-item modern-slide-up delay-200">
            <div class="stat-number">50+</div>
            <div class="stat-label">数据源接入</div>
          </div>
          <div class="stat-item modern-slide-up delay-300">
            <div class="stat-number">24h</div>
            <div class="stat-label">全天候服务</div>
          </div>
        </div>
      </section>
      
      <!-- 联系我们 -->
      <section class="contact-section">
        <div class="contact-card modern-card modern-slide-up">
          <h2 class="section-title">联系我们</h2>
          <p class="section-description">如有任何问题，请随时与我们联系</p>
          
          <div class="contact-info">
            <div class="contact-item">
              <el-icon :size="24"><Phone /></el-icon>
              <div class="contact-text">
                <div class="contact-label">客服热线</div>
                <div class="contact-value">{{ contactInfo.phone }}</div>
              </div>
            </div>
            <div class="contact-item">
              <el-icon :size="24"><Timer /></el-icon>
              <div class="contact-text">
                <div class="contact-label">工作时间</div>
                <div class="contact-value">{{ contactInfo.workTime }}</div>
              </div>
            </div>
            <div class="contact-item">
              <el-icon :size="24"><Message /></el-icon>
              <div class="contact-text">
                <div class="contact-label">电子邮箱</div>
                <div class="contact-value">{{ contactInfo.email }}</div>
              </div>
            </div>
            <div class="contact-item">
              <el-icon :size="24"><Location /></el-icon>
              <div class="contact-text">
                <div class="contact-label">公司地址</div>
                <div class="contact-value">{{ contactInfo.address }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    
    <!-- 页脚 -->
    <footer class="modern-footer">
      <div class="modern-container">
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

    <!-- 悬浮按钮组 -->
    <div class="floating-buttons">
      <!-- 客服按钮 -->
      <div 
        class="floating-btn service-btn" 
        @click="showOnlineService"
        title="联系客服"
      >
        <el-icon><ChatDotRound /></el-icon>
      </div>

    </div>

    <!-- 在线客服弹窗 -->
    <OnlineServiceDialog v-model="onlineServiceVisible" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, markRaw, computed } from 'vue';
import { useRouter } from 'vue-router';
import { isMobile } from '../utils/device';
import { useSystemSettingsStore } from '@/stores/systemSettings';
import { formatAmount } from '../utils';

import { queryServices } from '@/data/query-services';
import { ElMessage } from 'element-plus';

const mobileDevice = isMobile();
import { 
  DataAnalysis, Search, User, Lock, Timer, Connection, ArrowRight,
  Phone, Message, Location, ChatDotRound, Share, Link, HomeFilled, Document,
  House, School, Star, Monitor, TrendCharts, InfoFilled, DataBoard, 
  Histogram, PieChart
} from '@element-plus/icons-vue';
import ModernNavbar from '../components/ModernNavbar.vue';
import OnlineServiceDialog from '../components/OnlineServiceDialog.vue';

const router = useRouter();

// 在线客服弹窗状态
const onlineServiceVisible = ref(false);

// 系统设置store
const systemSettingsStore = useSystemSettingsStore();

// 计算属性 - 从系统设置获取内容
const heroTitle = computed(() => systemSettingsStore.settings.heroTitle);
const heroSubtitle = computed(() => systemSettingsStore.settings.heroSubtitle);
const serviceDescription = computed(() => systemSettingsStore.settings.serviceDescription);
const contactInfo = computed(() => systemSettingsStore.getContactInfo());

// 服务分类 - 从API获取
const categories = ref([]);
const queryItems = ref([]);

// 图标映射
const iconMap = {
  'business': markRaw(Document),
  'personal': markRaw(User),
  'property': markRaw(House),
  'vehicle': markRaw(Search),
  'education': markRaw(School),
  'legal': markRaw(Connection),
  'credit': markRaw(DataAnalysis),
  'default': markRaw(Document)
};

// 分类映射
const categoryKeyMap = {
  '企业信息': 'business',
  '个人信息': 'personal', 
  '房产信息': 'property',
  '车辆信息': 'vehicle',
  '学历信息': 'education',
  '司法信息': 'legal',
  '征信信息': 'credit'
};

// 根据分类获取图标组件
const getIconByCategory = (category) => {
  const key = categoryKeyMap[category] || 'default';
  return iconMap[key] || iconMap.default;
};

// 服务优势
const advantages = ref([
  {
    title: '数据准确可靠',
    description: '数据来源权威渠道，确保信息准确性',
    icon: markRaw(DataAnalysis)
  },
  {
    title: '安全保障',
    description: '全程加密传输，保障数据安全',
    icon: markRaw(Lock)
  },
  {
    title: '快速响应',
    description: '查询结果秒级返回，高效便捷',
    icon: markRaw(Timer)
  }
]);

// 平台配置相关数据
const currentPlatform = ref('pc'); // 强制设置为PC端优先
const platformServices = ref([]);
const mobileServices = ref([]);

// 获取平台配置服务
const fetchPlatformServices = async () => {
  try {
    console.log('🔄 开始获取首页可见服务数据...');
    console.log('🎯 当前平台:', currentPlatform.value);
    
    // 优先获取PC端首页可见数据
    const pcResponse = await fetch('/api/queries/homepage/pc');
    const pcData = await pcResponse.json();
    console.log('💻 PC端首页可见数据:', pcData);
    
    // 处理PC端数据 - 确保优先显示
     if (pcData && pcData.code === 200 && Array.isArray(pcData.data)) {
       console.log('💻 处理PC端数据，共', pcData.data.length, '个服务');
       
       const processedPcData = pcData.data.map((service, index) => {
         console.log(`\n📋 服务 ${index + 1}: ${service.name}`);
         console.log('  当前平台:', service.platform);
         console.log('  平台配置:', service.platformConfig);
         
         // 创建新的服务对象，确保PC端配置优先
         const processedService = { ...service };
         
         // 修复图标配置逻辑 - 将iconClass映射到icon字段
         processedService.icon = service.icon || service.iconClass || 'fas fa-search';
         processedService.iconClass = service.iconClass || 'fas fa-search';
         processedService.iconColor = service.iconColor || '#409EFF';
         processedService.iconSize = service.iconSize || 'medium';
         
         // 修复特性标签解析问题
         if (service.features) {
           try {
             if (typeof service.features === 'string') {
               processedService.features = JSON.parse(service.features);
             } else if (Array.isArray(service.features)) {
               processedService.features = service.features;
             } else {
               processedService.features = [];
             }
           } catch (error) {
             console.warn('解析features字段失败:', error, 'features值:', service.features);
             processedService.features = [];
           }
         } else {
           processedService.features = [];
         }
         
         console.log('  ✅ 服务配置:');
         console.log('    iconClass:', processedService.iconClass);
         console.log('    iconColor:', processedService.iconColor);
         console.log('    iconSize:', processedService.iconSize);
         
         return processedService;
       });
      
      // 立即设置PC端数据，确保优先显示
      platformServices.value = processedPcData.sort((a, b) => a.displayOrder - b.displayOrder);
      console.log('✅ PC端服务数据优先设置完成，当前服务数量:', platformServices.value.length);
      
      // 详细检查图标配置
      platformServices.value.forEach((service, index) => {
        console.log(`🔧 服务${index + 1} [${service.name}] 图标配置:`, {
          iconClass: service.iconClass,
          iconColor: service.iconColor,
          iconSize: service.iconSize,
          iconAnimation: service.iconAnimation,
          platformConfig: service.platformConfig,
          computedColor: getIconColor(service.iconColor),
          computedSize: getIconSize(service.iconSize),
          computedAnimation: getIconAnimation(service.iconAnimation)
        });
      });
    } else {
      throw new Error('PC端API返回数据格式错误');
    }
    
    // 然后获取移动端首页可见数据（如果需要）
    const mobileResponse = await fetch('/api/queries/homepage/mobile');
    const mobileData = await mobileResponse.json();
    console.log('📱 移动端首页可见数据:', mobileData);
    
    // 处理移动端数据
    if (mobileData && mobileData.code === 200 && Array.isArray(mobileData.data)) {
      console.log('📱 处理移动端数据，共', mobileData.data.length, '个服务');
      console.log('✅ 移动端服务数据设置完成');
    }
    
  } catch (error) {
    console.error('获取平台配置失败:', error);
    ElMessage.error('获取平台配置失败');
    
    // 降级方案：调用基础查询项目API并手动处理平台配置
    try {
      console.log('尝试降级方案...');
      const fallbackRes = await fetch('/api/queries/items', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (fallbackData && fallbackData.code === 200 && Array.isArray(fallbackData.data)) {
          const currentQueryServices = fallbackData.data;
          
          // 根据当前平台过滤并处理数据
          const filteredServices = currentQueryServices
            .filter(service => {
              // 解析platforms字段
              let platforms = null;
              try {
                if (service.platforms) {
                  platforms = typeof service.platforms === 'string' 
                    ? JSON.parse(service.platforms) 
                    : service.platforms;
                }
              } catch (error) {
                console.warn('解析platforms字段失败:', error);
                return false;
              }
              
              // 检查当前平台是否启用
              return platforms && 
                     platforms[currentPlatform.value] && 
                     platforms[currentPlatform.value].enabled;
            })
            .map(service => {
              // 解析platforms字段
              let platforms = null;
              try {
                if (service.platforms) {
                  platforms = typeof service.platforms === 'string' 
                    ? JSON.parse(service.platforms) 
                    : service.platforms;
                }
              } catch (error) {
                console.warn('解析platforms字段失败:', error);
                platforms = {};
              }
              
              const platformConfig = platforms[currentPlatform.value] || {};
              
              // 详细调试信息
              console.log(`🔧 服务 "${service.name}" 的平台配置:`, {
                serviceName: service.name,
                currentPlatform: currentPlatform.value,
                platformConfig: platformConfig,
                iconClass: platformConfig.iconClass,
                iconColor: platformConfig.iconColor,
                iconSize: platformConfig.iconSize
              });
              
              // 解析features字段
              let features = [];
              try {
                if (service.features) {
                  if (typeof service.features === 'string') {
                    features = JSON.parse(service.features);
                  } else if (Array.isArray(service.features)) {
                    features = service.features;
                  } else {
                    features = [];
                  }
                }
              } catch (error) {
                console.warn('解析features字段失败:', error);
                features = [];
              }
              
              return {
                id: service.id,
                name: service.name,
                code: service.code,
                category: service.category,
                subCategory: service.subCategory,
                description: platformConfig.description || service.description,
                price: platformConfig.customPrice || service.price,
                originalPrice: platformConfig.originalPrice || service.originalPrice,
                icon: service.icon,
                iconClass: platformConfig.iconClass || service.iconClass || 'fas fa-search',
                iconColor: platformConfig.iconColor || '#409EFF',
                iconSize: platformConfig.iconSize || 'medium',
                features: features || platformConfig.customParams || [],
                usage: service.usage || 0,
                isHot: platformConfig.isHot !== undefined ? platformConfig.isHot : (service.isHot || false),
                displayOrder: platformConfig.order || service.id,
                platformConfig: platformConfig
              };
            })
            .sort((a, b) => a.displayOrder - b.displayOrder);
          
          platformServices.value = filteredServices;
          console.log('使用降级方案成功加载服务');
        }
      }
    } catch (fallbackError) {
      console.error('降级方案也失败了:', fallbackError);
      ElMessage.error('无法获取服务数据');
    }
  }
};



// 服务操作方法
const handleServiceClick = (service) => {
  console.log('点击服务:', service.name);
};

const startQuery = (service) => {
  console.log('=== 立即查询按钮被点击 ===');
  console.log('服务信息:', service);
  console.log('当前时间:', new Date().toLocaleTimeString());
  
  try {
    console.log('准备跳转到查询页面');
    
    // 跳转到查询页面，传递服务ID，并添加hash定位到查询服务区域
    const targetUrl = `/query?service=${service.id}&name=${encodeURIComponent(service.name)}#query-services`;
    console.log('目标URL:', targetUrl);
    
    router.push(targetUrl).then(() => {
      console.log('路由跳转成功');
      // 延迟滚动，确保页面已完全加载
      setTimeout(() => {
        const queryServicesElement = document.querySelector('.query-categories');
        if (queryServicesElement) {
          queryServicesElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          console.log('已滚动到查询服务区域');
        }
      }, 500);
    }).catch(error => {
      console.error('路由跳转失败:', error);
      ElMessage.error('跳转失败，请重试');
    });
  } catch (error) {
    console.error('跳转查询页面失败:', error);
    ElMessage.error('跳转失败，请重试');
  }
};

const viewDetails = (service) => {
  ElMessage.info(`查看详情: ${service.name}`);
  // 这里可以显示服务详情弹窗或跳转到详情页
};

// 刷新平台服务数据
const refreshPlatformServices = async () => {
  await fetchPlatformServices();
  ElMessage.success('平台服务数据已刷新');
};

// 显示在线客服弹窗
const showOnlineService = () => {
  onlineServiceVisible.value = true;
};

// 获取图标大小
const getIconSize = (size) => {
  const sizeMap = {
    'xs': '16px',
    'sm': '20px',
    'small': '24px',
    'md': '28px',
    'medium': '32px',
    'lg': '36px',
    'large': '40px',
    'xl': '44px',
    'extra-large': '48px',
    '2xl': '52px'
  };
  return sizeMap[size] || sizeMap.medium;
};

// 获取图标颜色
const getIconColor = (color) => {
  const colorMap = {
    'primary': '#409EFF',
    'success': '#67C23A',
    'warning': '#E6A23C',
    'danger': '#F56C6C',
    'error': '#F56C6C',
    'info': '#909399',
    'secondary': '#909399',
    'dark': '#303133'
  };
  // 如果是颜色值（以#开头），直接返回
  if (color && color.startsWith('#')) {
    return color;
  }
  return colorMap[color] || colorMap.primary;
};

// 获取图标动画
const getIconAnimation = (animation) => {
  const animationMap = {
    'none': 'none',
    'pulse': 'pulse 2s infinite',
    'bounce': 'bounce 1s infinite',
    'rotate': 'rotate 2s linear infinite',
    'shake': 'shake 0.5s infinite'
  };
  return animationMap[animation] || animationMap.none;
};

// 获取图标容器样式类
const getIconWrapperClass = (category) => {
  const classMap = {
    '企业查询': 'business-icon',
    '个人查询': 'personal-icon',
    '房产查询': 'property-icon',
    '车辆查询': 'vehicle-icon',
    '学历查询': 'education-icon',
    '司法查询': 'legal-icon',
    '征信查询': 'credit-icon'
  };
  return classMap[category] || 'default-icon';
};

// 获取特性颜色类
const getFeatureColorClass = (index) => {
  const colorClasses = [
    'feature-primary',
    'feature-success', 
    'feature-warning',
    'feature-info',
    'feature-purple',
    'feature-pink',
    'feature-indigo',
    'feature-teal'
  ];
  return colorClasses[index % colorClasses.length];
};

// 获取分类显示名称
const getCategoryDisplayName = (category) => {
  const categoryNameMap = {
    'business': '企业查询',
    'personal': '个人查询',
    'property': '房产查询', 
    'vehicle': '车辆查询',
    'education': '教育查询',
    'legal': '司法查询',
    'credit': '征信查询',
    'communication': '通讯查询'
  };
  return categoryNameMap[category] || category;
};

// 获取分类颜色类
// 分类颜色缓存，避免重复计算
const categoryColorCache = new Map();

// 字符串哈希函数
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash);
};

// 生成HSL颜色
const generateColorFromHash = (hash) => {
  // 使用黄金比例来分布色相，确保颜色分布均匀
  const goldenRatio = 0.618033988749895;
  const hue = (hash * goldenRatio) % 1 * 360;
  
  // 饱和度在60-90%之间，确保颜色鲜艳但不刺眼
  const saturation = 60 + (hash % 30);
  
  // 亮度在45-65%之间，确保颜色既不太暗也不太亮
  const lightness = 45 + (hash % 20);
  
  return {
    hue: Math.round(hue),
    saturation,
    lightness
  };
};

// 将HSL转换为CSS颜色值
const hslToCSS = (hsl, alpha = 1) => {
  return `hsla(${hsl.hue}, ${hsl.saturation}%, ${hsl.lightness}%, ${alpha})`;
};

const getCategoryColorClass = (category) => {
  if (!category) {
    // 即使是空值也生成一个默认颜色
    category = 'default';
  }
  
  // 检查缓存
  if (categoryColorCache.has(category)) {
    return categoryColorCache.get(category);
  }
  
  // 为每个分类生成唯一的哈希值
  const hash = hashString(category);
  const colorData = generateColorFromHash(hash);
  
  // 生成动态类名
  const dynamicClassName = `category-hash-${hash}`;
  
  // 生成颜色方案
  const mainColor = hslToCSS(colorData);
  const bgColor = hslToCSS(colorData, 0.1);
  const borderColor = hslToCSS(colorData, 0.3);
  
  // 动态创建CSS样式
  const style = document.createElement('style');
  style.textContent = `
    .service-category.${dynamicClassName} {
      background: ${bgColor} !important;
      color: ${mainColor} !important;
      border: 1px solid ${borderColor} !important;
    }
  `;
  document.head.appendChild(style);
  
  // 缓存结果
  categoryColorCache.set(category, dynamicClassName);
  
  return dynamicClassName;
};



onMounted(async () => {
  console.log('首页已加载');
  // 加载系统设置
  await systemSettingsStore.fetchSettings();
  // 加载平台服务
  await fetchPlatformServices();
});
</script>

<style>
.home-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* 英雄区域 */
.hero-section {
  display: flex;
  align-items: center;
  min-height: 75vh;
  padding: var(--space-16) 0 var(--space-8) 0;
  position: relative;
}

.hero-content {
  flex: 1;
  max-width: 600px;
  position: relative;
  z-index: 2;
}

/* 顶部标签 */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: rgba(192, 250, 160, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-4);
  margin-bottom: var(--space-6);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--primary);
  backdrop-filter: blur(10px);
}

.badge-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #c0faa0;
  border-radius: var(--radius-full);
  color: #000000;
  font-size: 12px;
}

/* 主标题区域 */
.hero-title-section {
  position: relative;
  margin-bottom: var(--space-6);
}

.hero-title {
  font-size: var(--text-5xl);
  font-weight: 800;
  line-height: 1.1;
  color: var(--text-primary);
  margin: 0;
}

.hero-title .highlight {
  color: #000000;
  position: relative;
}

.title-decoration {
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.decoration-line {
  width: 30px;
  height: 2px;
  background: #c0faa0;
  border-radius: var(--radius-full);
}

.decoration-dot {
  width: 8px;
  height: 8px;
  background: #c0faa0;
  border-radius: var(--radius-full);
  animation: pulse 2s infinite;
}

/* 特色功能标签 */
.hero-features {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.feature-tag {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(79, 70, 229, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  backdrop-filter: blur(10px);
  transition: all var(--transition-normal);
}

.feature-tag:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary);
}

.feature-tag .el-icon {
  color: var(--primary);
  font-size: 16px;
}

.hero-description {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
  line-height: 1.6;
}

/* 数据统计 */
.hero-stats {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
  padding: var(--space-4);
  background: rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(79, 70, 229, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(0, 0, 0, 0.3);
}

/* 操作按钮 */
.hero-actions {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.hero-primary-btn {
  position: relative;
  overflow: hidden;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  transition: left 0.6s;
}

.hero-primary-btn:hover .btn-glow {
  left: 100%;
}

.hero-outline-btn {
  backdrop-filter: blur(10px);
}

/* 底部装饰元素 */
.hero-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
}

.floating-element {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(192, 250, 160, 0.1);
  border-radius: var(--radius-lg);
  color: #000000;
  font-size: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.element-1 {
  top: 20%;
  right: 10%;
  animation: float 6s ease-in-out infinite;
}

.element-2 {
  top: 60%;
  right: 5%;
  animation: float 8s ease-in-out infinite reverse;
}

.element-3 {
  bottom: 20%;
  right: 15%;
  animation: float 7s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 400px;
  transform: translateY(-60px);
}

.hero-image svg {
  max-width: 100%;
  height: auto;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1));
}

/* 服务分类 */
.services-section {
  padding: var(--space-16) 0;
}

.section-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--space-4);
  color: var(--text-primary);
}

.section-description {
  font-size: var(--text-lg);
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: var(--space-10);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
}

.service-card {
  padding: var(--space-6);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.service-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  background: rgba(192, 250, 160, 0.1);
  margin-bottom: var(--space-4);
  color: #000000;
}

.service-title {
  font-size: var(--text-xl);
  font-weight: 600;
  margin-bottom: var(--space-2);
  color: var(--text-primary);
}

.service-description {
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

.service-action {
  position: absolute;
  bottom: var(--space-6);
  right: var(--space-6);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background-color: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-normal);
}

.service-card:hover .service-action {
  transform: translateX(5px);
}

/* 平台配置板块 */
.platform-config-section {
  padding: var(--space-16) 0;
  margin: var(--space-16) 0;
}

.platform-switcher {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-10);
}

.platform-radio-group {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-1);
  box-shadow: var(--shadow-sm);
}

.platform-radio-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.platform-services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: var(--space-8);
  margin-bottom: var(--space-8);
}

.platform-service-card {
  padding: var(--space-8);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  background: linear-gradient(145deg, #ffffff 0%, #fafafa 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform, box-shadow, border-color;
}

.platform-service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(145deg, rgba(192, 250, 160, 0.05) 0%, rgba(192, 250, 160, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
  border-radius: inherit;
}

.platform-service-card:hover {
  transform: translateY(-12px) translateZ(0);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: #c0faa0;
}

.platform-service-card:hover::before {
  opacity: 1;
}

.platform-service-card:active {
  transform: translateY(-6px) translateZ(0);
  transition: all 0.15s ease;
}

.platform-service-card.hot-service {
  border-color: #c0faa0;
  background: linear-gradient(145deg, rgba(192, 250, 160, 0.08) 0%, #ffffff 100%);
  box-shadow: 0 8px 30px rgba(192, 250, 160, 0.2);
}

.hot-badge {
  position: absolute;
  top: var(--space-6);
  right: var(--space-6);
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  color: #c0faa0;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 3;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}



.service-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
  border-radius: 24px;
  background: linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%);
  margin: 0 auto var(--space-6);
  position: relative;
  overflow: visible !important;
  z-index: 2;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.service-icon-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24px;
  background: linear-gradient(145deg, rgba(192, 250, 160, 0.1) 0%, rgba(192, 250, 160, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.platform-service-card:hover .service-icon-wrapper {
  transform: translateY(-8px) scale(1.08);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.25),
    0 8px 32px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.3);
}

.platform-service-card:hover .service-icon-wrapper::before {
  opacity: 1;
}

.service-icon-wrapper .service-icon {
  font-size: 36px;
  color: #ffffff !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
  text-align: center !important;
  position: relative;
  z-index: 2;
  width: 100% !important;
  height: 100% !important;
  /* 强制居中对齐 */
  vertical-align: middle !important;
  /* 移除可能的默认margin和padding */
  margin: 0 !important;
  padding: 0 !important;
  /* 确保动画能够正常应用 */
  animation-fill-mode: both !important;
  transform-origin: center !important;
  /* 确保内联样式优先级更高 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.platform-service-card:hover .service-icon-wrapper .service-icon {
  color: #ffffff !important;
  transform: translate(-50%, -50%) scale(1.15) rotate(-5deg) !important;
  filter: drop-shadow(0 4px 16px rgba(255, 255, 255, 0.2));
}

/* FontAwesome图标正常显示和居中对齐 */
.service-icon-wrapper .service-icon.fas,
.service-icon-wrapper .service-icon.far,
.service-icon-wrapper .service-icon.fab,
.service-icon-wrapper .service-icon.fal {
  /* 覆盖FontAwesome的默认样式 */
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  vertical-align: middle !important;
  line-height: 1 !important;
  margin: 0 !important;
  padding: 0 !important;
  /* 确保图标在容器中完全居中 */
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  width: auto !important;
  height: auto !important;
}

/* 确保动画能够正常应用 - 使用更高的优先级 */
.service-icon-wrapper .service-icon[style*="animation"] {
  animation-fill-mode: both !important;
  transform-origin: center !important;
}

/* 确保所有图标样式类不会覆盖动画和内联样式 */
.business-icon .service-icon,
.credit-icon .service-icon,
.property-icon .service-icon,
.vehicle-icon .service-icon,
.education-icon .service-icon,
.legal-icon .service-icon {
  animation-fill-mode: both !important;
  transform-origin: center !important;
  /* 移除颜色覆盖，让内联样式生效 */
}

/* 图标样式类 - 移除背景颜色，保持统一的黑色背景 */
/* .default-icon, .business-icon, .credit-icon, .property-icon, .vehicle-icon, .education-icon, .legal-icon 不设置背景颜色，使用统一的黑色背景 */

.service-info {
  margin-bottom: var(--space-6);
  position: relative;
  z-index: 2;
  text-align: center;
}

.service-name {
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-3);
  color: var(--text-primary);
  line-height: 1.3;
}

.service-description {
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
  line-height: 1.6;
  font-size: var(--text-base);
}

.service-category {
  display: inline-block;
  padding: var(--space-2) var(--space-4);
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.05) 100%);
  color: var(--primary);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* 分类颜色样式 */
.service-category.category-business {
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  border: 1px solid rgba(64, 158, 255, 0.3);
}

.service-category.category-personal {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
  border: 1px solid rgba(103, 194, 58, 0.3);
}

.service-category.category-property {
  background: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
  border: 1px solid rgba(230, 162, 60, 0.3);
}

.service-category.category-vehicle {
  background: rgba(139, 69, 219, 0.1);
  color: #8B45DB;
  border: 1px solid rgba(139, 69, 219, 0.3);
}

.service-category.category-education {
  background: rgba(236, 72, 153, 0.1);
  color: #EC4899;
  border: 1px solid rgba(236, 72, 153, 0.3);
}

.service-category.category-legal {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.service-category.category-credit {
  background: rgba(20, 184, 166, 0.1);
  color: #14B8A6;
  border: 1px solid rgba(20, 184, 166, 0.3);
}

.service-category.category-communication {
  background: rgba(99, 102, 241, 0.1);
  color: #6366F1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.service-category.category-default {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.1) 0%, rgba(144, 147, 153, 0.2) 100%);
  color: #909399;
  border: 1px solid rgba(144, 147, 153, 0.3);
}

.service-pricing {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  padding: var(--space-3);
  background: linear-gradient(135deg, rgba(192, 250, 160, 0.1) 0%, rgba(192, 250, 160, 0.05) 100%);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(192, 250, 160, 0.2);
}

.current-price {
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--primary);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.original-price {
  font-size: var(--text-lg);
  color: var(--text-tertiary);
  text-decoration: line-through;
  opacity: 0.7;
}

.platform-features {
  margin-bottom: var(--space-4);
}

.feature-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-right: var(--space-2);
  flex-shrink: 0;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.feature-tag {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.feature-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 多彩特性标签样式 */
.feature-tag.feature-primary {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.2) 100%);
  color: #409EFF;
  border-color: rgba(64, 158, 255, 0.3);
}

.feature-tag.feature-success {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(103, 194, 58, 0.2) 100%);
  color: #67C23A;
  border-color: rgba(103, 194, 58, 0.3);
}

.feature-tag.feature-warning {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.1) 0%, rgba(230, 162, 60, 0.2) 100%);
  color: #E6A23C;
  border-color: rgba(230, 162, 60, 0.3);
}

.feature-tag.feature-info {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.1) 0%, rgba(144, 147, 153, 0.2) 100%);
  color: #909399;
  border-color: rgba(144, 147, 153, 0.3);
}

.feature-tag.feature-purple {
  background: linear-gradient(135deg, rgba(139, 69, 219, 0.1) 0%, rgba(139, 69, 219, 0.2) 100%);
  color: #8B45DB;
  border-color: rgba(139, 69, 219, 0.3);
}

.feature-tag.feature-pink {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.2) 100%);
  color: #EC4899;
  border-color: rgba(236, 72, 153, 0.3);
}

.feature-tag.feature-indigo {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.2) 100%);
  color: #6366F1;
  border-color: rgba(99, 102, 241, 0.3);
}

.feature-tag.feature-teal {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(20, 184, 166, 0.2) 100%);
  color: #14B8A6;
  border-color: rgba(20, 184, 166, 0.3);
}

.service-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: auto;
  position: relative;
  z-index: 10;
}

.service-btn {
  flex: 1;
  background: linear-gradient(135deg, #000000 0%, #333333 100%) !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-lg);
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  cursor: pointer !important;
  pointer-events: auto !important;
  z-index: 11;
}

.service-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.service-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  background: linear-gradient(135deg, #333333 0%, #555555 100%);
}

.service-btn:hover::before {
  left: 100%;
}

.service-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.empty-state {
  text-align: center;
  padding: var(--space-16);
}

/* 服务优势 */
.advantages-section {
  padding: var(--space-16) 0;
  background-color: var(--bg-light-alt);
  margin: var(--space-16) 0;
  border-radius: var(--radius-2xl);
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
}

.advantage-card {
  padding: var(--space-6);
  text-align: center;
}

.advantage-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: rgba(192, 250, 160, 0.1);
  margin: 0 auto var(--space-4);
  color: var(--primary);
}

.advantage-title {
  font-size: var(--text-xl);
  font-weight: 600;
  margin-bottom: var(--space-2);
  color: var(--text-primary);
}

.advantage-description {
  color: var(--text-secondary);
}

/* 数据统计 */
.stats-section {
  padding: var(--space-10);
  margin: var(--space-16) 0;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-6);
  margin-top: var(--space-10);
}

.stat-item {
  padding: var(--space-4);
}

.stat-number {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--primary);
  margin-bottom: var(--space-2);
}

.stat-label {
  color: var(--text-secondary);
  font-size: var(--text-lg);
}

/* 联系我们 */
.contact-section {
  padding: var(--space-16) 0;
}

.contact-card {
  padding: var(--space-8);
  text-align: center;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
  margin-top: var(--space-8);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
}

.contact-item i {
  color: var(--primary);
}

.contact-text {
  text-align: left;
}

.contact-label {
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.contact-value {
  font-weight: 500;
  color: var(--text-primary);
}

/* 页脚 */
.modern-footer {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: var(--space-12) 0 var(--space-6);
  margin-top: var(--space-16);
  border-top: 1px solid #333;
  position: relative;
  overflow: hidden;
}

.modern-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #666, transparent);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-8);
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 600;
  font-size: var(--text-lg);
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.footer-logo .el-icon {
  color: #ffffff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.footer-links {
  display: flex;
  gap: var(--space-12);
}

.footer-links-title {
  font-weight: 600;
  margin-bottom: var(--space-4);
  color: #ffffff;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.footer-link {
  display: block;
  text-decoration: none;
  color: #cccccc;
  margin-bottom: var(--space-2);
  transition: all var(--transition-normal);
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
  transition: width var(--transition-normal);
}

.footer-link:hover::before {
  width: 4px;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-6);
  border-top: 1px solid #333;
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
  gap: var(--space-4);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.1);
  color: #cccccc;
  transition: all var(--transition-normal);
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
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding-top: var(--space-16);
  }
  
  .hero-content {
    max-width: 100%;
    margin-bottom: var(--space-8);
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .hero-title {
    font-size: var(--text-4xl);
  }
  
  .hero-description {
    font-size: var(--text-lg);
  }
  
  .footer-content {
    flex-direction: column;
    gap: var(--space-8);
  }
  
  .footer-links {
    flex-direction: column;
    gap: var(--space-8);
  }
  
  .query-items-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: var(--text-3xl);
  }
  
  .section-title {
    font-size: var(--text-2xl);
  }
  
  .section-description {
    font-size: var(--text-base);
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .query-items-grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }
  
  .query-item-card {
    padding: var(--space-4);
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: var(--space-4);
  }
}

@media (max-width: 576px) {
  .hero-actions {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .query-items-grid {
    grid-template-columns: 1fr;
  }
}

/* 卡片入场动画 */
.card-entrance {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
  animation: cardEntranceAnimation 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  animation-fill-mode: both;
}

@keyframes cardEntranceAnimation {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 延迟动画类 */
.delay-0 { animation-delay: 0s; }
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }

/* 图标动画 - 强制优先级 */
@keyframes iconPulse {
  0%, 100% {
    transform: scale(1) !important;
    opacity: 1 !important;
  }
  50% {
    transform: scale(1.2) !important;
    opacity: 0.7 !important;
  }
}

@keyframes iconBounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0) !important;
  }
  40% {
    transform: translateY(-15px) !important;
  }
  60% {
    transform: translateY(-8px) !important;
  }
}

@keyframes iconSpin {
  from {
    transform: rotate(0deg) !important;
  }
  to {
    transform: rotate(360deg) !important;
  }
}

@keyframes iconShake {
  0%, 100% {
    transform: translateX(0) !important;
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-3px) !important;
  }
  20%, 40%, 60%, 80% {
    transform: translateX(3px) !important;
  }
}

@keyframes iconFlash {
  0%, 50%, 100% {
    opacity: 1 !important;
  }
  25%, 75% {
    opacity: 0.2 !important;
  }
}

@keyframes iconSwing {
  20% {
    transform: rotate(15deg) !important;
  }
  40% {
    transform: rotate(-10deg) !important;
  }
  60% {
    transform: rotate(5deg) !important;
  }
  80% {
    transform: rotate(-5deg) !important;
  }
  100% {
    transform: rotate(0deg) !important;
  }
}

@keyframes iconTada {
  0% {
    transform: scale(1) !important;
  }
  10%, 20% {
    transform: scale(0.9) rotate(-3deg) !important;
  }
  30%, 50%, 70%, 90% {
    transform: scale(1.1) rotate(3deg) !important;
  }
  40%, 60%, 80% {
    transform: scale(1.1) rotate(-3deg) !important;
  }
  100% {
    transform: scale(1) rotate(0) !important;
  }
}

/* 强制动画显示 */
.service-icon[style*="animation-name"] {
  animation-play-state: running !important;
  animation-fill-mode: both !important;
  transform-origin: center !important;
  will-change: transform, opacity !important;
}

/* 直接显示图标的基础样式 */
.service-icon-direct {
  transition: all 0.3s ease !important;
  transform-origin: center !important;
  position: relative !important;
  z-index: 1 !important;
}

/* 动画CSS类 */
.icon-spin-animation {
  animation: iconSpin 2s linear infinite !important;
  animation-fill-mode: both !important;
  transform-origin: center !important;
  will-change: transform !important;
  backface-visibility: hidden !important;
}

.icon-pulse-animation {
  animation: iconPulse 2s ease-in-out infinite !important;
  animation-fill-mode: both !important;
  transform-origin: center !important;
  will-change: transform, opacity !important;
  backface-visibility: hidden !important;
}

.icon-flash-animation {
  animation: iconFlash 2s ease-in-out infinite !important;
  animation-fill-mode: both !important;
  transform-origin: center !important;
  will-change: opacity !important;
  backface-visibility: hidden !important;
}

.icon-bounce-animation {
  animation: iconBounce 2s ease-in-out infinite !important;
  animation-fill-mode: both !important;
  transform-origin: center !important;
}

.icon-shake-animation {
  animation: iconShake 2s ease-in-out infinite !important;
  animation-fill-mode: both !important;
  transform-origin: center !important;
}

.icon-swing-animation {
  animation: iconSwing 2s ease-in-out infinite !important;
  animation-fill-mode: both !important;
  transform-origin: center !important;
}

.icon-tada-animation {
  animation: iconTada 2s ease-in-out infinite !important;
  animation-fill-mode: both !important;
  transform-origin: center !important;
}

/* 悬浮按钮组 */
.floating-buttons {
  position: fixed !important;
  right: 24px !important;
  bottom: 24px !important;
  z-index: 9999 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  pointer-events: auto !important;
}

.floating-btn {
  width: 56px !important;
  height: 56px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25) !important;
  border: none !important;
  position: relative !important;
  overflow: hidden !important;
  pointer-events: auto !important;
}

.floating-btn .el-icon {
  font-size: 24px !important;
  position: relative !important;
  z-index: 1 !important;
  transition: all 0.3s ease !important;
}

/* 客服按钮 - 黑色背景 */
.service-btn {
  background: #000000 !important;
  color: #ffffff !important;
}

.service-btn:hover {
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
  background: #333333 !important;
}

.service-btn:hover .el-icon {
  transform: scale(1.1) !important;
}

.service-btn:active {
  transform: translateY(0) scale(1) !important;
}

/* 回到顶部按钮 */
.back-to-top-btn {
  background: #ffffff !important;
  color: #000000 !important;
  border: 2px solid #000000 !important;
}

.back-to-top-btn .el-icon {
  transform: rotate(-90deg) !important;
}

.back-to-top-btn:hover {
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
  background: #f0f0f0 !important;
}

.back-to-top-btn:hover .el-icon {
  transform: rotate(-90deg) scale(1.1) !important;
}

.back-to-top-btn:active {
  transform: translateY(0) scale(1) !important;
}

/* 按钮入场动画 */
.floating-btn {
  animation: floatingBtnEntrance 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes floatingBtnEntrance {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .floating-buttons {
    right: 16px;
    bottom: 16px;
    gap: 8px;
  }
  
  .floating-btn {
    width: 48px;
    height: 48px;
  }
  
  .floating-btn .el-icon {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .floating-buttons {
    right: 12px;
    bottom: 12px;
  }
  
  .floating-btn {
    width: 44px;
    height: 44px;
  }
  
  .floating-btn .el-icon {
    font-size: 18px;
  }
}
</style>
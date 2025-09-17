<template>
  <div class="payment-container">
    <div class="payment-card">
      <div class="payment-header">
        <h2>支付订单</h2>
        <div class="order-info">
          <p><strong>订单号：</strong>{{ orderNo }}</p>
          <p><strong>查询项目：</strong>{{ queryItemName }}</p>
          <p><strong>支付金额：</strong><span class="amount">¥{{ amount }}</span></p>
          <p><strong>创建时间：</strong>{{ formatTime(createdAt) }}</p>
        </div>
      </div>

      <div class="payment-methods">
        <h3>选择支付方式</h3>
        <div class="method-list" v-if="availablePaymentMethods.length > 0">
          <div 
            v-for="method in availablePaymentMethods" 
            :key="method.code"
            class="method-item"
            :class="{ 
              active: selectedMethod === method.code,
              disabled: method.code === 'wechat' && method.disabled 
            }"
            @click="selectPaymentMethod(method)"
          >
            <div class="method-icon">
              <i :class="getMethodIcon(method.code)"></i>
            </div>
            <div class="method-info">
              <div class="method-name">
                {{ method.name }}
                <span v-if="method.disabled && method.disabledReason" class="status-badge">{{ method.disabledReason }}</span>
                <span v-if="method.code === 'epay' && !method.disabled" class="status-badge recommended">推荐</span>
              </div>
              <div class="method-desc">{{ getMethodDesc(method.code) }}</div>
            </div>
          </div>
        </div>
        <div v-else class="no-methods">
          <p>暂无可用的支付方式</p>
        </div>
      </div>

      <!-- 支付协议 -->
      <div class="payment-agreement">
        <label class="agreement-checkbox">
          <input type="checkbox" v-model="agreementChecked">
          <span class="checkmark"></span>
          <span class="agreement-text">
            我已阅读并同意
            <span 
              class="agreement-link"
              @click="showPaymentAgreement"
              :class="{ disabled: !systemSettings.paymentServiceAgreement }"
            >
              《支付服务协议》
            </span>
            和
            <span 
              class="agreement-link"
              @click="showPrivacyAgreement"
              :class="{ disabled: !systemSettings.privacyAgreement }"
            >
              《隐私政策》
            </span>
          </span>
        </label>
      </div>

      <div class="payment-actions">
        <button 
          class="pay-btn" 
          :disabled="!selectedMethod || !agreementChecked || isProcessing"
          @click="showPaymentModal"
        >
          <i class="fas fa-qrcode"></i>
          {{ isProcessing ? '处理中...' : '立即支付' }}
        </button>
        <button class="cancel-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i>
          返回
        </button>
      </div>

      <div class="payment-status" v-if="paymentStatus">
        <div class="status-item" :class="paymentStatus.toLowerCase()">
          <i :class="getStatusIcon(paymentStatus)"></i>
          <span>{{ getStatusText(paymentStatus) }}</span>
        </div>
      </div>
    </div>

    <!-- 支付弹窗 -->
    <div class="payment-modal" v-if="showModal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>扫码支付</h3>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="payment-info">
            <div class="payment-method-display">
              <i :class="getMethodIcon(selectedMethod)"></i>
              <span>{{ getSelectedMethodName() }}</span>
            </div>
            <div class="payment-amount-display">
              <span class="amount-label">支付金额</span>
              <span class="amount-value">¥{{ amount }}</span>
            </div>
          </div>

          <div class="qrcode-container" v-if="paymentUrl">
            <div class="qrcode-wrapper">
              <canvas ref="qrCanvas" class="qr-canvas"></canvas>
            </div>
            
            <!-- 微信环境特殊提示 -->
            <div class="wechat-tips" v-if="isWechat()">
              <div class="warning-box">
                <i class="fas fa-exclamation-triangle"></i>
                <p><strong>微信内无法直接支付</strong></p>
                <p>请点击右上角菜单，选择"在浏览器中打开"</p>
              </div>
              <div class="browser-actions">
                <button class="copy-link-btn" @click="copyPaymentUrl">
                  <i class="fas fa-copy"></i>
                  复制支付链接
                </button>
                <button class="open-browser-btn" @click="openInBrowser">
                  <i class="fas fa-external-link-alt"></i>
                  在浏览器中打开
                </button>
              </div>
            </div>
            
            <!-- 普通环境提示 -->
            <div class="qrcode-tips" v-else>
              <div v-if="paymentInfo && paymentInfo.directPayable && paymentInfo.paymentType === 'wechat_native'" class="direct-pay-tips">
                <div class="success-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <p><strong>✅ 直接支付二维码</strong></p>
                <p>请使用{{ getSelectedMethodName() }}扫描二维码直接完成支付</p>
                <p class="tip-text">支付完成后页面将自动跳转</p>
              </div>
              <div v-else-if="paymentInfo && paymentInfo.directPayable && (paymentInfo.paymentType === 'lakala' || paymentInfo.paymentType === 'third_party')" class="lakala-pay-tips">
                <div class="info-icon">
                  <i class="fas fa-info-circle"></i>
                </div>
                <p><strong>💳 第三方支付链接</strong></p>
                <p v-if="paymentInfo.paymentType === 'lakala'">扫描二维码将打开拉卡拉支付页面</p>
                <p v-else>扫描二维码将打开第三方支付页面</p>
                <p class="tip-text">在微信中扫码会提示"可用浏览器打开来下载此文件"，这是正常现象</p>
                <p class="tip-text">请点击"用浏览器打开"或复制链接到微信中打开即可正常支付</p>
                <div class="copy-action">
                  <button class="copy-link-btn-small" @click="copyPaymentUrl">
                    <i class="fas fa-copy"></i>
                    复制支付链接
                  </button>
                </div>
              </div>
              <div v-else-if="paymentInfo && paymentInfo.fallbackMode" class="fallback-tips">
                <div class="warning-icon">
                  <i class="fas fa-exclamation-triangle"></i>
                </div>
                <p><strong>⚠️ 跳转支付模式</strong></p>
                <p>{{ (paymentInfo && paymentInfo.message) || '扫描二维码将跳转到支付页面' }}</p>
                <p class="tip-text">请在新页面中完成支付，支付完成后返回此页面</p>
              </div>
              <div v-else class="normal-tips">
                <p>请使用{{ getSelectedMethodName() }}扫描二维码完成支付</p>
                <p class="tip-text">支付完成后页面将自动跳转</p>
              </div>
            </div>
          </div>

          <div class="loading-container" v-else>
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
            <p>正在生成支付二维码...</p>
          </div>

          <div class="payment-status-modal" v-if="paymentStatus">
            <div class="status-item" :class="paymentStatus.toLowerCase()">
              <i :class="getStatusIcon(paymentStatus)"></i>
              <span>{{ getStatusText(paymentStatus) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="payment-timer" v-if="paymentUrl">
            <i class="fas fa-clock"></i>
            <span>请在 {{ formatTime(paymentExpireTime) }} 前完成支付</span>
          </div>
          <div class="modal-actions">
            <button class="check-status-btn" @click="checkPaymentStatus" :disabled="isProcessing">
              <i class="fas fa-search"></i>
              检查支付状态
            </button>
            <button class="refresh-btn" @click="refreshPayment" :disabled="isProcessing">
              <i class="fas fa-refresh"></i>
              刷新二维码
            </button>
            <button class="cancel-modal-btn" @click="closeModal">
              取消支付
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 协议弹窗 -->
  <AgreementDialog 
    v-model="paymentAgreementDialogVisible"
    title="支付服务协议"
    :content="systemSettings.paymentServiceAgreement"
  />
  
  <AgreementDialog 
    v-model="privacyAgreementDialogVisible"
    title="隐私政策"
    :content="systemSettings.privacyAgreement"
  />
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import QRCode from 'qrcode'
import { getPaymentMethodInfo, isWechatEnvironment } from '@/utils/wechat'
import WechatPayment from '@/utils/wechat-payment'
import AgreementDialog from '@/components/AgreementDialog.vue'
import { useSystemSettingsStore } from '@/stores/systemSettings'

export default {
  name: 'Payment',
  components: {
    AgreementDialog
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const systemSettingsStore = useSystemSettingsStore()
    
    // 响应式数据
    const orderNo = ref('')
    const amount = ref('')
    const queryItemName = ref('')
    const createdAt = ref('')
    const paymentMethods = ref([])
    const selectedMethod = ref('')
    const isProcessing = ref(false)
    const paymentStatus = ref('')
    const paymentUrl = ref('')
    const showModal = ref(false)
    const paymentExpireTime = ref(null)
    const qrCanvas = ref(null)
    const paymentInfo = ref({
      directPayable: false,
      fallbackMode: false,
      message: ''
    })
    
    // 协议相关
    const agreementChecked = ref(false)
    const paymentAgreementDialogVisible = ref(false)
    const privacyAgreementDialogVisible = ref(false)
    
    // 计算属性
    const systemSettings = computed(() => systemSettingsStore.settings)
    
    // 轮询相关
    let statusCheckInterval = null

    // 从URL参数获取订单信息
    const initOrderInfo = () => {
      orderNo.value = route.params.orderNo || ''
      amount.value = route.query.amount || '0.00'
      queryItemName.value = decodeURIComponent(route.query.queryItemName || '')
      createdAt.value = route.query.createdAt || ''
      
      console.log('订单信息:', {
        orderNo: orderNo.value,
        amount: amount.value,
        queryItemName: queryItemName.value,
        createdAt: createdAt.value
      })
    }

    // 获取支付方式
    const fetchPaymentMethods = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/payments/methods', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          paymentMethods.value = data.methods || []
          
          // 等待下一个tick，确保计算属性已更新
          await nextTick()
          
          // 优先选择易支付，如果没有则选择第一个可用的
          const availableMethods = availablePaymentMethods.value.filter(m => !m.disabled)
          const epayMethod = availableMethods.find(m => m.code === 'epay')
          
          if (epayMethod) {
            selectedMethod.value = 'epay'
          } else if (availableMethods.length > 0) {
            selectedMethod.value = availableMethods[0].code
          }
          
          console.log('支付方式加载完成:', {
            allMethods: paymentMethods.value.map(m => m.code),
            availableMethods: availableMethods.map(m => m.code),
            selectedMethod: selectedMethod.value
          })
        }
      } catch (error) {
        console.error('获取支付方式失败:', error)
        ElMessage.error('获取支付方式失败')
      }
    }

    // 显示支付弹窗或直接跳转
    const showPaymentModal = async () => {
      if (!selectedMethod.value) {
        ElMessage.warning('请选择支付方式')
        return
      }

      isProcessing.value = true
      
      // 设置支付过期时间（15分钟后）
      paymentExpireTime.value = new Date(Date.now() + 15 * 60 * 1000)
      
      try {
        // 先创建支付订单，根据返回的支付模式决定是否显示弹窗
        await handlePayment()
      } catch (error) {
        console.error('创建支付订单失败:', error)
        ElMessage.error('创建支付订单失败')
        isProcessing.value = false
      }
    }

    // 关闭支付弹窗
    const closeModal = () => {
      showModal.value = false
      paymentUrl.value = ''
      stopStatusCheck()
    }

    // 处理支付
    const handlePayment = async () => {
      if (!selectedMethod.value) {
        ElMessage.warning('请选择支付方式')
        return
      }

      // 协议检查
      if (!agreementChecked.value) {
        ElMessage.warning('请先阅读并同意支付协议')
        return
      }

      // 如果是微信支付，优先尝试使用JS-SDK
      if (selectedMethod.value === 'wechat' && isWechat()) {
        try {
          await handleWechatJSSDKPayment()
          return
        } catch (error) {
          console.warn('微信JS-SDK支付失败，降级到二维码模式:', error)
          ElMessage.warning('微信JS-SDK支付失败，使用二维码支付')
          // 继续执行原有的二维码支付逻辑
        }
      }

      isProcessing.value = true
      
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/payments/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            orderNo: orderNo.value,
            paymentMethod: selectedMethod.value,
            amount: amount.value,
            description: `查询服务-${orderNo.value}`
          })
        })

        const data = await response.json()
        
        if (response.ok && data.success) {
          paymentUrl.value = data.paymentUrl
          
          // 保存支付模式信息
          const isQRMode = data.isQRMode || false
          const isRedirectMode = data.isRedirectMode || false
          const directPayable = data.directPayable || false
          const fallbackMode = data.fallbackMode || false
          
          // 更新支付信息
          paymentInfo.value = {
            directPayable,
            fallbackMode,
            message: data.message || '',
            paymentType: data.paymentType || 'unknown'
          }
          
          console.log('支付模式信息:', {
            isQRMode,
            isRedirectMode,
            directPayable,
            fallbackMode,
            paymentMethod: selectedMethod.value,
            qrCodeData: data.qrCodeData,
            paymentUrl: data.paymentUrl,
            message: data.message
          })
          
          // 根据支付模式选择不同的处理方式
          if (isRedirectMode && !isQRMode) {
            // 跳转模式：直接跳转到支付页面
            console.log('跳转模式：直接跳转到支付页面')
            
            // 不显示弹窗，直接跳转
            showModal.value = false
            
            // 开始轮询检测支付状态
            startStatusCheck(2000) // 每2秒检查一次，更频繁
            
            // 直接跳转到支付页面
            window.open(data.paymentUrl, '_blank')
            ElMessage.success('正在跳转到支付页面，支付完成后页面将自动更新（约2-5秒）')
            
          } else {
            // 扫码模式：显示二维码弹窗
            console.log('扫码模式：显示二维码')
            
            // 显示弹窗
            showModal.value = true
            
            // 根据支付模式生成二维码
            await nextTick()
            if (data.qrCodeData) {
              await generateQRCode(data.qrCodeData)
            } else {
              await generateQRCode(data.paymentUrl)
            }
            
            // 开始轮询检测支付状态 - 扫码模式也使用较短的轮询间隔
            startStatusCheck(2000) // 每2秒检查一次，与跳转模式保持一致
          }
          
        } else {
          throw new Error(data.message || '创建支付订单失败')
        }
      } catch (error) {
        console.error('支付处理失败:', error)
        ElMessage.error(error.message || '支付处理失败')
      } finally {
        isProcessing.value = false
      }
    }

    // 显示协议弹窗的方法
    const showPaymentAgreement = () => {
      paymentAgreementDialogVisible.value = true
    }

    const showPrivacyAgreement = () => {
      privacyAgreementDialogVisible.value = true
    }

    // 返回上一页
    const goBack = () => {
      router.go(-1)
    }

    // 组件挂载时初始化
    onMounted(() => {
      initOrderInfo()
      fetchPaymentMethods()
    })

    // 组件卸载时清理
    onUnmounted(() => {
      stopStatusCheck()
    })

    // 计算可用的支付方式
    const availablePaymentMethods = computed(() => {
      return paymentMethods.value.map(method => {
        // 处理微信支付的特殊逻辑
        if (method.code === 'wechat') {
          const wechatInfo = getPaymentMethodInfo('wechat')
          return {
            ...method,
            disabled: wechatInfo.disabled,
            disabledReason: wechatInfo.disabledReason
          }
        }
        return method
      }).sort((a, b) => {
        // 易支付排在最前面
        if (a.code === 'epay') return -1
        if (b.code === 'epay') return 1
        
        // 禁用的排在后面
        if (a.disabled && !b.disabled) return 1
        if (!a.disabled && b.disabled) return -1
        
        return 0
      })
    })

    // 选择支付方式
    const selectPaymentMethod = (method) => {
      if (method.disabled) {
        ElMessage.warning(method.disabledReason || '该支付方式暂不可用')
        return
      }
      selectedMethod.value = method.code
    }

    // 获取支付方式图标
    const getMethodIcon = (code) => {
      const icons = {
        wechat: 'fab fa-weixin',
        alipay: 'fab fa-alipay',
        epay: 'fas fa-credit-card'
      }
      return icons[code] || 'fas fa-credit-card'
    }

    // 获取支付方式描述
    const getMethodDesc = (code) => {
      const descs = {
        wechat: '使用微信扫码支付',
        alipay: '使用支付宝扫码支付',
        epay: '支持微信、支付宝等多种支付方式'
      }
      return descs[code] || '扫码支付'
    }

    // 获取选中的支付方式名称
    const getSelectedMethodName = () => {
      const method = paymentMethods.value.find(m => m.code === selectedMethod.value)
      return method ? method.name : '未知支付方式'
    }

    // 格式化时间
    const formatTime = (time) => {
      if (!time) return ''
      const date = new Date(time)
      return date.toLocaleString('zh-CN')
    }

    // 获取状态图标
    const getStatusIcon = (status) => {
      const icons = {
        pending: 'fas fa-clock',
        processing: 'fas fa-spinner fa-spin',
        success: 'fas fa-check-circle',
        paid: 'fas fa-check-circle',
        completed: 'fas fa-check-circle',
        failed: 'fas fa-times-circle',
        cancelled: 'fas fa-ban'
      }
      return icons[status] || 'fas fa-question-circle'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const texts = {
        pending: '等待支付',
        processing: '支付处理中',
        success: '支付成功',
        paid: '支付成功',
        completed: '支付完成',
        failed: '支付失败',
        cancelled: '支付已取消'
      }
      return texts[status] || '等待支付'  // 修改：未知状态显示为等待支付而不是处理中
    }

    // 生成二维码
    const generateQRCode = async (data) => {
      try {
        if (qrCanvas.value) {
          await QRCode.toCanvas(qrCanvas.value, data, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          })
        }
      } catch (error) {
        console.error('生成二维码失败:', error)
        ElMessage.error('生成二维码失败')
      }
    }

    // 检查支付状态
    const checkPaymentStatus = async () => {
      if (!orderNo.value) return
      
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/payments/status/${orderNo.value}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('支付状态查询返回:', data) // 添加调试日志
          
          // 后端返回的状态在 data.status 字段中
          const status = data.status
          paymentStatus.value = status
          
          console.log('当前支付状态:', status) // 添加状态日志
          
          // 支持多种成功状态
          if (status === 'success' || status === 'paid' || status === 'completed') {
            console.log('支付成功，准备跳转到成功页面')
            ElMessage.success('支付成功！')
            stopStatusCheck()
            
            // 关闭支付弹窗
            showModal.value = false
            
            // 立即跳转到支付成功页面 - 修复PC端跳转路径
            setTimeout(() => {
              console.log('正在跳转到PC端支付成功页面...')
              router.push('/payment-success?orderNo=' + orderNo.value + '&amount=' + amount.value)
            }, 1000) // 缩短延迟时间到1秒
            
          } else if (status === 'failed' || status === 'cancelled') {
            console.log('支付失败或取消')
            ElMessage.error('支付失败，请重试')
            stopStatusCheck()
          } else {
            console.log('支付状态仍为:', status, '继续轮询...')
          }
        } else {
          console.error('支付状态查询请求失败:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('检查支付状态失败:', error)
      }
    }

    // 开始状态检查
    const startStatusCheck = (interval = 3000) => { // 修改：缩短轮询间隔到3秒
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
      }
      
      console.log('开始支付状态轮询，间隔:', interval + 'ms')
      
      // 立即执行一次状态检查
      checkPaymentStatus()
      
      statusCheckInterval = setInterval(() => {
        console.log('执行定时支付状态检查...')
        checkPaymentStatus()
      }, interval)
    }

    // 停止状态检查
    const stopStatusCheck = () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
        statusCheckInterval = null
      }
    }

    // 刷新支付
    const refreshPayment = async () => {
      if (isProcessing.value) return
      
      isProcessing.value = true
      try {
        await handlePayment()
      } catch (error) {
        console.error('刷新支付失败:', error)
        ElMessage.error('刷新支付失败')
      } finally {
        isProcessing.value = false
      }
    }

    // 判断是否在微信环境
    const isWechat = () => {
      return isWechatEnvironment()
    }

    // 复制支付链接
    const copyPaymentUrl = async () => {
      try {
        await navigator.clipboard.writeText(paymentUrl.value)
        ElMessage.success('支付链接已复制到剪贴板')
      } catch (error) {
        console.error('复制失败:', error)
        ElMessage.error('复制失败，请手动复制')
      }
    }

    // 在浏览器中打开
    const openInBrowser = () => {
      window.open(paymentUrl.value, '_blank')
    }

    // 微信JS-SDK支付处理
    const handleWechatJSSDKPayment = async () => {
      try {
        const wechatPayment = new WechatPayment()
        const result = await wechatPayment.pay({
          orderNo: orderNo.value,
          amount: amount.value,
          description: `查询服务-${orderNo.value}`
        })
        
        if (result.success) {
          ElMessage.success('支付成功！')
          setTimeout(() => {
            router.push('/orders')
          }, 2000)
        } else {
          throw new Error(result.message || '微信支付失败')
        }
      } catch (error) {
        console.error('微信JS-SDK支付失败:', error)
        throw error
      }
    }

    return {
      // 响应式数据
      orderNo,
      amount,
      queryItemName,
      createdAt,
      selectedMethod,
      isProcessing,
      paymentStatus,
      paymentUrl,
      showModal,
      paymentExpireTime,
      qrCanvas,
      paymentInfo,
      // 协议相关
      agreementChecked,
      paymentAgreementDialogVisible,
      privacyAgreementDialogVisible,
      systemSettings,
      // 计算属性
      availablePaymentMethods,
      // 方法
      selectPaymentMethod,
      getMethodIcon,
      getMethodDesc,
      getSelectedMethodName,
      formatTime,
      getStatusIcon,
      getStatusText,
      showPaymentModal,
      closeModal,
      handlePayment,
      checkPaymentStatus,
      refreshPayment,
      isWechat,
      copyPaymentUrl,
      openInBrowser,
      goBack,
      // 协议弹窗方法
      showPaymentAgreement,
      showPrivacyAgreement
    }
  }
}
</script>

<style scoped>
.payment-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.payment-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 600px;
  margin-top: 20px;
}

.payment-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.payment-header h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
}

.order-info {
  text-align: left;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.order-info p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.order-info .amount {
  color: #e74c3c;
  font-weight: bold;
  font-size: 16px;
}

.payment-methods {
  margin-bottom: 30px;
}

.payment-methods h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.method-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.method-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.method-item.active {
  border-color: #409eff;
  background: #f0f8ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.method-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
}

.method-item.disabled:hover {
  border-color: #e9ecef;
  box-shadow: none;
}

.method-icon {
  font-size: 24px;
  margin-right: 16px;
  width: 40px;
  text-align: center;
}

.method-icon .fab.fa-weixin {
  color: #07c160;
}

.method-icon .fab.fa-alipay {
  color: #1677ff;
}

.method-icon .fas.fa-credit-card {
  color: #409eff;
}

.method-info {
  flex: 1;
}

.method-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.method-desc {
  color: #666;
  font-size: 13px;
}

.status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: normal;
}

.status-badge.recommended {
  background: #e8f5e8;
  color: #52c41a;
}

.status-badge:not(.recommended) {
  background: #fff2e8;
  color: #fa8c16;
}

.no-methods {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

/* 支付协议样式 */
.payment-agreement {
  margin: 20px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.agreement-checkbox {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  position: relative;
}

.agreement-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 18px;
  width: 18px;
  background-color: #fff;
  border: 2px solid #ddd;
  border-radius: 3px;
  margin-right: 12px;
  margin-top: 2px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.agreement-checkbox input[type="checkbox"]:checked + .checkmark {
  background-color: #409eff;
  border-color: #409eff;
}

.agreement-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.agreement-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  flex: 1;
}

.agreement-link {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.3s ease;
}

.agreement-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.agreement-link.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.agreement-link.disabled:hover {
  color: #c0c4cc;
  text-decoration: none;
}

.payment-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.pay-btn, .cancel-btn {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pay-btn {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: white;
}

.pay-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #66b1ff, #409eff);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.pay-btn:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.payment-status {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
}

.status-item.pending {
  color: #fa8c16;
  background: #fff7e6;
}

.status-item.processing {
  color: #1890ff;
  background: #e6f7ff;
}

.status-item.success {
  color: #52c41a;
  background: #f6ffed;
}

.status-item.failed {
  color: #ff4d4f;
  background: #fff2f0;
}

.status-item.cancelled {
  color: #8c8c8c;
  background: #f5f5f5;
}

/* 支付弹窗样式 */
.payment-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 24px;
}

.payment-info {
  text-align: center;
  margin-bottom: 24px;
}

.payment-method-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.payment-method-display i {
  font-size: 20px;
}

.payment-amount-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.amount-label {
  font-size: 14px;
  color: #666;
}

.amount-value {
  font-size: 24px;
  font-weight: bold;
  color: #e74c3c;
}

.qrcode-container {
  text-align: center;
}

.qrcode-wrapper {
  display: inline-block;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.qr-canvas {
  display: block;
}

.qrcode-tips, .wechat-tips {
  margin-top: 16px;
}

.wechat-tips .warning-box {
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.wechat-tips .warning-box i {
  color: #fa8c16;
  font-size: 20px;
  margin-bottom: 8px;
}

.wechat-tips .warning-box p {
  margin: 4px 0;
  color: #8c4a00;
}

.browser-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.copy-link-btn, .open-browser-btn, .copy-link-btn-small {
  padding: 8px 16px;
  border: 1px solid #409eff;
  background: white;
  color: #409eff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.copy-link-btn:hover, .open-browser-btn:hover, .copy-link-btn-small:hover {
  background: #409eff;
  color: white;
}

.direct-pay-tips, .lakala-pay-tips, .fallback-tips, .normal-tips {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.direct-pay-tips {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.direct-pay-tips .success-icon {
  color: #52c41a;
  font-size: 20px;
  margin-bottom: 8px;
}

.lakala-pay-tips {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
}

.lakala-pay-tips .info-icon {
  color: #1890ff;
  font-size: 20px;
  margin-bottom: 8px;
}

.fallback-tips {
  background: #fff7e6;
  border: 1px solid #ffd591;
}

.fallback-tips .warning-icon {
  color: #fa8c16;
  font-size: 20px;
  margin-bottom: 8px;
}

.normal-tips {
  background: #f0f8ff;
  border: 1px solid #d6e4ff;
}

.direct-pay-tips p, .lakala-pay-tips p, .fallback-tips p, .normal-tips p {
  margin: 4px 0;
  color: #333;
}

.tip-text {
  font-size: 13px;
  color: #666 !important;
}

.copy-action {
  margin-top: 12px;
  text-align: center;
}

.loading-container {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  font-size: 24px;
  color: #409eff;
  margin-bottom: 16px;
}

.loading-container p {
  color: #666;
  margin: 0;
}

.payment-status-modal {
  margin-top: 20px;
  text-align: center;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #eee;
  background: #fafafa;
}

.payment-timer {
  text-align: center;
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.check-status-btn, .refresh-btn, .cancel-modal-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background: white;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.check-status-btn:hover, .refresh-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.check-status-btn:disabled, .refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-modal-btn {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.cancel-modal-btn:hover {
  background: #5a6268;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .payment-container {
    padding: 10px;
  }
  
  .payment-card {
    padding: 20px;
    margin-top: 10px;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .payment-actions {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .browser-actions {
    flex-direction: column;
  }
}
</style>
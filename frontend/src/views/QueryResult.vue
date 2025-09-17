<template>
  <div class="query-result-container">
    <div class="result-box">
      <div class="result-header">
        <h2>查询结果</h2>
        <p>订单号：{{ orderNo }}</p>
      </div>
      
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading"><loading /></el-icon>
        <p>正在加载查询结果...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <el-icon><circle-close /></el-icon>
        <p>{{ error }}</p>
        <el-button type="primary" @click="fetchQueryResult">重新加载</el-button>
      </div>
      
      <div v-else class="result-content">
        <div class="query-info">
          <div class="info-item">
            <span class="label">查询项目：</span>
            <span class="value">{{ resultData.queryItemName }}</span>
          </div>
          <div class="info-item">
            <span class="label">查询时间：</span>
            <span class="value">{{ formatDate(resultData.queryTime) }}</span>
          </div>
        </div>
        
        <!-- 个人信息查询结果 -->
        <template v-if="resultData.type === 'person'">
          <div class="result-section">
            <h3>基本信息</h3>
            <div class="result-table">
              <div class="table-row">
                <div class="table-cell label">姓名</div>
                <div class="table-cell value">{{ resultData.basicInfo?.name || '无数据' }}</div>
              </div>
              <div class="table-row">
                <div class="table-cell label">性别</div>
                <div class="table-cell value">{{ resultData.basicInfo?.gender || '无数据' }}</div>
              </div>
              <div class="table-row">
                <div class="table-cell label">年龄</div>
                <div class="table-cell value">{{ resultData.basicInfo?.age || '无数据' }}</div>
              </div>
              <div class="table-row">
                <div class="table-cell label">身份证号</div>
                <div class="table-cell value">{{ resultData.basicInfo?.idCard || '无数据' }}</div>
              </div>
              <div class="table-row">
                <div class="table-cell label">手机号</div>
                <div class="table-cell value">{{ resultData.basicInfo?.phone || '无数据' }}</div>
              </div>
              <div class="table-row">
                <div class="table-cell label">住址</div>
                <div class="table-cell value">{{ resultData.basicInfo?.address || '无数据' }}</div>
              </div>
            </div>
          </div>
          
          <!-- 征信逾期信息 -->
          <div v-if="resultData.creditInfo" class="result-section">
            <h3>征信逾期信息</h3>
            <div v-if="resultData.creditInfo.overdue && resultData.creditInfo.overdue.length > 0">
              <div class="result-table">
                <div class="table-header">
                  <div class="table-cell">逾期时间</div>
                  <div class="table-cell">逾期金额</div>
                  <div class="table-cell">逾期天数</div>
                  <div class="table-cell">机构名称</div>
                </div>
                <div v-for="(item, index) in resultData.creditInfo.overdue" :key="index" class="table-row">
                  <div class="table-cell">{{ formatDate(item.date) }}</div>
                  <div class="table-cell">{{ formatAmount(item.amount) }}元</div>
                  <div class="table-cell">{{ item.days }}天</div>
                  <div class="table-cell">{{ item.institution }}</div>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              <p>无逾期记录</p>
            </div>
          </div>
          
          <!-- 司法涉诉信息 -->
          <div v-if="resultData.judicialInfo" class="result-section">
            <h3>司法涉诉信息</h3>
            <div v-if="resultData.judicialInfo.cases && resultData.judicialInfo.cases.length > 0">
              <div class="result-table">
                <div class="table-header">
                  <div class="table-cell">案件编号</div>
                  <div class="table-cell">案件类型</div>
                  <div class="table-cell">立案时间</div>
                  <div class="table-cell">案件状态</div>
                </div>
                <div v-for="(item, index) in resultData.judicialInfo.cases" :key="index" class="table-row">
                  <div class="table-cell">{{ item.caseNo }}</div>
                  <div class="table-cell">{{ item.caseType }}</div>
                  <div class="table-cell">{{ formatDate(item.filingDate) }}</div>
                  <div class="table-cell">{{ item.status }}</div>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              <p>无司法涉诉记录</p>
            </div>
          </div>
          
          <!-- 人企关联信息 -->
          <div v-if="resultData.personCompanyInfo" class="result-section">
            <h3>人企关联信息</h3>
            <div v-if="resultData.personCompanyInfo.companies && resultData.personCompanyInfo.companies.length > 0">
              <div class="result-table">
                <div class="table-header">
                  <div class="table-cell">企业名称</div>
                  <div class="table-cell">关联类型</div>
                  <div class="table-cell">出资比例</div>
                  <div class="table-cell">关联时间</div>
                </div>
                <div v-for="(item, index) in resultData.personCompanyInfo.companies" :key="index" class="table-row">
                  <div class="table-cell">{{ item.companyName }}</div>
                  <div class="table-cell">{{ item.relationType }}</div>
                  <div class="table-cell">{{ item.investmentRatio || '-' }}</div>
                  <div class="table-cell">{{ formatDate(item.relationTime) }}</div>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              <p>无人企关联记录</p>
            </div>
          </div>
          
          <!-- 婚姻状况 -->
          <div v-if="resultData.marriageInfo" class="result-section">
            <h3>婚姻状况</h3>
            <div class="result-table">
              <div class="table-row">
                <div class="table-cell label">婚姻状态</div>
                <div class="table-cell value">{{ resultData.marriageInfo.status || '无数据' }}</div>
              </div>
              <div v-if="resultData.marriageInfo.status === '已婚'" class="table-row">
                <div class="table-cell label">配偶姓名</div>
                <div class="table-cell value">{{ resultData.marriageInfo.spouseName || '无数据' }}</div>
              </div>
              <div v-if="resultData.marriageInfo.status === '已婚'" class="table-row">
                <div class="table-cell label">结婚日期</div>
                <div class="table-cell value">{{ formatDate(resultData.marriageInfo.marriageDate) || '无数据' }}</div>
              </div>
            </div>
          </div>
          
          <!-- 贷款记录 -->
          <div v-if="resultData.loanInfo" class="result-section">
            <h3>贷款记录</h3>
            <div v-if="resultData.loanInfo.loans && resultData.loanInfo.loans.length > 0">
              <div class="result-table">
                <div class="table-header">
                  <div class="table-cell">贷款机构</div>
                  <div class="table-cell">贷款金额</div>
                  <div class="table-cell">贷款日期</div>
                  <div class="table-cell">贷款期限</div>
                  <div class="table-cell">还款状态</div>
                </div>
                <div v-for="(item, index) in resultData.loanInfo.loans" :key="index" class="table-row">
                  <div class="table-cell">{{ item.institution }}</div>
                  <div class="table-cell">{{ formatAmount(item.amount) }}元</div>
                  <div class="table-cell">{{ formatDate(item.loanDate) }}</div>
                  <div class="table-cell">{{ item.term }}</div>
                  <div class="table-cell">{{ item.status }}</div>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              <p>无贷款记录</p>
            </div>
          </div>
        </template>
        
        <!-- 企业查询结果 -->
        <template v-else-if="resultData.type === 'company'">
          <div class="result-section">
            <h3>企业基本信息</h3>
            <div class="result-table">
              <div class="table-row">
                <div class="table-cell label">企业名称</div>
                <div class="table-cell value">{{ resultData.basicInfo?.name || '无数据' }}</div>
              </div>
              <div class="table-row">
                <div class="table-cell label">统一社会信用代码</div>
                <div class="table-cell value">{{ resultData.basicInfo?.creditCode || '无数据' }}</div>
              </div>
              <div class="table-row">
                <div class="table-cell label">注册资本</div>
                <div class="table-cell value">{{ resultData.basicInfo?.registeredCapital || '无数据' }}</div>
              </div>
              <div class="table-row">
                <div class="table-cell label">成立日期</div>
                <div class="table-cell value">{{ formatDate(resultData.basicInfo?.establishDate) || '无数据' }}</div>
              </div>
              <div class="table-row">
                <div class="table-cell label">企业类型</div>
                <div class="table-cell value">{{ resultData.basicInfo?.companyType || '无数据' }}</div>
              </div>
              <div class="table-row">
                <div class="table-cell label">经营状态</div>
                <div class="table-cell value">{{ resultData.basicInfo?.status || '无数据' }}</div>
              </div>
              <div class="table-row">
                <div class="table-cell label">注册地址</div>
                <div class="table-cell value">{{ resultData.basicInfo?.address || '无数据' }}</div>
              </div>
              <div class="table-row">
                <div class="table-cell label">经营范围</div>
                <div class="table-cell value">{{ resultData.basicInfo?.businessScope || '无数据' }}</div>
              </div>
            </div>
          </div>
          
          <!-- 企业涉诉信息 -->
          <div v-if="resultData.judicialInfo" class="result-section">
            <h3>企业涉诉信息</h3>
            <div v-if="resultData.judicialInfo.cases && resultData.judicialInfo.cases.length > 0">
              <div class="result-table">
                <div class="table-header">
                  <div class="table-cell">案件编号</div>
                  <div class="table-cell">案件类型</div>
                  <div class="table-cell">立案时间</div>
                  <div class="table-cell">案件状态</div>
                </div>
                <div v-for="(item, index) in resultData.judicialInfo.cases" :key="index" class="table-row">
                  <div class="table-cell">{{ item.caseNo }}</div>
                  <div class="table-cell">{{ item.caseType }}</div>
                  <div class="table-cell">{{ formatDate(item.filingDate) }}</div>
                  <div class="table-cell">{{ item.status }}</div>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              <p>无企业涉诉记录</p>
            </div>
          </div>
          
          <!-- 法人股东信息 -->
          <div v-if="resultData.shareholderInfo" class="result-section">
            <h3>法人股东信息</h3>
            <div v-if="resultData.shareholderInfo.shareholders && resultData.shareholderInfo.shareholders.length > 0">
              <div class="result-table">
                <div class="table-header">
                  <div class="table-cell">股东名称</div>
                  <div class="table-cell">股东类型</div>
                  <div class="table-cell">出资比例</div>
                  <div class="table-cell">认缴出资额</div>
                </div>
                <div v-for="(item, index) in resultData.shareholderInfo.shareholders" :key="index" class="table-row">
                  <div class="table-cell">{{ item.name }}</div>
                  <div class="table-cell">{{ item.type }}</div>
                  <div class="table-cell">{{ item.ratio }}</div>
                  <div class="table-cell">{{ item.amount }}</div>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              <p>无法人股东记录</p>
            </div>
          </div>
        </template>
        
        <div v-else class="no-data-container">
          <el-icon><warning /></el-icon>
          <p>暂无查询结果数据</p>
        </div>
      </div>
      
      <div class="result-actions">
        <el-button type="primary" @click="handleDownload">下载查询结果</el-button>
        <el-button @click="router.push('/query')">返回查询页面</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Loading, CircleClose, Warning } from '@element-plus/icons-vue';
import { getQueryResult } from '../api/query';
import { formatDate, formatAmount } from '../utils';

const route = useRoute();
const router = useRouter();
const orderNo = route.params.orderNo as string;

const loading = ref(true);
const error = ref('');
const resultData = reactive<any>({});

// 获取查询结果
const fetchQueryResult = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const res = await getQueryResult(orderNo);
    
    // 将查询结果数据赋值给resultData
    Object.assign(resultData, res.data);
  } catch (err: any) {
    error.value = err.message || '获取查询结果失败，请稍后再试';
    console.error('获取查询结果失败:', err);
  } finally {
    loading.value = false;
  }
};

// 下载查询结果
const handleDownload = () => {
  // 这里应该调用下载API
  // 由于我们没有实现该API，这里只显示一个消息
  ElMessage.success('查询结果下载中...');
};

onMounted(() => {
  fetchQueryResult();
});
</script>

<style scoped>
.query-result-container {
  min-height: 100%;
  background-color: #f5f7fa;
  padding: 20px;
}

.result-box {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.result-header {
  text-align: center;
  margin-bottom: 30px;
}

.result-header h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 10px;
}

.result-header p {
  color: #666;
}

.loading-container,
.error-container,
.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  color: #666;
}

.loading-container .el-icon,
.error-container .el-icon,
.no-data-container .el-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.error-container .el-icon {
  color: #f56c6c;
}

.no-data-container .el-icon {
  color: #e6a23c;
}

.query-info {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  width: 100px;
  color: #666;
}

.info-item .value {
  flex: 1;
  color: #333;
}

.result-section {
  margin-bottom: 30px;
}

.result-section h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.result-table {
  width: 100%;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.table-header {
  display: flex;
  background-color: #f5f7fa;
  font-weight: bold;
}

.table-row {
  display: flex;
  border-top: 1px solid #ebeef5;
}

.table-row:first-child {
  border-top: none;
}

.table-cell {
  padding: 12px 15px;
  flex: 1;
  word-break: break-all;
}

.table-cell.label {
  width: 120px;
  flex: none;
  background-color: #f5f7fa;
  color: #666;
}

.no-data {
  padding: 20px;
  text-align: center;
  color: #909399;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .result-box {
    padding: 20px;
  }
  
  .table-header,
  .table-row {
    flex-direction: column;
  }
  
  .table-cell {
    border-bottom: 1px solid #ebeef5;
  }
  
  .table-row:last-child .table-cell:last-child {
    border-bottom: none;
  }
  
  .table-header .table-cell {
    text-align: center;
  }
  
  .table-cell.label {
    width: 100%;
  }
}
</style>
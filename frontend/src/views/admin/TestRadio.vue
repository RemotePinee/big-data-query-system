<template>
  <div style="padding: 20px;">
    <h2>单选按钮测试页面</h2>
    
    <div style="margin: 20px 0;">
      <h3>测试1: 基本单选按钮</h3>
      <el-radio-group v-model="radio1">
        <el-radio label="option1">选项1</el-radio>
        <el-radio label="option2">选项2</el-radio>
      </el-radio-group>
      <p>当前选择: {{ radio1 }}</p>
    </div>

    <div style="margin: 20px 0;">
      <h3>测试2: 支付模式单选按钮</h3>
      <el-radio-group v-model="paymentMode">
        <el-radio label="redirect">跳转模式</el-radio>
        <el-radio label="qrcode">扫码模式</el-radio>
      </el-radio-group>
      <p>当前选择: {{ paymentMode }}</p>
    </div>

    <div style="margin: 20px 0;">
      <h3>测试3: 表单中的单选按钮</h3>
      <el-form :model="testForm" label-width="120px">
        <el-form-item label="支付模式">
          <el-radio-group v-model="testForm.paymentMode">
            <el-radio label="redirect">跳转模式</el-radio>
            <el-radio label="qrcode">扫码模式</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="支付类型">
          <el-select v-model="testForm.type">
            <el-option label="易支付" value="epay"></el-option>
            <el-option label="微信支付" value="wechat"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <p>表单数据: {{ JSON.stringify(testForm) }}</p>
    </div>

    <div style="margin: 20px 0;">
      <el-button @click="changeValue">改变值</el-button>
      <el-button @click="resetValue">重置值</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const radio1 = ref('option1');
const paymentMode = ref('redirect');
const testForm = ref({
  paymentMode: 'redirect',
  type: 'epay'
});

const changeValue = () => {
  paymentMode.value = paymentMode.value === 'redirect' ? 'qrcode' : 'redirect';
  testForm.value.paymentMode = testForm.value.paymentMode === 'redirect' ? 'qrcode' : 'redirect';
};

const resetValue = () => {
  radio1.value = 'option1';
  paymentMode.value = 'redirect';
  testForm.value.paymentMode = 'redirect';
};
</script>
import { pool } from '../config/database';

/**
 * 更新查询项目的参数模式和结果模式
 */
const updateQueryItems = async () => {
  try {
    console.log('开始更新查询项目数据...');

    // 企业信息查询的参数模式
    const companyParamsSchema = JSON.stringify([
      {
        name: "companyName",
        label: "企业名称",
        type: "text",
        required: true,
        placeholder: "请输入完整企业名称"
      },
      {
        name: "creditCode",
        label: "统一社会信用代码",
        type: "text",
        required: false,
        placeholder: "选填，提高查询精确度"
      }
    ]);

    // 企业信息查询的结果模式
    const companyResultSchema = JSON.stringify({
      type: "object",
      properties: {
        basicInfo: {
          type: "object",
          properties: {
            name: { type: "string" },
            creditCode: { type: "string" },
            registerDate: { type: "string" },
            registeredCapital: { type: "string" },
            legalPerson: { type: "string" },
            status: { type: "string" }
          }
        },
        contactInfo: {
          type: "object",
          properties: {
            address: { type: "string" },
            phone: { type: "string" },
            email: { type: "string" }
          }
        }
      }
    });

    // 个人征信查询的参数模式
    const personalParamsSchema = JSON.stringify([
      {
        name: "name",
        label: "姓名",
        type: "text",
        required: true,
        placeholder: "请输入真实姓名"
      },
      {
        name: "idCard",
        label: "身份证号",
        type: "text",
        required: true,
        placeholder: "请输入18位身份证号"
      }
    ]);

    // 个人征信查询的结果模式
    const personalResultSchema = JSON.stringify({
      type: "object",
      properties: {
        personalInfo: {
          type: "object",
          properties: {
            name: { type: "string" },
            idCard: { type: "string" },
            gender: { type: "string" },
            age: { type: "number" }
          }
        },
        creditScore: { type: "number" },
        loanHistory: {
          type: "array",
          items: {
            type: "object",
            properties: {
              institution: { type: "string" },
              amount: { type: "number" },
              startDate: { type: "string" },
              endDate: { type: "string" },
              status: { type: "string" }
            }
          }
        }
      }
    });

    // 不再自动检查和插入个人征信查询项目

    console.log('查询项目数据更新完成！');
    return true;
  } catch (error) {
    console.error('更新查询项目数据失败:', error);
    return false;
  }
};

export { updateQueryItems };
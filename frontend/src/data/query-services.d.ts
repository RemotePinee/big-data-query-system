// 类型声明文件
export interface QueryService {
  id: number
  name: string
  description: string
  icon: string
  iconClass?: string
  category: string
  price: number
  originalPrice?: number
  usage: number
  isHot?: boolean
  features: string[]
  platformFeatures?: any
}

export function getServicesForPlatform(platform: string): QueryService[]
export function getPlatformDifferences(serviceId: number): any
export function getIconClass(category: string): string
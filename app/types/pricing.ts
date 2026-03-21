export interface PricingPlan {
  id: 'pro' | 'team'
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
}

import { describe, expect, it } from 'vitest'
import { pricingPlans } from '../../app/data/pricing'

describe('pricing config', () => {
  it('defines placeholder monthly and yearly prices for the paid plans', () => {
    expect(pricingPlans).toEqual([
      expect.objectContaining({
        id: 'pro',
        monthlyPrice: expect.any(Number),
        yearlyPrice: expect.any(Number),
      }),
      expect.objectContaining({
        id: 'team',
        monthlyPrice: expect.any(Number),
        yearlyPrice: expect.any(Number),
      }),
    ])
  })
})

import { describe, expect, it } from 'vitest'
import { pricingPlans } from '../../app/data/pricing'

describe('pricing config', () => {
  it('defines placeholder monthly and yearly prices for the paid plan', () => {
    expect(pricingPlans).toEqual([
      expect.objectContaining({
        id: 'pro',
        monthlyPrice: expect.any(Number),
        yearlyPrice: expect.any(Number),
      }),
    ])
  })
})

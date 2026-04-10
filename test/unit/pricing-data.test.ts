import { describe, expect, it } from 'vitest'
import { pricingPlans } from '../../app/data/pricing'

describe('pricing config', () => {
  it('defines placeholder monthly and yearly prices for the paid plans', () => {
    expect(pricingPlans).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'pro',
        monthlyPrice: expect.any(Number),
        yearlyPrice: expect.any(Number),
      }),
      expect.objectContaining({
        id: 'teams',
        monthlyPrice: expect.any(Number),
        yearlyPrice: expect.any(Number),
      }),
    ]))
  })

  it('centralizes palette generation and save limits on each plan', () => {
    expect(pricingPlans).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'free',
        paletteGenerationLimit: 5,
        paletteSaveLimit: 1,
      }),
      expect.objectContaining({
        id: 'pro',
        paletteGenerationLimit: 60,
        paletteSaveLimit: 25,
      }),
      expect.objectContaining({
        id: 'teams',
        paletteGenerationLimit: 300,
        paletteSaveLimit: null,
      }),
    ]))
  })
})

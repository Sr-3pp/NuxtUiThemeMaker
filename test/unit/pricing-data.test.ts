import { describe, expect, it } from 'vitest'
import { pricingPlans } from '../../app/data/pricing'
import { planLimits } from '../../app/data/limits'

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
    expect(planLimits.free.paletteGenerationLimit).toBe(5)
    expect(planLimits.free.paletteSaveLimit).toBe(1)

    expect(pricingPlans).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'free',
        paletteGenerationLimit: planLimits.free.paletteGenerationLimit,
        paletteSaveLimit: planLimits.free.paletteSaveLimit,
      }),
      expect.objectContaining({
        id: 'pro',
        paletteGenerationLimit: planLimits.pro.paletteGenerationLimit,
        paletteSaveLimit: planLimits.pro.paletteSaveLimit,
      }),
      expect.objectContaining({
        id: 'teams',
        paletteGenerationLimit: planLimits.teams.paletteGenerationLimit,
        paletteSaveLimit: planLimits.teams.paletteSaveLimit,
      }),
    ]))
  })
})

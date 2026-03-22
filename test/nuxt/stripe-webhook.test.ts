import { createEvent, type H3Event } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const findUserByEmailMock = vi.fn()
const findUserByIdMock = vi.fn()
const findUserByStripeCustomerIdMock = vi.fn()
const updateBillingPlanForUserMock = vi.fn()
const updateEmailDeliveryForUserMock = vi.fn()
const sendPricingPlanPurchaseConfirmationEmailMock = vi.fn()
const verifyStripeWebhookSignatureMock = vi.fn()

vi.mock('~~/server/db/repositories/user-repository', () => ({
  findUserByEmail: findUserByEmailMock,
  findUserById: findUserByIdMock,
  findUserByStripeCustomerId: findUserByStripeCustomerIdMock,
  updateBillingPlanForUser: updateBillingPlanForUserMock,
  updateEmailDeliveryForUser: updateEmailDeliveryForUserMock,
}))

vi.mock('~~/server/services/email-service', () => ({
  sendPricingPlanPurchaseConfirmationEmail: sendPricingPlanPurchaseConfirmationEmailMock,
}))

vi.mock('~~/server/services/stripe-service', () => ({
  verifyStripeWebhookSignature: verifyStripeWebhookSignatureMock,
}))

function createWebhookEvent(body: Record<string, unknown>) {
  return createEvent({
    method: 'POST',
    url: '/api/stripe/webhook',
    headers: {
      'content-type': 'application/json',
      'stripe-signature': 't=1,v1=test',
    },
    body: JSON.stringify(body),
  } as never, {
    writableEnded: false,
    headersSent: false,
  } as never)
}

describe('stripe webhook handler', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    findUserByEmailMock.mockReset()
    findUserByIdMock.mockReset()
    findUserByStripeCustomerIdMock.mockReset()
    updateBillingPlanForUserMock.mockReset()
    updateEmailDeliveryForUserMock.mockReset()
    sendPricingPlanPurchaseConfirmationEmailMock.mockReset()
    verifyStripeWebhookSignatureMock.mockReset()
  })

  it('sends a purchase confirmation email after a completed checkout session', async () => {
    const user = {
      id: 'user-1',
      email: 'buyer@example.com',
      name: 'Casey Buyer',
      plan: 'free',
      planInterval: null,
    }

    findUserByIdMock.mockResolvedValueOnce(user)
    updateBillingPlanForUserMock.mockResolvedValueOnce({
      ...user,
      plan: 'pro',
      planInterval: 'monthly',
    })

    const { default: handler } = await import('~~/server/api/stripe/webhook.post')

    const result = await handler(createWebhookEvent({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer: 'cus_123',
          subscription: 'sub_123',
          client_reference_id: 'user-1',
          metadata: {
            planId: 'pro',
            billingInterval: 'monthly',
          },
        },
      },
    }) as H3Event)

    expect(result).toEqual({ received: true })
    expect(updateBillingPlanForUserMock).toHaveBeenCalledWith('user-1', expect.objectContaining({
      plan: 'pro',
      planStatus: 'active',
      planInterval: 'monthly',
      stripeCustomerId: 'cus_123',
      stripeSubscriptionId: 'sub_123',
    }))
    expect(sendPricingPlanPurchaseConfirmationEmailMock).toHaveBeenCalledWith({
      billingInterval: 'monthly',
      email: 'buyer@example.com',
      name: 'Casey Buyer',
      planId: 'pro',
    })
    expect(updateEmailDeliveryForUserMock).toHaveBeenCalledWith('user-1', {
      lastPurchaseConfirmationId: 'cs_test_123',
    })
  })

  it('does not resend a purchase confirmation email for the same checkout session', async () => {
    const user = {
      id: 'user-1',
      email: 'buyer@example.com',
      name: 'Casey Buyer',
      plan: 'pro',
      planInterval: 'monthly',
      lastPurchaseConfirmationId: 'cs_test_123',
    }

    findUserByIdMock.mockResolvedValueOnce(user)
    updateBillingPlanForUserMock.mockResolvedValueOnce(user)

    const { default: handler } = await import('~~/server/api/stripe/webhook.post')

    const result = await handler(createWebhookEvent({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer: 'cus_123',
          subscription: 'sub_123',
          client_reference_id: 'user-1',
          metadata: {
            planId: 'pro',
            billingInterval: 'monthly',
          },
        },
      },
    }) as H3Event)

    expect(result).toEqual({ received: true })
    expect(sendPricingPlanPurchaseConfirmationEmailMock).not.toHaveBeenCalled()
    expect(updateEmailDeliveryForUserMock).not.toHaveBeenCalled()
  })
})

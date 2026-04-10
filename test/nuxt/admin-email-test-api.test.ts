import { createEvent, type H3Event } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireAuthSessionMock = vi.fn()
const sendRegistrationConfirmationEmailMock = vi.fn()
const sendPricingPlanPurchaseConfirmationEmailMock = vi.fn()

vi.mock('~~/server/utils/auth-session', () => ({
  requireAuthSession: requireAuthSessionMock,
}))

vi.mock('~~/server/services/email-service', () => ({
  sendRegistrationConfirmationEmail: sendRegistrationConfirmationEmailMock,
  sendPricingPlanPurchaseConfirmationEmail: sendPricingPlanPurchaseConfirmationEmailMock,
}))

function createPostEvent(body: Record<string, unknown>) {
  return createEvent({
    method: 'POST',
    url: '/api/admin/emails/test',
    headers: {
      'content-type': 'application/json',
    },
    body,
  } as never, {
    writableEnded: false,
    headersSent: false,
  } as never)
}

describe('admin email test api handler', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    requireAuthSessionMock.mockReset()
    sendRegistrationConfirmationEmailMock.mockReset()
    sendPricingPlanPurchaseConfirmationEmailMock.mockReset()
  })

  it('rejects non-admin users', async () => {
    requireAuthSessionMock.mockResolvedValueOnce({
      user: {
        isAdmin: false,
      },
    })

    const { default: handler } = await import('~~/server/api/admin/emails/test.post')

    await expect(handler(createPostEvent({
      template: 'registration',
      recipientEmail: 'test@example.com',
    }) as H3Event)).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  })

  it('sends a registration test email for admins', async () => {
    requireAuthSessionMock.mockResolvedValueOnce({
      user: {
        isAdmin: true,
      },
    })

    const { default: handler } = await import('~~/server/api/admin/emails/test.post')

    const result = await handler(createPostEvent({
      template: 'registration',
      recipientEmail: 'ADMIN@EXAMPLE.COM',
      recipientName: ' Admin User ',
    }) as H3Event)

    expect(sendRegistrationConfirmationEmailMock).toHaveBeenCalledWith({
      email: 'admin@example.com',
      name: 'Admin User',
    })
    expect(result).toEqual({
      ok: true,
      message: 'Registration email sent to admin@example.com.',
    })
  })

  it('sends a purchase test email for admins', async () => {
    requireAuthSessionMock.mockResolvedValueOnce({
      user: {
        isAdmin: true,
      },
    })

    const { default: handler } = await import('~~/server/api/admin/emails/test.post')

    const result = await handler(createPostEvent({
      template: 'purchase',
      recipientEmail: 'buyer@example.com',
      recipientName: 'Buyer',
      planId: 'pro',
      billingInterval: 'yearly',
    }) as H3Event)

    expect(sendPricingPlanPurchaseConfirmationEmailMock).toHaveBeenCalledWith({
      billingInterval: 'yearly',
      email: 'buyer@example.com',
      name: 'Buyer',
      planId: 'pro',
    })
    expect(result).toEqual({
      ok: true,
      message: 'pro yearly purchase email sent to buyer@example.com.',
    })
  })

  it('sends a teams purchase test email for admins', async () => {
    requireAuthSessionMock.mockResolvedValueOnce({
      user: {
        isAdmin: true,
      },
    })

    const { default: handler } = await import('~~/server/api/admin/emails/test.post')

    const result = await handler(createPostEvent({
      template: 'purchase',
      recipientEmail: 'teams@example.com',
      recipientName: 'Teams Buyer',
      planId: 'teams',
      billingInterval: 'monthly',
    }) as H3Event)

    expect(sendPricingPlanPurchaseConfirmationEmailMock).toHaveBeenCalledWith({
      billingInterval: 'monthly',
      email: 'teams@example.com',
      name: 'Teams Buyer',
      planId: 'teams',
    })
    expect(result).toEqual({
      ok: true,
      message: 'teams monthly purchase email sent to teams@example.com.',
    })
  })
})

import { toStoredPalette } from '~~/server/domain/palette'
import { listPalettesByUserId } from '~~/server/db/repositories/palette-repository'
import { requireAuthSession } from '~~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
    const { user } = await requireAuthSession(event)

    if (!user) return createError({
        statusCode: 400,
        statusMessage: 'User id is required'
    })

    const palettes = await listPalettesByUserId(user.id)
    return palettes.map(palette => toStoredPalette(palette, user.id))
})

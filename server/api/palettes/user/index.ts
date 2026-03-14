import { listPalettesByUserId } from "~~/server/db/repositories/palette-repository"

export default defineEventHandler(async (event) => {
    const { user } = await requireAuthSession(event)

    if(!user) return createError({
        statusCode: 400,
        statusMessage: 'User id is required'
    })

    const palettes = await listPalettesByUserId(user.id);
    return palettes;
})
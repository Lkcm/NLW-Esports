import express from 'express'
import cors from 'cors'
import { Prisma, PrismaClient } from '@prisma/client'
import { convertHour } from './utils/convert-hour'
import { convertMinutes } from './utils/convert-minutes'

const app = express()

app.use(express.json())
app.use(cors())

const prisma = new PrismaClient()

// banco de dados demora logo usa se a sintaxa async await

app.get('/games', async (request, response) => {
   const games = await prisma.game.findMany({
     include: {
       _count: {
         select: {
           ads: true,
         }
       }
     }
   })

  return response.json(games);
});

app.post('/games/:id/ads', async(request, response) => {
  const gameId = request.params.id;
  const body: any = request.body;

  //Validacao zod javascript

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(','),
      hourStart: convertHour(body.hourStart),
      hourEnd: convertHour(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel,
    }
  })

  return response.status(201).json(ad);
})

app.get('/games/:id/ads', async(request, response) => {
  // para pegar o id que coloquei em cima utiliza:

  const gameId = request.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where : {
      gameId: gameId,
    },
    orderBy: {
      createdAt: 'desc',
    }
  })

  return response.json(ads.map(ad => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: convertMinutes(ad.hourStart),
      hourEnd: convertMinutes(ad.hourEnd),
    } 
  }))
})

app.get('/ads/:id/discord', async(request, response) => {
  // para pegar o id que coloquei em cima utiliza:

  const adId = request.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    select : {
      discord: true,
    },
    where : {
      id: adId,
    }
  })

  // return response.send(adId);
  
  return response.json({
    discord: ad.discord,
  })
})

app.listen(3333)

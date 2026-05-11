import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const addFavoriteSchema = z.object({
  ayahId: z.string(),
  surahNumber: z.number().int(),
  ayahNumber: z.number().int(),
});

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data = addFavoriteSchema.parse(req.body);

    const existing = await prisma.favorite.findUnique({
      where: { userId_ayahId: { userId, ayahId: data.ayahId } }
    });

    if (existing) {
      return res.status(400).json({ message: 'Already favorited' });
    }

    const favorite = await prisma.favorite.create({
      data: { ...data, userId }
    });

    // Update AyahStat
    await prisma.ayahStat.upsert({
      where: { ayahId: data.ayahId },
      update: { favoriteCount: { increment: 1 } },
      create: { ayahId: data.ayahId, favoriteCount: 1 }
    });

    res.status(201).json(favorite);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: 'Validation error', errors: error.issues });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const ayahId = req.params.ayahId as string;

    const existing = await prisma.favorite.findUnique({
      where: { userId_ayahId: { userId, ayahId } }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    await prisma.favorite.delete({
      where: { id: existing.id }
    });

    // Decrement AyahStat
    await prisma.ayahStat.update({
      where: { ayahId },
      data: { favoriteCount: { decrement: 1 } }
    });

    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const syncSchema = z.array(addFavoriteSchema);

export const syncFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const localFavorites = syncSchema.parse(req.body);

    const existingFavorites = await prisma.favorite.findMany({
      where: { userId },
      select: { ayahId: true }
    });

    const existingSet = new Set(existingFavorites.map(f => f.ayahId));
    
    let addedCount = 0;
    for (const fav of localFavorites) {
      if (!existingSet.has(fav.ayahId)) {
        await prisma.favorite.create({
          data: { ...fav, userId }
        });
        await prisma.ayahStat.upsert({
          where: { ayahId: fav.ayahId },
          update: { favoriteCount: { increment: 1 } },
          create: { ayahId: fav.ayahId, favoriteCount: 1 }
        });
        addedCount++;
      }
    }

    res.json({ message: `Synced ${addedCount} new favorites` });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: 'Validation error', errors: error.issues });
    res.status(500).json({ message: 'Internal server error' });
  }
};

import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';

export const getCollections = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const collections = await prisma.collection.findMany({
      where: { userId },
      include: {
        _count: { select: { items: true } },
        items: { include: { favorite: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createCollectionSchema = z.object({
  name: z.string().min(1).max(50)
});

export const createCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data = createCollectionSchema.parse(req.body);

    const collection = await prisma.collection.create({
      data: { name: data.name, userId }
    });

    res.status(201).json(collection);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: 'Validation error', errors: error.issues });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const collectionId = parseInt(req.params.id as string);

    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });

    if (!collection || collection.userId !== userId) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    await prisma.collection.delete({ where: { id: collectionId } });
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const addItemSchema = z.object({
  favoriteId: z.number().int()
});

export const addItemToCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const collectionId = parseInt(req.params.id as string);
    const data = addItemSchema.parse(req.body);

    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.userId !== userId) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const favorite = await prisma.favorite.findUnique({ where: { id: data.favoriteId } });
    if (!favorite || favorite.userId !== userId) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    const item = await prisma.collectionItem.create({
      data: { collectionId, favoriteId: data.favoriteId }
    });

    res.status(201).json(item);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: 'Validation error', errors: error.issues });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeItemFromCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const collectionId = parseInt(req.params.id as string);
    const favoriteId = parseInt(req.params.favoriteId as string);

    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.userId !== userId) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    await prisma.collectionItem.delete({
      where: {
        collectionId_favoriteId: { collectionId, favoriteId }
      }
    });

    res.json({ message: 'Item removed from collection' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

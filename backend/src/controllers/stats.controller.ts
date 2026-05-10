import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAyahStats = async (req: Request, res: Response) => {
  try {
    const ayahId = req.params.ayahId as string;
    let stats = await prisma.ayahStat.findUnique({
      where: { ayahId }
    });

    if (!stats) {
      // Fallback: Count real comments and favorites if stat record doesn't exist yet
      const actualCommentCount = await prisma.comment.count({ where: { ayahId, isDeleted: false } });
      const actualFavoriteCount = await prisma.favorite.count({ where: { ayahId } });
      
      return res.json({
        ayahId,
        favoriteCount: actualFavoriteCount,
        commentCount: actualCommentCount,
        likeCount: 0
      });
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

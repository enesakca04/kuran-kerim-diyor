import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { moderateComment } from '../services/moderation.service';

export const getComments = async (req: Request, res: Response) => {
  try {
    const ayahId = req.params.ayahId as string;
    console.log(`[Comments]: Fetching for Ayah ID: ${ayahId}`);
    
    const userId = req.user?.userId;

    // We only fetch comments that are NOT deleted and match visibility rules
    const comments = await prisma.comment.findMany({
      where: { 
        ayahId, 
        isDeleted: false,
        OR: [
          { status: 'APPROVED' },
          { AND: [{ userId: userId || 'GUEST' }, { status: 'PENDING' }] }, // Sadece PENDING olan kendi yorumunu görsün, REJECTED olanı burada görmesin
          { status: 'REMOVED_BY_MODERATOR' }
        ]
      },
      include: {
        user: {
          select: { name: true, isDeleted: true }
        },
        _count: { select: { likes: true } },
        likes: (userId && !req.user?.isGuest) ? {
          where: { userId }
        } : false
      },
      orderBy: [
        { status: 'asc' }, // PENDING ve APPROVED başa, REMOVED sona (Alfabetik olarak P-A-R)
        { createdAt: 'desc' }
      ]
    });

    console.log(`[Comments]: Found ${comments.length} comments in DB`);
    // Map through comments to apply the "Silinen Hesap" mask if user is deleted
    const sanitizedComments = comments.map((comment: any) => {
      let displayName = comment.user.name || 'Anonim';
      
      if (comment.user.isDeleted) {
        displayName = 'Silinmiş Hesap';
      }

      if (comment.status === 'REMOVED_BY_MODERATOR') {
        return {
          id: comment.id,
          ayahId: comment.ayahId,
          userId: comment.userId,
          replyToId: comment.replyToId,
          text: `Bu yorum topluluk kuralları (${comment.moderationReason || 'Uygunsuz İçerik'}) nedeniyle moderatör tarafından kaldırılmıştır.`,
          createdAt: comment.createdAt,
          status: comment.status,
          language: comment.language,
          likeCount: comment._count.likes,
          isLikedByMe: comment.likes ? comment.likes.length > 0 : false,
          user: { name: 'Moderatör Sistemi' }
        };
      }

      return {
        id: comment.id,
        ayahId: comment.ayahId,
        userId: comment.userId,
        replyToId: comment.replyToId,
        text: comment.text,
        createdAt: comment.createdAt,
        status: comment.status,
        language: comment.language,
        moderationReason: comment.moderationReason,
        likeCount: comment._count.likes,
        isLikedByMe: comment.likes ? comment.likes.length > 0 : false,
        user: { name: displayName }
      };
    });

    res.json(sanitizedComments);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyComments = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const comments = await prisma.comment.findMany({
      where: { userId, isDeleted: false },
      orderBy: { createdAt: 'desc' }
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const addCommentSchema = z.object({
  ayahId: z.string(),
  text: z.string().min(1).max(1000),
  language: z.string().optional().default('tr'),
  replyToId: z.number().optional()
});

export const addComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { isGuest } = req.user!;

    if (isGuest) {
      return res.status(403).json({ message: 'Guests are not allowed to comment' });
    }

    const data = addCommentSchema.parse(req.body);
    let finalLanguage = data.language; 
    
    const comment = await prisma.comment.create({
      data: { 
        ayahId: data.ayahId,
        text: data.text,
        language: finalLanguage,
        userId: userId,
        status: 'PENDING',
        ...(data.replyToId ? { replyToId: data.replyToId } : {})
      }
    });

    // Artık AI Moderasyonu ve Sayaç Güncellemesini Arka Plan İşçisi (Worker) yapacak.
    // Kullanıcıya yorumun kaydedildiğini dönüyoruz, "İncelemede" olarak görünecek.

    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: 'Validation error', errors: error.issues });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const commentId = parseInt(req.params.id as string);

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment || comment.userId !== userId) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    // Soft delete
    await prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true }
    });

    // Decrement AyahStat
    await prisma.ayahStat.update({
      where: { ayahId: comment.ayahId },
      data: { commentCount: { decrement: 1 } }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const isGuest = req.user!.isGuest;
    const commentId = parseInt(req.params.commentId as string);

    if (isGuest) {
      return res.status(403).json({ message: 'Guests cannot like comments' });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: { userId, commentId }
      }
    });

    if (existingLike) {
      await prisma.commentLike.delete({
        where: { userId_commentId: { userId, commentId } }
      });
      // Update ayah stat
      await prisma.ayahStat.update({
        where: { ayahId: comment.ayahId },
        data: { likeCount: { decrement: 1 } }
      });
      res.json({ message: 'Like removed', isLikedByMe: false });
    } else {
      await prisma.commentLike.create({
        data: { userId, commentId }
      });
      // Update ayah stat
      await prisma.ayahStat.update({
        where: { ayahId: comment.ayahId },
        data: { likeCount: { increment: 1 } }
      });
      res.json({ message: 'Like added', isLikedByMe: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

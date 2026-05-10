import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';

export const getComments = async (req: Request, res: Response) => {
  try {
    const ayahId = req.params.ayahId as string;
    console.log(`[Comments]: Fetching for Ayah ID: ${ayahId}`);
    
    // We only fetch comments that are NOT deleted
    const comments = await prisma.comment.findMany({
      where: { ayahId, isDeleted: false },
      include: {
        user: {
          select: { name: true, isDeleted: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`[Comments]: Found ${comments.length} comments in DB`);
    // Map through comments to apply the "Silinen Hesap" mask if user is deleted
    const sanitizedComments = comments.map((comment: any) => {
      let displayName = comment.user.name || 'Anonim';
      
      if (comment.user.isDeleted) {
        displayName = 'Silinmiş Hesap';
      }

      return {
        id: comment.id,
        ayahId: comment.ayahId,
        text: comment.text,
        createdAt: comment.createdAt,
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
  language: z.string().optional().default('tr')
});

export const addComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { isGuest } = req.user!;

    if (isGuest) {
      return res.status(403).json({ message: 'Guests are not allowed to comment' });
    }

    const data = addCommentSchema.parse(req.body);

    // Akıllı Dil Algılama
    let finalLanguage = data.language; // Varsayılan olarak frontend'den gelen (uygulama dili)
    
    try {
      const LanguageDetect = require('languagedetect');
      const lngDetector = new LanguageDetect();
      const detected = lngDetector.detect(data.text, 1); // En yakın 1 sonucu al
      
      if (detected.length > 0 && detected[0][1] > 0.2) { // %20'den fazla eminse
        const langMap: Record<string, string> = {
          'turkish': 'tr',
          'english': 'en',
          'arabic': 'ar',
          'german': 'de',
          'french': 'fr',
          'spanish': 'es',
          'russian': 'ru',
          'bosnian': 'bs',
          'albanian': 'sq'
        };
        const detectedName = detected[0][0].toLowerCase();
        if (langMap[detectedName]) {
          finalLanguage = langMap[detectedName];
        } else {
          // Desteklemedigimiz ama algiladigimiz bir dil (ornegin: greek, swedish vb.)
          // Bu yorumlar sadece "Tüm Diller" sekmesinde gorunur, ana dili mesgul etmez.
          finalLanguage = detectedName;
        }
        console.log(`[LanguageDetect]: "${data.text.substring(0, 20)}..." detected as ${finalLanguage}`);
      }
    } catch (error) {
      console.error('[LanguageDetect Error]:', error);
    }

    const comment = await prisma.comment.create({
      data: { 
        ayahId: data.ayahId,
        text: data.text,
        language: finalLanguage,
        userId: userId
      }
    });

    // Update AyahStat
    await prisma.ayahStat.upsert({
      where: { ayahId: data.ayahId },
      update: { commentCount: { increment: 1 } },
      create: { ayahId: data.ayahId, commentCount: 1 }
    });

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

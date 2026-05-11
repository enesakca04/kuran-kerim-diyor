import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { TokenPayload } from '../utils/jwt';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userPayload = req.user;
    if (!userPayload) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isGuest: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Cascade delete is handled by Prisma schema (onDelete: Cascade)
    // We just need to delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'Account and all data deleted successfully' });
  } catch (error) {
    console.error('deleteAccount error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

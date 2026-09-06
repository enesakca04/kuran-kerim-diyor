import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { z } from 'zod';
import {
  DuaGeneratorService,
  generateDuaRequestSchema,
} from '../services/dua-generator.service';

export const generateDua = async (req: Request, res: Response) => {
  try {
    const input = generateDuaRequestSchema.parse(req.body);
    const result = await DuaGeneratorService.generate(input);
    return res.json({ id: randomUUID(), ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid request', errors: error.issues });
    }
    if (error instanceof Error && error.message === 'AI_SERVICE_NOT_CONFIGURED') {
      return res.status(503).json({ message: 'AI service is not configured' });
    }
    console.error('[Dua Generator Error]:', error);
    return res.status(502).json({ message: 'Dua could not be generated at this time' });
  }
};

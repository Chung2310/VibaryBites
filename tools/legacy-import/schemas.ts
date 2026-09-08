import { z } from 'zod';
export const idSchema = z.string().min(1).max(160).regex(/^[\p{L}\p{N}_-]+$/u);

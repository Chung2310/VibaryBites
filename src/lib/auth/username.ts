import { z } from 'zod';
export const usernameSchema = z.string().trim().min(3, 'Tên đăng nhập cần ít nhất 3 ký tự.').max(64, 'Tên đăng nhập tối đa 64 ký tự.').regex(/^[a-zA-Z0-9_.-]+$/, 'Chỉ dùng chữ cái không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.').transform(value => value.toLowerCase());

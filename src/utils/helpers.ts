import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';

export const generateId = (): string => {
  return uuidv4();
};

export const generateVerificationToken = (): string => {
  return uuidv4();
};

export const generateResetToken = (): string => {
  return uuidv4();
};

export const isValidEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const isValidPhone = (phone: string): boolean => {
  return validator.isMobilePhone(phone);
};

export const isValidUrl = (url: string): boolean => {
  return validator.isURL(url);
};

export const sanitizeEmail = (email: string): string => {
  return validator.normalizeEmail(email) || email;
};

export const escapeHtml = (text: string): string => {
  return validator.escape(text);
};

export const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, dm)) / Math.pow(10, dm) + ' ' + sizes[i];
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const retry = async (
  fn: () => Promise<any>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<any> => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
      await sleep(delayMs * (i + 1));
    }
  }
};

import CryptoJS from 'crypto-js';
import config from '@config/env';

const encryptionKey = config.jwt_secret.substring(0, 32);

export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, encryptionKey).toString();
};

export const decryptData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

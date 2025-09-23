import { FONT_SIZES, LINE_HEIGHT_MULTIPLIERS } from '../constants/fonts';
import { FontSize, LineHeight } from '../types/text';

/**
 * Get font size from size preset or return the provided size
 */
export const getFontSize = (size?: FontSize, customSize?: number): number => {
  if (customSize) return customSize;
  if (size) return FONT_SIZES[size];
  return FONT_SIZES.md;
};

/**
 * Get line height from preset or calculate from font size
 */
export const getLineHeight = (
  fontSize: number,
  lineHeight?: number | LineHeight,
  multiplier: number = 1.2
): number => {
  if (typeof lineHeight === 'number') return lineHeight;
  if (typeof lineHeight === 'string') {
    return fontSize * LINE_HEIGHT_MULTIPLIERS[lineHeight];
  }
  return fontSize * multiplier;
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string): string => {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Convert text to title case
 */
export const toTitleCase = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Generate initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Check if text is empty or whitespace
 */
export const isEmpty = (text: string | null | undefined): boolean => {
  return !text || text.trim().length === 0;
};

/**
 * Get text length in characters
 */
export const getTextLength = (text: string): number => {
  return text.length;
};

/**
 * Get word count
 */
export const getWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Generate placeholder text
 */
export const generatePlaceholder = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Date formatting utilities for Naitrust using Luxon
 */

import { DateTime } from 'luxon';

/**
 * Format date for chat/conversation display
 * - "Today" if today
 * - "Yesterday" if yesterday
 * - "Mon, 12 Jan" if this year
 * - "12 Jan 2024" if previous year
 */
export function formatChatDate(date: string | Date): string {
  const messageDate = DateTime.fromJSDate(new Date(date));
  const today = DateTime.now().startOf('day');
  const yesterday = today.minus({ days: 1 });

  const messageDateOnly = messageDate.startOf('day');

  if (messageDateOnly.equals(today)) {
    return 'Today';
  }

  if (messageDateOnly.equals(yesterday)) {
    return 'Yesterday';
  }

  // Check if same year
  if (messageDate.year === DateTime.now().year) {
    return messageDate.toFormat('ccc, d LLL'); // "Mon, 12 Jan"
  }

  // Different year
  return messageDate.toFormat('d LLL yyyy'); // "12 Jan 2024"
}

/**
 * Format time for conversation list (e.g., "2:30 PM")
 */
export function formatChatTime(date: string | Date): string {
  const messageDate = DateTime.fromJSDate(new Date(date));
  return messageDate.toFormat('h:mm a'); // "2:30 PM"
}

/**
 * Format date and time for conversation list
 * - "2:30 PM" if today
 * - "Yesterday" if yesterday
 * - "12 Jan" if this year
 * - "12 Jan 2024" if previous year
 */
export function formatConversationDate(date: string | Date): string {

  const messageDate = DateTime.fromJSDate(new Date(date));

  const today = DateTime.now().startOf('day');
  const yesterday = today.minus({ days: 1 });

  const messageDateOnly = messageDate.startOf('day');

  if (messageDateOnly.equals(today)) {
    return formatChatTime(date);
  }

  if (messageDateOnly.equals(yesterday)) {
    return 'Yesterday';
  }

  // Check if same year
  if (messageDate.year === DateTime.now().year) {
    return messageDate.toFormat('d LLL'); // "12 Jan"
  }

  // Different year
  return messageDate.toFormat('d LLL yyyy'); // "12 Jan 2024"
}

/**
 * Check if a message is recent (within 1 hour)
 */
export function isMessageRecent(messageDate: string | Date): boolean {
  const date = DateTime.fromJSDate(new Date(messageDate));
  const now = DateTime.now();
  const oneHourAgo = now.minus({ hours: 1 });
  
  return date >= oneHourAgo;
}

/**
 * Get time remaining to edit/delete message
 */
export function getTimeRemainingToEdit(messageDate: string | Date): string {
  const date = DateTime.fromJSDate(new Date(messageDate));
  const now = DateTime.now();
  const oneHourFromMessage = date.plus({ hours: 1 });
  
  const diff = oneHourFromMessage.diff(now, 'minutes').minutes;
  
  if (diff <= 0) {
    return '0 minutes';
  }
  
  const minutes = Math.floor(diff);
  
  if (minutes < 1) {
    return 'less than a minute';
  }
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

/**
 * Get date header text for grouping messages
 * Same as formatChatDate but for message grouping
 */
export function getDateHeader(date: string | Date): string {
  return formatChatDate(date);
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  const dt1 = DateTime.fromJSDate(new Date(date1)).startOf('day');
  const dt2 = DateTime.fromJSDate(new Date(date2)).startOf('day');
  return dt1.equals(dt2);
}

/**
 * Format relative time (e.g., "2 hours ago", "5 minutes ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const messageDate = DateTime.fromJSDate(new Date(date));
  const now = DateTime.now();
  
  const diff = now.diff(messageDate, ['days', 'hours', 'minutes']).toObject();
  
  if (diff.days && diff.days >= 1) {
    return `${Math.floor(diff.days)} day${Math.floor(diff.days) !== 1 ? 's' : ''} ago`;
  }
  
  if (diff.hours && diff.hours >= 1) {
    return `${Math.floor(diff.hours)} hour${Math.floor(diff.hours) !== 1 ? 's' : ''} ago`;
  }
  
  if (diff.minutes && diff.minutes >= 1) {
    return `${Math.floor(diff.minutes)} minute${Math.floor(diff.minutes) !== 1 ? 's' : ''} ago`;
  }
  
  return 'Just now';
}

/**
 * Format full date and time for display
 */
export function formatFullDateTime(date: string | Date): string {
  const messageDate = DateTime.fromJSDate(new Date(date));
  return messageDate.toFormat('ccc, d LLL yyyy \'at\' h:mm a'); // "Mon, 12 Jan 2024 at 2:30 PM"
}

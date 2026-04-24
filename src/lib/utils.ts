import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export type ErrorCategory = 'server' | 'client' | 'unknown';

export interface ErrorInfo {
  category: ErrorCategory;
  message: string;
  statusCode?: number;
}

function getUserFriendlyServerMessage(status: number, backendMessage: string | undefined): string {
  switch (status) {
    case 400:
      return backendMessage || 'The request was invalid. Please check your input and try again.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return backendMessage || 'A conflict occurred. The data may have already been modified.';
    case 422:
      return backendMessage || 'Some of the information provided is invalid. Please review and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Something went wrong on our end. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'The service is temporarily unavailable. Please try again in a few moments.';
    default:
      if (status >= 500) return 'Something went wrong on our end. Please try again later.';
      return backendMessage || 'An error occurred. Please try again.';
  }
}

export function getErrorInfo(err: unknown): ErrorInfo {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as {
      response?: { status?: number; data?: { message?: string | string[] } };
    };
    const status = axiosErr.response?.status;
    const raw = axiosErr.response?.data?.message;
    const backendMessage = raw ? (Array.isArray(raw) ? raw.join(', ') : raw) : undefined;

    if (status) {
      return {
        category: 'server',
        message: getUserFriendlyServerMessage(status, backendMessage),
      };
    }
  }
  if (err && typeof err === 'object' && 'request' in err) {
    return { category: 'client', message: 'Unable to connect to the server. Please check your internet connection.' };
  }
  if (err instanceof Error) {
    const msg = err.message;
    if (msg === 'Network Error') {
      return { category: 'client', message: 'Unable to connect to the server. Please check your internet connection.' };
    }
    return { category: 'client', message: msg };
  }
  return { category: 'unknown', message: 'Something went wrong. Please try again.' };
}

export function getErrorMessage(err: unknown): string {
  return getErrorInfo(err).message;
}
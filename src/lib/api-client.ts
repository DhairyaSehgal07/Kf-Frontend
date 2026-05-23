import axios, { isAxiosError } from 'axios';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { router } from '@/router';
import { env } from './env';

export const apiClient = axios.create({
  baseURL: `${env.apiBaseUrl}/v1`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 401) {
      useAuthStore.getState().clearAuth();

      if (window.location.pathname !== '/') {
        void router.navigate({ to: '/', replace: true });
      }
    }

    return Promise.reject(error);
  },
);

/** Reads HTTP status from an axios error or from `Error.cause` when wrapped. */
export function getHttpStatusFromError(error: unknown): number | undefined {
  if (isAxiosError(error)) {
    return error.response?.status;
  }

  if (error instanceof Error && error.cause !== undefined) {
    return getHttpStatusFromError(error.cause);
  }

  return undefined;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong',
): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') return message;
  }

  if (error instanceof Error) return error.message;

  return fallback;
}

export default apiClient;

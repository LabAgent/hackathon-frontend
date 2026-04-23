import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/api/auth.api';
import type {
  RegisterRequest,
  LoginRequest,
  MfaVerifyRequest,
  MfaEnableRequest,
  MfaDisableRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResendVerificationRequest,
  VerifyEmailRequest,
  LoginResponse,
} from '@/types';
import type { AxiosError } from 'axios';

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });
}

export function useLogin() {
  const navigate = useNavigate();
  const { login, setTempToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      if ('mfaRequired' in response && response.mfaRequired) {
        setTempToken(response.tempToken);
        navigate('/mfa/verify', { replace: true });
      } else {
        const loginResp = response as LoginResponse;
        login(loginResp.accessToken, loginResp.refreshToken, loginResp.user);
        navigate(loginResp.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      }
    },
  });
}

export function useVerifyMfa() {
  const navigate = useNavigate();
  const { login, tempToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: Omit<MfaVerifyRequest, 'tempToken'>) =>
      authApi.verifyMfa({ ...data, tempToken: tempToken! }),
    onSuccess: (response) => {
      const { accessToken, refreshToken, user } = response;
      login(accessToken, refreshToken, user);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 401) {
        navigate('/login', { replace: true });
      }
    },
  });
}

export function useVerifyMfaBackup() {
  const navigate = useNavigate();
  const { login, tempToken } = useAuthStore();

  return useMutation({
    mutationFn: (backupCode: string) =>
      authApi.verifyMfaBackupCode({ tempToken: tempToken!, backupCode }),
    onSuccess: (response) => {
      const { accessToken, refreshToken, user } = response;
      login(accessToken, refreshToken, user);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    },
  });
}

export function useSetupMfa() {
  return useMutation({
    mutationFn: () => authApi.setupMfa(),
  });
}

export function useEnableMfa() {
  return useMutation({
    mutationFn: (data: MfaEnableRequest) => authApi.enableMfa(data),
  });
}

export function useDisableMfa() {
  return useMutation({
    mutationFn: (data: MfaDisableRequest) => authApi.disableMfa(data),
  });
}

export function useRegenerateBackupCodes() {
  return useMutation({
    mutationFn: () => authApi.regenerateBackupCodes(),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
  });
}

export function useResetPassword() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onSuccess: () => {
      navigate('/login', { replace: true });
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (data: VerifyEmailRequest) => authApi.verifyEmail(data),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (data: ResendVerificationRequest) => authApi.resendVerification(data),
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const doLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try { await authApi.logout(refreshToken); } catch { /* ignore */ }
    }
    logout();
    navigate('/login', { replace: true });
  };
  return { logout: doLogout };
}


import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Alert, Badge, Modal, ErrorBanner } from '@/components/ui';
import { useProfile } from '@/hooks/useUser';
import { useDisableMfa, useRegenerateBackupCodes } from '@/hooks/useAuth';
import { Link } from 'react-router';
import { useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui';

const disableSchema = z.object({
  password: z.string().min(1, 'Password is required to disable MFA'),
});

type DisableFormData = z.infer<typeof disableSchema>;

export default function SecurityPage() {
  const { data: profile, isLoading } = useProfile();
  const navigate = useNavigate();
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disableSuccess, setDisableSuccess] = useState('');
  const [backupSuccess, setBackupSuccess] = useState('');

  const disableMfa = useDisableMfa();
  const regenerateBackup = useRegenerateBackupCodes();

  const {
    register: reg,
    handleSubmit: handleDisableSubmit,
    formState: { errors },
  } = useForm<DisableFormData>({
    resolver: zodResolver(disableSchema),
  });

  if (isLoading || !profile) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-sponge-500" /></div>;
  }

  const onDisable = (data: DisableFormData) => {
    setDisableSuccess('');
    disableMfa.mutate(data, {
      onSuccess: () => {
        setShowDisableModal(false);
        setDisableSuccess('🛡️ MFA has been disabled successfully');
      },
    });
  };

  const onRegenerate = () => {
    setBackupSuccess('');
    regenerateBackup.mutate(undefined, {
      onSuccess: (data) => {
        setBackupCodes(data.backupCodes);
        setShowBackupModal(true);
      },
    });
  };

  return (
    <div>
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-bb-porthole hover:text-white font-bold mb-4">
        <ArrowLeft className="h-4 w-4" />
        ← Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-white mb-6 font-[var(--font-display)] flex items-center gap-2">
        <span className="emoji-icon">🛡️</span> Security
      </h1>

      {disableSuccess && <Alert variant="success" className="mb-4">{disableSuccess}</Alert>}
      {backupSuccess && <Alert variant="success" className="mb-4">{backupSuccess}</Alert>}

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-bb-purple-light/20 flex items-center justify-center text-xl">
              🛡️
            </div>
            <div>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <p className="text-sm text-ocean-500 mt-0.5 font-medium">
                {profile.mfaEnabled
                  ? 'Your Treedome is protected with 2FA'
                  : 'Enable 2FA for extra security'}
              </p>
            </div>
          </div>
          <Badge variant={profile.mfaEnabled ? 'success' : 'warning'}>
            {profile.mfaEnabled ? '✅ Enabled' : '⚠️ Disabled'}
          </Badge>
        </CardHeader>
        <CardContent>
          {profile.mfaEnabled ? (
            <div className="space-y-4">
              <p className="text-sm text-ocean-600 font-medium">
                Two-factor authentication is currently active. You'll need your authenticator app
                each time you dive into the lab.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="danger"
                  onClick={() => setShowDisableModal(true)}
                >
                  ❌ Disable 2FA
                </Button>
                <Button variant="secondary" onClick={() => navigate('/security/mfa/setup')}>
                  🔑 Manage 2FA
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-bb-warning-light rounded-2xl border-2 border-bb-pineapple/30">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-bb-pineapple-dark">
                    Your Treedome is not protected!
                  </p>
                  <p className="text-sm text-bb-pineapple mt-1">
                    Enable two-factor authentication to add an extra layer of security.
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/security/mfa/setup')} variant="sponge">
                🛡️ Enable 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {profile.mfaEnabled && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-bb-ocean/15 flex items-center justify-center text-xl">
                🔑
              </div>
              <div>
                <CardTitle>Backup Codes</CardTitle>
                <p className="text-sm text-ocean-500 mt-0.5 font-medium">
                  Generate new backup codes if you've lost yours
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" onClick={onRegenerate} loading={regenerateBackup.isPending}>
              🔄 Regenerate Backup Codes
            </Button>
            {disableMfa.isError && (
              <ErrorBanner error={disableMfa.error} />
            )}
          </CardContent>
        </Card>
      )}

      <Modal open={showDisableModal} onClose={() => setShowDisableModal(false)} title="❌ Disable 2FA">
        <p className="text-sm text-ocean-500 mb-4 font-medium">
          This will remove two-factor authentication from your account. Please enter your password to confirm.
        </p>
        {disableMfa.isError && (
          <ErrorBanner error={disableMfa.error} />
        )}
        <form onSubmit={handleDisableSubmit(onDisable)} className="space-y-4">
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...reg('password')}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowDisableModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" loading={disableMfa.isPending}>
              ❌ Disable 2FA
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={showBackupModal} onClose={() => setShowBackupModal(false)} title="🔑 Your Backup Codes">
        <div className="mb-4 p-3 bg-bb-warning-light rounded-2xl border-2 border-bb-pineapple/30">
          <p className="text-sm text-bb-pineapple-dark font-bold">
            Save these backup codes in a safe place. Each code can only be used once.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {backupCodes.map((code) => (
            <div
              key={code}
              className="px-3 py-2 bg-bb-sand-light rounded-2xl font-mono text-sm text-center font-bold text-bb-brown"
            >
              {code}
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button variant="sponge" onClick={() => setShowBackupModal(false)}>✅ Done</Button>
        </div>
      </Modal>
    </div>
  );
}

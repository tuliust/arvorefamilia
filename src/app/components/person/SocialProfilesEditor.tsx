import React from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { createSocialProfile, getSocialPlaceholder, SOCIAL_NETWORKS } from '../../utils/personFields';
import type { SocialProfileForm } from '../../utils/personFields';

const SOCIAL_PROFILE_PREFIXES: Record<string, string> = {
  LinkedIn: 'linkedin.com/in/',
  Facebook: 'facebook.com/',
  Instagram: 'instagram.com/',
  TikTok: ['tiktok.com/', '@'].join(''),
};

type SocialProfilesEditorProps = {
  profiles: SocialProfileForm[];
  onChange: (profiles: SocialProfileForm[]) => void;
  disabled?: boolean;
  errors?: {
    rede_social?: string;
    instagram_usuario?: string;
  };
  compactDraftFlow?: boolean;
};

function isCompleteProfile(profile: SocialProfileForm) {
  return Boolean(profile.rede.trim() && profile.perfil.trim());
}

function getProfileUrl(profile: SocialProfileForm) {
  const prefix = SOCIAL_PROFILE_PREFIXES[profile.rede] ?? '';
  return `${prefix}${profile.perfil}`.trim();
}

function withDraft(profiles: SocialProfileForm[]) {
  const safeProfiles = profiles.length > 0 ? profiles : [createSocialProfile()];
  const lastProfile = safeProfiles[safeProfiles.length - 1];

  if (!lastProfile || isCompleteProfile(lastProfile)) {
    return [...safeProfiles, createSocialProfile()];
  }

  return safeProfiles;
}

export function SocialProfilesEditor({
  profiles,
  onChange,
  disabled = false,
  errors,
  compactDraftFlow = false,
}: SocialProfilesEditorProps) {
  const safeProfiles = withDraft(profiles);
  const draftProfile = safeProfiles[safeProfiles.length - 1];
  const completedProfiles = safeProfiles.slice(0, -1).filter(isCompleteProfile);
  const RemoveIcon = compactDraftFlow ? Trash2 : X;
  const removeButtonSizeClass = compactDraftFlow ? 'h-10 w-10' : 'h-8 w-8';

  const updateProfile = (profileId: string, field: 'rede' | 'perfil', value: string) => {
    onChange(
      safeProfiles.map((profile) =>
        profile.id === profileId ? { ...profile, [field]: value } : profile,
      ),
    );
  };

  const removeProfile = (profileId: string) => {
    onChange(withDraft(safeProfiles.filter((profile) => profile.id !== profileId)));
  };

  const canAdd = Boolean(
    draftProfile?.rede.trim() &&
    draftProfile?.perfil.trim() &&
    !disabled &&
    !completedProfiles.some(
      (profile) =>
        profile.rede === draftProfile.rede &&
        profile.perfil.trim().toLowerCase() === draftProfile.perfil.trim().toLowerCase(),
    ),
  );

  const addProfile = () => {
    if (!canAdd) return;
    onChange([...safeProfiles, createSocialProfile()]);
  };

  return (
    <div className="space-y-2">
      <Label>Redes sociais</Label>

      <div className="space-y-2">
        {completedProfiles.map((profile) => (
          <div key={profile.id} className="flex min-w-0 items-center gap-2">
            <span className="inline-flex min-w-0 flex-1 items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
              <span className="truncate">{profile.rede}: {getProfileUrl(profile)}</span>
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={`${removeButtonSizeClass} shrink-0`}
              onClick={() => removeProfile(profile.id)}
              disabled={disabled}
              aria-label="Remover rede social"
              title="Remover rede social"
            >
              <RemoveIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {draftProfile && (
          <div className="space-y-2">
            {!draftProfile.rede ? (
              <select
                value={draftProfile.rede}
                onChange={(event) => updateProfile(draftProfile.id, 'rede', event.target.value)}
                disabled={disabled}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                aria-invalid={Boolean(errors?.rede_social)}
              >
                <option value="">Selecione a plataforma</option>
                {SOCIAL_NETWORKS.map((network) => (
                  <option key={network} value={network}>
                    {network}
                  </option>
                ))}
              </select>
            ) : (
              <div className={compactDraftFlow ? 'grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:flex sm:flex-row' : 'flex min-w-0 items-center gap-2'}>
                <div className="flex min-w-0 flex-1 overflow-hidden">
                  <span className={compactDraftFlow ? 'inline-flex h-10 min-w-[8.5rem] shrink-0 items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-600' : 'inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-600'}>
                    {SOCIAL_PROFILE_PREFIXES[draftProfile.rede]}
                  </span>
                  <Input
                    value={draftProfile.perfil}
                    onChange={(event) => updateProfile(draftProfile.id, 'perfil', event.target.value)}
                    placeholder={getSocialPlaceholder(draftProfile.rede)}
                    disabled={disabled}
                    className="min-w-0 rounded-l-none"
                    aria-invalid={Boolean(errors?.instagram_usuario)}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={addProfile}
                  disabled={!canAdd}
                  aria-label="Adicionar rede social"
                  title="Adicionar rede social"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {(errors?.rede_social || errors?.instagram_usuario) && (
              <p className="text-xs font-medium text-red-600">
                {errors.rede_social || errors.instagram_usuario}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export type { SocialProfileForm };

import React from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  createSocialProfile,
  getSocialPlaceholder,
  SOCIAL_NETWORKS,
} from '../../utils/personFields';
import type { SocialProfileForm } from '../../utils/personFields';

const SOCIAL_PROFILE_PREFIXES: Record<string, string> = {
  LinkedIn: 'linkedin.com/in/',
  Facebook: 'facebook.com/',
  Instagram: 'instagram.com/',
  TikTok: 'tiktok.com/@',
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
  return Boolean(profile.rede && profile.perfil.trim());
}

function ensureProfiles(profiles: SocialProfileForm[], compactDraftFlow = false) {
  const safeProfiles = profiles.length > 0 ? profiles : [createSocialProfile()];

  if (!compactDraftFlow) return safeProfiles;

  const hasDraft = safeProfiles.some((profile) => !isCompleteProfile(profile));
  return hasDraft ? safeProfiles : [...safeProfiles, createSocialProfile()];
}

function getProfileUrl(profile: SocialProfileForm) {
  const prefix = SOCIAL_PROFILE_PREFIXES[profile.rede] ?? '';
  return `${prefix}${profile.perfil}`.trim();
}

export function SocialProfilesEditor({
  profiles,
  onChange,
  disabled = false,
  errors,
  compactDraftFlow = false,
}: SocialProfilesEditorProps) {
  const safeProfiles = ensureProfiles(profiles, compactDraftFlow);

  const updateProfile = (profileId: string, field: 'rede' | 'perfil', value: string) => {
    onChange(
      safeProfiles.map((profile) =>
        profile.id === profileId ? { ...profile, [field]: value } : profile
      ),
    );
  };

  const addProfile = () => {
    if (compactDraftFlow) {
      const hasEmptyDraft = safeProfiles.some((profile) => !profile.rede && !profile.perfil.trim());
      if (hasEmptyDraft) return;
    }

    onChange([...safeProfiles, createSocialProfile()]);
  };

  const removeProfile = (profileId: string) => {
    onChange(ensureProfiles(safeProfiles.filter((profile) => profile.id !== profileId), compactDraftFlow));
  };

  if (compactDraftFlow) {
    return (
      <div className="space-y-2">
        <Label>Redes sociais</Label>

        <div className="space-y-3">
          {safeProfiles.map((profile, index) => {
            const complete = isCompleteProfile(profile);
            const canAdd = Boolean(profile.rede && profile.perfil.trim() && !disabled);

            if (complete) {
              return (
                <div key={profile.id} className="flex min-w-0 items-center gap-2">
                  <span className="inline-flex min-w-0 flex-1 items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
                    <span className="truncate">{profile.rede}: {getProfileUrl(profile)}</span>
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => removeProfile(profile.id)}
                    disabled={disabled}
                    aria-label="Remover rede social"
                    title="Remover rede social"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            }

            return (
              <div key={profile.id} className="space-y-2">
                {!profile.rede ? (
                  <select
                    value={profile.rede}
                    onChange={(event) => updateProfile(profile.id, 'rede', event.target.value)}
                    disabled={disabled}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-invalid={index === 0 ? Boolean(errors?.rede_social) : undefined}
                  >
                    <option value="">Selecione a plataforma</option>
                    {SOCIAL_NETWORKS.map((network) => (
                      <option key={network} value={network}>
                        {network}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:flex sm:flex-row">
                    <div className="flex min-w-0 flex-1">
                      <span className="inline-flex h-10 min-w-[8.5rem] shrink-0 items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-600">
                        {SOCIAL_PROFILE_PREFIXES[profile.rede]}
                      </span>
                      <Input
                        value={profile.perfil}
                        onChange={(event) => updateProfile(profile.id, 'perfil', event.target.value)}
                        placeholder={getSocialPlaceholder(profile.rede)}
                        disabled={disabled}
                        className="min-w-0 rounded-l-none"
                        aria-invalid={index === 0 ? Boolean(errors?.instagram_usuario) : undefined}
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

                {index === 0 && (errors?.rede_social || errors?.instagram_usuario) && (
                  <p className="text-xs font-medium text-red-600">
                    {errors.rede_social || errors.instagram_usuario}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Non-compact: badge-based flow
  const nonCompactProfiles = ensureProfiles(profiles, true);
  const completedProfiles = nonCompactProfiles.filter(isCompleteProfile);
  const pendingProfile = nonCompactProfiles.find((profile) => !isCompleteProfile(profile));

  const updateNonCompact = (profileId: string, field: 'rede' | 'perfil', value: string) => {
    onChange(
      nonCompactProfiles.map((profile) =>
        profile.id === profileId ? { ...profile, [field]: value } : profile
      ),
    );
  };

  const removeNonCompact = (profileId: string) => {
    onChange(ensureProfiles(nonCompactProfiles.filter((p) => p.id !== profileId), true));
  };

  const canAdd = Boolean(
    pendingProfile?.rede &&
    pendingProfile?.perfil.trim() &&
    !disabled &&
    !completedProfiles.some(
      (p) =>
        p.rede === pendingProfile.rede &&
        p.perfil.trim().toLowerCase() === pendingProfile.perfil.trim().toLowerCase()
    )
  );

  const handleAdd = () => {
    if (!canAdd) return;
    onChange([...nonCompactProfiles, createSocialProfile()]);
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
              className="h-8 w-8 shrink-0"
              onClick={() => removeNonCompact(profile.id)}
              disabled={disabled}
              aria-label="Remover rede social"
              title="Remover rede social"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {pendingProfile && (
          <div className="space-y-2">
            {!pendingProfile.rede ? (
              <select
                value={pendingProfile.rede}
                onChange={(event) => updateNonCompact(pendingProfile.id, 'rede', event.target.value)}
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
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex min-w-0 flex-1 overflow-hidden">
                  <span className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-600">
                    {SOCIAL_PROFILE_PREFIXES[pendingProfile.rede]}
                  </span>
                  <Input
                    value={pendingProfile.perfil}
                    onChange={(event) => updateNonCompact(pendingProfile.id, 'perfil', event.target.value)}
                    placeholder={getSocialPlaceholder(pendingProfile.rede)}
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
                  onClick={handleAdd}
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

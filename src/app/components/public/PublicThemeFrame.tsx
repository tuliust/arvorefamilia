import React from 'react';
import { Link } from 'react-router';
import { SiteVisualSettings } from '../../services/siteVisualSettingsService';

export function getPublicLinkTarget(url?: string | null) {
  const cleanUrl = String(url ?? '').trim();
  return cleanUrl || '#';
}

export function isInternalPublicLink(url?: string | null) {
  const cleanUrl = getPublicLinkTarget(url);
  return cleanUrl.startsWith('/') && !cleanUrl.startsWith('//');
}

export function PublicThemeFrame({
  settings,
  children,
  className = '',
}: {
  settings: SiteVisualSettings;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={['relative min-h-screen overflow-hidden', className].filter(Boolean).join(' ')}
      style={{
        backgroundColor: settings.home_background_color,
        color: settings.global_text_color,
      }}
    >
      {settings.home_background_media_url ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${settings.home_background_media_url}")`,
            opacity: settings.home_background_media_opacity / 100,
          }}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </div>
  );
}

export function PublicInlineLink({
  url,
  color,
  children,
  external = true,
}: {
  url: string;
  color: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const target = getPublicLinkTarget(url);

  if (isInternalPublicLink(target)) {
    return (
      <Link
        to={target}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className="font-medium hover:underline"
        style={{ color }}
      >
        {children}
      </Link>
    );
  }

  return (
    <a href={target} target="_blank" rel="noreferrer" className="font-medium hover:underline" style={{ color }}>
      {children}
    </a>
  );
}

export function PublicFooterLinks({
  settings,
  className = '',
}: {
  settings: SiteVisualSettings;
  className?: string;
}) {
  return (
    <footer className={['relative z-10 px-4 pb-6', className].filter(Boolean).join(' ')}>
      {settings.entrance_footer_note ? (
        <p className="mx-auto mb-3 max-w-6xl text-center text-xs" style={{ color: settings.global_muted_text_color }}>
          {settings.entrance_footer_note}
        </p>
      ) : null}
      <nav
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 text-xs"
        style={{ color: settings.global_muted_text_color }}
      >
        <PublicInlineLink url={settings.public_terms_url} color={settings.global_primary_color} external={false}>
          {settings.public_terms_label}
        </PublicInlineLink>
        <span aria-hidden="true">•</span>
        <PublicInlineLink url={settings.public_privacy_url} color={settings.global_primary_color} external={false}>
          {settings.public_privacy_label}
        </PublicInlineLink>
        {settings.public_support_label && settings.public_support_url ? (
          <>
            <span aria-hidden="true">•</span>
            <PublicInlineLink url={settings.public_support_url} color={settings.global_primary_color}>
              {settings.public_support_label}
            </PublicInlineLink>
          </>
        ) : null}
      </nav>
    </footer>
  );
}

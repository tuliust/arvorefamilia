import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_SITE_VISUAL_SETTINGS,
  getSiteVisualSettings,
  SiteVisualSettings,
} from '../services/siteVisualSettingsService';

const SITE_VISUAL_SETTINGS_CACHE_KEY = 'arvorefamilia:site-visual-settings:public';

function readCachedSiteVisualSettings() {
  if (typeof window === 'undefined') return DEFAULT_SITE_VISUAL_SETTINGS;

  try {
    const raw = window.localStorage.getItem(SITE_VISUAL_SETTINGS_CACHE_KEY);
    if (!raw) return DEFAULT_SITE_VISUAL_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<SiteVisualSettings>;
    return {
      ...DEFAULT_SITE_VISUAL_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SITE_VISUAL_SETTINGS;
  }
}

function cacheSiteVisualSettings(settings: SiteVisualSettings) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(SITE_VISUAL_SETTINGS_CACHE_KEY, JSON.stringify(settings));
  } catch {
    // Cache is best effort. Public settings still load from Supabase on every mount.
  }
}

export function useSiteVisualSettings() {
  const [settings, setSettings] = useState<SiteVisualSettings>(() => readCachedSiteVisualSettings());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSiteVisualSettings();
      cacheSiteVisualSettings(data);
      setSettings(data);
      return data;
    } catch (nextError) {
      const message = nextError instanceof Error
        ? nextError.message
        : 'Não foi possível carregar as configurações públicas.';
      setError(message);
      const cachedSettings = readCachedSiteVisualSettings();
      setSettings(cachedSettings);
      return cachedSettings;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      setLoading(true);
      setError(null);

      try {
        const data = await getSiteVisualSettings();
        cacheSiteVisualSettings(data);
        if (mounted) {
          setSettings(data);
        }
      } catch (nextError) {
        if (mounted) {
          const message = nextError instanceof Error
            ? nextError.message
            : 'Não foi possível carregar as configurações públicas.';
          setError(message);
          setSettings(readCachedSiteVisualSettings());
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    settings,
    loading,
    error,
    reload,
  };
}

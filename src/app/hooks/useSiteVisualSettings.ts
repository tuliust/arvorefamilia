import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_SITE_VISUAL_SETTINGS,
  getSiteVisualSettings,
  SiteVisualSettings,
} from '../services/siteVisualSettingsService';

export function useSiteVisualSettings() {
  const [settings, setSettings] = useState<SiteVisualSettings>(DEFAULT_SITE_VISUAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSiteVisualSettings();
      setSettings(data);
      return data;
    } catch (nextError) {
      const message = nextError instanceof Error
        ? nextError.message
        : 'Não foi possível carregar as configurações públicas.';
      setError(message);
      setSettings(DEFAULT_SITE_VISUAL_SETTINGS);
      return DEFAULT_SITE_VISUAL_SETTINGS;
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
        if (mounted) {
          setSettings(data);
        }
      } catch (nextError) {
        if (mounted) {
          const message = nextError instanceof Error
            ? nextError.message
            : 'Não foi possível carregar as configurações públicas.';
          setError(message);
          setSettings(DEFAULT_SITE_VISUAL_SETTINGS);
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

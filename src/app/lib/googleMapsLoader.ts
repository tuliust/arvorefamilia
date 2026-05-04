const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-javascript-api';

export type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

export type GooglePlaceResult = {
  address_components?: GoogleAddressComponent[];
  formatted_address?: string;
  geometry?: unknown;
};

export type GoogleMapsEventListener = {
  remove: () => void;
};

type GooglePlacesAutocompleteOptions = {
  bounds?: unknown;
  fields?: string[];
  strictBounds?: boolean;
  types?: string[];
};

export type GooglePlacesAutocomplete = {
  addListener: (eventName: 'place_changed', handler: () => void) => GoogleMapsEventListener;
  getPlace: () => GooglePlaceResult;
};

type GoogleMapsApi = {
  maps: {
    LatLngBounds: new (
      southwest: { lat: number; lng: number },
      northeast: { lat: number; lng: number },
    ) => unknown;
    event?: {
      clearInstanceListeners?: (instance: unknown) => void;
    };
    places: {
      Autocomplete: new (
        input: HTMLInputElement,
        options: GooglePlacesAutocompleteOptions,
      ) => GooglePlacesAutocomplete;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
  }
}

let googleMapsScriptPromise: Promise<GoogleMapsApi> | null = null;

function getLoadedGoogleMapsApi() {
  if (typeof window === 'undefined') return null;
  return window.google?.maps?.places ? window.google : null;
}

export function loadGoogleMapsPlaces(apiKey?: string) {
  if (!apiKey) return Promise.resolve(null);
  if (typeof window === 'undefined') return Promise.resolve(null);

  const loadedApi = getLoadedGoogleMapsApi();
  if (loadedApi) return Promise.resolve(loadedApi);
  if (googleMapsScriptPromise) return googleMapsScriptPromise;

  googleMapsScriptPromise = new Promise<GoogleMapsApi>((resolve, reject) => {
    const resolveLoadedApi = () => {
      const api = getLoadedGoogleMapsApi();

      if (api) {
        resolve(api);
        return;
      }

      googleMapsScriptPromise = null;
      reject(new Error('Google Maps JavaScript API não carregou a biblioteca Places.'));
    };

    const rejectLoad = () => {
      googleMapsScriptPromise = null;
      reject(new Error('Não foi possível carregar Google Maps JavaScript API.'));
    };

    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      if (existingScript.dataset.loaded === 'true' || window.google?.maps) {
        resolveLoadedApi();
        return;
      }

      existingScript.addEventListener('load', resolveLoadedApi, { once: true });
      existingScript.addEventListener('error', rejectLoad, { once: true });
      return;
    }

    const script = document.createElement('script');
    const params = new URLSearchParams({
      key: apiKey,
      libraries: 'places',
      language: 'pt-BR',
      region: 'BR',
      v: 'weekly',
    });

    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolveLoadedApi();
      },
      { once: true },
    );
    script.addEventListener('error', rejectLoad, { once: true });

    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

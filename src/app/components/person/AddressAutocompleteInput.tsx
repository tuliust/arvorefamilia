import React, { useEffect, useRef } from 'react';
import { Input, InputProps } from '../ui/input';
import { GooglePlacesAutocomplete, loadGoogleMapsPlaces } from '../../lib/googleMapsLoader';
import { formatGooglePlaceAddress } from '../../utils/googleAddress';

type AddressAutocompleteInputProps = Omit<InputProps, 'value' | 'onChange' | 'type'> & {
  value: string;
  onChange: (value: string) => void;
};

function setInputRef(
  node: HTMLInputElement | null,
  internalRef: React.MutableRefObject<HTMLInputElement | null>,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  internalRef.current = node;

  if (typeof forwardedRef === 'function') {
    forwardedRef(node);
    return;
  }

  if (forwardedRef) {
    forwardedRef.current = node;
  }
}

export const AddressAutocompleteInput = React.forwardRef<HTMLInputElement, AddressAutocompleteInputProps>(
  ({
    value,
    onChange,
    disabled,
    autoComplete = 'off',
    autoCorrect = 'off',
    autoCapitalize = 'off',
    spellCheck = false,
    name = 'family-tree-places-street-address',
    id,
    ...props
  }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? `family-tree-google-address-${generatedId.replace(/:/g, '')}`;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const input = inputRef.current;

      if (!apiKey) {
        if (import.meta.env.DEV) {
          console.warn('[Google Maps] VITE_GOOGLE_MAPS_API_KEY ausente; autocomplete de endereço desativado.');
        }
        return;
      }

      if (!input || disabled) return;

      let active = true;
      let autocomplete: GooglePlacesAutocomplete | undefined;
      let listener: { remove: () => void } | undefined;

      loadGoogleMapsPlaces(apiKey)
        .then((googleMaps) => {
          if (!active || !googleMaps || !inputRef.current) return;

          const brazilBounds = new googleMaps.maps.LatLngBounds(
            { lat: -33.75, lng: -73.99 },
            { lat: 5.27, lng: -34.79 },
          );

          autocomplete = new googleMaps.maps.places.Autocomplete(inputRef.current, {
            bounds: brazilBounds,
            componentRestrictions: { country: 'br' },
            fields: ['address_components', 'formatted_address', 'geometry', 'name'],
            strictBounds: false,
            types: ['geocode'],
          });

          if (import.meta.env.DEV) {
            console.debug('[Google Maps] Autocomplete de endereço inicializado.');
          }

          listener = autocomplete.addListener('place_changed', () => {
            const place = autocomplete?.getPlace();

            if (!place?.address_components?.length && import.meta.env.DEV) {
              console.warn('[Google Maps] place_changed sem address_components.', place);
            }

            const selectedAddress = place ? formatGooglePlaceAddress(place) : '';
            if (selectedAddress) onChangeRef.current(selectedAddress);
          });
        })
        .catch((error) => {
          if (active && import.meta.env.DEV) {
            console.warn('[Google Maps] Não foi possível carregar Places.', error);
          }
        });

      return () => {
        active = false;
        listener?.remove();
        if (autocomplete && window.google?.maps.event?.clearInstanceListeners) {
          window.google.maps.event.clearInstanceListeners(autocomplete);
        }
      };
    }, [disabled]);

    return (
      <Input
        {...props}
        ref={(node) => setInputRef(node, inputRef, ref)}
        type="text"
        value={value}
        disabled={disabled}
        id={inputId}
        name={name}
        autoComplete={autoComplete}
        autoCorrect={autoCorrect}
        autoCapitalize={autoCapitalize}
        spellCheck={spellCheck}
        data-form-type="other"
        data-lpignore="true"
        data-1p-ignore="true"
        onChange={(event) => onChangeRef.current(event.target.value)}
      />
    );
  },
);

AddressAutocompleteInput.displayName = 'AddressAutocompleteInput';

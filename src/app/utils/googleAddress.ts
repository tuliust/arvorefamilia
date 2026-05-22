import { GoogleAddressComponent, GooglePlaceResult } from '../lib/googleMapsLoader';

export function getAddressComponent(
  components: GoogleAddressComponent[] | undefined,
  type: string,
  name: 'long_name' | 'short_name' = 'long_name',
) {
  return components?.find((component) => component.types.includes(type))?.[name] ?? '';
}

export function joinAddressParts(parts: string[]) {
  return parts.map((part) => part.trim()).filter(Boolean).join(', ');
}

export function formatGooglePlaceAddress(place: GooglePlaceResult) {
  const components = place.address_components;
  if (!components?.length) return place.formatted_address ?? '';

  const street = getAddressComponent(components, 'route');
  const number = getAddressComponent(components, 'street_number');
  const neighborhood =
    getAddressComponent(components, 'sublocality_level_1') ||
    getAddressComponent(components, 'sublocality') ||
    getAddressComponent(components, 'neighborhood');
  const city =
    getAddressComponent(components, 'locality') ||
    getAddressComponent(components, 'administrative_area_level_2') ||
    getAddressComponent(components, 'postal_town');
  const state = getAddressComponent(components, 'administrative_area_level_1', 'short_name');
  const postalCode = getAddressComponent(components, 'postal_code');
  const postalCodeSuffix = getAddressComponent(components, 'postal_code_suffix');
  const fullPostalCode = [postalCode, postalCodeSuffix].filter(Boolean).join('-');
  const cityState = [city, state].filter(Boolean).join('/');
  const streetLine = joinAddressParts([street, number]);
  const address = joinAddressParts([streetLine, neighborhood, cityState, fullPostalCode ? `CEP ${fullPostalCode}` : '']);

  return address || (place.formatted_address ?? '');
}

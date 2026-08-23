/* ============================================================
   global-presence-data.js — CorosDev Global Presence location data
   Single source of truth for the hero's interactive globe.
   Translatable fields point to i18n keys defined in locale.js
   (CD_TRANSLATIONS) instead of hardcoding text here.
   `countryCode` is plain data (identical in every language, so it
   isn't routed through the i18n table).
   ============================================================ */

const GP_LOCATIONS = [
  {
    id: 'honduras',
    lat: 15.50,
    lng: -88.03,
    countryCode: 'HN',
    banner: 'assets/Cities/sps.jpg',
    i18n: {
      type: 'gp_loc_honduras_type',
      title: 'gp_loc_honduras_title',
      short: 'gp_loc_honduras_short',
      location: 'gp_loc_honduras_location',
      company: 'gp_loc_honduras_company',
      address: 'gp_loc_honduras_full_address'
    }
  },
  {
    id: 'miami',
    lat: 25.76,
    lng: -80.19,
    countryCode: 'US',
    banner: 'assets/Cities/Miami.jpg',
    i18n: {
      type: 'gp_loc_miami_type',
      title: 'gp_loc_miami_title',
      short: 'gp_loc_miami_short',
      location: 'gp_loc_miami_location',
      company: 'gp_loc_miami_company',
      address: 'gp_loc_miami_full_address'
    }
  },
  {
    id: 'wyoming',
    lat: 43.08,
    lng: -107.29,
    countryCode: 'US',
    banner: 'assets/Cities/Wyoming.jpg',
    i18n: {
      type: 'gp_loc_wyoming_type',
      title: 'gp_loc_wyoming_title',
      short: 'gp_loc_wyoming_short',
      location: 'gp_loc_wyoming_location',
      company: 'gp_loc_wyoming_company',
      address: 'gp_loc_wyoming_full_address'
    }
  },
  {
    id: 'prague',
    lat: 50.08,
    lng: 14.44,
    countryCode: 'CZ',
    banner: 'assets/Cities/Prague.jpg',
    i18n: {
      type: 'gp_loc_prague_type',
      title: 'gp_loc_prague_title',
      short: 'gp_loc_prague_short',
      location: 'gp_loc_prague_location',
      company: 'gp_loc_prague_company',
      address: 'gp_loc_prague_full_address'
    }
  }
];

// Connections communicating CorosDev as one interconnected organization.
const GP_CONNECTIONS = [
  { from: 'honduras', to: 'miami' },
  { from: 'honduras', to: 'wyoming' },
  { from: 'honduras', to: 'prague' },
  { from: 'miami', to: 'prague' }
];

function gpFindLocation(id) {
  return GP_LOCATIONS.find(loc => loc.id === id) || null;
}

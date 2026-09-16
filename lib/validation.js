const SEARCH_TYPES = new Set(['auto', 'home', 'bundle']);
const COVERAGE_PROFILES = new Set(['Basic', 'Recommended', 'Enhanced']);
const STATES = new Set(['NM']);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value, max = 120) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const choice = (value, allowed, fallback) => allowed.includes(value) ? value : fallback;
const numberText = (value, min, max) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? String(n) : '';
};
const validDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date <= new Date();
};
const age = value => Math.floor((Date.now() - new Date(`${value}T00:00:00Z`).getTime()) / 31557600000);

export function validateSubmission(body) {
  const errors = [];
  const searchType = SEARCH_TYPES.has(body?.searchType) ? body.searchType : '';
  const coverageProfile = COVERAGE_PROFILES.has(body?.coverageProfile) ? body.coverageProfile : '';
  const stateCode = STATES.has(body?.stateCode) ? body.stateCode : '';
  const source = body?.intake || {};

  if (!searchType) errors.push('Choose Auto, Home, or Home + Auto.');
  if (!coverageProfile) errors.push('Choose a coverage level.');
  if (!stateCode) errors.push('RateHunt is currently available in New Mexico only.');

  const first = clean(source.first, 60);
  const last = clean(source.last, 60);
  const email = clean(source.email, 254).toLowerCase();
  const zip = clean(source.zip, 5);
  const dob = clean(source.dob, 10);
  if (first.length < 2) errors.push('Enter the primary applicant’s first name.');
  if (last.length < 2) errors.push('Enter the primary applicant’s last name.');
  if (!EMAIL.test(email)) errors.push('Enter a valid email address.');
  if (!/^\d{5}$/.test(zip)) errors.push('Enter a five-digit ZIP code.');
  if (!validDate(dob) || age(dob) < 18 || age(dob) > 100) errors.push('The primary applicant must be between 18 and 100.');

  const rawDrivers = Array.isArray(source.drivers) ? source.drivers.slice(0, 8) : [];
  const rawVehicles = Array.isArray(source.vehicles) ? source.vehicles.slice(0, 8) : [];
  const drivers = rawDrivers.map((driver, index) => {
    const item = { first: clean(driver?.first, 60), last: clean(driver?.last, 60), dob: clean(driver?.dob, 10) };
    if (searchType !== 'home' && (!item.first || !item.last || !validDate(item.dob) || age(item.dob) < 14 || age(item.dob) > 100)) {
      errors.push(`Complete the information for driver ${index + 1}.`);
    }
    return item;
  });
  const vehicles = rawVehicles.map((vehicle, index) => {
    const item = {
      year: numberText(vehicle?.year, 1900, new Date().getFullYear() + 2),
      make: clean(vehicle?.make, 60),
      model: clean(vehicle?.model, 80)
    };
    if (searchType !== 'home' && (!item.year || !item.make || !item.model)) errors.push(`Complete the information for vehicle ${index + 1}.`);
    return item;
  });
  if (searchType !== 'home' && !drivers.length) errors.push('Add at least one driver.');
  if (searchType !== 'home' && !vehicles.length) errors.push('Add at least one vehicle.');

  const address = clean(source.address, 180);
  if (searchType !== 'auto' && address.length < 5) errors.push('Enter the home address.');
  if (searchType !== 'auto' && !numberText(source.squareFeet, 300, 30000)) errors.push('Enter the approximate finished square footage.');
  if (searchType !== 'auto' && !numberText(source.yearBuilt, 1700, new Date().getFullYear() + 1)) errors.push('Enter a valid year built.');

  if (body?.consent?.accepted !== true) errors.push('Accept the privacy notice and quote-request authorization.');
  if (body?.consent?.version !== '2026-09-16') errors.push('Refresh the page and review the current consent notice.');

  const intake = {
    first, last, email, zip, dob, address,
    roof: numberText(source.roof, 1900, new Date().getFullYear() + 1),
    yearBuilt: numberText(source.yearBuilt, 1700, new Date().getFullYear() + 1),
    squareFeet: numberText(source.squareFeet, 300, 30000),
    stories: choice(source.stories, ['1', '1.5', '2', '3'], '1'),
    finishQuality: choice(source.finishQuality, ['basic', 'standard', 'upgraded', 'custom'], 'standard'),
    garage: choice(source.garage, ['none', 'one_car', 'two_car', 'three_car'], 'none'),
    detachedStructures: choice(source.detachedStructures, ['none', 'small', 'garage', 'substantial'], 'none'),
    occupancy: choice(source.occupancy, ['primary', 'secondary', 'rental'], 'primary'),
    construction: choice(source.construction, ['frame', 'masonry', 'manufactured', 'log'], 'frame'),
    homeDeductible: choice(source.homeDeductible, ['1000', '2500', '5000'], '2500'),
    homeClaims: choice(source.homeClaims, ['0', '1', '2', '3'], '0'),
    vehicleUse: choice(source.vehicleUse, ['pleasure', 'commute', 'business'], 'commute'),
    annualMiles: choice(source.annualMiles, ['low', 'average', 'high'], 'average'),
    priorInsurance: choice(source.priorInsurance, ['continuous', 'lapse', 'none'], 'continuous'),
    accidents: choice(source.accidents, ['0', '1', '2', '3'], '0'),
    tickets: choice(source.tickets, ['0', '1', '2', '3'], '0'),
    drivers: searchType === 'home' ? [] : drivers,
    vehicles: searchType === 'home' ? [] : vehicles,
    schemaVersion: 'ratehunt-intake-2'
  };

  return { ok: errors.length === 0, errors: [...new Set(errors)].slice(0, 8), searchType, coverageProfile, stateCode, intake };
}

export function safeEstimates(estimates) {
  if (!Array.isArray(estimates)) return [];
  return estimates.slice(0, 25).map(item => ({
    carrier: clean(item?.carrier, 80),
    low: Math.max(0, Math.round(Number(item?.low) || 0)),
    midpoint: Math.max(0, Math.round(Number(item?.midpoint) || 0)),
    high: Math.max(0, Math.round(Number(item?.high) || 0))
  })).filter(item => item.carrier && item.low && item.midpoint && item.high);
}

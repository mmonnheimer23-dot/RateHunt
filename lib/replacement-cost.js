const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const roundTo = (value, increment = 5000) => Math.round(value / increment) * increment;

export const replacementCostProvider = {
  preferred: 'Verisk 360Value',
  current: 'RateHunt preliminary model',
  verificationStatus: 'credentials_required',
  schemaVersion: 'replacement-cost-profile-1'
};

export function buildReplacementCostProfile(intake) {
  return {
    address: intake.address || '',
    postalCode: intake.zip || '',
    yearBuilt: num(intake.yearBuilt),
    roofReplacementYear: num(intake.roof),
    finishedSquareFeet: num(intake.squareFeet),
    stories: intake.stories || '1',
    construction: intake.construction || 'frame',
    finishQuality: intake.finishQuality || 'standard',
    garage: intake.garage || 'two_car',
    detachedStructures: intake.detachedStructures || 'none',
    occupancy: intake.occupancy || 'primary'
  };
}

export function estimateReplacementCost(intake) {
  const profile = buildReplacementCostProfile(intake);
  const squareFeet = Math.max(500, profile.finishedSquareFeet || 1800);
  const perSquareFoot = { basic: 170, standard: 215, upgraded: 270, custom: 350 }[profile.finishQuality] || 215;
  const storyFactor = { '1': 1.05, '1.5': 1.02, '2': .97, '3': 1.01 }[profile.stories] || 1;
  const constructionFactor = { frame: 1, masonry: 1.08, manufactured: .72, log: 1.28 }[profile.construction] || 1;
  const garageCost = { none: 0, one_car: 22000, two_car: 39000, three_car: 57000 }[profile.garage] || 0;
  const detachedCost = { none: 0, small: 12000, garage: 48000, substantial: 90000 }[profile.detachedStructures] || 0;
  const ageFactor = profile.yearBuilt && profile.yearBuilt < 1950 ? 1.16 : profile.yearBuilt && profile.yearBuilt < 1980 ? 1.08 : 1;
  const occupancyFactor = profile.occupancy === 'rental' ? 1.03 : 1;
  const structure = squareFeet * perSquareFoot * storyFactor * constructionFactor * ageFactor * occupancyFactor;
  const midpoint = roundTo((structure + garageCost + detachedCost) * 1.10);
  return {
    low: roundTo(midpoint * .84),
    midpoint,
    high: roundTo(midpoint * 1.18),
    provider: replacementCostProvider.current,
    verificationProvider: replacementCostProvider.preferred,
    verificationStatus: replacementCostProvider.verificationStatus,
    profile
  };
}

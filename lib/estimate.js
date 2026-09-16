const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const number = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
const ageFrom = dob => dob ? Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000) : 40;
const round = n => Math.max(1, Math.round(n));

function autoEstimate(intake, profile) {
  const drivers = intake.drivers?.length ? intake.drivers : [{ dob: intake.dob }];
  const vehicles = intake.vehicles?.length ? intake.vehicles : [{}];
  const youngest = Math.min(...drivers.map(d => ageFrom(d.dob)));
  const newestYear = Math.max(...vehicles.map(v => number(v.year, 2018)));
  const currentYear = new Date().getFullYear();
  let factor = 1;
  const reasons = [];

  if (youngest < 21) { factor *= 1.78; reasons.push('driver under 21'); }
  else if (youngest < 25) { factor *= 1.42; reasons.push('driver under 25'); }
  else if (youngest >= 70) { factor *= 1.10; reasons.push('senior driver'); }
  else if (youngest >= 35 && youngest <= 64) factor *= .93;
  factor *= 1 + Math.max(0, drivers.length - 1) * .34;
  factor *= 1 + Math.max(0, vehicles.length - 1) * .63;
  if (newestYear >= currentYear - 2) { factor *= 1.16; reasons.push('newer vehicle'); }
  else if (newestYear <= currentYear - 12) factor *= .88;
  factor *= ({ pleasure: .90, commute: 1, business: 1.18 }[intake.vehicleUse] || 1);
  factor *= ({ low: .88, average: 1, high: 1.14 }[intake.annualMiles] || 1);
  factor *= intake.priorInsurance === 'none' ? 1.32 : intake.priorInsurance === 'lapse' ? 1.20 : .96;
  if (intake.priorInsurance !== 'continuous') reasons.push('insurance history');
  factor *= 1 + number(intake.accidents) * .27 + number(intake.tickets) * .12;
  if (number(intake.accidents) || number(intake.tickets)) reasons.push('driving history');
  factor *= ({ Basic: .78, Recommended: 1, Enhanced: 1.25 }[profile] || 1);
  return { monthly: 184 * factor, uncertainty: .20, reasons };
}

function homeEstimate(intake, profile) {
  const currentYear = new Date().getFullYear();
  const built = number(intake.yearBuilt, 1995);
  const roof = number(intake.roof, currentYear - 10);
  const dwelling = clamp(number(intake.dwelling, 350000), 75000, 2000000);
  let factor = dwelling / 350000;
  const reasons = [];
  if (built < 1950) { factor *= 1.24; reasons.push('older home'); }
  else if (built < 1980) { factor *= 1.11; reasons.push('home age'); }
  else if (built >= 2015) factor *= .90;
  const roofAge = currentYear - roof;
  if (roofAge > 20) { factor *= 1.30; reasons.push('roof over 20 years'); }
  else if (roofAge > 12) { factor *= 1.13; reasons.push('roof age'); }
  else if (roofAge <= 5) factor *= .93;
  factor *= ({ frame: 1.08, masonry: .94, manufactured: 1.28 }[intake.construction] || 1);
  factor *= ({ primary: 1, secondary: 1.17, rental: 1.24 }[intake.occupancy] || 1);
  factor *= ({ '1000': 1.10, '2500': 1, '5000': .88 }[intake.homeDeductible] || 1);
  factor *= 1 + number(intake.homeClaims) * .22;
  if (number(intake.homeClaims)) reasons.push('recent property claims');
  factor *= ({ Basic: .86, Recommended: 1, Enhanced: 1.15 }[profile] || 1);
  return { monthly: 198 * factor, uncertainty: .24, reasons };
}

export function estimateCarrier(carrier, searchType, intake, profile) {
  const auto = carrier.autoIndex == null ? null : autoEstimate(intake, profile);
  const home = carrier.homeIndex == null ? null : homeEstimate(intake, profile);
  const bundleEligible = searchType === 'bundle' && auto && home;
  const monthly = searchType === 'auto' ? auto?.monthly * carrier.autoIndex
    : searchType === 'home' ? home?.monthly * carrier.homeIndex
    : bundleEligible ? (auto.monthly * carrier.autoIndex + home.monthly * carrier.homeIndex) * .88 : null;
  if (!monthly) return { ...carrier, estimate: null };
  const uncertainty = searchType === 'bundle' ? .19 : searchType === 'home' ? home.uncertainty : auto.uncertainty;
  return {
    ...carrier,
    estimate: round(monthly),
    low: round(monthly * (1 - uncertainty)),
    high: round(monthly * (1 + uncertainty)),
    reasons: [...new Set([...(auto?.reasons || []), ...(home?.reasons || [])])].slice(0, 3)
  };
}

export function estimateAll(carriers, searchType, intake, profile) {
  return carriers
    .filter(c => searchType === 'auto' ? c.autoIndex != null : searchType === 'home' ? c.homeIndex != null : (c.autoIndex != null && c.homeIndex != null))
    .map(c => estimateCarrier(c, searchType, intake, profile))
    .sort((a, b) => a.estimate - b.estimate);
}

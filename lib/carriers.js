export const carriers = [
  { n: 'Progressive', autoIndex: .94, homeIndex: 1.04, au: 'https://www.progressive.com/auto/', hu: 'https://www.progressive.com/homeowners/', connection: 'external' },
  { n: 'Travelers', autoIndex: 1.01, homeIndex: .96, au: 'https://www.travelers.com/quote/car-insurance', hu: 'https://www.travelers.com/quote/home-insurance', connection: 'external' },
  { n: 'Farmers', autoIndex: 1.08, homeIndex: 1.02, au: 'https://www.farmers.com/auto/', hu: 'https://www.farmers.com/home/homeowners/quote/', connection: 'external' },
  { n: 'State Farm', autoIndex: 1.04, homeIndex: .98, au: 'https://www.statefarm.com/insurance/auto', hu: 'https://www.statefarm.com/insurance/quotes/homeowners-quote', connection: 'external' },
  { n: 'Allstate', autoIndex: 1.10, homeIndex: 1.06, au: 'https://www.allstate.com/auto-insurance', hu: 'https://www.allstate.com/home-insurance', connection: 'external' },
  { n: 'Bristol West', autoIndex: 1.12, homeIndex: null, au: 'https://www.bristolwest.com/', hu: null, connection: 'external' },
  { n: 'Openly', autoIndex: null, homeIndex: .92, au: null, hu: 'https://openly.com/homeowners', connection: 'external', note: 'Independent-agent access' },
  { n: 'Liberty Mutual', autoIndex: 1.05, homeIndex: 1.04, au: 'https://www.libertymutual.com/auto/auto-insurance', hu: 'https://www.libertymutual.com/property/homeowners-insurance', connection: 'external' },
  { n: 'Safeco', autoIndex: 1.03, homeIndex: 1.01, au: 'https://www.safeco.com/products/auto-insurance', hu: 'https://www.safeco.com/products/homeowners-insurance', connection: 'external', note: 'Independent-agent quote' },
  { n: 'Nationwide', autoIndex: 1.02, homeIndex: 1.03, au: 'https://www.nationwide.com/personal/insurance/auto/', hu: 'https://www.nationwide.com/personal/insurance/homeowners/', connection: 'external' },
  { n: 'GEICO', autoIndex: .98, homeIndex: 1.07, au: 'https://www.geico.com/auto-insurance/', hu: 'https://www.geico.com/homeowners-insurance/', connection: 'external', note: 'Home coverage may be placed with a partner' },
  { n: 'USAA', autoIndex: .91, homeIndex: .95, au: 'https://www.usaa.com/insurance/vehicles/auto/', hu: 'https://www.usaa.com/insurance/property/homeowners/', connection: 'external', note: 'Membership eligibility required' },
  { n: 'Foremost', autoIndex: 1.14, homeIndex: 1.12, au: 'https://www.foremost.com/products/auto/', hu: 'https://www.foremost.com/products/home/', connection: 'external', note: 'Specialty-market option' },
  { n: 'National General', autoIndex: 1.09, homeIndex: 1.08, au: 'https://nationalgeneral.com/insurance/auto', hu: 'https://nationalgeneral.com/insurance/homeowners', connection: 'external', note: 'Availability subject to underwriting' },
  { n: 'Steadily', autoIndex: null, homeIndex: 1.10, au: null, hu: 'https://www.steadily.com/', connection: 'external', note: 'Landlord properties only', homeOccupancies: ['rental'] }
];

export const modelInfo = {
  version: 'RH-NM-0.5',
  calibratedFor: 'New Mexico planning estimates',
  disclaimer: 'Modeled planning estimate — not a bindable carrier quote.'
};

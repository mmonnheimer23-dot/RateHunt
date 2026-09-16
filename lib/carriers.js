export const carriers = [
  { n: 'Progressive', autoIndex: .94, homeIndex: 1.04, au: 'https://www.progressive.com/auto/', hu: 'https://www.progressive.com/homeowners/', connection: 'external' },
  { n: 'Travelers', autoIndex: 1.01, homeIndex: .96, au: 'https://www.travelers.com/quote/car-insurance', hu: 'https://www.travelers.com/quote/home-insurance', connection: 'external' },
  { n: 'Farmers', autoIndex: 1.08, homeIndex: 1.02, au: 'https://www.farmers.com/auto/', hu: 'https://www.farmers.com/home/homeowners/quote/', connection: 'external' },
  { n: 'State Farm', autoIndex: 1.04, homeIndex: .98, au: 'https://www.statefarm.com/insurance/auto', hu: 'https://www.statefarm.com/insurance/quotes/homeowners-quote', connection: 'external' },
  { n: 'Allstate', autoIndex: 1.10, homeIndex: 1.06, au: 'https://www.allstate.com/auto-insurance', hu: 'https://www.allstate.com/home-insurance', connection: 'external' },
  { n: 'Bristol West', autoIndex: 1.12, homeIndex: null, au: 'https://www.bristolwest.com/', hu: null, connection: 'external' },
  { n: 'Openly', autoIndex: null, homeIndex: .92, au: null, hu: 'https://openly.com/homeowners', connection: 'external' }
];

export const modelInfo = {
  version: 'RH-NM-0.3',
  calibratedFor: 'New Mexico planning estimates',
  disclaimer: 'Modeled planning estimate — not a bindable carrier quote.'
};

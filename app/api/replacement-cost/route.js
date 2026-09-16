import { NextResponse } from 'next/server';
import { buildReplacementCostProfile, estimateReplacementCost, replacementCostProvider } from '../../../lib/replacement-cost';

export async function GET() {
  return NextResponse.json({
    provider: replacementCostProvider,
    connected: false,
    message: '360Value credentials and licensed integration documentation are required.'
  });
}

export async function POST(request) {
  try {
    const intake = await request.json();
    const profile = buildReplacementCostProfile(intake);
    const estimate = estimateReplacementCost(intake);
    return NextResponse.json({
      estimate,
      profile,
      provider: replacementCostProvider,
      verifiedBy360Value: false
    });
  } catch {
    return NextResponse.json({ error: 'Unable to prepare replacement-cost profile' }, { status: 400 });
  }
}

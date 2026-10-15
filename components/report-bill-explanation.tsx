type Props = {
  currencySymbol: string;
  averageBill: number | null;
  billingFrequency: string;
  annualSpendOverride: number | null;
  fixedChargePerBill: number | null;
  unitRate: number | null;
  estimatedYearlyKwh: number | null;
};

const billsPerYear: Record<string, number> = {
  Monthly: 12,
  "Bi-monthly": 6,
  Quarterly: 4,
  Annual: 1,
};

function money(value: number, symbol: string) {
  return symbol + new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ReportBillExplanation({
  currencySymbol,
  averageBill,
  billingFrequency,
  annualSpendOverride,
  fixedChargePerBill,
  unitRate,
  estimatedYearlyKwh,
}: Props) {
  const frequency = billsPerYear[billingFrequency];
  if (!frequency) return null;

  const useOverride =
    annualSpendOverride !== null &&
    Number.isFinite(annualSpendOverride) &&
    annualSpendOverride > 0;

  const hasBill =
    averageBill !== null &&
    Number.isFinite(averageBill) &&
    averageBill > 0;

  if (!useOverride && !hasBill) return null;

  const annualSpend = useOverride
    ? annualSpendOverride
    : (averageBill ?? 0) * frequency;

  const fixedCharge = Math.max(0, fixedChargePerBill ?? 0);
  const fixedAnnual = fixedCharge * frequency;
  const variableSpend = Math.max(0, annualSpend - fixedAnnual);
  const rate = unitRate !== null && unitRate > 0 ? unitRate : null;
  const calculatedUsage = rate ? variableSpend / Math.max(rate, 0.01) : null;
  const canShowKwhFormula =
    calculatedUsage !== null &&
    estimatedYearlyKwh !== null &&
    estimatedYearlyKwh > 0 &&
    Math.abs(calculatedUsage - estimatedYearlyKwh) < 2;

  return (
    <div className="ri-bill-bridge">
      <div className="ri-bill-bridge-heading">
        <div>
          <p className="ri-section-kicker">HOW THE ESTIMATE WORKS</p>
          <h3>From your bill to estimated electricity use</h3>
        </div>
        <span>Based on your answers</span>
      </div>
      <div className="ri-bill-steps">
        <div>
          <span>01 / YEARLY ELECTRICITY BILL</span>
          <strong>{money(annualSpend, currencySymbol)}</strong>
          <small>
            {useOverride
              ? "Using the annual electricity spend you entered"
              : money(averageBill ?? 0, currencySymbol) + " per " + billingFrequency.toLowerCase() + " bill × " + frequency + " bills"}
          </small>
        </div>
        <div>
          <span>02 / FIXED BILL CHARGES</span>
          <strong>{money(fixedAnnual, currencySymbol)}</strong>
          <small>{money(fixedCharge, currencySymbol)} per bill × {frequency} bills</small>
        </div>
        <div>
          <span>03 / ELECTRICITY USAGE PORTION</span>
          <strong>{money(variableSpend, currencySymbol)}</strong>
          <small>Yearly bill less fixed charges</small>
        </div>
        <div className="ri-bill-result">
          <span>04 / ESTIMATED YEARLY USAGE</span>
          <strong>{canShowKwhFormula ? Math.round(estimatedYearlyKwh).toLocaleString("en-US") + " kWh" : "Needs checking"}</strong>
          <small>{canShowKwhFormula ? "Usage portion ÷ " + money(rate ?? 0, currencySymbol) + "/kWh" : "Check your unit rate and bill details for a usable estimate"}</small>
        </div>
      </div>
      <p className="ri-bill-disclaimer">
        This is a bill-based estimate, not a meter reading. Your fixed charge is treated as
        the amount on each bill. If the bill period, price, or charge is inaccurate, the
        estimated electricity use can change.
      </p>
    </div>
  );
}

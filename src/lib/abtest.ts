export function rate(eng: number, imp: number) {
  return imp > 0 ? (eng / imp) * 100 : 0;
}
function normCdf(z: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
export function analyze(ia: number, ea: number, ib: number, eb: number) {
  const ra = rate(ea, ia), rb = rate(eb, ib);
  const lift = ra > 0 ? ((rb - ra) / ra) * 100 : 0;
  let confidence = 0;
  if (ia > 0 && ib > 0) {
    const p = (ea + eb) / (ia + ib);
    const se = Math.sqrt(p * (1 - p) * (1 / ia + 1 / ib));
    if (se > 0) {
      const z = Math.abs(ea / ia - eb / ib) / se;
      confidence = (2 * normCdf(z) - 1) * 100;
    }
  }
  return { ra, rb, lift, confidence };
}

// Only an explicit execution revert is a definite rejection. Network failures,
// proxy errors, and timeouts must keep the pending transaction locked.
export function executionRejection(error) {
  try {
    const detail = JSON.parse(error.message);
    if (Number.isInteger(detail.code) && detail.code > 0 && Array.isArray(detail.logs) &&
        detail.logs.some(log => typeof log === 'string' && log.startsWith('transaction reverted:')))
      return detail.logs.join(' ');
  } catch {}
  return null;
}

export function purchaseDeadline(pending) {
  if (pending?.method !== 'buy') return null;
  if (typeof pending.deadline === 'string' && /^[1-9]\d*$/.test(pending.deadline)) return BigInt(pending.deadline);
  // The original frontend used a ten-minute quote and saved createdAt only
  // after signing. This is an upper bound on that legacy quote's deadline.
  const created = Date.parse(pending.createdAt);
  return Number.isFinite(created) ? BigInt(created + 600000) : null;
}

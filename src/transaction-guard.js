export function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
  return JSON.stringify(value);
}
export function transactionIntent(transaction) {
  return canonical({header:transaction.header,operations:transaction.operations});
}
export function verifySignedTransaction(signed, expectedIntent, expectedId) {
  if (!signed || signed.id !== expectedId || !Array.isArray(signed.signatures) || signed.signatures.length === 0 || transactionIntent(signed) !== expectedIntent)
    throw Error('The signed transaction differs from the requested action. Nothing was broadcast.');
}

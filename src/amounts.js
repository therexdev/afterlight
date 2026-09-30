const MAX_PRICE = 100000000000000000n;
export function parseKoin(value) {
  const text = String(value).trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/.test(text)) throw Error('Enter a KOIN amount with up to 8 decimal places.');
  const [whole, fraction = ''] = text.split('.');
  const amount = BigInt(whole) * 100000000n + BigInt(fraction.padEnd(8, '0'));
  if (amount <= 0n || amount > MAX_PRICE) throw Error('Price must be greater than zero and at most 1 billion KOIN.');
  return amount.toString();
}
export function formatKoin(value) {
  const amount = BigInt(value || '0');
  const fraction = (amount % 100000000n).toString().padStart(8, '0').replace(/0+$/, '');
  return (amount / 100000000n).toLocaleString('en-US') + (fraction ? '.' + fraction : '');
}
export function tokenId(id) {
  if (!Number.isInteger(id) || id < 1 || id > 100) throw Error('Invalid artwork.');
  return '0x' + Array.from(new TextEncoder().encode(String(id)), byte => byte.toString(16).padStart(2, '0')).join('');
}
export function parseTokenId(hex) {
  const clean = String(hex).replace(/^0x/, '');
  if (!/^(?:[a-f0-9]{2}){1,3}$/i.test(clean)) throw Error('Invalid token ID.');
  const raw = new TextDecoder().decode(Uint8Array.from(clean.match(/../g), x => parseInt(x, 16)));
  const id = Number(raw);
  if (!/^[1-9]\d{0,2}$/.test(raw) || !Number.isInteger(id) || id > 100) throw Error('Invalid token ID.');
  return id;
}

import {Provider, Contract, Transaction, utils} from 'koilib';
import {getAccounts, getSigner} from '../vendor/kondor-js/src/index.js';
import collectionAbi from '../contracts/build/afterlight.abi' with {type:'json'};
import archiveAbi from '../contracts/build/archive.abi' with {type:'json'};
import {tokenId, parseTokenId} from './amounts.js';
import {transactionIntent,verifySignedTransaction} from './transaction-guard.js';

export const MAINNET = 'EiBZK_GGVP0H_fXVAM3j6EAuz3-B-l3ejxRSewi7qIBfSA==';
export const TESTNET = 'EiAIKVvm6-V2qmsmUvPJy09vCCLbtn9lHFpwrJbcTIEWRQ==';
export function address(value) {
  try { if (typeof value !== 'string' || !utils.isChecksumAddress(value)) throw Error(); }
  catch { throw Error('Enter a valid Koinos address.'); }
  return value;
}
const withTimeout = (promise, ms, message) => {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(Error(message)), ms); })]).finally(() => clearTimeout(timer));
};
export class ChainClient {
  constructor(config) {
    this.config = config;
    this.provider = new Provider(config.rpcUrls);
    this.collection = config.collectionId ? new Contract({id:address(config.collectionId), abi:collectionAbi, provider:this.provider}) : null;
    this.archive = config.archiveId ? new Contract({id:address(config.archiveId), abi:archiveAbi, provider:this.provider}) : null;
  }
  async network() {
    if (![MAINNET, TESTNET].includes(this.config.chainId)) throw Error('Unknown configured chain.');
    const chain = await withTimeout(this.provider.getChainId(), 20000, 'The Koinos node did not respond.');
    if (chain !== this.config.chainId) throw Error('This node is on the wrong network. No transaction was sent.');
  }
  async read(method, args = {}) {
    if (!this.collection) throw Error('The collection has not been deployed yet.');
    const {result} = await this.collection.functions[method](args);
    return result || {};
  }
  async state() {
    await this.network();
    const config = (await this.read('get_config')).value;
    if (!config || config.archive !== this.config.archiveId || config.payment_token !== this.config.paymentToken || config.treasury !== this.config.treasury) throw Error('Contract configuration does not match this website.');
    const tokens = [];
    for (let start = 1; start <= 100; start += 25) {
      const page = await this.read('get_tokens', {start, limit:25});
      for (const token of page.values || []) tokens.push({...token, id:parseTokenId(token.token_id)});
    }
    return {config, tokens};
  }
  async connect() {
    await this.network();
    const accounts = await withTimeout(getAccounts(), 20000, 'Kondor did not respond. Open this site in a browser with Kondor installed and unlocked.');
    if (!Array.isArray(accounts) || !accounts.length) throw Error('No wallet account was selected.');
    return accounts.map(account => ({...account, address:address(account.address)}));
  }
  async balances(owner) {
    const token = new Contract({id:this.config.paymentToken, abi:utils.tokenAbi, provider:this.provider});
    const [{result}, rc] = await Promise.all([token.functions.balanceOf({owner:address(owner)}), this.provider.getAccountRc(owner)]);
    return {balance:result?.value || '0', mana:rc};
  }
  async quote(id) {
    await this.network();
    const sale = (await this.read('get_listing', {token_id:tokenId(id)})).value;
    if (!sale?.active) throw Error('This work is not currently listed. Refresh the page for its latest status.');
    return sale;
  }
  async send(owner, method, args, progress = () => {}) {
    if (!this.config.enabled || !this.collection) throw Error('Mainnet sales have not opened.');
    if (!['buy','list_token','cancel_listing','transfer'].includes(method)) throw Error('Unsupported transaction.');
    address(owner); await this.network();
    if (localStorage.getItem('afterlight.pending.' + this.config.chainId)) throw Error('An earlier transaction needs confirmation before another can be submitted.');
    const actor = method === 'buy' ? args.buyer : method === 'transfer' ? args.from : args.seller;
    if (actor !== owner) throw Error('The selected wallet does not match this action.');
    if (method === 'transfer') address(args.to);
    const available = BigInt(await this.provider.getAccountRc(owner));
    const maxMana = BigInt(this.config.maxActionMana || '1000000000');
    const rcLimit = available < maxMana ? available : maxMana;
    if (rcLimit < 100000n) throw Error('This wallet needs KOIN with available Mana to submit the transaction.');
    const signer = getSigner(owner, {provider:this.provider});
    const {operation} = await this.collection.functions[method](args, {onlyOperation:true});
    const tx = new Transaction({provider:this.provider, signer, options:{chainId:this.config.chainId, rcLimit:rcLimit.toString(), payer:owner}});
    await tx.pushOperation(operation); await tx.prepare();
    const intended = transactionIntent(tx.transaction), expectedId = tx.transaction.id;
    progress('Review and approve this transaction in Kondor.');
    const signed = await withTimeout(signer.signTransaction(tx.transaction, {[this.config.collectionId]:collectionAbi}), 120000, 'Signing timed out. No transaction was broadcast by this site.');
    verifySignedTransaction(signed, intended, expectedId);
    if (method === 'buy' && BigInt(args.deadline) <= BigInt(Date.now())) throw Error('The purchase quote expired while signing. Refresh and try again.');
    const pending = {id:signed.id, account:owner, method, createdAt:new Date().toISOString()};
    localStorage.setItem('afterlight.pending.' + this.config.chainId, JSON.stringify(pending));
    progress('Submitting the signed transaction…');
    let response;
    try { response = await this.provider.sendTransaction(signed); }
    catch (error) { throw Error('Submission status is uncertain. Do not repeat this action yet. Check transaction ' + signed.id + '. ' + error.message); }
    if (response.receipt?.reverted) {
      localStorage.removeItem('afterlight.pending.' + this.config.chainId);
      throw Error('The transaction was rejected: ' + (response.receipt.logs || []).join(' '));
    }
    progress('Waiting for the transaction to appear in a block…');
    await this.confirm(signed.id);
    localStorage.removeItem('afterlight.pending.' + this.config.chainId);
    return signed.id;
  }
  async confirm(id) {
    const inclusion = await this.provider.wait(id, 'byTransactionId', 60000);
    const blocks = await this.provider.getBlocksById([inclusion.blockId], {returnBlock:false, returnReceipt:true});
    const receipt = blocks.block_items?.[0]?.receipt?.transaction_receipts?.find(item => item.id === id);
    if (!receipt) throw Error('Transaction confirmation is unavailable. Check transaction ' + id + ' before trying again.');
    if (receipt.reverted) {
      const key = 'afterlight.pending.' + this.config.chainId;
      try { if (JSON.parse(localStorage.getItem(key))?.id === id) localStorage.removeItem(key); } catch {}
      throw Error('This transaction was included but reverted. No purchase or transfer completed. Transaction: ' + id);
    }
    return receipt;
  }
  async recover(id, expected, progress) {
    if (!this.archive) throw Error('The archive has not been deployed yet.');
    // Independent dependency-free reader verifies each byte against the immutable archive digest.
    return window.AfterlightChain.reconstruct({rpc:this.config.rpcUrls[0], contractId:this.config.archiveId, chainId:this.config.chainId}, id, expected, progress);
  }
}

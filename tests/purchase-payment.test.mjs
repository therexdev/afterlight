import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {Contract,Signer,utils} from 'koilib';
import {bytecodeNetwork} from './fixtures/bytecode-network.mjs';
import {buildKoin} from './fixtures/build-koin.mjs';
import {TESTNET_KOIN} from '../scripts/chain-compat.mjs';
import {executionRejection} from '../src/transaction-status.js';

const dir=mkdtempSync(join(tmpdir(),'afterlight-payment-'));
await build({entryPoints:['src/chain-client.js'],bundle:true,format:'cjs',platform:'node',outfile:join(dir,'client.cjs'),loader:{'.abi':'json'},logLevel:'silent'});
const {ChainClient,TESTNET}=createRequire(import.meta.url)(join(dir,'client.cjs'));
rmSync(dir,{recursive:true,force:true});
const paymentWasm=buildKoin(),now=String(Date.now());
const archiveId=Signer.fromSeed('offline payment test archive').address;
const collectionId=Signer.fromSeed('offline payment test collection').address;
const treasury=Signer.fromSeed('offline payment test treasury').address;
const alice=Signer.fromSeed('offline payment test alice').address,bob=Signer.fromSeed('offline payment test bob').address;
const config={enabled:true,chainId:TESTNET,rpcUrls:[],paymentToken:TESTNET_KOIN,archiveId,collectionId,treasury,maxActionMana:'1000000000'};
const abi=JSON.parse(readFileSync('contracts/build/afterlight.abi'));
const market=new Contract({id:collectionId,abi}),koin=new Contract({id:TESTNET_KOIN,abi:utils.tokenAbi});
const price='50000000000',key='afterlight.pending.'+TESTNET;
const args=(buyer=alice,seller=collectionId,value=price,revision='0')=>({buyer,token_id:'0x31',expected_seller:seller,expected_price:value,expected_revision:revision,deadline:String(BigInt(now)+600000n)});
const storage=()=>{const entries=new Map();return {getItem:k=>entries.get(k)||null,setItem:(k,v)=>entries.set(k,v),removeItem:k=>entries.delete(k)};};
async function setup(){
 const network=bytecodeNetwork(archiveId,collectionId,{paymentId:TESTNET_KOIN,paymentWasm,now});
 const invoke=async(contract,name,input={},signers=[])=>{
  const op=await contract.encodeOperation({name,args:input});
  const bytes=network.transaction([op],signers)[0];
  const result=contract.abi.methods[name].return;
  return result?contract.serializer.deserialize(bytes,result):{};
 };
 // Seed inventory only. All payment, authorization, listing, and buy logic runs
 // through the actual compiled contracts, including nested KOIN calls.
 for(const [space,keyBytes,type,value] of [
  [7,new Uint8Array(),'configuration',{archive:archiveId,treasury,payment_token:TESTNET_KOIN,base_uri:'koinos://test',launched:true}],
  [1,Buffer.from('1'),'token_record',{owner:collectionId}],
  [2,utils.decodeBase58(collectionId),'number_record',{value:'1'}],
  [6,new Uint8Array(),'number_record',{value:'1'}]
 ])network.seed(collectionId,space,keyBytes,await market.serializer.serialize(value,'afterlight.'+type));
 for(const owner of [alice,bob])await invoke(koin,'mint',{to:owner,value:'200000000000'},[TESTNET_KOIN]);
 const memory=storage(),receipts=new Map(),signed=[],submissions=[];
 const provider={
  getChainId:async()=>TESTNET,getAccountRc:async()=> '200000000000',getNextNonce:async()=> 'KAE=',
  sendTransaction:async tx=>{
   submissions.push(tx);
   try{network.transaction(tx.operations,[tx.header.payer]);}
   catch(error){throw Error(JSON.stringify({error:error.message,code:1,logs:['transaction reverted: '+error.message]}));}
   const receipt={id:tx.id,reverted:false};receipts.set(tx.id,receipt);return {receipt};
  },
  wait:async id=>({blockId:id}),getBlocksById:async ids=>({block_items:ids.map(id=>({receipt:{transaction_receipts:[receipts.get(id)]}}))}),
  getTransactionsById:async()=>({}),getHeadInfo:async()=>({head_block_time:now,last_irreversible_block:'1'}),
  getBlocks:async()=>[{block:{header:{timestamp:now}}}]
 };
 const client=new ChainClient(config,{provider,storage:memory,signerFor:owner=>({getAddress:()=>owner,signTransaction:async(tx,abis)=>{signed.push({tx:structuredClone(tx),abis});return {...tx,signatures:['offline-signature-placeholder']};}})});
 return {network,invoke,client,provider,memory,signed,submissions};
}

test('old buy-only transaction reproduces KOIN payment failure; ownership and funds roll back',async()=>{
 const {network,invoke}=await setup();
 const buy=await market.encodeOperation({name:'buy',args:args()});
 assert.throws(()=>network.transaction([buy],[alice]),/KOIN payment failed/);
 assert.equal((await invoke(market,'owner_of',{token_id:'0x31'})).value,collectionId);
 assert.equal((await invoke(koin,'balanceOf',{owner:alice})).value,'200000000000');
 assert.equal((await invoke(koin,'allowance',{owner:alice,spender:collectionId})).value,'0');
});
test('actual browser client signs one exact-price approval + purchase; primary and resale pay correct recipients with zero allowance left',async()=>{
 const {client,invoke,signed,submissions,memory}=await setup();
 await client.send(alice,'buy',args());
 assert.equal(signed.length,1);assert.equal(submissions.length,1);assert.equal(signed[0].tx.operations.length,2);
 const approval=await koin.decodeOperation(signed[0].tx.operations[0]);
 assert.equal(approval.name,'approve');assert.deepEqual(approval.args,{owner:alice,spender:collectionId,value:price});
 assert.ok(signed[0].abis[TESTNET_KOIN].methods.approve);
 assert.equal((await invoke(market,'owner_of',{token_id:'0x31'})).value,alice);
 assert.equal((await invoke(koin,'balanceOf',{owner:treasury})).value,price);
 assert.equal((await invoke(koin,'balanceOf',{owner:alice})).value,'150000000000');
 assert.equal((await invoke(koin,'allowance',{owner:alice,spender:collectionId})).value,'0');
 assert.equal(memory.getItem(key),null);
 await client.send(alice,'list_token',{seller:alice,token_id:'0x31',price:'60000000000',expires_at:String(BigInt(now)+86400000n)});
 assert.equal(signed[1].tx.operations.length,1);
 const listing=(await invoke(market,'get_listing',{token_id:'0x31'})).value;
 await client.send(bob,'buy',args(bob,alice,listing.price,listing.revision));
 assert.equal((await invoke(market,'owner_of',{token_id:'0x31'})).value,bob);
 assert.equal((await invoke(koin,'balanceOf',{owner:alice})).value,'210000000000');
 assert.equal((await invoke(koin,'balanceOf',{owner:bob})).value,'140000000000');
 assert.equal((await invoke(koin,'allowance',{owner:bob,spender:collectionId})).value,'0');
});
test('stale price rejects entire batch, rolls back approval, clears definite rejection without retries',async()=>{
 const {client,invoke,memory,submissions}=await setup();
 await assert.rejects(client.send(alice,'buy',{...args(),expected_price:'1'}),/transaction was rejected.*listing changed/);
 assert.equal(submissions.length,1);assert.equal(memory.getItem(key),null);
 assert.equal((await invoke(market,'owner_of',{token_id:'0x31'})).value,collectionId);
 assert.equal((await invoke(koin,'balanceOf',{owner:alice})).value,'200000000000');
 assert.equal((await invoke(koin,'allowance',{owner:alice,spender:collectionId})).value,'0');
});
test('network timeout keeps pending lock; changing signed payment is blocked before broadcast',async()=>{
 const {client,provider,memory,submissions}=await setup();let sends=0;
 provider.sendTransaction=async()=>{sends++;throw Error('Failed to fetch');};
 await assert.rejects(client.send(alice,'buy',args()),/Submission status is uncertain/);
 assert.equal(sends,1);assert.ok(memory.getItem(key));
 await assert.rejects(client.send(alice,'buy',args()),/earlier transaction needs confirmation/);
 assert.equal(sends,1);
 memory.removeItem(key);
 client.signerFor=owner=>({getAddress:()=>owner,signTransaction:async tx=>({...tx,operations:tx.operations.slice(1),signatures:['signature']})});
 await assert.rejects(client.send(alice,'buy',args()),/differs from the requested action/);
 assert.equal(sends,1);assert.equal(submissions.length,0);assert.equal(memory.getItem(key),null);
});
test('a KOIN balance failure after approval rolls back the allowance and NFT move together',async()=>{
 const {client,invoke,memory}=await setup();
 await invoke(koin,'transfer',{from:alice,to:bob,value:'200000000000'},[alice]);
 await assert.rejects(client.send(alice,'buy',args()),/transaction was rejected.*KOIN payment failed/);
 assert.equal(memory.getItem(key),null);
 assert.equal((await invoke(koin,'balanceOf',{owner:alice})).value,'0');
 assert.equal((await invoke(market,'owner_of',{token_id:'0x31'})).value,collectionId);
 assert.equal((await invoke(koin,'allowance',{owner:alice,spender:collectionId})).value,'0');
});
test('legacy pending purchase clears only after chain time passes quote; index absence alone never clears it',async()=>{
 const {client,provider,memory}=await setup();
 const pending={id:'old-id',method:'buy',account:alice,createdAt:new Date(Number(now)).toISOString()};
 memory.setItem(key,JSON.stringify(pending));
 await assert.rejects(client.checkPending(pending),/not confirmed yet/);assert.ok(memory.getItem(key));
 provider.getHeadInfo=async()=>({head_block_time:String(BigInt(now)+600000n),last_irreversible_block:'1'});
 await assert.rejects(client.checkPending(pending),/not confirmed yet/);assert.ok(memory.getItem(key));
 provider.getBlocks=async()=>[{block:{header:{timestamp:String(BigInt(now)+600000n)}}}];
 assert.match(await client.checkPending(pending),/expired/);assert.equal(memory.getItem(key),null);
 const other={...pending,method:'transfer'};memory.setItem(key,JSON.stringify(other));
 await assert.rejects(client.checkPending(other),/not confirmed yet/);assert.ok(memory.getItem(key));
});
test('explicit execution rejection is distinct from RPC or transport uncertainty',()=>{
 const reported=Error('{"error":"KOIN payment failed","code":1,"logs":["account \'from\' has not authorized transfer","transaction reverted: KOIN payment failed"]}');
 assert.match(executionRejection(reported),/KOIN payment failed/);
 for(const e of [Error('timeout'),Error('{"code":1,"error":"unavailable"}'),Error('{"code":-32603,"logs":["transaction reverted: proxy error"]}')])assert.equal(executionRejection(e),null);
});

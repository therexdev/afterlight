// Offline RPC boundary for launch-cli.test.mjs. Real SDK operations and signatures
// remain in use; an unhandled RPC call fails instead of reaching any network.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {Provider,Contract,Signer,Transaction,utils} from 'koilib';
import {sha256} from '../../scripts/launch-lib.mjs';
import {TESTNET_KOIN,TESTNET_NAME_SERVICE} from '../../scripts/chain-compat.mjs';
import {bytecodeNetwork} from './bytecode-network.mjs';

const json=path=>JSON.parse(readFileSync(path));
const cfg=json('dist/network-config.json');
const payer=json('collection/launch-state.json').fundingAddress;
const statePath='rpc-fixture.json';
const state=existsSync(statePath)?json(statePath):{transactions:[],simulations:[],deployments:{}};
const save=()=>writeFileSync(statePath,JSON.stringify(state));
const contracts=Object.fromEntries([
  [cfg.archiveId,'archive'],[cfg.collectionId,'afterlight']
].map(([id,name])=>[id,new Contract({id,abi:json('contracts/build/'+name+'.abi')})]));
const decode=async op=>{
  const contract=contracts[op.contract_id];assert.ok(contract,'unexpected contract');
  const [name,method]=Object.entries(contract.abi.methods).find(([,m])=>m.entry_point===op.entry_point)||[];
  assert.ok(method,'unexpected entry point');
  return {contract,name,method,args:await contract.serializer.deserialize(op.args,method.argument)};
};
Provider.prototype.call=async function(method){
  if(method==='contract_meta_store.get_contract_meta')return {};
  throw Error('Unexpected fixture RPC: '+method);
};
Provider.prototype.getChainId=async()=>cfg.chainId;
Provider.prototype.getAccountRc=async account=>{assert.equal(account,payer);return '1000000000000';};
Provider.prototype.getNonce=async account=>account===payer?String(state.transactions.length):'0';
Provider.prototype.invokeGetContractAddress=async()=>{throw Error('unknown method');};
Provider.prototype.invokeGetContractMetadata=async()=>{throw Error('unknown method');};
Provider.prototype.readContract=async op=>{
  if(op.contract_id===TESTNET_NAME_SERVICE){
    // get_address_result -> address_record -> 25-byte address.
    return {result:utils.encodeBase64url(Uint8Array.from([10,27,10,25,...utils.decodeBase58(TESTNET_KOIN)]))};
  }
  const {contract,name,method,args}=await decode(op);
  let result;
  if(name==='get_contract_info'){
    const uploaded=state.deployments[args.account];
    result=uploaded?{exists:true,code_hash:'0x1220'+sha256(utils.decodeBase64url(uploaded.bytecode)),
      authorizes_upload_contract:!!uploaded.authorizes_upload_contract}:{};
  }else if(name==='get_config')result=state.settings?{value:state.settings}:{};
  else if(name==='total_supply')result={value:'0'};
  else if(name==='get_artifact')throw Error('TEST_BOUNDARY: both deployments and initialization confirmed');
  else throw Error('Unexpected fixture read: '+name);
  return {result:utils.encodeBase64url(await contract.serializer.serialize(result,method.return))};
};
Provider.prototype.sendTransaction=async (transaction,broadcast)=>{
  const tx=structuredClone(transaction);
  assert.equal(tx.header.chain_id,cfg.chainId);assert.equal(tx.header.payer,payer);
  assert.equal(tx.id,Transaction.computeTransactionId(tx.header));
  assert.equal(tx.operations.length,1);
  const op=tx.operations[0];const owner=op.upload_contract?.contract_id||op.call_contract?.contract_id;
  assert.deepEqual((await Signer.recoverAddresses(tx)).sort(),[payer,owner].sort());
  // Validate initialization using the shipped WASM, not a mocked acceptance.
  if(op.call_contract)bytecodeNetwork(cfg.archiveId,cfg.collectionId).call(op.call_contract);
  const receipt={id:tx.id,rc_used:'1000000',reverted:false};
  if(!broadcast){state.simulations.push(tx);save();return {receipt};}
  const simulation=state.simulations.at(-1);
  assert.deepEqual(tx.operations,simulation.operations);assert.equal(tx.header.nonce,simulation.header.nonce);
  assert.notEqual(tx.id,simulation.id);assert.equal(tx.header.rc_limit,'1210000');
  if(op.upload_contract){
    assert.equal(state.deployments[owner],undefined,'must not redeploy on resume');
    const name=owner===cfg.archiveId?'archive':'afterlight';
    assert.equal(sha256(utils.decodeBase64url(op.upload_contract.bytecode)),sha256(readFileSync('contracts/build/'+name+'.wasm')));
    assert.equal(!!op.upload_contract.authorizes_upload_contract,owner===cfg.archiveId);
    state.deployments[owner]=op.upload_contract;
  }else{
    const {name,args}=await decode(op.call_contract);assert.equal(name,'initialize');
    assert.equal(args.archive,cfg.archiveId);assert.equal(args.treasury,cfg.treasury);assert.equal(args.payment_token,TESTNET_KOIN);
    state.settings={...args,launched:false,paused:false};
  }
  const blockNumber=state.transactions.length+1;
  state.transactions.push({tx,receipt,blockNumber,blockId:'0x1220'+blockNumber.toString(16).padStart(64,'0')});save();
  return {receipt};
};
Provider.prototype.wait=async id=>{
  const found=state.transactions.find(item=>item.tx.id===id);assert.ok(found,'unconfirmed transaction');
  return {blockId:found.blockId,blockNumber:found.blockNumber};
};
Provider.prototype.getBlocksById=async ids=>({block_items:ids.map(id=>{
  const found=state.transactions.find(item=>item.blockId===id);assert.ok(found);
  return {block:{transactions:[found.tx]},receipt:{transaction_receipts:[found.receipt]}};
})});

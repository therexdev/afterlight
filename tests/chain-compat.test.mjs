import test from 'node:test';
import assert from 'node:assert/strict';
import {Serializer,utils} from 'koilib';
import {resolveNativeKoin,deploymentMetadata,TESTNET_KOIN,TESTNET_NAME_SERVICE} from '../scripts/chain-compat.mjs';
import {TESTNET,MAINNET} from '../scripts/launch-lib.mjs';
const unsupported=async()=>{throw Error('Unable to translate request "unknown method"');};
test('legacy testnet resolves the native token from the name service',async()=>{
  const raw=Uint8Array.from([10,27,10,25,...utils.decodeBase58(TESTNET_KOIN)]);
  const provider={invokeGetContractAddress:unsupported,readContract:async(op)=>{assert.equal(op.contract_id,TESTNET_NAME_SERVICE);return {result:utils.encodeBase64url(raw)};}};
  assert.equal(await resolveNativeKoin(provider,TESTNET),TESTNET_KOIN);
});
test('legacy compatibility never hides mainnet errors or transport errors',async()=>{
  await assert.rejects(resolveNativeKoin({invokeGetContractAddress:unsupported},MAINNET),/unknown method/);
  await assert.rejects(resolveNativeKoin({invokeGetContractAddress:async()=>{throw Error('network timeout');}},TESTNET),/network timeout/);
});
test('legacy deployment verification reads current hashes and flags through the archive',async()=>{
  const provider={invokeGetContractMetadata:unsupported};
  const archive={functions:{get_contract_info:async({account})=>{assert.equal(account,TESTNET_KOIN);return {result:{exists:true,code_hash:'0x1220ab',authorizes_upload_contract:true}};}}};
  const result=await deploymentMetadata(provider,TESTNET,TESTNET_KOIN,archive,true);
  assert.equal(result.hash,'0x1220ab');assert.equal(result.authorizes_upload_contract,true);
});
test('the first legacy archive deployment rejects occupied and previously used addresses',async()=>{
  const provider={invokeGetContractMetadata:unsupported,call:async()=>({meta:{abi:''}}),getNonce:async()=>0};
  await assert.rejects(deploymentMetadata(provider,TESTNET,TESTNET_KOIN,null,false),/occupied/);
  provider.call=async()=>({});provider.getNonce=async()=>1;
  await assert.rejects(deploymentMetadata(provider,TESTNET,TESTNET_KOIN,null,false),/transaction history/);
  provider.getNonce=async()=>0;
  assert.equal(await deploymentMetadata(provider,TESTNET,TESTNET_KOIN,null,false),undefined);
});

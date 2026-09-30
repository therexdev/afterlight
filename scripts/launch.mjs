import {Signer,Contract,Transaction,utils} from 'koilib';
import {randomBytes} from 'node:crypto';
import {readFileSync,writeFileSync,existsSync,mkdirSync,unlinkSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {makeProvider} from './provider.mjs';
import {resolveNativeKoin,deploymentMetadata,TESTNET_KOIN} from './chain-compat.mjs';
import {MAINNET,TESTNET,sha256,atomicJSON,assertNetwork,loadArtifacts,compareArtifact,declaration,quoteLimit,readJournal} from './launch-lib.mjs';
const command=process.argv[2]||'plan';
const arg=name=>{const i=process.argv.indexOf('--'+name);return i<0?null:process.argv[i+1];};
const has=name=>process.argv.includes('--'+name);
const configPath='dist/network-config.json',walletPath='.secrets/launch-wallets.json',journalPath='collection/launch-state.json',pendingPath='.secrets/pending-launch.json';
const json=path=>JSON.parse(readFileSync(path));
const run=path=>{const r=spawnSync(process.execPath,[path],{stdio:'inherit'});if(r.status!==0)throw Error('Launch preparation failed: '+path);};
function validateAddress(value){if(!value||!utils.isChecksumAddress(value))throw Error('Invalid Koinos address.');return value;}
if(command==='prepare'){
 if(existsSync(walletPath))throw Error('Launch wallets already exist. Back them up and continue; they were not overwritten.');
 const network=arg('network');if(!['mainnet','testnet'].includes(network))throw Error('Choose --network mainnet or --network testnet.');
 const main=network==='mainnet';
 const funding=process.env.AFTERLIGHT_FUNDING_WIF?Signer.fromWif(process.env.AFTERLIGHT_FUNDING_WIF):new Signer({privateKey:randomBytes(32)});
 if(arg('funding-address')&&funding.address!==validateAddress(arg('funding-address')))throw Error('The imported key does not match the requested funded wallet. No launch files were created.');
 const archive=new Signer({privateKey:randomBytes(32)}),collection=new Signer({privateKey:randomBytes(32)});
 const treasury=validateAddress(arg('treasury')||funding.address);
 mkdirSync('.secrets',{recursive:true,mode:0o700});
 const secrets={network,chainId:main?MAINNET:TESTNET,funding:{address:funding.address,wif:funding.getPrivateKey('wif')},archive:{address:archive.address,wif:archive.getPrivateKey('wif')},collection:{address:collection.address,wif:collection.getPrivateKey('wif')}};
 writeFileSync(walletPath,JSON.stringify(secrets,null,2)+'\n',{flag:'wx',mode:0o600});
 const cfg={...json(configPath),networkLabel:main?'Koinos mainnet':'Koinos Foundation Testnet',currencySymbol:main?'KOIN':'tKOIN',chainId:secrets.chainId,rpcUrls:[arg('rpc')||(main?'https://api.koinos.io':'https://testnet.koinosfoundation.org/jsonrpc')],paymentToken:main?'19GYjDBVXU7keLbYvMLazsGQn3GTWHjHkK':TESTNET_KOIN,archiveId:archive.address,collectionId:collection.address,treasury,enabled:false};
 // The native KOIN address is resolved and verified by upload, before initialize is constructed.
 atomicJSON(configPath,cfg);atomicJSON(journalPath,{status:'prepared',chainId:cfg.chainId,archiveId:cfg.archiveId,collectionId:cfg.collectionId,fundingAddress:funding.address,transactions:[]});
 run('scripts/prepare-collection.mjs');run('scripts/build-utilities.mjs');
 console.log(JSON.stringify({network:cfg.networkLabel,fundThisWallet:funding.address,treasury,archive:archive.address,collection:collection.address,keyBackup:walletPath,next:'Back up the key file offline. Fund only the payer address. Run launch:plan, then launch:upload.'},null,2));
 process.exit(0);
}
const cfg=json(configPath);
if(command==='plan'){
 const artifacts=loadArtifacts();
 const plan={network:cfg.networkLabel,contractsPrepared:!!cfg.archiveId&&!!cfg.collectionId,artworks:100,archivedViewer:true,imageBytes:artifacts.filter(a=>a.id<=100).reduce((n,a)=>n+a.bytes,0),totalArchiveBytes:artifacts.reduce((n,a)=>n+a.bytes,0),uploadChunks:artifacts.reduce((n,a)=>n+Math.ceil(a.bytes/16384),0),initialPriceKoin:500,totalInitialListingsKoin:50000,archiveUpgradeable:false,collectionUpgradeable:true,mainnetBroadcast:false,next:cfg.archiveId?'Fund the payer printed by prepare:wallet. Upload remains a separate command.':'Run npm run prepare:wallet -- --network '+(cfg.chainId===MAINNET?'mainnet':'testnet')+', then back up the generated local wallet file.'};
 atomicJSON('collection/launch-plan.json',plan);console.log(JSON.stringify(plan,null,2));process.exit(0);
}
if(!['upload','verify','open'].includes(command))throw Error('Unknown launch command.');
if(!cfg.archiveId||!cfg.collectionId)throw Error('Run prepare:wallet first.');
if(command!=='verify'&&cfg.chainId===MAINNET&&!has('confirm-mainnet'))throw Error('Mainnet writes require --confirm-mainnet. The collection has not been launched.');
if(command==='open'&&!has('open-sales'))throw Error('Opening paid sales requires --open-sales in addition to any network confirmation.');
const p=makeProvider(process.env.AFTERLIGHT_RPC||cfg.rpcUrls[0]);assertNetwork(cfg,await p.getChainId());
const archiveAbi=json('contracts/build/archive.abi'),marketAbi=json('contracts/build/afterlight.abi');
const archive=new Contract({id:cfg.archiveId,abi:archiveAbi,provider:p,bytecode:new Uint8Array(readFileSync('contracts/build/archive.wasm'))});
const market=new Contract({id:cfg.collectionId,abi:marketAbi,provider:p,bytecode:new Uint8Array(readFileSync('contracts/build/afterlight.wasm'))});
const journal=readJournal(journalPath);
if(journal.chainId!==cfg.chainId||journal.archiveId!==cfg.archiveId||journal.collectionId!==cfg.collectionId)throw Error('Launch journal does not match the configured contracts.');
async function read(contract,method,args={}){return (await contract.functions[method](args)).result||{};}
async function confirm(id){
 const inclusion=await p.wait(id,'byTransactionId',60000);
 const blocks=await p.getBlocksById([inclusion.blockId],{returnBlock:true,returnReceipt:true});
 const item=blocks.block_items?.[0],receipt=item?.receipt?.transaction_receipts?.find(r=>r.id===id);
 if(!receipt||receipt.reverted)throw Error('Transaction is unconfirmed or reverted: '+id);
 return {block:inclusion.blockNumber,blockId:inclusion.blockId,receipt,transaction:item.block?.transactions?.find(t=>t.id===id)};
}
function record(label,id,confirmed){if(!journal.transactions.some(t=>t.id===id))journal.transactions.push({label,id,block:confirmed.block,blockId:confirmed.blockId,rcUsed:confirmed.receipt.rc_used});atomicJSON(journalPath,journal);}
let signers;
if(command!=='verify'){
 const keys=json(walletPath);if(keys.chainId!==cfg.chainId)throw Error('Wallet backup belongs to another network.');
 signers=Object.fromEntries(['funding','archive','collection'].map(role=>{const signer=Signer.fromWif(keys[role].wif);signer.provider=p;if(signer.address!==keys[role].address)throw Error('Wallet address mismatch.');return [role,signer];}));
 if(signers.archive.address!==cfg.archiveId||signers.collection.address!==cfg.collectionId||signers.funding.address!==journal.fundingAddress)throw Error('Signing keys do not match this launch.');
 if(existsSync(pendingPath)){
  const pending=json(pendingPath);if(pending.chainId!==cfg.chainId)throw Error('Pending transaction is for another network.');
  const done=await confirm(pending.transaction.id);record(pending.label,pending.transaction.id,done);unlinkSync(pendingPath);
 }
}
async function send(role,label,operations){
 const available=await p.getAccountRc(signers.funding.address);
 if(BigInt(available)<=100000n)throw Error('Fund '+signers.funding.address+' on '+cfg.networkLabel+' before continuing.');
 const tx=new Transaction({provider:p,signer:signers.funding,options:{chainId:cfg.chainId,rcLimit:available,payer:signers.funding.address}});
 for(const op of [].concat(operations))await tx.pushOperation(op);await tx.prepare();
 async function sign(){tx.transaction=await signers.funding.signTransaction(tx.transaction);if(role!=='funding')tx.transaction=await signers[role].signTransaction(tx.transaction);}
 await sign();const simulation=await p.sendTransaction(tx.transaction,false);
 if(simulation.receipt?.reverted)throw Error('Simulation rejected '+label+': '+(simulation.receipt.logs||[]).join(' '));
 tx.adjustRcLimit(quoteLimit(simulation.receipt?.rc_used,available));await sign();
 atomicJSON(pendingPath,{chainId:cfg.chainId,label,transaction:tx.transaction},0o600);
 console.log(label+' — estimated '+Number(simulation.receipt.rc_used)/1e8+' Mana; '+tx.transaction.id);
 const response=await p.sendTransaction(tx.transaction,true);
 if(response.receipt?.reverted)throw Error('Submitted transaction reverted. Inspect '+tx.transaction.id+'; pending record retained.');
 const done=await confirm(tx.transaction.id);record(label,tx.transaction.id,done);unlinkSync(pendingPath);return done;
}
async function write(contract,role,name,args={},label=name){return send(role,label,(await contract.functions[name](args,{onlyOperation:true})).operation);}
async function verifyUpload(role,contract,abi,immutable){
 const label='Deploy '+role;const prior=journal.transactions.find(t=>t.label===label);
 const bytes=readFileSync('contracts/build/'+(role==='archive'?'archive':'afterlight')+'.wasm');
 const current=await deploymentMetadata(p,cfg.chainId,contract.getId(),archive,journal.transactions.some(t=>t.label==='Deploy archive'));
 if(prior){
  if(!current || current.hash?.replace(/^0x/,'')!=='1220'+sha256(bytes) || !!current.authorizes_upload_contract!==immutable || current.authorizes_call_contract || current.authorizes_transaction_application)throw Error('Current contract code or authority flags differ from the launch build.');
  const done=await confirm(prior.id);const op=done.transaction?.operations?.find(o=>o.upload_contract?.contract_id===contract.getId())?.upload_contract;
  if(!op||sha256(utils.decodeBase64url(op.bytecode))!==sha256(bytes)||!!op.authorizes_upload_contract!==immutable||op.authorizes_call_contract||op.authorizes_transaction_application)throw Error('The confirmed deployment differs from this launch build.');
  return;
 }
 // Never overwrite an occupied contract address. A read failure is not treated as proof of absence.
 if(current?.hash)throw Error('Contract address is already occupied and has no matching launch receipt.');
 const {operation}=await contract.deploy({abi:JSON.stringify(abi),authorizesUploadContract:immutable,authorizesCallContract:false,authorizesTransactionApplication:false,onlyOperation:true});
 await send(role,label,operation);
}
async function readback(art){
 const record=(await read(archive,'get_artifact',{artifact_id:art.id})).value;compareArtifact(record,art);if(!record?.finalized)throw Error('Artifact is not finalized: '+art.name);
 const parts=[];for(let index=0;index<record.chunks;index++){const value=(await read(archive,'get_chunk',{artifact_id:art.id,index})).value;const bytes=utils.decodeBase64url(value);if(bytes.length!==Math.min(16384,art.bytes-index*16384))throw Error('Invalid chunk size.');parts.push(Buffer.from(bytes));}
 if(sha256(Buffer.concat(parts))!==art.sha256)throw Error('On-chain fingerprint mismatch: '+art.name);
 return {id:art.id,sha256:art.sha256,bytes:art.bytes,verified:true};
}
if(command==='upload'){
 const payment=await resolveNativeKoin(p,cfg.chainId);
 validateAddress(payment);if(cfg.chainId===MAINNET&&payment!=='19GYjDBVXU7keLbYvMLazsGQn3GTWHjHkK')throw Error('Unexpected mainnet KOIN contract.');
 if(cfg.paymentToken!==payment){cfg.paymentToken=payment;atomicJSON(configPath,cfg);run('scripts/prepare-collection.mjs');run('scripts/build-utilities.mjs');}
 const artifacts=loadArtifacts();
 await verifyUpload('archive',archive,archiveAbi,true);await verifyUpload('collection',market,marketAbi,false);
 let settings=(await read(market,'get_config')).value;
 if(!settings){await write(market,'collection','initialize',{archive:cfg.archiveId,treasury:cfg.treasury,payment_token:cfg.paymentToken,base_uri:arg('base-uri')||''});settings=(await read(market,'get_config')).value;}
 if(settings.archive!==cfg.archiveId||settings.treasury!==cfg.treasury||settings.payment_token!==cfg.paymentToken)throw Error('Collection settings do not match the prepared launch.');
 let minted=Number((await read(market,'total_supply')).value||0);
 for(const art of artifacts){
  const record=(await read(archive,'get_artifact',{artifact_id:art.id})).value;compareArtifact(record,art);
  if(!record){await write(archive,'archive','begin_artifact',declaration(art),'Declare '+art.id);}
  if(!record?.finalized){
   const bytes=readFileSync('dist/'+art.file);
   // Small bounded batches avoid filling a block with one large multi-operation upload.
   for(let index=record?.uploaded||0;index<Math.ceil(bytes.length/16384);){
    const ops=[];for(let n=0;n<3&&index<Math.ceil(bytes.length/16384);n++,index++)ops.push((await archive.functions.upload_chunk({artifact_id:art.id,index,data:utils.encodeBase64url(bytes.subarray(index*16384,(index+1)*16384))},{onlyOperation:true})).operation);
    await send('archive','Upload '+art.id+' through chunk '+index,ops);
   }
   await write(archive,'archive','finalize_artifact',{artifact_id:art.id},'Finalize '+art.id);
  }
  await readback(art);
  if(art.id<=100&&art.id>minted){await write(market,'collection','mint',{token_id:'0x'+Buffer.from(String(art.id)).toString('hex')},'Mint '+art.id);minted=art.id;}
  console.log('Verified artwork '+art.id+' / 101');
 }
 if(!(await read(archive,'get_status')).sealed)await write(archive,'archive','seal_archive',{},'Seal permanent archive');
 journal.status='uploaded';atomicJSON(journalPath,journal);
 console.log('Upload complete. Sales remain CLOSED. Run launch:verify, then the separate launch:open command when ready.');
}else{
 for(const role of ['archive','collection'])if(!journal.transactions.some(t=>t.label==='Deploy '+role))throw Error('Missing confirmed deployment receipt for '+role);
 await verifyUpload('archive',archive,archiveAbi,true);await verifyUpload('collection',market,marketAbi,false);
 const artifacts=loadArtifacts(),proof=[];
 for(const art of artifacts){proof.push(await readback(art));if(art.id<=100){const result=await read(market,'owner_of',{token_id:'0x'+Buffer.from(String(art.id)).toString('hex')});if(!result.value)throw Error('Missing minted token '+art.id);}}
 const archiveState=await read(archive,'get_status'),settings=(await read(market,'get_config')).value,supply=Number((await read(market,'total_supply')).value||0);
 if(!archiveState.sealed||archiveState.minted!==101||supply!==100||settings.archive!==cfg.archiveId||settings.payment_token!==cfg.paymentToken||settings.treasury!==cfg.treasury)throw Error('Collection is not fully prepared.');
 const head=await p.getHeadInfo(),lastBlock=Math.max(...journal.transactions.map(t=>Number(t.block)));
 const report={verifiedAt:new Date().toISOString(),chainId:cfg.chainId,archiveId:cfg.archiveId,collectionId:cfg.collectionId,artifacts:proof,supply,archiveSealed:true,allUploadsIrreversible:Number(head.last_irreversible_block)>=lastBlock,publicationMana:journal.transactions.reduce((n,t)=>n+BigInt(t.rcUsed||0),0n).toString()};
 atomicJSON('collection/chain-verification.json',report);
 if(command==='open'){
  if(!report.allUploadsIrreversible)throw Error('Wait until all upload transactions are irreversible, then run launch:open again.');
  if(!settings.launched)await write(market,'collection','open_sales',{},'Open initial sales');
  const live=(await read(market,'get_config')).value;if(!live.launched||live.paused)throw Error('Sales are not open.');
  cfg.enabled=true;atomicJSON(configPath,cfg);journal.status='live';atomicJSON(journalPath,journal);
  // Do not rebuild archived metadata or the standalone viewer after sealing.
  console.log('Sales are open on-chain. Publish the updated dist/network-config.json with the website.');
 }else console.log(JSON.stringify({verified:proof.length,supply,archiveSealed:true,allUploadsIrreversible:report.allUploadsIrreversible},null,2));
}

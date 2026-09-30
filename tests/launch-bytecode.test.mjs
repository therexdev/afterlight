import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Signer,Contract,utils} from 'koilib';
import {bytecodeNetwork} from './fixtures/bytecode-network.mjs';
import {loadArtifacts,declaration,compareArtifact,sha256,TESTNET} from '../scripts/launch-lib.mjs';
import {TESTNET_KOIN} from '../scripts/chain-compat.mjs';

test('shipped WASM accepts ABI-encoded initialization, all 101 archives, 100 mints, seal and open',async()=>{
  const archiveId=Signer.fromSeed('afterlight offline archive').address;
  const collectionId=Signer.fromSeed('afterlight offline collection').address;
  const treasury=Signer.fromSeed('afterlight offline treasury').address;
  const network=bytecodeNetwork(archiveId,collectionId);
  const archive=new Contract({id:archiveId,abi:JSON.parse(readFileSync('contracts/build/archive.abi'))});
  const market=new Contract({id:collectionId,abi:JSON.parse(readFileSync('contracts/build/afterlight.abi'))});
  const invoke=async(contract,name,args={})=>{
    const {call_contract}=await contract.encodeOperation({name,args});
    let bytes;
    try{bytes=network.call(call_contract);}catch(error){error.message=name+' '+JSON.stringify(args)+': '+error.message;throw error;}
    return contract.serializer.deserialize(bytes,contract.abi.methods[name].return);
  };
  const init={archive:archiveId,treasury,payment_token:TESTNET_KOIN,base_uri:''};
  await assert.rejects(invoke(market,'initialize',init),/invalid base URI/);
  init.base_uri='koinos://'+TESTNET+'/'+archiveId+'/artifacts';
  await invoke(market,'initialize',init);
  assert.equal((await invoke(market,'get_config')).value.base_uri,init.base_uri);
  for(const art of loadArtifacts()){
    await invoke(archive,'begin_artifact',declaration(art));
    const bytes=readFileSync('dist/'+art.file);
    for(let index=0;index<Math.ceil(bytes.length/16384);index++){
      await invoke(archive,'upload_chunk',{artifact_id:art.id,index,data:utils.encodeBase64url(bytes.subarray(index*16384,(index+1)*16384))});
    }
    await invoke(archive,'finalize_artifact',{artifact_id:art.id});
    const record=(await invoke(archive,'get_artifact',{artifact_id:art.id})).value;
    compareArtifact(record,art);assert.equal(record.finalized,true);
    const chunks=[];
    for(let index=0;index<record.chunks;index++)chunks.push(Buffer.from(utils.decodeBase64url((await invoke(archive,'get_chunk',{artifact_id:art.id,index})).value)));
    assert.equal(sha256(Buffer.concat(chunks)),art.sha256);
    if(art.id<=100){
      const token_id='0x'+Buffer.from(String(art.id)).toString('hex');
      await invoke(market,'mint',{token_id});
      assert.equal((await invoke(market,'owner_of',{token_id})).value,collectionId);
      const dataUri=(await invoke(market,'token_uri',{token_id})).value;
      assert.equal(Buffer.from(dataUri.split(',')[1],'base64').toString(),JSON.stringify(art.metadata));
    }
  }
  await invoke(archive,'seal_archive');
  assert.equal((await invoke(archive,'get_status')).sealed,true);
  assert.equal((await invoke(market,'total_supply')).value,'100');
  await invoke(market,'open_sales');
  assert.equal((await invoke(market,'get_config')).value.launched,true);
  assert.equal((await invoke(market,'get_listing',{token_id:'0x31'})).value.price,'50000000000');
});

// Execute the shipped WASM entry points with actual ABI-encoded arguments.
// MockVM supplies storage/authority; cross-contract reads execute the other WASM.
import {readFileSync} from 'node:fs';
import {utils} from 'koilib';
import {MockVM} from '@koinos/mock-vm';
import proto from '@koinos/proto-js';
import constants from '@koinos/mock-vm/src/constants.js';
const {koinos}=proto;
const {METADATA_SPACE,ENTRY_POINT_KEY,CONTRACT_ARGUMENTS_KEY,CONTRACT_ID_KEY,
  CONTRACT_RESULT_KEY,AUTHORITY_KEY,CALLER_KEY,HEAD_INFO_KEY,CONTRACT_METADATA_KEY}=constants;

export function bytecodeNetwork(archiveId,collectionId,options={}){
  const nodes=new Map([[archiveId,'archive'],[collectionId,'afterlight']].map(([id,name])=>[
    id,{vm:new MockVM(true),module:new WebAssembly.Module(readFileSync('contracts/build/'+name+'.wasm'))}
  ]));
  if(options.paymentId)nodes.set(options.paymentId,{vm:new MockVM(true),module:new WebAssembly.Module(readFileSync(options.paymentWasm))});
  let signatures=null;
  // These contracts use exact-key storage, not ordered DB iteration. A Map keeps
  // the full 13 MB rehearsal fast while retaining transactional snapshots and
  // owned bytes (MockVM's default DB keeps detachable views into WASM memory).
  for(const {vm} of nodes.values()){
    let data=new Map(),backup=new Map();
    const keyOf=(space,key)=>[!!space.system,space.id||0,utils.encodeBase64url(space.zone||new Uint8Array()),utils.encodeBase64url(key)].join(':');
    vm.db={
      putObject(space,key,value){const k=keyOf(space,key),old=data.get(k);data.set(k,Uint8Array.from(value));return value.length-(old?.length||0);},
      getObject(space,key){const value=data.get(keyOf(space,key));return value?{exists:true,value}:null;},
      removeObject(space,key){data.delete(keyOf(space,key));},
      commitTransaction(){backup=new Map(data);},
      rollbackTransaction(){data=new Map(backup);},
      snapshot(){return new Map(data);},
      restore(snapshot){data=new Map(snapshot);backup=new Map(snapshot);}
    };
  }
  function call(op,caller=null){
    const node=nodes.get(op.contract_id);if(!node)throw Error('Unknown WASM contract');
    const {vm,module}=node;
    const put=(key,value)=>vm.db.putObject(METADATA_SPACE,key,value);
    const address=utils.decodeBase58(op.contract_id);
    put(CONTRACT_ID_KEY,address);
    put(ENTRY_POINT_KEY,koinos.chain.value_type.encode({int32_value:op.entry_point|0}).finish());
    put(CONTRACT_ARGUMENTS_KEY,utils.decodeBase64url(op.args));
    put(CONTRACT_RESULT_KEY,new Uint8Array());
    put(AUTHORITY_KEY,koinos.chain.list_type.encode({values:(signatures||[op.contract_id]).map(id=>({
      int32_value:koinos.chain.authorization_type.contract_call,bytes_value:utils.decodeBase58(id),bool_value:true
    }))}).finish());
    put(CALLER_KEY,koinos.chain.caller_data.encode({caller:caller?utils.decodeBase58(caller):new Uint8Array(),caller_privilege:0}).finish());
    // Normal signing accounts have no authority override. The real KOIN code
    // must therefore use its allowance for a nested collection -> KOIN call.
    put(CONTRACT_METADATA_KEY,koinos.chain.contract_metadata_object.encode({}).finish());
    put(HEAD_INFO_KEY,koinos.chain.head_info.encode({head_block_time:options.now||'1800000000000'}).finish());
    vm.db.commitTransaction();
    const instance=new WebAssembly.Instance(module,{env:{invoke_system_call:(sid,rp,rl,ap,al,rb)=>{
      if(sid!==koinos.chain.system_call_id.call)return vm.invokeSystemCall(sid,rp,rl,ap,al,rb);
      const args=koinos.chain.call_arguments.decode(new Uint8Array(vm.memory.buffer,ap,al));
      let response,code=0;
      try {
        const bytes=call({contract_id:utils.encodeBase58(args.contract_id),entry_point:args.entry_point,args:utils.encodeBase64url(args.args)},op.contract_id);
        response=koinos.chain.call_result.encode({value:bytes}).finish();
      }catch(error){
        if(!Number.isInteger(error.code)||error.code===0)throw error;
        code=error.code;response=koinos.chain.error_data.encode({message:error.message}).finish();
      }
      if(response.length>rl)throw Error('WASM cross-call result exceeds system buffer');
      new Uint8Array(vm.memory.buffer,rp,rl).set(response);
      new Uint32Array(vm.memory.buffer,rb,1)[0]=response.length;
      return code;
    }}});
    vm.setInstance(instance);
    try{instance.exports._start();}
    catch(error){if(error.code!==0)throw error;}
    return Uint8Array.from(vm.db.getObject(METADATA_SPACE,CONTRACT_RESULT_KEY)?.value||[]);
  }
  function transaction(operations,signers){
    const snapshots=new Map([...nodes].map(([id,{vm}])=>[id,vm.db.snapshot()]));
    signatures=signers;
    try{return operations.map(op=>call(op.call_contract));}
    catch(error){for(const [id,snapshot]of snapshots)nodes.get(id).vm.db.restore(snapshot);throw error;}
    finally{signatures=null;}
  }
  function seed(id,space,key,value){nodes.get(id).vm.db.putObject({zone:utils.decodeBase58(id),id:space},key,value);}
  return {call,transaction,seed};
}

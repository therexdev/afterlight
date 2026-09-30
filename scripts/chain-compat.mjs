import {Contract} from 'koilib';
import {createHash} from 'node:crypto';
import {TESTNET} from './launch-lib.mjs';

export const TESTNET_KOIN='1FaSvLjQJsCJKq5ybmGsMMQs8RQYyVv8ju';
export const TESTNET_NAME_SERVICE='13NQnca5chwpKm4ebHbvgvJmXrsSCTayDJ';
export const unsupportedSystemCall=error=>/unknown method|method not found/i.test(error?.message||'');
const registryAbi={
  methods:{get_address:{argument:'args',return:'res',entry_point:parseInt(createHash('sha256').update('get_address').digest('hex').slice(0,8),16),read_only:true}},
  types:{nested:{
    args:{fields:{name:{type:'string',id:1}}},
    res:{fields:{value:{type:'record',id:1}}},
    record:{fields:{address:{type:'bytes',id:1,options:{'(koinos.btype)':'ADDRESS'}}}}
  }}
};
export async function resolveNativeKoin(provider,chainId){
  try{return (await provider.invokeGetContractAddress('koin'))?.value?.address;}
  catch(error){
    if(chainId!==TESTNET||!unsupportedSystemCall(error))throw error;
    const registry=new Contract({id:TESTNET_NAME_SERVICE,abi:registryAbi,provider});
    const {result}=await registry.functions.get_address({name:'koin'});
    if(result?.value?.address!==TESTNET_KOIN)throw Error('Unexpected testnet KOIN registry address. Review the network configuration.');
    return result.value.address;
  }
}
export async function deploymentMetadata(provider,chainId,account,archive,archiveDeployed){
  try{return (await provider.invokeGetContractMetadata(account))?.value;}
  catch(error){
    if(chainId!==TESTNET||!unsupportedSystemCall(error))throw error;
    if(archiveDeployed){
      const {result}=await archive.functions.get_contract_info({account});
      if(!result)throw Error('The archive could not inspect deployed contract metadata.');
      return result.exists?{hash:result.code_hash,authorizes_upload_contract:result.authorizes_upload_contract,authorizes_call_contract:result.authorizes_call_contract,authorizes_transaction_application:result.authorizes_transaction_application}:undefined;
    }
    // Only the very first archive upload reaches this branch. Never replace an existing or used account.
    const [{meta},nonce]=await Promise.all([provider.call('contract_meta_store.get_contract_meta',{contract_id:account}),provider.getNonce(account)]);
    if(meta||String(nonce)!=='0')throw Error('The new archive address is already occupied or has transaction history.');
    return undefined;
  }
}

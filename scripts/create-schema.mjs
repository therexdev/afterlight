import {writeFileSync} from 'node:fs';
const R=true,W=false;
export const archiveMethods={
 get_status:[[],[['uint32','minted',1],['bool','sealed',2],['uint32','supply_cap',3],['uint32','chunk_bytes',4],['uint32','max_artifact_bytes',5]],R],
 get_artifact:[[['uint32','artifact_id',1]],[['artifact','value',1]],R],
 get_chunk:[[['uint32','artifact_id',1],['uint32','index',2]],[['bytes','value',1]],R],
 begin_artifact:[[['uint32','artifact_id',1],['string','name',2],['string','mime',3],['uint32','byte_length',4],['bytes','sha256',5],['string','metadata',6]],[],W],
 upload_chunk:[[['uint32','artifact_id',1],['uint32','index',2],['bytes','data',3]],[],W],
 finalize_artifact:[[['uint32','artifact_id',1]],[],W],
 seal_archive:[[],[],W]
};
export const collectionMethods={
 name:[[],[['string','value',1]],R],symbol:[[],[['string','value',1]],R],uri:[[],[['string','value',1]],R],
 token_uri:[[['bytes','token_id',1]],[['string','value',1]],R],owner:[[],[['bytes','value',1]],R],
 total_supply:[[],[['uint64','value',1]],R],balance_of:[[['bytes','owner',1]],[['uint64','value',1]],R],
 owner_of:[[['bytes','token_id',1]],[['bytes','value',1]],R],get_approved:[[['bytes','token_id',1]],[['bytes','value',1]],R],
 is_approved_for_all:[[['bytes','owner',1],['bytes','operator',2]],[['bool','value',1]],R],
 royalties:[[],[['repeated royalty','value',1]],R],
 get_config:[[],[['configuration','value',1]],R],
 get_metadata:[[['bytes','token_id',1]],[['string','value',1]],R],
 get_listing:[[['bytes','token_id',1]],[['listing','value',1]],R],
 get_tokens:[[['uint32','start',1],['uint32','limit',2]],[['repeated token_view','values',1]],R],
 initialize:[[['bytes','archive',1],['bytes','treasury',2],['bytes','payment_token',3],['string','base_uri',4]],[],W],
 mint:[[['bytes','token_id',1]],[],W],
 open_sales:[[],[],W],set_paused:[[['bool','paused',1]],[],W],
 transfer:[[['bytes','from',1],['bytes','to',2],['bytes','token_id',3]],[],W],
 approve:[[['bytes','approver_address',1],['bytes','to',2],['bytes','token_id',3]],[],W],
 set_approval_for_all:[[['bytes','approver_address',1],['bytes','operator_address',2],['bool','approved',3]],[],W],
 list_token:[[['bytes','seller',1],['bytes','token_id',2],['uint64','price',3],['uint64','expires_at',4]],[],W],
 cancel_listing:[[['bytes','seller',1],['bytes','token_id',2]],[],W],
 buy:[[['bytes','buyer',1],['bytes','token_id',2],['bytes','expected_seller',3],['uint64','expected_price',4],['uint64','expected_revision',5],['uint64','deadline',6]],[],W]
};
export const methods={...archiveMethods,...collectionMethods};
export function generateSchema(){
let s='syntax = "proto3";\npackage afterlight;\nimport "koinos/options.proto";\n';
s+=
'message royalty { uint64 percentage=1; bytes address=2; }\n'+
'message artifact { uint32 artifact_id=1; string name=2; string mime=3; uint32 byte_length=4; bytes sha256=5; string metadata=6; uint32 chunks=7; uint32 uploaded=8; bool finalized=9; }\n'+
'message token_record { bytes owner=1; bytes approved=2; uint64 revision=3; }\n'+
'message number_record { uint64 value=1; }\nmessage bool_record { bool value=1; }\nmessage chunk_record { bytes value=1; }\n'+
'message operator_list { repeated bytes values=1; }\n'+
'message configuration { bytes archive=1; bytes treasury=2; bytes payment_token=3; string base_uri=4; bool launched=5; bool paused=6; }\n'+
'message listing { bytes seller=1; uint64 price=2; uint64 revision=3; uint64 expires_at=4; bool primary=5; bool active=6; }\n'+
'message token_view { bytes token_id=1; bytes owner=2; listing sale=3; }\n'+
'message mint_event { bytes to=1; bytes token_id=2; }\n'+
'message transfer_event { bytes from=1; bytes to=2; bytes token_id=3; }\n'+
'message token_approval_event { bytes approver_address=1; bytes to=2; bytes token_id=3; }\n'+
'message operator_approval_event { bytes approver_address=1; bytes operator_address=2; bool approved=3; }\n'+
'message sale_event { bytes token_id=1; bytes seller=2; bytes buyer=3; uint64 price=4; bool primary=5; uint64 revision=6; }\n'+
'message listing_event { bytes token_id=1; listing sale=2; }\n';
const fields=fs=>fs.map(([t,n,i])=>'  '+t+' '+n+' = '+i+';').join('\n');
for(const[n,[a,r,ro]]of Object.entries(methods))s+='\n// @read-only '+ro+'\nmessage '+n+'_arguments {\n'+fields(a)+'\n}\nmessage '+n+'_result {\n'+fields(r)+'\n}\n';
s=s.replace(/bytes (to|from|owner|approved|operator|approver_address|operator_address|account|address|archive|treasury|payment_token|seller|buyer|expected_seller)\s*=\s*(\d+);/g,'bytes $1 = $2 [(koinos.btype) = ADDRESS];')
.replace(/bytes token_id\s*=\s*(\d+);/g,'bytes token_id = $1 [(koinos.btype) = HEX];')
.replace(/bytes sha256\s*=\s*(\d+);/g,'bytes sha256 = $1 [(koinos.btype) = HEX];');
for(const n of ['owner','owner_of','get_approved'])s=s.replace('message '+n+'_result {\n  bytes value = 1;','message '+n+'_result {\n  bytes value = 1 [(koinos.btype) = ADDRESS];');
writeFileSync('contracts/assembly/proto/afterlight.proto',s);
}

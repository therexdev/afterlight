import {readFileSync,writeFileSync,renameSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const MAINNET='EiBZK_GGVP0H_fXVAM3j6EAuz3-B-l3ejxRSewi7qIBfSA==';
export const TESTNET='EiAIKVvm6-V2qmsmUvPJy09vCCLbtn9lHFpwrJbcTIEWRQ==';
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export function atomicJSON(path,value,mode=0o644){writeFileSync(path+'.tmp',JSON.stringify(value,null,2)+'\n',{mode});renameSync(path+'.tmp',path);}
export function assertNetwork(config,chainId){if(![MAINNET,TESTNET].includes(chainId)||config.chainId!==chainId)throw Error('Endpoint chain ID does not match the prepared launch.');}
export function loadArtifacts(){
 const manifest=JSON.parse(readFileSync('collection/manifest.json'));
 if(manifest.items.length!==100||new Set(manifest.items.map(x=>x.id)).size!==100)throw Error('Prepare all 100 artworks before deployment.');
 const result=manifest.items.map(work=>({id:work.id,name:work.name,file:work.file,mime:'image/webp',bytes:work.bytes,sha256:work.sha256,metadata:work.metadata}));
 const viewer=readFileSync('dist/recovery.html');
 result.push({id:101,name:'AFTERLIGHT independent reader',file:'recovery.html',mime:'text/html',bytes:viewer.length,sha256:sha256(viewer),metadata:{name:'AFTERLIGHT independent reader',description:'Self-contained reader for the 100 artwork records. No website or IPFS dependency.',mime_type:'text/html'}});
 for(const art of result){const bytes=readFileSync('dist/'+art.file);if(bytes.length!==art.bytes||bytes.length>200000||sha256(bytes)!==art.sha256)throw Error('Artwork changed or exceeds the on-chain limit: '+art.name);if(Buffer.byteLength(JSON.stringify(art.metadata))>8192)throw Error('Metadata too large.');}
 return result;
}
export function compareArtifact(record,art){
 if(!record)return;
 if(record.name!==art.name||record.mime!==art.mime||record.byte_length!==art.bytes||record.sha256.replace(/^0x/,'')!==art.sha256||record.metadata!==JSON.stringify(art.metadata))throw Error('Existing on-chain artifact differs from this exact launch package: '+art.name);
 if(record.uploaded>record.chunks||record.chunks!==Math.ceil(art.bytes/16384))throw Error('Invalid on-chain chunk state.');
}
export function declaration(art){return {artifact_id:art.id,name:art.name,mime:art.mime,byte_length:art.bytes,sha256:'0x'+art.sha256,metadata:JSON.stringify(art.metadata)};}
export function quoteLimit(estimated,available){const cost=BigInt(estimated||0),balance=BigInt(available);if(cost<=0n)throw Error('Simulation returned no reliable Mana estimate.');const limit=cost*120n/100n+10000n;if(limit>balance)throw Error('Insufficient available Mana: need about '+Number(limit)/1e8+', have '+Number(balance)/1e8+'. Fund the payer or wait for Mana to regenerate, then resume.');return limit.toString();}
export function readJournal(path){return existsSync(path)?JSON.parse(readFileSync(path)):{transactions:[],status:'prepared'};}

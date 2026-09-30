import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const original=JSON.parse(readFileSync('collection/mainnet-preview.json'));
const added=JSON.parse(readFileSync('collection/art-prompts.json'));
const config=JSON.parse(readFileSync('dist/network-config.json'));
const items=[...original.items,...added];
if(items.length!==100||new Set(items.map(x=>x.id)).size!==100||new Set(items.map(x=>x.slug)).size!==100)throw Error('The collection must contain 100 distinct works.');
mkdirSync('dist/metadata',{recursive:true});
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const work of items){
 const path='dist/'+work.file;if(!existsSync(path))throw Error('Missing final image: '+path);
 const bytes=readFileSync(path);if(bytes.length<1||bytes.length>200000)throw Error('Invalid image size: '+path);
 work.caption=work.caption?.replace(/\.{2,}$/,'.');
 work.bytes=bytes.length;work.sha256=digest(bytes);work.description=work.was+'\n\n'+work.became;
 work.alt=work.scene||work.name+' — tactile sculptural artwork from AFTERLIGHT';
 work.attributes=work.attributes||[{trait_type:'Theme',value:work.theme},{trait_type:'Medium',value:'AI-generated sculptural still life'},{trait_type:'Materials',value:'Aged ivory, painted steel, terracotta'}];
 const image=config.archiveId?'koinos://'+config.chainId+'/'+config.archiveId+'/artifacts/'+work.id:work.file;
 work.metadata={name:work.name,description:work.description,image,attributes:work.attributes,properties:{collection:'AFTERLIGHT: The World That Was',edition_size:100,sha256:work.sha256,mime_type:'image/webp',byte_length:work.bytes,artifact_id:work.id,storage:'Koinos contract state',archive_contract:config.archiveId||null,chain_id:config.chainId,generation:'AI-generated artwork',...(config.archiveId?{}:{status:'Prepared; not yet deployed'})}};
 if(Buffer.byteLength(JSON.stringify(work.metadata))>8192)throw Error('Metadata exceeds the archive limit.');
 writeFileSync('dist/metadata/'+work.id+'.json',JSON.stringify(work.metadata,null,2)+'\n');
}
const manifest={title:original.title,status:config.enabled?'live':'prepared',plannedSupply:100,initialPriceKoin:500,previewCount:100,artDirection:original.artDirection,items};
writeFileSync('collection/manifest.json',JSON.stringify(manifest,null,2)+'\n');
writeFileSync('dist/collection.json',JSON.stringify(manifest,null,2)+'\n');
writeFileSync('dist/world-data.js','window.AFTERLIGHT_WORLD='+JSON.stringify(manifest)+';\n');
writeFileSync('collection/world-art-files.json',JSON.stringify(items.map(({id,slug,bytes,sha256})=>({id,slug,bytes,sha256})),null,2)+'\n');
console.log('Prepared 100 unique image files and metadata records; total bytes '+items.reduce((n,w)=>n+w.bytes,0));

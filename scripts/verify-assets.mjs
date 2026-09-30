import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const data=JSON.parse(readFileSync('collection/manifest.json'));
if(data.items.length!==100)throw Error('Expected 100 works.');
const hashes=new Set();let total=0;
for(let index=0;index<data.items.length;index++){
 const work=data.items[index];if(work.id!==index+1)throw Error('Nonsequential artwork IDs.');
 const bytes=readFileSync('dist/'+work.file),hash=createHash('sha256').update(bytes).digest('hex');
 if(bytes.length>200000||hash!==work.sha256||bytes.length!==work.bytes)throw Error('Image integrity failure: '+work.name);
 if(hashes.has(hash))throw Error('Duplicate image bytes: '+work.name);hashes.add(hash);
 const image=await sharp(bytes).metadata();if(image.format!=='webp'||image.width!==image.height||image.width<900)throw Error('Invalid image format or dimensions: '+work.name);
 const meta=JSON.parse(readFileSync('dist/metadata/'+work.id+'.json'));
 if(meta.name!==work.name||meta.properties.sha256!==hash||Buffer.byteLength(JSON.stringify(meta))>8192)throw Error('Metadata integrity failure.');
 if(!work.was||!work.became||!work.name||!work.caption)throw Error('Incomplete story.');total+=bytes.length;
}
for(const file of ['index.html','collect.html','marketplace.html','wallet.html','network.html','recover.html','recovery.html','marketplace.js','afterhours.js','abi/archive.json','abi/afterlight.json'])if(!existsSync('dist/'+file))throw Error('Missing website file: '+file);
const viewer=readFileSync('dist/recovery.html','utf8');if(Buffer.byteLength(viewer)>200000||/<script[^>]+src=|<link[^>]+href=/i.test(viewer))throw Error('Standalone reader has external dependencies or exceeds the size cap.');
console.log(JSON.stringify({works:100,uniqueImages:hashes.size,totalImageBytes:total,maxImageBytes:Math.max(...data.items.map(w=>w.bytes)),metadata:'verified',standaloneReaderBytes:Buffer.byteLength(viewer)},null,2));

import sharp from 'sharp';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
const works=JSON.parse(readFileSync('collection/art-prompts.json'));
mkdirSync('dist/world-art',{recursive:true});
let completed=0;
for(const work of works){
 const source='artwork-originals/collection/'+work.slug+'.png',target='dist/'+work.file;
 if(existsSync(target)){completed++;continue;}
 if(!existsSync(source)){if(process.argv.includes('--partial'))continue;throw Error('Missing generated artwork: '+work.name);}
 let bytes;
 for(const size of [1100,1000,900]){
  for(const quality of [88,84,80,76,72]){
   bytes=await sharp(source).resize(size,size,{fit:'inside',withoutEnlargement:true}).webp({quality,effort:6}).toBuffer();
   if(bytes.length<=200000)break;
  }
  if(bytes.length<=200000)break;
 }
 if(bytes.length>200000)throw Error('Artwork exceeds the on-chain limit: '+work.name);
 writeFileSync(target,bytes);completed++;
}
console.log('Optimized new artwork files: '+completed+' / 94');

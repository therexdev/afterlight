import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Serializer,utils} from 'koilib';
import {parseKoin,formatKoin,tokenId,parseTokenId} from '../src/amounts.js';
import {MAINNET,TESTNET,assertNetwork,quoteLimit,compareArtifact,declaration} from '../scripts/launch-lib.mjs';
test('KOIN input uses exact integers, including one satoshi',()=>{
 assert.equal(parseKoin('0.00000001'),'1');assert.equal(parseKoin('500'),'50000000000');assert.equal(parseKoin('1.23456789'),'123456789');assert.equal(formatKoin('123456789'),'1.23456789');
});
test('reject malformed, zero, negative, overprecision and overflow prices',()=>{for(const input of ['0','-1','1e8','1.000000001','  ','NaN','1,000','01','1000000001'])assert.throws(()=>parseKoin(input));});
test('all 100 token IDs round-trip without aliases',()=>{for(let id=1;id<=100;id++)assert.equal(parseTokenId(tokenId(id)),id);for(const value of ['0x3031','0x30','0x313031','0xzz'])assert.throws(()=>parseTokenId(value));});
test('network guards reject cross-chain and unknown deployments',()=>{assert.doesNotThrow(()=>assertNetwork({chainId:MAINNET},MAINNET));assert.throws(()=>assertNetwork({chainId:MAINNET},TESTNET));assert.throws(()=>assertNetwork({chainId:'x'},'x'));});
test('Mana estimates are bounded by actual available resources',()=>{assert.equal(quoteLimit('100000000','200000000'),'120010000');assert.throws(()=>quoteLimit('0','200000000'));assert.throws(()=>quoteLimit('100000000','100000000'));});
test('resume rejects mismatching bytes, metadata, names, and upload state',()=>{
 const art={id:1,name:'Test',mime:'image/webp',bytes:20,sha256:'ab'.repeat(32),metadata:{name:'Test'}};
 const record={name:art.name,mime:art.mime,byte_length:20,sha256:'0x'+art.sha256,metadata:JSON.stringify(art.metadata),uploaded:1,chunks:1};
 assert.doesNotThrow(()=>compareArtifact(record,art));for(const altered of [{name:'Different'},{byte_length:21},{metadata:'{}'},{sha256:'00'.repeat(32)},{uploaded:2}])assert.throws(()=>compareArtifact({...record,...altered},art));assert.equal(declaration(art).sha256,'0x'+art.sha256);
});
test('corrected ABI preserves snake_case fields and address/hex encodings',async()=>{
 const abi=JSON.parse(readFileSync('contracts/build/afterlight.abi'));const serializer=new Serializer(abi.types);
 const args={buyer:'1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqe',token_id:tokenId(100),expected_seller:'1BrPkP7JhBwT4MuRDMWiiysGEu4XkyXuCH',expected_price:'50000000000',expected_revision:'17',deadline:'1800000600000'};
 const bytes=await serializer.serialize(args,abi.methods.buy.argument);const actual=await serializer.deserialize(bytes,abi.methods.buy.argument);
 assert.equal(actual.buyer,args.buyer);assert.equal(actual.expected_seller,args.expected_seller);assert.equal(actual.token_id.replace(/^0x/,''),args.token_id.replace(/^0x/,''));assert.equal(actual.expected_price,args.expected_price);assert.equal(actual.expected_revision,'17');
 assert.equal(abi.methods.transfer.entry_point,0x27f576ca);assert.equal(abi.methods.approve.entry_point,0x74e21680);
});
test('metadata contains all 100 distinct titles and image fingerprints',()=>{const {items}=JSON.parse(readFileSync('collection/manifest.json'));assert.equal(items.length,100);assert.equal(new Set(items.map(x=>x.name)).size,100);assert.equal(new Set(items.map(x=>x.sha256)).size,100);});
test('public package has no configured mainnet launch or embedded signing keys',()=>{const cfg=JSON.parse(readFileSync('dist/network-config.json'));if(cfg.enabled){assert.ok(utils.isChecksumAddress(cfg.archiveId));assert.ok(utils.isChecksumAddress(cfg.collectionId));}for(const file of ['dist/marketplace.js','dist/world-data.js','dist/network-config.json'])assert.doesNotMatch(readFileSync(file,'utf8'),/"wif"\s*:\s*"[5KL][1-9A-HJ-NP-Za-km-z]{49,51}"/);});

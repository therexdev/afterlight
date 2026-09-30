import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,cpSync,symlinkSync,readFileSync,statSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {utils} from 'koilib';

test('offline wallet preparation binds all artifacts, protects keys, and refuses overwrite',()=>{
  const root=resolve('.'),fixture=mkdtempSync(join(tmpdir(),'afterlight-prepare-'));
  try {
    for(const dir of ['scripts','collection','dist'])cpSync(join(root,dir),join(fixture,dir),{recursive:true});
    symlinkSync(join(root,'node_modules'),join(fixture,'node_modules'),'dir');
    const env={...process.env};delete env.AFTERLIGHT_FUNDING_WIF;
    const run=()=>spawnSync(process.execPath,['scripts/launch.mjs','prepare','--network','testnet'],{cwd:fixture,env,encoding:'utf8'});
    const result=run();assert.equal(result.status,0,result.stderr);
    const secrets=JSON.parse(readFileSync(join(fixture,'.secrets/launch-wallets.json')));
    assert.equal(new Set(['funding','archive','collection'].map(role=>secrets[role].address)).size,3);
    for(const role of ['funding','archive','collection']){
      assert.ok(utils.isChecksumAddress(secrets[role].address));
      assert.ok(!result.stdout.includes(secrets[role].wif));
    }
    if(process.platform!=='win32')assert.equal(statSync(join(fixture,'.secrets/launch-wallets.json')).mode&0o777,0o600);
    const config=JSON.parse(readFileSync(join(fixture,'dist/network-config.json')));
    assert.equal(config.enabled,false);assert.equal(config.archiveId,secrets.archive.address);assert.equal(config.collectionId,secrets.collection.address);
    const manifest=JSON.parse(readFileSync(join(fixture,'collection/manifest.json')));
    for(const art of manifest.items){assert.ok(art.metadata.image.includes(secrets.archive.address));assert.equal(art.metadata.properties.chain_id,secrets.chainId);assert.equal(art.metadata.properties.status,undefined);}
    assert.ok(readFileSync(join(fixture,'dist/recovery.html'),'utf8').includes(secrets.archive.address));
    const again=run();assert.notEqual(again.status,0);assert.match(again.stderr,/were not overwritten/);
    assert.deepEqual(JSON.parse(readFileSync(join(fixture,'.secrets/launch-wallets.json'))),secrets);
  } finally {rmSync(fixture,{recursive:true,force:true});}
});

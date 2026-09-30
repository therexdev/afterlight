import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,cpSync,symlinkSync,readFileSync,rmSync,existsSync,renameSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

test('real launch CLI signs both deployments and initialization, resumes, and verifies without keys',()=>{
  const root=resolve('.'),fixture=mkdtempSync(join(tmpdir(),'afterlight-launch-cli-'));
  const json=path=>JSON.parse(readFileSync(join(fixture,path)));
  try{
    for(const dir of ['scripts','collection','dist','contracts/build','tests/fixtures'])cpSync(join(root,dir),join(fixture,dir),{recursive:true});
    symlinkSync(join(root,'node_modules'),join(fixture,'node_modules'),'dir');
    const env={...process.env};delete env.AFTERLIGHT_FUNDING_WIF;delete env.AFTERLIGHT_USE_CURL;delete env.AFTERLIGHT_RPC;
    const prepared=spawnSync(process.execPath,['scripts/launch.mjs','prepare','--network','testnet'],{cwd:fixture,env,encoding:'utf8'});
    assert.equal(prepared.status,0,prepared.stderr);
    const keys=readFileSync(join(fixture,'.secrets/launch-wallets.json'),'utf8');
    const run=command=>{
      const result=spawnSync(process.execPath,['--import','./tests/fixtures/launch-transport.mjs','scripts/launch.mjs',command],{cwd:fixture,env,encoding:'utf8'});
      assert.match(result.stderr,/TEST_BOUNDARY: both deployments and initialization confirmed/,result.stderr);
      assert.equal(result.status,1); // Intentional boundary before artwork upload; no live RPC.
      for(const role of Object.values(JSON.parse(keys)))if(role?.wif)assert.ok(!result.stdout.includes(role.wif)&&!result.stderr.includes(role.wif));
    };
    run('upload');
    const journal=json('collection/launch-state.json');
    assert.deepEqual(journal.transactions.map(t=>t.label),['Deploy archive','Deploy collection','initialize']);
    assert.equal(json('rpc-fixture.json').transactions.length,3);
    assert.equal(existsSync(join(fixture,'.secrets/pending-launch.json')),false);
    run('upload');
    assert.deepEqual(json('collection/launch-state.json'),journal);
    assert.equal(json('rpc-fixture.json').transactions.length,3);
    assert.equal(readFileSync(join(fixture,'.secrets/launch-wallets.json'),'utf8'),keys);
    renameSync(join(fixture,'.secrets/launch-wallets.json'),join(fixture,'.secrets/offline-backup.json'));
    run('verify');
    assert.equal(json('rpc-fixture.json').transactions.length,3);
    assert.equal(json('dist/network-config.json').enabled,false);
  }finally{rmSync(fixture,{recursive:true,force:true});}
});

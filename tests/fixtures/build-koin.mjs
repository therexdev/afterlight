import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {writeFileSync,mkdirSync} from 'node:fs';
import {KOINOS_DISABLED_FEATURES} from '../../scripts/wasm-compat.mjs';
export function buildKoin(){
 const dir=resolve('tests/fixtures/koin'),bin=resolve('node_modules/.bin');
 mkdirSync('contracts/build',{recursive:true});
 const shim=resolve('contracts/build/protoc-gen-payment-test');
 writeFileSync(shim,'#!/bin/sh\nexec "'+process.execPath+'" "'+resolve('scripts/protoc-plugin.mjs')+'" "'+bin+'/as-proto-gen"\n',{mode:0o755});
 for(const [cmd,args] of [
  [bin+'/protoc',['-I'+dir,'--plugin=protoc-gen-as='+shim,'--as_out='+dir,dir+'/proto/koin.proto',dir+'/proto/fund.proto']],
  [process.execPath,[resolve('node_modules/assemblyscript/bin/asc.js'),dir+'/entry.ts','--outFile','contracts/build/payment-test.wasm','--use','abort=','--use','BUILD_FOR_TESTING=1','--exportStart','_start','--disable',KOINOS_DISABLED_FEATURES.join(','),'--optimize']]
 ]){
  const r=spawnSync(cmd,args,{encoding:'utf8'});
  if(r.status!==0)throw Error('KOIN test fixture build failed: '+r.stdout+r.stderr);
 }
 return resolve('contracts/build/payment-test.wasm');
}

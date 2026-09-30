import protobuf from 'protobufjs';
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {archiveMethods,collectionMethods,generateSchema} from './create-schema.mjs';
import {assertKoinosWasm,KOINOS_DISABLED_FEATURES} from './wasm-compat.mjs';
const dir=resolve('contracts'),bin=resolve('node_modules/.bin');
const run=(cmd,args,opts={})=>{const r=spawnSync(cmd,args,{stdio:'inherit',...opts});if(r.status!==0)throw Error('Build failed: '+cmd);};
const ep=name=>createHash('sha256').update(name).digest('hex').slice(0,8);
generateSchema();mkdirSync('contracts/build',{recursive:true});mkdirSync('dist/abi',{recursive:true});
const shim=resolve('contracts/build/protoc-gen-as');
writeFileSync(shim,'#!/bin/sh\nexec "'+process.execPath+'" "'+resolve('scripts/protoc-plugin.mjs')+'" "'+bin+'/as-proto-gen"\n',{mode:0o755});
run(bin+'/protoc',['-I'+dir,'-I'+dir+'/proto-deps','--include_imports','--plugin=protoc-gen-as='+shim,'--as_out='+dir,'--descriptor_set_out='+dir+'/build/afterlight.pb',dir+'/assembly/proto/afterlight.proto'],{env:{...process.env,PATH:bin+':'+process.env.PATH}});
const types=protobuf.parse(readFileSync('contracts/assembly/proto/afterlight.proto','utf8'),{keepCase:true}).root.toJSON();
for(const[name,className,methods]of[['archive','Archive',archiveMethods],['afterlight','Afterlight',collectionMethods]]){
 let code="import{System,Protobuf,authority}from'@koinos/sdk-as';import{"+className+"}from'./"+className+"';import{afterlight as p}from'./proto/afterlight';\nexport function main():i32{const a=System.getArguments();const c=new "+className+"();let out=new Uint8Array(0);switch(a.entry_point){case 0x4a2dbd90:out=Protobuf.encode(c.authorize(Protobuf.decode<authority.authorize_arguments>(a.args,authority.authorize_arguments.decode)),authority.authorize_result.encode);break;";
 const abi={methods:{},types};
 for(const[n,[, ,ro]]of Object.entries(methods)){
  code+='\ncase 0x'+ep(n)+':out=Protobuf.encode(c.'+n+'(Protobuf.decode<p.'+n+'_arguments>(a.args,p.'+n+'_arguments.decode)),p.'+n+'_result.encode);break;';
  abi.methods[n]={argument:'afterlight.'+n+'_arguments',return:'afterlight.'+n+'_result',entry_point:parseInt(ep(n),16),read_only:ro};
 }
 code+='default:System.exit(1);return 1;}System.exit(0,out);return 0;}main();\n';
 writeFileSync('contracts/assembly/'+name+'-entry.ts',code);
 writeFileSync('contracts/build/'+name+'.abi',JSON.stringify(abi,null,2)+'\n');
 copyFileSync('contracts/build/'+name+'.abi','dist/abi/'+name+'.json');
 run(process.execPath,[resolve('node_modules/assemblyscript/bin/asc.js'),'assembly/'+name+'-entry.ts','--target','release','--outFile','build/'+name+'.wasm','--use','abort=','--use','BUILD_FOR_TESTING=0','--exportStart','_start','--disable',KOINOS_DISABLED_FEATURES.join(','),'--config','asconfig.json'],{cwd:dir});
 const bytes=readFileSync('contracts/build/'+name+'.wasm');assertKoinosWasm(bytes);
 console.log(JSON.stringify({contract:name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}));
}

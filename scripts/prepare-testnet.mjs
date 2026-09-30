import {createInterface} from 'node:readline';
import {Writable} from 'node:stream';
import {existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {Contract,utils} from 'koilib';
import {makeProvider} from './provider.mjs';
import {resolveNativeKoin} from './chain-compat.mjs';
import {TESTNET} from './launch-lib.mjs';
import {formatKoin} from '../src/amounts.js';

const index=process.argv.indexOf('--funding-address'),funding=index<0?null:process.argv[index+1];
if(Number(process.versions.node.split('.')[0])<22)throw Error('Node.js 22 or later is required.');
if(!funding||!utils.isChecksumAddress(funding))throw Error('Pass --funding-address with your funded testnet wallet address.');
if(existsSync('.secrets/launch-wallets.json'))throw Error('Launch keys already exist. Keep them and resume launch:upload; do not prepare again.');
if(!process.stdin.isTTY)throw Error('Run this command in an interactive terminal. Never pass your wallet key as a command argument.');
const endpoint='https://testnet.koinosfoundation.org/jsonrpc',provider=makeProvider(endpoint);
if(await provider.getChainId()!==TESTNET)throw Error('The endpoint is not on the expected testnet.');
const payment=await resolveNativeKoin(provider,TESTNET);
const token=new Contract({id:payment,abi:utils.tokenAbi,provider});
const [{result},mana]=await Promise.all([token.functions.balanceOf({owner:funding}),provider.getAccountRc(funding)]);
console.log('TESTNET ONLY — no mainnet transactions.');
console.log('Funded wallet: '+funding);
console.log('Balance: '+formatKoin(result?.value||'0')+' tKOIN; available Mana: '+formatKoin(mana));
if(BigInt(mana)<=100000n)throw Error('This wallet does not have enough available Mana to start.');
console.log('Paste this wallet’s WIF private key below. Input is hidden and stays on this computer.');
let muted=false;
const output=new Writable({write(chunk,_encoding,done){if(!muted)process.stdout.write(chunk);done();}});
const input=createInterface({input:process.stdin,output,terminal:true});
let secret;
try {
  secret=await new Promise((resolve,reject)=>{
    input.on('SIGINT',()=>reject(Error('Preparation canceled.')));
    input.question('WIF private key: ',resolve);muted=true;
  });
} finally {input.close();process.stdout.write('\n');}
try {
  const child=spawnSync(process.execPath,['scripts/launch.mjs','prepare','--network','testnet','--funding-address',funding,'--treasury',funding],{stdio:'inherit',env:{...process.env,AFTERLIGHT_FUNDING_WIF:secret.trim()}});
  if(child.status!==0)throw Error('Preparation failed; nothing was deployed. Read the error above.');
} finally {secret='';}
console.log('\nBack up .secrets/launch-wallets.json offline now. It contains the deployment keys.');
console.log('Nothing has been deployed. Next command: npm.cmd run launch:upload');

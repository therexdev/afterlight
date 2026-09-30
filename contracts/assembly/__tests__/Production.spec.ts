import {Arrays,Base58,MockVM,System,authority,Crypto,chain,Protobuf,system_calls,kcs4,StringBytes} from '@koinos/sdk-as';
import {Archive} from '../Archive';
import {Afterlight} from '../Afterlight';
import {afterlight as p} from '../proto/afterlight';
const CONTRACT=Base58.decode('1CsLXtkZ78QXk1bLAyAxcyEGPDAHJELqb2');
const ALICE=Base58.decode('1DQzuCcTKacbs9GGScRTU1Hc8BsyARTPqe');
const BOB=Base58.decode('1BrPkP7JhBwT4MuRDMWiiysGEu4XkyXuCH');
const KOIN=Base58.decode('15im92XgZiV39tcKMhMGtDYhJjXPMjUu8r');
const NOW:u64=1800000000000,PRICE:u64=50000000000;
let a!:Archive;let c!:Afterlight;
function auth(account:Uint8Array=CONTRACT):void{MockVM.setAuthorities([new MockVM.MockAuthority(authority.authorization_type.contract_call,account,true)]);MockVM.commitTransaction();}
function tid(n:u32=1):Uint8Array{return StringBytes.stringToBytes(n.toString());}
function data(n:i32):Uint8Array{const b=new Uint8Array(n);for(let i=0;i<n;i++)b[i]=<u8>(i%251);return b;}
function begin(id:u32=1,n:i32=20,bad:bool=false):void{const hash=System.hash(Crypto.multicodec.sha2_256,data(n))!.slice(2);if(bad)hash[0]^=1;a.begin_artifact(new p.begin_artifact_arguments(id,'A work',id==101?'text/html':'image/webp',<u32>n,hash,'{"name":"A work"}'));MockVM.commitTransaction();}
function uploaded(id:u32=1,n:i32=20):void{begin(id,n);const b=data(n);for(let i:u32=0;i < <u32>(n+16383)/16384;i++){a.upload_chunk(new p.upload_chunk_arguments(id,i,b.slice(i*16384,(i+1)*16384)));MockVM.commitTransaction();}a.finalize_artifact(new p.finalize_artifact_arguments(id));MockVM.commitTransaction();}
function result(bytes:Uint8Array,code:i32=0):system_calls.exit_arguments{return new system_calls.exit_arguments(code,new chain.result(bytes,code==0?null:new chain.error_data('mock payment rejected')));}
function initialized():void{c.initialize(new p.initialize_arguments(ALICE,BOB,KOIN,'https://example.com/metadata'));MockVM.commitTransaction();}
function seed(owner:Uint8Array=ALICE):void{initialized();c.tokens.put(tid(),new p.token_record(owner));c.count.put(new p.number_record(1));c.balances.put(owner,new p.number_record(1));const cfg=c.cfg();cfg.launched=true;c.config.put(cfg);MockVM.commitTransaction();}
function list(price:u64=PRICE):void{auth(ALICE);c.list_token(new p.list_token_arguments(ALICE,tid(),price,NOW+86400000));MockVM.commitTransaction();}
function buyArgs(seller:Uint8Array=ALICE,revision:u64=1):p.buy_arguments{return new p.buy_arguments(BOB,tid(),seller,PRICE,revision,NOW+600000);}
beforeEach(()=>{MockVM.reset();MockVM.setContractId(CONTRACT);MockVM.setCaller(new chain.caller_data(new Uint8Array(0),chain.privilege.user_mode));MockVM.setEntryPoint(1);MockVM.setContractArguments(new Uint8Array(1));const h=new chain.head_info();h.head_block_time=NOW;MockVM.setHeadInfo(h);auth();a=new Archive();c=new Afterlight();});
describe('Permanent archive',()=>{
 it('reads the actual code hash and authority flags without mutation',()=>{const hash=System.hash(Crypto.multicodec.sha2_256,data(32))!;MockVM.setContractMetadata(new chain.contract_metadata_object(hash,false,false,false,true));MockVM.commitTransaction();auth(ALICE);const info=a.get_contract_info(new p.get_contract_info_arguments(CONTRACT));expect(info.exists).toBe(true);expect(Arrays.equal(info.code_hash!,hash)).toBe(true);expect(info.authorizes_upload_contract).toBe(true);expect(info.authorizes_call_contract).toBe(false);expect(info.authorizes_transaction_application).toBe(false);expect(a.get_status(new p.get_status_arguments()).minted).toBe(0);});
 it('rejects malformed metadata inspection addresses',()=>{expect(():void=>{a.get_contract_info(new p.get_contract_info_arguments(new Uint8Array(24)));}).toThrow();});
 it('reconstructs a multi-chunk image exactly',()=>{uploaded(1,40000);expect(a.get_artifact(new p.get_artifact_arguments(1)).value!.finalized).toBe(true);expect(Arrays.equal(a.get_chunk(new p.get_chunk_arguments(1,2)).value!,data(40000).slice(32768))).toBe(true);});
 it('accepts the full 200000 byte limit',()=>{uploaded(100,200000);expect(a.get_chunk(new p.get_chunk_arguments(100,12)).value!.length).toBe(3392);});
 it('rejects oversized data',()=>{expect(():void=>{begin(1,200001);}).toThrow();});
 it('requires archive authority',()=>{auth(ALICE);expect(():void=>{begin();}).toThrow();});
 it('rejects duplicate declarations',()=>{begin();expect(():void=>{begin();}).toThrow();});
 it('rejects missing chunks',()=>{begin();expect(():void=>{a.finalize_artifact(new p.finalize_artifact_arguments(1));}).toThrow();});
 it('rejects wrong chunk order',()=>{begin(1,20000);expect(():void=>{a.upload_chunk(new p.upload_chunk_arguments(1,1,data(3616)));}).toThrow();});
 it('rejects wrong chunk size',()=>{begin();expect(():void=>{a.upload_chunk(new p.upload_chunk_arguments(1,0,data(19)));}).toThrow();});
 it('rejects a mismatched fingerprint',()=>{begin(1,20,true);a.upload_chunk(new p.upload_chunk_arguments(1,0,data(20)));MockVM.commitTransaction();expect(():void=>{a.finalize_artifact(new p.finalize_artifact_arguments(1));}).toThrow();});
 it('keeps completed image bytes immutable',()=>{uploaded();expect(():void=>{a.upload_chunk(new p.upload_chunk_arguments(1,0,data(20)));}).toThrow();});
 it('does not expose incomplete content',()=>{begin();expect(():void=>{a.get_chunk(new p.get_chunk_arguments(1,0));}).toThrow();});
 it('rejects an invalid artifact number',()=>{expect(():void=>{begin(102);}).toThrow();});
 it('refuses to seal an incomplete archive',()=>{uploaded();expect(():void=>{a.seal_archive(new p.seal_archive_arguments());}).toThrow();});
 it('seals exactly 100 images and one viewer',()=>{for(let i:u32=1;i<=101;i++)uploaded(i);a.seal_archive(new p.seal_archive_arguments());expect(a.get_status(new p.get_status_arguments()).sealed).toBe(true);});
 it('always denies archive replacement authority',()=>{expect(a.authorize(new authority.authorize_arguments()).value).toBe(false);});
});
describe('Collection and ownership',()=>{
 it('initializes once with explicit roles',()=>{initialized();expect(Arrays.equal(c.cfg().archive!,ALICE)).toBe(true);expect(():void=>{c.initialize(new p.initialize_arguments(ALICE,BOB,KOIN,''));}).toThrow();});
 it('requires admin to initialize',()=>{auth(ALICE);expect(():void=>{c.initialize(new p.initialize_arguments(ALICE,BOB,KOIN,''));}).toThrow();});
 it('mints only after archive completion of that image',()=>{initialized();MockVM.setCallContractResults([result(Protobuf.encode(new p.get_artifact_result(),p.get_artifact_result.encode))]);MockVM.commitTransaction();expect(():void=>{c.mint(new p.mint_arguments(tid()));}).toThrow();});
 it('mints sequentially into the primary sale pool',()=>{initialized();const art=new p.artifact();art.finalized=true;MockVM.setCallContractResults([result(Protobuf.encode(new p.get_artifact_result(art),p.get_artifact_result.encode))]);MockVM.commitTransaction();c.mint(new p.mint_arguments(tid()));expect(Arrays.equal(c.owner_of(new p.owner_of_arguments(tid())).value!,CONTRACT)).toBe(true);expect(c.total_supply(new p.total_supply_arguments()).value).toBe(1);});
 it('rejects skipping token numbers',()=>{initialized();expect(():void=>{c.mint(new p.mint_arguments(tid(2)));}).toThrow();});
 it('rejects leading-zero aliases',()=>{initialized();expect(():void=>{c.owner_of(new p.owner_of_arguments(StringBytes.stringToBytes('01')));}).toThrow();});
 it('rejects tokens beyond the 100 cap',()=>{initialized();expect(():void=>{c.owner_of(new p.owner_of_arguments(tid(101)));}).toThrow();});
 it('does not open sales before all tokens exist',()=>{initialized();expect(():void=>{c.open_sales(new p.open_sales_arguments());}).toThrow();});
 it('requires the sealed archive before launch',()=>{initialized();c.count.put(new p.number_record(100));MockVM.setCallContractResults([result(Protobuf.encode(new p.get_status_result(100,false,100,16384,200000),p.get_status_result.encode))]);MockVM.commitTransaction();expect(():void=>{c.open_sales(new p.open_sales_arguments());}).toThrow();});
 it('opens only the complete collection',()=>{initialized();c.count.put(new p.number_record(100));MockVM.setCallContractResults([result(Protobuf.encode(new p.get_status_result(101,true,100,16384,200000),p.get_status_result.encode))]);MockVM.commitTransaction();c.open_sales(new p.open_sales_arguments());expect(c.cfg().launched).toBe(true);});
 it('transfers and updates balances',()=>{seed();auth(ALICE);c.transfer(new p.transfer_arguments(ALICE,BOB,tid()));expect(c.balance_of(new p.balance_of_arguments(ALICE)).value).toBe(0);expect(c.balance_of(new p.balance_of_arguments(BOB)).value).toBe(1);});
 it('rejects unauthorized transfers',()=>{seed();auth(BOB);expect(():void=>{c.transfer(new p.transfer_arguments(ALICE,BOB,tid()));}).toThrow();});
 it('cannot extract primary inventory by admin transfer',()=>{seed(CONTRACT);auth();expect(():void=>{c.transfer(new p.transfer_arguments(CONTRACT,ALICE,tid()));}).toThrow();});
 it('permits single-token approval and clears it on transfer',()=>{seed();auth(ALICE);c.approve(new p.approve_arguments(ALICE,BOB,tid()));MockVM.commitTransaction();auth(BOB);c.transfer(new p.transfer_arguments(ALICE,BOB,tid()));expect(c.get_approved(new p.get_approved_arguments(tid())).value==null).toBe(true);});
 it('permits an approved operator',()=>{seed();auth(ALICE);c.set_approval_for_all(new p.set_approval_for_all_arguments(ALICE,BOB,true));MockVM.commitTransaction();auth(BOB);c.transfer(new p.transfer_arguments(ALICE,BOB,tid()));expect(Arrays.equal(c.token(tid()).owner!,BOB)).toBe(true);});
 it('rejects a revoked operator',()=>{seed();auth(ALICE);c.set_approval_for_all(new p.set_approval_for_all_arguments(ALICE,BOB,true));c.set_approval_for_all(new p.set_approval_for_all_arguments(ALICE,BOB,false));MockVM.commitTransaction();auth(BOB);expect(():void=>{c.transfer(new p.transfer_arguments(ALICE,BOB,tid()));}).toThrow();});
 it('invalidates a listing when transferred',()=>{seed();list();c.transfer(new p.transfer_arguments(ALICE,BOB,tid()));expect(c.get_listing(new p.get_listing_arguments(tid())).value==null).toBe(true);});
 it('bounds pagination to 25 tokens',()=>{seed();expect(c.get_tokens(new p.get_tokens_arguments(1,25)).values.length).toBe(1);expect(():void=>{c.get_tokens(new p.get_tokens_arguments(1,26));}).toThrow();});
});
describe('Atomic KOIN marketplace',()=>{
 it('shows primary inventory at exactly 500 KOIN',()=>{seed(CONTRACT);const sale=c.get_listing(new p.get_listing_arguments(tid())).value!;expect(sale.price).toBe(PRICE);expect(sale.primary).toBe(true);});
 it('requires owner authority to list',()=>{seed();auth(BOB);expect(():void=>{c.list_token(new p.list_token_arguments(ALICE,tid(),PRICE,NOW+86400000));}).toThrow();});
 it('rejects a zero listing price',()=>{seed();auth(ALICE);expect(():void=>{c.list_token(new p.list_token_arguments(ALICE,tid(),0,NOW+86400000));}).toThrow();});
 it('rejects already expired listings',()=>{seed();auth(ALICE);expect(():void=>{c.list_token(new p.list_token_arguments(ALICE,tid(),PRICE,NOW));}).toThrow();});
 it('pays the seller the exact resale amount',()=>{seed();list();auth(BOB);MockVM.setCallContractResults([result(new Uint8Array(0))]);MockVM.commitTransaction();c.buy(buyArgs());expect(Arrays.equal(c.token(tid()).owner!,BOB)).toBe(true);const calls=MockVM.getCallContractArguments();const payment=Protobuf.decode<kcs4.transfer_arguments>(calls[0].args,kcs4.transfer_arguments.decode);expect(Arrays.equal(calls[0].contract_id!,KOIN)).toBe(true);expect(Arrays.equal(payment.from!,BOB)).toBe(true);expect(Arrays.equal(payment.to!,ALICE)).toBe(true);expect(payment.value).toBe(PRICE);});
 it('pays primary proceeds to the configured treasury',()=>{seed(CONTRACT);auth(ALICE);MockVM.setCallContractResults([result(new Uint8Array(0))]);MockVM.commitTransaction();c.buy(new p.buy_arguments(ALICE,tid(),CONTRACT,PRICE,0,NOW+600000));const payment=Protobuf.decode<kcs4.transfer_arguments>(MockVM.getCallContractArguments()[0].args,kcs4.transfer_arguments.decode);expect(Arrays.equal(payment.to!,BOB)).toBe(true);expect(Arrays.equal(c.token(tid()).owner!,ALICE)).toBe(true);});
 it('rejects a failed KOIN payment',()=>{seed();list();auth(BOB);MockVM.setCallContractResults([result(new Uint8Array(0),1)]);MockVM.commitTransaction();expect(():void=>{c.buy(buyArgs());}).toThrow();expect(Arrays.equal(c.token(tid()).owner!,ALICE)).toBe(true);expect(c.get_listing(new p.get_listing_arguments(tid())).value!.active).toBe(true);});
 it('requires the buyer signature',()=>{seed();list();auth(ALICE);expect(():void=>{c.buy(buyArgs());}).toThrow();});
 it('rejects a price changed after preview',()=>{seed();list(PRICE+1);auth(BOB);expect(():void=>{c.buy(buyArgs());}).toThrow();});
 it('rejects a replaced listing even at the same price',()=>{seed();list();list();auth(BOB);expect(():void=>{c.buy(buyArgs());}).toThrow();});
 it('rejects a wrong expected seller',()=>{seed();list();auth(BOB);expect(():void=>{c.buy(buyArgs(CONTRACT));}).toThrow();});
 it('rejects expired purchase quotes',()=>{seed();list();auth(BOB);expect(():void=>{c.buy(new p.buy_arguments(BOB,tid(),ALICE,PRICE,1,NOW));}).toThrow();});
 it('rejects overlong purchase quotes',()=>{seed();list();auth(BOB);expect(():void=>{c.buy(new p.buy_arguments(BOB,tid(),ALICE,PRICE,1,NOW+1800001));}).toThrow();});
 it('rejects buying your own listing',()=>{seed();list();expect(():void=>{c.buy(new p.buy_arguments(ALICE,tid(),ALICE,PRICE,1,NOW+600000));}).toThrow();});
 it('cancels without moving NFT ownership',()=>{seed();list();c.cancel_listing(new p.cancel_listing_arguments(ALICE,tid()));expect(c.get_listing(new p.get_listing_arguments(tid())).value==null).toBe(true);expect(Arrays.equal(c.token(tid()).owner!,ALICE)).toBe(true);});
 it('allows listing cancellation while purchases are paused',()=>{seed();list();auth();c.set_paused(new p.set_paused_arguments(true));MockVM.commitTransaction();auth(ALICE);c.cancel_listing(new p.cancel_listing_arguments(ALICE,tid()));expect(c.get_listing(new p.get_listing_arguments(tid())).value==null).toBe(true);});
 it('blocks purchases while paused',()=>{seed();list();auth();c.set_paused(new p.set_paused_arguments(true));MockVM.commitTransaction();auth(BOB);expect(():void=>{c.buy(buyArgs());}).toThrow();});
 it('keeps transfers available while paused',()=>{seed();auth();c.set_paused(new p.set_paused_arguments(true));MockVM.commitTransaction();auth(ALICE);c.transfer(new p.transfer_arguments(ALICE,BOB,tid()));expect(Arrays.equal(c.token(tid()).owner!,BOB)).toBe(true);});
 it('rejects reentrant mutations',()=>{seed();list();c.locked.put(new p.bool_record(true));MockVM.commitTransaction();auth(BOB);expect(():void=>{c.buy(buyArgs());}).toThrow();});
});

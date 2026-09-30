import {System,Storage,Protobuf,authority,Arrays,StringBytes,Token,Base64} from '@koinos/sdk-as';
import {afterlight as p} from './proto/afterlight';
System.setSystemBufferSize(32*1024);
const CAP:u32=100, PRICE:u64=50000000000, MAX_PRICE:u64=100000000000000000;
const MAX_LISTING_MS:u64=31622400000, MAX_QUOTE_MS:u64=30*60*1000;
/** KCS-2-style ownership and native atomic marketplace.
 * The contract account may upgrade this code. Archive data is held by a separate immutable contract.
 * No user funds are held in escrow. A buy sends KOIN directly to the seller (treasury for primary sales).
 */
export class Afterlight {
 id:Uint8Array=System.getContractId();
 tokens:Storage.Map<Uint8Array,p.token_record>=new Storage.Map<Uint8Array,p.token_record>(this.id,1,p.token_record.decode,p.token_record.encode,null);
 balances:Storage.Map<Uint8Array,p.number_record>=new Storage.Map<Uint8Array,p.number_record>(this.id,2,p.number_record.decode,p.number_record.encode,()=>new p.number_record());
 operators:Storage.Map<Uint8Array,p.bool_record>=new Storage.Map<Uint8Array,p.bool_record>(this.id,3,p.bool_record.decode,p.bool_record.encode,()=>new p.bool_record());
 operatorLists:Storage.Map<Uint8Array,p.operator_list>=new Storage.Map<Uint8Array,p.operator_list>(this.id,4,p.operator_list.decode,p.operator_list.encode,()=>new p.operator_list());
 listings:Storage.Map<Uint8Array,p.listing>=new Storage.Map<Uint8Array,p.listing>(this.id,5,p.listing.decode,p.listing.encode,null);
 count:Storage.Obj<p.number_record>=new Storage.Obj<p.number_record>(this.id,6,p.number_record.decode,p.number_record.encode,()=>new p.number_record());
 config:Storage.Obj<p.configuration>=new Storage.Obj<p.configuration>(this.id,7,p.configuration.decode,p.configuration.encode,null);
 locked:Storage.Obj<p.bool_record>=new Storage.Obj<p.bool_record>(this.id,8,p.bool_record.decode,p.bool_record.encode,()=>new p.bool_record());
 authorize(args:authority.authorize_arguments):authority.authorize_result{return new authority.authorize_result(false);}
 guard():void{System.require(!this.locked.get()!.value,'reentrant call');}
 admin():void{this.guard();System.requireAuthority(authority.authorization_type.contract_call,this.id);}
 cfg():p.configuration{const c=this.config.get();System.require(c!=null,'collection not initialized');return c!;}
 address(a:Uint8Array|null):Uint8Array{System.require(a!=null&&a!.length==25,'invalid address');return a!;}
 tokenId(b:Uint8Array|null):Uint8Array{
  System.require(b!=null&&b!.length>=1&&b!.length<=3,'invalid token id');let n:u32=0;
  for(let i=0;i<b!.length;i++){System.require(b![i]>=48&&b![i]<=57,'invalid token id');n=n*10+<u32>b![i]-48;}
  System.require(b![0]!=48&&n>=1&&n<=CAP,'token must be 1 through 100');return b!;
 }
 number(id:Uint8Array):u32{let n:u32=0;for(let i=0;i<id.length;i++)n=n*10+<u32>id[i]-48;return n;}
 token(id:Uint8Array):p.token_record{const t=this.tokens.get(id);System.require(t!=null,'token not minted');return t!;}
 pair(a:Uint8Array,b:Uint8Array):Uint8Array{const k=new Uint8Array(50);k.set(a);k.set(b,25);return k;}
 balance(a:Uint8Array):u64{return this.balances.get(a)!.value;}
 now():u64{return System.getHeadInfo().head_block_time;}
 archiveStatus():p.get_status_result{
  const r=System.call(this.cfg().archive!,0x72cdbfdd,new Uint8Array(0));
  System.require(r.code==0,'archive status unavailable');return Protobuf.decode<p.get_status_result>(r.res.object!,p.get_status_result.decode);
 }
 artifact(id:Uint8Array):p.artifact{
  const r=System.call(this.cfg().archive!,0x9dd471ab,Protobuf.encode(new p.get_artifact_arguments(this.number(id)),p.get_artifact_arguments.encode));
  System.require(r.code==0,'archive unavailable');const a=Protobuf.decode<p.get_artifact_result>(r.res.object!,p.get_artifact_result.decode).value;
  System.require(a!=null&&a!.finalized,'artwork not finalized');return a!;
 }
 bump(t:p.token_record):void{System.require(t.revision<u64.MAX_VALUE,'revision exhausted');t.revision++;}
 move(id:Uint8Array,t:p.token_record,to:Uint8Array):void{
  const from=t.owner!;if(!Arrays.equal(from,to)){const n=this.balance(from);System.require(n>0,'invalid balance');this.balances.put(from,new p.number_record(n-1));this.balances.put(to,new p.number_record(this.balance(to)+1));}
  t.owner=to;t.approved=null;this.bump(t);this.tokens.put(id,t);this.listings.remove(id);
  System.event('collections.transfer_event',Protobuf.encode(new p.transfer_event(from,to,id),p.transfer_event.encode),[from,to]);
 }
 name(args:p.name_arguments):p.name_result{return new p.name_result('AFTERLIGHT: The World That Was');}
 symbol(args:p.symbol_arguments):p.symbol_result{return new p.symbol_result('AFTL');}
 uri(args:p.uri_arguments):p.uri_result{return new p.uri_result(this.cfg().base_uri);}
 token_uri(args:p.token_uri_arguments):p.token_uri_result{const id=this.tokenId(args.token_id);this.token(id);return new p.token_uri_result('data:application/json;base64,'+Base64.encode(StringBytes.stringToBytes(this.artifact(id).metadata!)));}
 owner(args:p.owner_arguments):p.owner_result{return new p.owner_result(this.id);}
 royalties(args:p.royalties_arguments):p.royalties_result{return new p.royalties_result();}
 total_supply(args:p.total_supply_arguments):p.total_supply_result{return new p.total_supply_result(this.count.get()!.value);}
 balance_of(args:p.balance_of_arguments):p.balance_of_result{return new p.balance_of_result(this.balance(this.address(args.owner)));}
 owner_of(args:p.owner_of_arguments):p.owner_of_result{return new p.owner_of_result(this.token(this.tokenId(args.token_id)).owner);}
 get_approved(args:p.get_approved_arguments):p.get_approved_result{return new p.get_approved_result(this.token(this.tokenId(args.token_id)).approved);}
 is_approved_for_all(args:p.is_approved_for_all_arguments):p.is_approved_for_all_result{return new p.is_approved_for_all_result(this.operators.get(this.pair(this.address(args.owner),this.address(args.operator)))!.value);}
 get_config(args:p.get_config_arguments):p.get_config_result{return new p.get_config_result(this.config.get());}
 get_metadata(args:p.get_metadata_arguments):p.get_metadata_result{const id=this.tokenId(args.token_id);this.token(id);return new p.get_metadata_result(this.artifact(id).metadata);}
 get_listing(args:p.get_listing_arguments):p.get_listing_result{
  const id=this.tokenId(args.token_id),t=this.tokens.get(id);if(t==null)return new p.get_listing_result();
  const c=this.cfg();if(Arrays.equal(t!.owner!,this.id))return new p.get_listing_result(new p.listing(this.id,PRICE,t!.revision,0,true,c.launched&&!c.paused));
  const sale=this.listings.get(id);if(sale==null)return new p.get_listing_result();
  sale!.active=c.launched&&!c.paused&&Arrays.equal(sale!.seller!,t!.owner!)&&sale!.revision==t!.revision&&sale!.expires_at>this.now();
  return new p.get_listing_result(sale);
 }
 get_tokens(args:p.get_tokens_arguments):p.get_tokens_result{
  System.require(args.limit>=1&&args.limit<=25,'page limit must be 1 through 25');const start:u32=args.start==0?1:args.start;System.require(start<=CAP+1,'invalid start');
  const out=new Array<p.token_view>();for(let i=start;i<=CAP&&i<start+args.limit;i++){const id=StringBytes.stringToBytes(i.toString()),t=this.tokens.get(id);if(t!=null)out.push(new p.token_view(id,t!.owner,this.get_listing(new p.get_listing_arguments(id)).value));}
  return new p.get_tokens_result(out);
 }
 initialize(args:p.initialize_arguments):p.initialize_result{
  this.admin();System.require(this.config.get()==null,'already initialized');
  const archive=this.address(args.archive),treasury=this.address(args.treasury),payment=this.address(args.payment_token);
  System.require(!Arrays.equal(archive,this.id)&&!Arrays.equal(treasury,this.id)&&!Arrays.equal(payment,this.id)&&!Arrays.equal(archive,payment),'invalid role address');
  System.require(args.base_uri!=null&&StringBytes.stringToBytes(args.base_uri!).length<=512,'invalid base URI');
  this.config.put(new p.configuration(archive,treasury,payment,args.base_uri,false,false));return new p.initialize_result();
 }
 mint(args:p.mint_arguments):p.mint_result{
  this.admin();const c=this.cfg();System.require(!c.launched,'collection already launched');
  const id=this.tokenId(args.token_id);System.require(this.tokens.get(id)==null,'token already minted');
  const n=this.count.get()!.value;System.require(n<CAP&&this.number(id)==n+1,'mint tokens in order');
  this.artifact(id);this.tokens.put(id,new p.token_record(this.id));this.count.put(new p.number_record(n+1));this.balances.put(this.id,new p.number_record(this.balance(this.id)+1));
  System.event('collections.mint_event',Protobuf.encode(new p.mint_event(this.id,id),p.mint_event.encode),[this.id]);return new p.mint_result();
 }
 open_sales(args:p.open_sales_arguments):p.open_sales_result{
  this.admin();const c=this.cfg();System.require(!c.launched,'already launched');System.require(this.count.get()!.value==CAP,'mint all 100 works first');
  const a=this.archiveStatus();System.require(a.sealed&&a.minted==CAP+1&&a.supply_cap==CAP,'archive must be complete and sealed');
  c.launched=true;this.config.put(c);return new p.open_sales_result();
 }
 set_paused(args:p.set_paused_arguments):p.set_paused_result{this.admin();const c=this.cfg();c.paused=args.paused;this.config.put(c);return new p.set_paused_result();}
 transfer(args:p.transfer_arguments):p.transfer_result{
  this.guard();const from=this.address(args.from),to=this.address(args.to),id=this.tokenId(args.token_id),t=this.token(id);
  System.require(!Arrays.equal(from,this.id)&&!Arrays.equal(to,this.id),'primary inventory moves only through purchase');
  System.require(Arrays.equal(from,t.owner!),'from is not owner');let ok=System.checkAuthority(authority.authorization_type.contract_call,from);
  if(!ok&&t.approved!=null&&t.approved!.length==25)ok=System.checkAuthority(authority.authorization_type.contract_call,t.approved!);
  if(!ok){const operators=this.operatorLists.get(from)!;for(let i=0;i<operators.values.length;i++){if(System.checkAuthority(authority.authorization_type.contract_call,operators.values[i])){ok=true;break;}}}
  System.require(ok,'transfer not authorized');this.move(id,t,to);return new p.transfer_result();
 }
 approve(args:p.approve_arguments):p.approve_result{
  this.guard();const from=this.address(args.approver_address),id=this.tokenId(args.token_id),t=this.token(id);System.require(!Arrays.equal(from,this.id),'cannot approve primary inventory');
  System.require(Arrays.equal(from,t.owner!),'approver is not owner');System.requireAuthority(authority.authorization_type.contract_call,from);
  const to=args.to;if(to!=null&&to!.length>0){this.address(to);System.require(!Arrays.equal(from,to!),'cannot approve yourself');}
  t.approved=to;this.tokens.put(id,t);System.event('collections.token_approval_event',Protobuf.encode(new p.token_approval_event(from,to,id),p.token_approval_event.encode),[from]);return new p.approve_result();
 }
 set_approval_for_all(args:p.set_approval_for_all_arguments):p.set_approval_for_all_result{
  this.guard();const from=this.address(args.approver_address),operator=this.address(args.operator_address);
  System.require(!Arrays.equal(from,this.id)&&!Arrays.equal(from,operator),'invalid operator owner');System.requireAuthority(authority.authorization_type.contract_call,from);
  const list=this.operatorLists.get(from)!;let found:i32=-1;for(let i=0;i<list.values.length;i++){if(Arrays.equal(list.values[i],operator))found=i;}
  if(args.approved&&found<0){System.require(list.values.length<16,'maximum 16 operators');list.values.push(operator);}
  if(!args.approved&&found>=0)list.values.splice(found,1);this.operatorLists.put(from,list);
  this.operators.put(this.pair(from,operator),new p.bool_record(args.approved));System.event('collections.operator_approval_event',Protobuf.encode(new p.operator_approval_event(from,operator,args.approved),p.operator_approval_event.encode),[from,operator]);return new p.set_approval_for_all_result();
 }
 list_token(args:p.list_token_arguments):p.list_token_result{
  this.guard();const c=this.cfg();System.require(c.launched&&!c.paused,'marketplace is not open');const seller=this.address(args.seller),id=this.tokenId(args.token_id),t=this.token(id);
  System.require(Arrays.equal(seller,t.owner!)&&!Arrays.equal(seller,this.id),'seller is not the owner');System.requireAuthority(authority.authorization_type.contract_call,seller);
  System.require(args.price>0&&args.price<=MAX_PRICE,'invalid price');const now=this.now();System.require(args.expires_at>now&&args.expires_at<=now+MAX_LISTING_MS,'invalid listing expiry');
  this.bump(t);this.tokens.put(id,t);const sale=new p.listing(seller,args.price,t.revision,args.expires_at,false,true);this.listings.put(id,sale);
  System.event('afterlight.listing_event',Protobuf.encode(new p.listing_event(id,sale),p.listing_event.encode),[seller]);return new p.list_token_result();
 }
 cancel_listing(args:p.cancel_listing_arguments):p.cancel_listing_result{
  this.guard();const seller=this.address(args.seller),id=this.tokenId(args.token_id),t=this.token(id);System.require(Arrays.equal(seller,t.owner!),'seller is not the owner');System.requireAuthority(authority.authorization_type.contract_call,seller);
  System.require(this.listings.get(id)!=null,'no listing');this.listings.remove(id);this.bump(t);this.tokens.put(id,t);
  System.event('afterlight.listing_event',Protobuf.encode(new p.listing_event(id),p.listing_event.encode),[seller]);return new p.cancel_listing_result();
 }
 buy(args:p.buy_arguments):p.buy_result{
  this.guard();const c=this.cfg();System.require(c.launched&&!c.paused,'marketplace is not open');
  const buyer=this.address(args.buyer),id=this.tokenId(args.token_id),expected=this.address(args.expected_seller),t=this.token(id),sale=this.get_listing(new p.get_listing_arguments(id)).value;
  System.require(sale!=null&&sale!.active,'listing unavailable');const s=sale!;
  System.require(!Arrays.equal(buyer,s.seller!)&&!Arrays.equal(buyer,this.id),'cannot buy your own listing');
  System.require(Arrays.equal(expected,s.seller!)&&args.expected_price==s.price&&args.expected_revision==s.revision,'listing changed; refresh before buying');
  const now=this.now();System.require(args.deadline>now&&args.deadline<=now+MAX_QUOTE_MS,'purchase quote expired or invalid');
  System.requireAuthority(authority.authorization_type.contract_call,buyer);
  this.locked.put(new p.bool_record(true));const recipient=s.primary?c.treasury!:s.seller!;
  // Both effects share the same blockchain transaction. Any failed KOIN transfer reverts everything.
  this.move(id,t,buyer);const koin=new Token(c.payment_token!);System.require(koin.transfer(buyer,recipient,s.price),'KOIN payment failed');
  this.locked.put(new p.bool_record(false));
  System.event('afterlight.sale_event',Protobuf.encode(new p.sale_event(id,s.seller,buyer,s.price,s.primary,s.revision),p.sale_event.encode),[buyer,recipient]);return new p.buy_result();
 }
}

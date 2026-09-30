import {System, Storage, Protobuf, authority, Arrays, Crypto, StringBytes} from '@koinos/sdk-as';
import {afterlight as p} from './proto/afterlight';
System.setSystemBufferSize(32 * 1024);
const CHUNK:u32=16384, MAX_BYTES:u32=200000, CAP:u32=100;
/** Permanent archive. Deployment MUST override upload authority only; authorize always denies upgrades. */
export class Archive {
 id:Uint8Array=System.getContractId();
 artifacts:Storage.Map<string,p.artifact>=new Storage.Map<string,p.artifact>(this.id,1,p.artifact.decode,p.artifact.encode,null);
 chunks:Storage.Map<Uint8Array,p.chunk_record>=new Storage.Map<Uint8Array,p.chunk_record>(this.id,2,p.chunk_record.decode,p.chunk_record.encode,null);
 count:Storage.Obj<p.number_record>=new Storage.Obj<p.number_record>(this.id,3,p.number_record.decode,p.number_record.encode,()=>new p.number_record());
 frozen:Storage.Obj<p.bool_record>=new Storage.Obj<p.bool_record>(this.id,4,p.bool_record.decode,p.bool_record.encode,()=>new p.bool_record());
 authorize(args:authority.authorize_arguments):authority.authorize_result{return new authority.authorize_result(false);}
 admin():void{System.requireAuthority(authority.authorization_type.contract_call,this.id);}
 artifact(id:u32):p.artifact{const a=this.artifacts.get(id.toString());System.require(a!=null,'artifact not found');return a!;}
 key(id:u32,index:u32):Uint8Array{const b=new Uint8Array(8);for(let i:u32=0;i<4;i++){b[i]=<u8>(id>>(i*8));b[i+4]=<u8>(index>>(i*8));}return b;}
 get_status(args:p.get_status_arguments):p.get_status_result{return new p.get_status_result(<u32>this.count.get()!.value,this.frozen.get()!.value,CAP,CHUNK,MAX_BYTES);}
 get_artifact(args:p.get_artifact_arguments):p.get_artifact_result{return new p.get_artifact_result(this.artifacts.get(args.artifact_id.toString()));}
 get_chunk(args:p.get_chunk_arguments):p.get_chunk_result{const a=this.artifact(args.artifact_id);System.require(a.finalized,'artifact not finalized');System.require(args.index<a.chunks,'chunk index out of bounds');return new p.get_chunk_result(this.chunks.get(this.key(args.artifact_id,args.index))!.value);}
 begin_artifact(args:p.begin_artifact_arguments):p.begin_artifact_result{
  this.admin();System.require(!this.frozen.get()!.value,'archive sealed');
  System.require(args.artifact_id>=1&&args.artifact_id<=CAP+1,'artifact id out of bounds');
  System.require(this.artifacts.get(args.artifact_id.toString())==null,'artifact already exists');
  System.require(args.byte_length>0&&args.byte_length<=MAX_BYTES,'artifact exceeds 200000 bytes');
  System.require(args.sha256!=null&&args.sha256!.length==32,'invalid SHA-256');
  System.require(args.name!=null&&StringBytes.stringToBytes(args.name!).length>0&&StringBytes.stringToBytes(args.name!).length<=100,'invalid name');
  System.require(args.metadata!=null&&StringBytes.stringToBytes(args.metadata!).length<=8192,'metadata too large');
  System.require(args.artifact_id==CAP+1?args.mime=='text/html':args.mime=='image/webp','unsupported media type');
  this.artifacts.put(args.artifact_id.toString(),new p.artifact(args.artifact_id,args.name,args.mime,args.byte_length,args.sha256,args.metadata,(args.byte_length+CHUNK-1)/CHUNK,0,false));
  return new p.begin_artifact_result();
 }
 upload_chunk(args:p.upload_chunk_arguments):p.upload_chunk_result{
  this.admin();System.require(!this.frozen.get()!.value,'archive sealed');const a=this.artifact(args.artifact_id);
  System.require(!a.finalized,'artifact finalized');System.require(args.index==a.uploaded&&args.index<a.chunks,'chunks must be uploaded in order');
  const remaining=a.byte_length-args.index*CHUNK,expected=remaining>CHUNK?CHUNK:remaining;
  System.require(args.data!=null&&<u32>args.data!.length==expected,'incorrect chunk size');
  const k=this.key(args.artifact_id,args.index);System.require(this.chunks.get(k)==null,'chunk already stored');
  this.chunks.put(k,new p.chunk_record(args.data));a.uploaded++;this.artifacts.put(args.artifact_id.toString(),a);return new p.upload_chunk_result();
 }
 finalize_artifact(args:p.finalize_artifact_arguments):p.finalize_artifact_result{
  this.admin();System.require(!this.frozen.get()!.value,'archive sealed');const a=this.artifact(args.artifact_id);
  System.require(!a.finalized,'artifact finalized');System.require(a.uploaded==a.chunks,'upload incomplete');
  const data=new Uint8Array(a.byte_length);for(let i:u32=0;i<a.chunks;i++){const chunk=this.chunks.get(this.key(args.artifact_id,i));System.require(chunk!=null,'missing chunk');data.set(chunk!.value!,i*CHUNK);}
  const digest=System.hash(Crypto.multicodec.sha2_256,data)!;System.require(Arrays.equal(digest.slice(2),a.sha256!),'image hash mismatch');
  a.finalized=true;this.artifacts.put(args.artifact_id.toString(),a);this.count.put(new p.number_record(this.count.get()!.value+1));return new p.finalize_artifact_result();
 }
 seal_archive(args:p.seal_archive_arguments):p.seal_archive_result{
  this.admin();System.require(!this.frozen.get()!.value,'already sealed');
  System.require(this.count.get()!.value==CAP+1,'finalize all 100 artworks and the recovery viewer first');
  this.frozen.put(new p.bool_record(true));return new p.seal_archive_result();
 }
}

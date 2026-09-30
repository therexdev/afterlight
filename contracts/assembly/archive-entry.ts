import{System,Protobuf,authority}from'@koinos/sdk-as';import{Archive}from'./Archive';import{afterlight as p}from'./proto/afterlight';
export function main():i32{const a=System.getArguments();const c=new Archive();let out=new Uint8Array(0);switch(a.entry_point){case 0x4a2dbd90:out=Protobuf.encode(c.authorize(Protobuf.decode<authority.authorize_arguments>(a.args,authority.authorize_arguments.decode)),authority.authorize_result.encode);break;
case 0x72cdbfdd:out=Protobuf.encode(c.get_status(Protobuf.decode<p.get_status_arguments>(a.args,p.get_status_arguments.decode)),p.get_status_result.encode);break;
case 0x9dd471ab:out=Protobuf.encode(c.get_artifact(Protobuf.decode<p.get_artifact_arguments>(a.args,p.get_artifact_arguments.decode)),p.get_artifact_result.encode);break;
case 0x92b1fc90:out=Protobuf.encode(c.get_chunk(Protobuf.decode<p.get_chunk_arguments>(a.args,p.get_chunk_arguments.decode)),p.get_chunk_result.encode);break;
case 0xc7dc717e:out=Protobuf.encode(c.begin_artifact(Protobuf.decode<p.begin_artifact_arguments>(a.args,p.begin_artifact_arguments.decode)),p.begin_artifact_result.encode);break;
case 0x66f126aa:out=Protobuf.encode(c.upload_chunk(Protobuf.decode<p.upload_chunk_arguments>(a.args,p.upload_chunk_arguments.decode)),p.upload_chunk_result.encode);break;
case 0xf3b44a9f:out=Protobuf.encode(c.finalize_artifact(Protobuf.decode<p.finalize_artifact_arguments>(a.args,p.finalize_artifact_arguments.decode)),p.finalize_artifact_result.encode);break;
case 0x77dd7939:out=Protobuf.encode(c.seal_archive(Protobuf.decode<p.seal_archive_arguments>(a.args,p.seal_archive_arguments.decode)),p.seal_archive_result.encode);break;default:System.exit(1);return 1;}System.exit(0,out);return 0;}main();

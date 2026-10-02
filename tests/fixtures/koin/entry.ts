import {System,Protobuf,kcs4} from '@koinos/sdk-as';
import {Koin} from './Koin';
// Test-only wrapper around the unmodified upstream KOIN implementation.
const c=new Koin(),a=System.getArguments();let out=new Uint8Array(0);
switch(a.entry_point){
 case 0x74e21680:out=Protobuf.encode(c.approve(Protobuf.decode<kcs4.approve_arguments>(a.args,kcs4.approve_arguments.decode)),kcs4.approve_result.encode);break;
 case 0x27f576ca:out=Protobuf.encode(c.transfer(Protobuf.decode<kcs4.transfer_arguments>(a.args,kcs4.transfer_arguments.decode)),kcs4.transfer_result.encode);break;
 case 0x32f09fa1:out=Protobuf.encode(c.allowance(Protobuf.decode<kcs4.allowance_arguments>(a.args,kcs4.allowance_arguments.decode)),kcs4.allowance_result.encode);break;
 case 0x5c721497:out=Protobuf.encode(c.balance_of(Protobuf.decode<kcs4.balance_of_arguments>(a.args,kcs4.balance_of_arguments.decode)),kcs4.balance_of_result.encode);break;
 case 0xdc6f17bb:out=Protobuf.encode(c.mint(Protobuf.decode<kcs4.mint_arguments>(a.args,kcs4.mint_arguments.decode)),kcs4.mint_result.encode);break;
 default:System.exit(1);
}
System.exit(0,out);

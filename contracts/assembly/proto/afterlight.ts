import { Writer, Reader } from "as-proto";

export namespace afterlight {
  export class royalty {
    static encode(message: royalty, writer: Writer): void {
      if (message.percentage != 0) {
        writer.uint32(8);
        writer.uint64(message.percentage);
      }

      const unique_name_address = message.address;
      if (unique_name_address !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_address);
      }
    }

    static decode(reader: Reader, length: i32): royalty {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new royalty();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.percentage = reader.uint64();
            break;

          case 2:
            message.address = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    percentage: u64;
    address: Uint8Array | null;

    constructor(percentage: u64 = 0, address: Uint8Array | null = null) {
      this.percentage = percentage;
      this.address = address;
    }
  }

  export class artifact {
    static encode(message: artifact, writer: Writer): void {
      if (message.artifact_id != 0) {
        writer.uint32(8);
        writer.uint32(message.artifact_id);
      }

      const unique_name_name = message.name;
      if (unique_name_name !== null) {
        writer.uint32(18);
        writer.string(unique_name_name);
      }

      const unique_name_mime = message.mime;
      if (unique_name_mime !== null) {
        writer.uint32(26);
        writer.string(unique_name_mime);
      }

      if (message.byte_length != 0) {
        writer.uint32(32);
        writer.uint32(message.byte_length);
      }

      const unique_name_sha256 = message.sha256;
      if (unique_name_sha256 !== null) {
        writer.uint32(42);
        writer.bytes(unique_name_sha256);
      }

      const unique_name_metadata = message.metadata;
      if (unique_name_metadata !== null) {
        writer.uint32(50);
        writer.string(unique_name_metadata);
      }

      if (message.chunks != 0) {
        writer.uint32(56);
        writer.uint32(message.chunks);
      }

      if (message.uploaded != 0) {
        writer.uint32(64);
        writer.uint32(message.uploaded);
      }

      if (message.finalized != false) {
        writer.uint32(72);
        writer.bool(message.finalized);
      }
    }

    static decode(reader: Reader, length: i32): artifact {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new artifact();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.artifact_id = reader.uint32();
            break;

          case 2:
            message.name = reader.string();
            break;

          case 3:
            message.mime = reader.string();
            break;

          case 4:
            message.byte_length = reader.uint32();
            break;

          case 5:
            message.sha256 = reader.bytes();
            break;

          case 6:
            message.metadata = reader.string();
            break;

          case 7:
            message.chunks = reader.uint32();
            break;

          case 8:
            message.uploaded = reader.uint32();
            break;

          case 9:
            message.finalized = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    artifact_id: u32;
    name: string | null;
    mime: string | null;
    byte_length: u32;
    sha256: Uint8Array | null;
    metadata: string | null;
    chunks: u32;
    uploaded: u32;
    finalized: bool;

    constructor(
      artifact_id: u32 = 0,
      name: string | null = null,
      mime: string | null = null,
      byte_length: u32 = 0,
      sha256: Uint8Array | null = null,
      metadata: string | null = null,
      chunks: u32 = 0,
      uploaded: u32 = 0,
      finalized: bool = false
    ) {
      this.artifact_id = artifact_id;
      this.name = name;
      this.mime = mime;
      this.byte_length = byte_length;
      this.sha256 = sha256;
      this.metadata = metadata;
      this.chunks = chunks;
      this.uploaded = uploaded;
      this.finalized = finalized;
    }
  }

  export class token_record {
    static encode(message: token_record, writer: Writer): void {
      const unique_name_owner = message.owner;
      if (unique_name_owner !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_owner);
      }

      const unique_name_approved = message.approved;
      if (unique_name_approved !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_approved);
      }

      if (message.revision != 0) {
        writer.uint32(24);
        writer.uint64(message.revision);
      }
    }

    static decode(reader: Reader, length: i32): token_record {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new token_record();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.owner = reader.bytes();
            break;

          case 2:
            message.approved = reader.bytes();
            break;

          case 3:
            message.revision = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    owner: Uint8Array | null;
    approved: Uint8Array | null;
    revision: u64;

    constructor(
      owner: Uint8Array | null = null,
      approved: Uint8Array | null = null,
      revision: u64 = 0
    ) {
      this.owner = owner;
      this.approved = approved;
      this.revision = revision;
    }
  }

  @unmanaged
  export class number_record {
    static encode(message: number_record, writer: Writer): void {
      if (message.value != 0) {
        writer.uint32(8);
        writer.uint64(message.value);
      }
    }

    static decode(reader: Reader, length: i32): number_record {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new number_record();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: u64;

    constructor(value: u64 = 0) {
      this.value = value;
    }
  }

  @unmanaged
  export class bool_record {
    static encode(message: bool_record, writer: Writer): void {
      if (message.value != false) {
        writer.uint32(8);
        writer.bool(message.value);
      }
    }

    static decode(reader: Reader, length: i32): bool_record {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new bool_record();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: bool;

    constructor(value: bool = false) {
      this.value = value;
    }
  }

  export class chunk_record {
    static encode(message: chunk_record, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_value);
      }
    }

    static decode(reader: Reader, length: i32): chunk_record {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new chunk_record();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: Uint8Array | null;

    constructor(value: Uint8Array | null = null) {
      this.value = value;
    }
  }

  export class operator_list {
    static encode(message: operator_list, writer: Writer): void {
      const unique_name_values = message.values;
      if (unique_name_values.length !== 0) {
        for (let i = 0; i < unique_name_values.length; ++i) {
          writer.uint32(10);
          writer.bytes(unique_name_values[i]);
        }
      }
    }

    static decode(reader: Reader, length: i32): operator_list {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new operator_list();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.values.push(reader.bytes());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    values: Array<Uint8Array>;

    constructor(values: Array<Uint8Array> = []) {
      this.values = values;
    }
  }

  export class configuration {
    static encode(message: configuration, writer: Writer): void {
      const unique_name_archive = message.archive;
      if (unique_name_archive !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_archive);
      }

      const unique_name_treasury = message.treasury;
      if (unique_name_treasury !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_treasury);
      }

      const unique_name_payment_token = message.payment_token;
      if (unique_name_payment_token !== null) {
        writer.uint32(26);
        writer.bytes(unique_name_payment_token);
      }

      const unique_name_base_uri = message.base_uri;
      if (unique_name_base_uri !== null) {
        writer.uint32(34);
        writer.string(unique_name_base_uri);
      }

      if (message.launched != false) {
        writer.uint32(40);
        writer.bool(message.launched);
      }

      if (message.paused != false) {
        writer.uint32(48);
        writer.bool(message.paused);
      }
    }

    static decode(reader: Reader, length: i32): configuration {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new configuration();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.archive = reader.bytes();
            break;

          case 2:
            message.treasury = reader.bytes();
            break;

          case 3:
            message.payment_token = reader.bytes();
            break;

          case 4:
            message.base_uri = reader.string();
            break;

          case 5:
            message.launched = reader.bool();
            break;

          case 6:
            message.paused = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    archive: Uint8Array | null;
    treasury: Uint8Array | null;
    payment_token: Uint8Array | null;
    base_uri: string | null;
    launched: bool;
    paused: bool;

    constructor(
      archive: Uint8Array | null = null,
      treasury: Uint8Array | null = null,
      payment_token: Uint8Array | null = null,
      base_uri: string | null = null,
      launched: bool = false,
      paused: bool = false
    ) {
      this.archive = archive;
      this.treasury = treasury;
      this.payment_token = payment_token;
      this.base_uri = base_uri;
      this.launched = launched;
      this.paused = paused;
    }
  }

  export class listing {
    static encode(message: listing, writer: Writer): void {
      const unique_name_seller = message.seller;
      if (unique_name_seller !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_seller);
      }

      if (message.price != 0) {
        writer.uint32(16);
        writer.uint64(message.price);
      }

      if (message.revision != 0) {
        writer.uint32(24);
        writer.uint64(message.revision);
      }

      if (message.expires_at != 0) {
        writer.uint32(32);
        writer.uint64(message.expires_at);
      }

      if (message.primary != false) {
        writer.uint32(40);
        writer.bool(message.primary);
      }

      if (message.active != false) {
        writer.uint32(48);
        writer.bool(message.active);
      }
    }

    static decode(reader: Reader, length: i32): listing {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new listing();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.seller = reader.bytes();
            break;

          case 2:
            message.price = reader.uint64();
            break;

          case 3:
            message.revision = reader.uint64();
            break;

          case 4:
            message.expires_at = reader.uint64();
            break;

          case 5:
            message.primary = reader.bool();
            break;

          case 6:
            message.active = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    seller: Uint8Array | null;
    price: u64;
    revision: u64;
    expires_at: u64;
    primary: bool;
    active: bool;

    constructor(
      seller: Uint8Array | null = null,
      price: u64 = 0,
      revision: u64 = 0,
      expires_at: u64 = 0,
      primary: bool = false,
      active: bool = false
    ) {
      this.seller = seller;
      this.price = price;
      this.revision = revision;
      this.expires_at = expires_at;
      this.primary = primary;
      this.active = active;
    }
  }

  export class token_view {
    static encode(message: token_view, writer: Writer): void {
      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_token_id);
      }

      const unique_name_owner = message.owner;
      if (unique_name_owner !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_owner);
      }

      const unique_name_sale = message.sale;
      if (unique_name_sale !== null) {
        writer.uint32(26);
        writer.fork();
        listing.encode(unique_name_sale, writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): token_view {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new token_view();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.token_id = reader.bytes();
            break;

          case 2:
            message.owner = reader.bytes();
            break;

          case 3:
            message.sale = listing.decode(reader, reader.uint32());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    token_id: Uint8Array | null;
    owner: Uint8Array | null;
    sale: listing | null;

    constructor(
      token_id: Uint8Array | null = null,
      owner: Uint8Array | null = null,
      sale: listing | null = null
    ) {
      this.token_id = token_id;
      this.owner = owner;
      this.sale = sale;
    }
  }

  export class mint_event {
    static encode(message: mint_event, writer: Writer): void {
      const unique_name_to = message.to;
      if (unique_name_to !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_to);
      }

      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_token_id);
      }
    }

    static decode(reader: Reader, length: i32): mint_event {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new mint_event();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.to = reader.bytes();
            break;

          case 2:
            message.token_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    to: Uint8Array | null;
    token_id: Uint8Array | null;

    constructor(
      to: Uint8Array | null = null,
      token_id: Uint8Array | null = null
    ) {
      this.to = to;
      this.token_id = token_id;
    }
  }

  export class transfer_event {
    static encode(message: transfer_event, writer: Writer): void {
      const unique_name_from = message.from;
      if (unique_name_from !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_from);
      }

      const unique_name_to = message.to;
      if (unique_name_to !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_to);
      }

      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(26);
        writer.bytes(unique_name_token_id);
      }
    }

    static decode(reader: Reader, length: i32): transfer_event {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new transfer_event();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.from = reader.bytes();
            break;

          case 2:
            message.to = reader.bytes();
            break;

          case 3:
            message.token_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    from: Uint8Array | null;
    to: Uint8Array | null;
    token_id: Uint8Array | null;

    constructor(
      from: Uint8Array | null = null,
      to: Uint8Array | null = null,
      token_id: Uint8Array | null = null
    ) {
      this.from = from;
      this.to = to;
      this.token_id = token_id;
    }
  }

  export class token_approval_event {
    static encode(message: token_approval_event, writer: Writer): void {
      const unique_name_approver_address = message.approver_address;
      if (unique_name_approver_address !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_approver_address);
      }

      const unique_name_to = message.to;
      if (unique_name_to !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_to);
      }

      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(26);
        writer.bytes(unique_name_token_id);
      }
    }

    static decode(reader: Reader, length: i32): token_approval_event {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new token_approval_event();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.approver_address = reader.bytes();
            break;

          case 2:
            message.to = reader.bytes();
            break;

          case 3:
            message.token_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    approver_address: Uint8Array | null;
    to: Uint8Array | null;
    token_id: Uint8Array | null;

    constructor(
      approver_address: Uint8Array | null = null,
      to: Uint8Array | null = null,
      token_id: Uint8Array | null = null
    ) {
      this.approver_address = approver_address;
      this.to = to;
      this.token_id = token_id;
    }
  }

  export class operator_approval_event {
    static encode(message: operator_approval_event, writer: Writer): void {
      const unique_name_approver_address = message.approver_address;
      if (unique_name_approver_address !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_approver_address);
      }

      const unique_name_operator_address = message.operator_address;
      if (unique_name_operator_address !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_operator_address);
      }

      if (message.approved != false) {
        writer.uint32(24);
        writer.bool(message.approved);
      }
    }

    static decode(reader: Reader, length: i32): operator_approval_event {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new operator_approval_event();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.approver_address = reader.bytes();
            break;

          case 2:
            message.operator_address = reader.bytes();
            break;

          case 3:
            message.approved = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    approver_address: Uint8Array | null;
    operator_address: Uint8Array | null;
    approved: bool;

    constructor(
      approver_address: Uint8Array | null = null,
      operator_address: Uint8Array | null = null,
      approved: bool = false
    ) {
      this.approver_address = approver_address;
      this.operator_address = operator_address;
      this.approved = approved;
    }
  }

  export class sale_event {
    static encode(message: sale_event, writer: Writer): void {
      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_token_id);
      }

      const unique_name_seller = message.seller;
      if (unique_name_seller !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_seller);
      }

      const unique_name_buyer = message.buyer;
      if (unique_name_buyer !== null) {
        writer.uint32(26);
        writer.bytes(unique_name_buyer);
      }

      if (message.price != 0) {
        writer.uint32(32);
        writer.uint64(message.price);
      }

      if (message.primary != false) {
        writer.uint32(40);
        writer.bool(message.primary);
      }

      if (message.revision != 0) {
        writer.uint32(48);
        writer.uint64(message.revision);
      }
    }

    static decode(reader: Reader, length: i32): sale_event {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new sale_event();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.token_id = reader.bytes();
            break;

          case 2:
            message.seller = reader.bytes();
            break;

          case 3:
            message.buyer = reader.bytes();
            break;

          case 4:
            message.price = reader.uint64();
            break;

          case 5:
            message.primary = reader.bool();
            break;

          case 6:
            message.revision = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    token_id: Uint8Array | null;
    seller: Uint8Array | null;
    buyer: Uint8Array | null;
    price: u64;
    primary: bool;
    revision: u64;

    constructor(
      token_id: Uint8Array | null = null,
      seller: Uint8Array | null = null,
      buyer: Uint8Array | null = null,
      price: u64 = 0,
      primary: bool = false,
      revision: u64 = 0
    ) {
      this.token_id = token_id;
      this.seller = seller;
      this.buyer = buyer;
      this.price = price;
      this.primary = primary;
      this.revision = revision;
    }
  }

  export class listing_event {
    static encode(message: listing_event, writer: Writer): void {
      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_token_id);
      }

      const unique_name_sale = message.sale;
      if (unique_name_sale !== null) {
        writer.uint32(18);
        writer.fork();
        listing.encode(unique_name_sale, writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): listing_event {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new listing_event();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.token_id = reader.bytes();
            break;

          case 2:
            message.sale = listing.decode(reader, reader.uint32());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    token_id: Uint8Array | null;
    sale: listing | null;

    constructor(
      token_id: Uint8Array | null = null,
      sale: listing | null = null
    ) {
      this.token_id = token_id;
      this.sale = sale;
    }
  }

  @unmanaged
  export class get_status_arguments {
    static encode(message: get_status_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): get_status_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_status_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  @unmanaged
  export class get_status_result {
    static encode(message: get_status_result, writer: Writer): void {
      if (message.minted != 0) {
        writer.uint32(8);
        writer.uint32(message.minted);
      }

      if (message.sealed != false) {
        writer.uint32(16);
        writer.bool(message.sealed);
      }

      if (message.supply_cap != 0) {
        writer.uint32(24);
        writer.uint32(message.supply_cap);
      }

      if (message.chunk_bytes != 0) {
        writer.uint32(32);
        writer.uint32(message.chunk_bytes);
      }

      if (message.max_artifact_bytes != 0) {
        writer.uint32(40);
        writer.uint32(message.max_artifact_bytes);
      }
    }

    static decode(reader: Reader, length: i32): get_status_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_status_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.minted = reader.uint32();
            break;

          case 2:
            message.sealed = reader.bool();
            break;

          case 3:
            message.supply_cap = reader.uint32();
            break;

          case 4:
            message.chunk_bytes = reader.uint32();
            break;

          case 5:
            message.max_artifact_bytes = reader.uint32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    minted: u32;
    sealed: bool;
    supply_cap: u32;
    chunk_bytes: u32;
    max_artifact_bytes: u32;

    constructor(
      minted: u32 = 0,
      sealed: bool = false,
      supply_cap: u32 = 0,
      chunk_bytes: u32 = 0,
      max_artifact_bytes: u32 = 0
    ) {
      this.minted = minted;
      this.sealed = sealed;
      this.supply_cap = supply_cap;
      this.chunk_bytes = chunk_bytes;
      this.max_artifact_bytes = max_artifact_bytes;
    }
  }

  @unmanaged
  export class get_artifact_arguments {
    static encode(message: get_artifact_arguments, writer: Writer): void {
      if (message.artifact_id != 0) {
        writer.uint32(8);
        writer.uint32(message.artifact_id);
      }
    }

    static decode(reader: Reader, length: i32): get_artifact_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_artifact_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.artifact_id = reader.uint32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    artifact_id: u32;

    constructor(artifact_id: u32 = 0) {
      this.artifact_id = artifact_id;
    }
  }

  export class get_artifact_result {
    static encode(message: get_artifact_result, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value !== null) {
        writer.uint32(10);
        writer.fork();
        artifact.encode(unique_name_value, writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): get_artifact_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_artifact_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = artifact.decode(reader, reader.uint32());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: artifact | null;

    constructor(value: artifact | null = null) {
      this.value = value;
    }
  }

  @unmanaged
  export class get_chunk_arguments {
    static encode(message: get_chunk_arguments, writer: Writer): void {
      if (message.artifact_id != 0) {
        writer.uint32(8);
        writer.uint32(message.artifact_id);
      }

      if (message.index != 0) {
        writer.uint32(16);
        writer.uint32(message.index);
      }
    }

    static decode(reader: Reader, length: i32): get_chunk_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_chunk_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.artifact_id = reader.uint32();
            break;

          case 2:
            message.index = reader.uint32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    artifact_id: u32;
    index: u32;

    constructor(artifact_id: u32 = 0, index: u32 = 0) {
      this.artifact_id = artifact_id;
      this.index = index;
    }
  }

  export class get_chunk_result {
    static encode(message: get_chunk_result, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_value);
      }
    }

    static decode(reader: Reader, length: i32): get_chunk_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_chunk_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: Uint8Array | null;

    constructor(value: Uint8Array | null = null) {
      this.value = value;
    }
  }

  export class begin_artifact_arguments {
    static encode(message: begin_artifact_arguments, writer: Writer): void {
      if (message.artifact_id != 0) {
        writer.uint32(8);
        writer.uint32(message.artifact_id);
      }

      const unique_name_name = message.name;
      if (unique_name_name !== null) {
        writer.uint32(18);
        writer.string(unique_name_name);
      }

      const unique_name_mime = message.mime;
      if (unique_name_mime !== null) {
        writer.uint32(26);
        writer.string(unique_name_mime);
      }

      if (message.byte_length != 0) {
        writer.uint32(32);
        writer.uint32(message.byte_length);
      }

      const unique_name_sha256 = message.sha256;
      if (unique_name_sha256 !== null) {
        writer.uint32(42);
        writer.bytes(unique_name_sha256);
      }

      const unique_name_metadata = message.metadata;
      if (unique_name_metadata !== null) {
        writer.uint32(50);
        writer.string(unique_name_metadata);
      }
    }

    static decode(reader: Reader, length: i32): begin_artifact_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new begin_artifact_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.artifact_id = reader.uint32();
            break;

          case 2:
            message.name = reader.string();
            break;

          case 3:
            message.mime = reader.string();
            break;

          case 4:
            message.byte_length = reader.uint32();
            break;

          case 5:
            message.sha256 = reader.bytes();
            break;

          case 6:
            message.metadata = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    artifact_id: u32;
    name: string | null;
    mime: string | null;
    byte_length: u32;
    sha256: Uint8Array | null;
    metadata: string | null;

    constructor(
      artifact_id: u32 = 0,
      name: string | null = null,
      mime: string | null = null,
      byte_length: u32 = 0,
      sha256: Uint8Array | null = null,
      metadata: string | null = null
    ) {
      this.artifact_id = artifact_id;
      this.name = name;
      this.mime = mime;
      this.byte_length = byte_length;
      this.sha256 = sha256;
      this.metadata = metadata;
    }
  }

  @unmanaged
  export class begin_artifact_result {
    static encode(message: begin_artifact_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): begin_artifact_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new begin_artifact_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class upload_chunk_arguments {
    static encode(message: upload_chunk_arguments, writer: Writer): void {
      if (message.artifact_id != 0) {
        writer.uint32(8);
        writer.uint32(message.artifact_id);
      }

      if (message.index != 0) {
        writer.uint32(16);
        writer.uint32(message.index);
      }

      const unique_name_data = message.data;
      if (unique_name_data !== null) {
        writer.uint32(26);
        writer.bytes(unique_name_data);
      }
    }

    static decode(reader: Reader, length: i32): upload_chunk_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new upload_chunk_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.artifact_id = reader.uint32();
            break;

          case 2:
            message.index = reader.uint32();
            break;

          case 3:
            message.data = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    artifact_id: u32;
    index: u32;
    data: Uint8Array | null;

    constructor(
      artifact_id: u32 = 0,
      index: u32 = 0,
      data: Uint8Array | null = null
    ) {
      this.artifact_id = artifact_id;
      this.index = index;
      this.data = data;
    }
  }

  @unmanaged
  export class upload_chunk_result {
    static encode(message: upload_chunk_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): upload_chunk_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new upload_chunk_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  @unmanaged
  export class finalize_artifact_arguments {
    static encode(message: finalize_artifact_arguments, writer: Writer): void {
      if (message.artifact_id != 0) {
        writer.uint32(8);
        writer.uint32(message.artifact_id);
      }
    }

    static decode(reader: Reader, length: i32): finalize_artifact_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new finalize_artifact_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.artifact_id = reader.uint32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    artifact_id: u32;

    constructor(artifact_id: u32 = 0) {
      this.artifact_id = artifact_id;
    }
  }

  @unmanaged
  export class finalize_artifact_result {
    static encode(message: finalize_artifact_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): finalize_artifact_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new finalize_artifact_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  @unmanaged
  export class seal_archive_arguments {
    static encode(message: seal_archive_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): seal_archive_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new seal_archive_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  @unmanaged
  export class seal_archive_result {
    static encode(message: seal_archive_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): seal_archive_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new seal_archive_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  @unmanaged
  export class name_arguments {
    static encode(message: name_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): name_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new name_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class name_result {
    static encode(message: name_result, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value !== null) {
        writer.uint32(10);
        writer.string(unique_name_value);
      }
    }

    static decode(reader: Reader, length: i32): name_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new name_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: string | null;

    constructor(value: string | null = null) {
      this.value = value;
    }
  }

  @unmanaged
  export class symbol_arguments {
    static encode(message: symbol_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): symbol_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new symbol_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class symbol_result {
    static encode(message: symbol_result, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value !== null) {
        writer.uint32(10);
        writer.string(unique_name_value);
      }
    }

    static decode(reader: Reader, length: i32): symbol_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new symbol_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: string | null;

    constructor(value: string | null = null) {
      this.value = value;
    }
  }

  @unmanaged
  export class uri_arguments {
    static encode(message: uri_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): uri_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new uri_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class uri_result {
    static encode(message: uri_result, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value !== null) {
        writer.uint32(10);
        writer.string(unique_name_value);
      }
    }

    static decode(reader: Reader, length: i32): uri_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new uri_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: string | null;

    constructor(value: string | null = null) {
      this.value = value;
    }
  }

  export class token_uri_arguments {
    static encode(message: token_uri_arguments, writer: Writer): void {
      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_token_id);
      }
    }

    static decode(reader: Reader, length: i32): token_uri_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new token_uri_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.token_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    token_id: Uint8Array | null;

    constructor(token_id: Uint8Array | null = null) {
      this.token_id = token_id;
    }
  }

  export class token_uri_result {
    static encode(message: token_uri_result, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value !== null) {
        writer.uint32(10);
        writer.string(unique_name_value);
      }
    }

    static decode(reader: Reader, length: i32): token_uri_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new token_uri_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: string | null;

    constructor(value: string | null = null) {
      this.value = value;
    }
  }

  @unmanaged
  export class owner_arguments {
    static encode(message: owner_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): owner_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new owner_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class owner_result {
    static encode(message: owner_result, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_value);
      }
    }

    static decode(reader: Reader, length: i32): owner_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new owner_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: Uint8Array | null;

    constructor(value: Uint8Array | null = null) {
      this.value = value;
    }
  }

  @unmanaged
  export class total_supply_arguments {
    static encode(message: total_supply_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): total_supply_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new total_supply_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  @unmanaged
  export class total_supply_result {
    static encode(message: total_supply_result, writer: Writer): void {
      if (message.value != 0) {
        writer.uint32(8);
        writer.uint64(message.value);
      }
    }

    static decode(reader: Reader, length: i32): total_supply_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new total_supply_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: u64;

    constructor(value: u64 = 0) {
      this.value = value;
    }
  }

  export class balance_of_arguments {
    static encode(message: balance_of_arguments, writer: Writer): void {
      const unique_name_owner = message.owner;
      if (unique_name_owner !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_owner);
      }
    }

    static decode(reader: Reader, length: i32): balance_of_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new balance_of_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.owner = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    owner: Uint8Array | null;

    constructor(owner: Uint8Array | null = null) {
      this.owner = owner;
    }
  }

  @unmanaged
  export class balance_of_result {
    static encode(message: balance_of_result, writer: Writer): void {
      if (message.value != 0) {
        writer.uint32(8);
        writer.uint64(message.value);
      }
    }

    static decode(reader: Reader, length: i32): balance_of_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new balance_of_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: u64;

    constructor(value: u64 = 0) {
      this.value = value;
    }
  }

  export class owner_of_arguments {
    static encode(message: owner_of_arguments, writer: Writer): void {
      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_token_id);
      }
    }

    static decode(reader: Reader, length: i32): owner_of_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new owner_of_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.token_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    token_id: Uint8Array | null;

    constructor(token_id: Uint8Array | null = null) {
      this.token_id = token_id;
    }
  }

  export class owner_of_result {
    static encode(message: owner_of_result, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_value);
      }
    }

    static decode(reader: Reader, length: i32): owner_of_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new owner_of_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: Uint8Array | null;

    constructor(value: Uint8Array | null = null) {
      this.value = value;
    }
  }

  export class get_approved_arguments {
    static encode(message: get_approved_arguments, writer: Writer): void {
      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_token_id);
      }
    }

    static decode(reader: Reader, length: i32): get_approved_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_approved_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.token_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    token_id: Uint8Array | null;

    constructor(token_id: Uint8Array | null = null) {
      this.token_id = token_id;
    }
  }

  export class get_approved_result {
    static encode(message: get_approved_result, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_value);
      }
    }

    static decode(reader: Reader, length: i32): get_approved_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_approved_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: Uint8Array | null;

    constructor(value: Uint8Array | null = null) {
      this.value = value;
    }
  }

  export class is_approved_for_all_arguments {
    static encode(
      message: is_approved_for_all_arguments,
      writer: Writer
    ): void {
      const unique_name_owner = message.owner;
      if (unique_name_owner !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_owner);
      }

      const unique_name_operator = message.operator;
      if (unique_name_operator !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_operator);
      }
    }

    static decode(reader: Reader, length: i32): is_approved_for_all_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new is_approved_for_all_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.owner = reader.bytes();
            break;

          case 2:
            message.operator = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    owner: Uint8Array | null;
    operator: Uint8Array | null;

    constructor(
      owner: Uint8Array | null = null,
      operator: Uint8Array | null = null
    ) {
      this.owner = owner;
      this.operator = operator;
    }
  }

  @unmanaged
  export class is_approved_for_all_result {
    static encode(message: is_approved_for_all_result, writer: Writer): void {
      if (message.value != false) {
        writer.uint32(8);
        writer.bool(message.value);
      }
    }

    static decode(reader: Reader, length: i32): is_approved_for_all_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new is_approved_for_all_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: bool;

    constructor(value: bool = false) {
      this.value = value;
    }
  }

  @unmanaged
  export class royalties_arguments {
    static encode(message: royalties_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): royalties_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new royalties_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class royalties_result {
    static encode(message: royalties_result, writer: Writer): void {
      const unique_name_value = message.value;
      for (let i = 0; i < unique_name_value.length; ++i) {
        writer.uint32(10);
        writer.fork();
        royalty.encode(unique_name_value[i], writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): royalties_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new royalties_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value.push(royalty.decode(reader, reader.uint32()));
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: Array<royalty>;

    constructor(value: Array<royalty> = []) {
      this.value = value;
    }
  }

  @unmanaged
  export class get_config_arguments {
    static encode(message: get_config_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): get_config_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_config_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class get_config_result {
    static encode(message: get_config_result, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value !== null) {
        writer.uint32(10);
        writer.fork();
        configuration.encode(unique_name_value, writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): get_config_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_config_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = configuration.decode(reader, reader.uint32());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: configuration | null;

    constructor(value: configuration | null = null) {
      this.value = value;
    }
  }

  export class get_metadata_arguments {
    static encode(message: get_metadata_arguments, writer: Writer): void {
      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_token_id);
      }
    }

    static decode(reader: Reader, length: i32): get_metadata_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_metadata_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.token_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    token_id: Uint8Array | null;

    constructor(token_id: Uint8Array | null = null) {
      this.token_id = token_id;
    }
  }

  export class get_metadata_result {
    static encode(message: get_metadata_result, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value !== null) {
        writer.uint32(10);
        writer.string(unique_name_value);
      }
    }

    static decode(reader: Reader, length: i32): get_metadata_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_metadata_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: string | null;

    constructor(value: string | null = null) {
      this.value = value;
    }
  }

  export class get_listing_arguments {
    static encode(message: get_listing_arguments, writer: Writer): void {
      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_token_id);
      }
    }

    static decode(reader: Reader, length: i32): get_listing_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_listing_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.token_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    token_id: Uint8Array | null;

    constructor(token_id: Uint8Array | null = null) {
      this.token_id = token_id;
    }
  }

  export class get_listing_result {
    static encode(message: get_listing_result, writer: Writer): void {
      const unique_name_value = message.value;
      if (unique_name_value !== null) {
        writer.uint32(10);
        writer.fork();
        listing.encode(unique_name_value, writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): get_listing_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_listing_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.value = listing.decode(reader, reader.uint32());
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    value: listing | null;

    constructor(value: listing | null = null) {
      this.value = value;
    }
  }

  @unmanaged
  export class get_tokens_arguments {
    static encode(message: get_tokens_arguments, writer: Writer): void {
      if (message.start != 0) {
        writer.uint32(8);
        writer.uint32(message.start);
      }

      if (message.limit != 0) {
        writer.uint32(16);
        writer.uint32(message.limit);
      }
    }

    static decode(reader: Reader, length: i32): get_tokens_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_tokens_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.start = reader.uint32();
            break;

          case 2:
            message.limit = reader.uint32();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    start: u32;
    limit: u32;

    constructor(start: u32 = 0, limit: u32 = 0) {
      this.start = start;
      this.limit = limit;
    }
  }

  export class get_tokens_result {
    static encode(message: get_tokens_result, writer: Writer): void {
      const unique_name_values = message.values;
      for (let i = 0; i < unique_name_values.length; ++i) {
        writer.uint32(10);
        writer.fork();
        token_view.encode(unique_name_values[i], writer);
        writer.ldelim();
      }
    }

    static decode(reader: Reader, length: i32): get_tokens_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new get_tokens_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.values.push(token_view.decode(reader, reader.uint32()));
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    values: Array<token_view>;

    constructor(values: Array<token_view> = []) {
      this.values = values;
    }
  }

  export class initialize_arguments {
    static encode(message: initialize_arguments, writer: Writer): void {
      const unique_name_archive = message.archive;
      if (unique_name_archive !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_archive);
      }

      const unique_name_treasury = message.treasury;
      if (unique_name_treasury !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_treasury);
      }

      const unique_name_payment_token = message.payment_token;
      if (unique_name_payment_token !== null) {
        writer.uint32(26);
        writer.bytes(unique_name_payment_token);
      }

      const unique_name_base_uri = message.base_uri;
      if (unique_name_base_uri !== null) {
        writer.uint32(34);
        writer.string(unique_name_base_uri);
      }
    }

    static decode(reader: Reader, length: i32): initialize_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new initialize_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.archive = reader.bytes();
            break;

          case 2:
            message.treasury = reader.bytes();
            break;

          case 3:
            message.payment_token = reader.bytes();
            break;

          case 4:
            message.base_uri = reader.string();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    archive: Uint8Array | null;
    treasury: Uint8Array | null;
    payment_token: Uint8Array | null;
    base_uri: string | null;

    constructor(
      archive: Uint8Array | null = null,
      treasury: Uint8Array | null = null,
      payment_token: Uint8Array | null = null,
      base_uri: string | null = null
    ) {
      this.archive = archive;
      this.treasury = treasury;
      this.payment_token = payment_token;
      this.base_uri = base_uri;
    }
  }

  @unmanaged
  export class initialize_result {
    static encode(message: initialize_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): initialize_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new initialize_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class mint_arguments {
    static encode(message: mint_arguments, writer: Writer): void {
      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_token_id);
      }
    }

    static decode(reader: Reader, length: i32): mint_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new mint_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.token_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    token_id: Uint8Array | null;

    constructor(token_id: Uint8Array | null = null) {
      this.token_id = token_id;
    }
  }

  @unmanaged
  export class mint_result {
    static encode(message: mint_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): mint_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new mint_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  @unmanaged
  export class open_sales_arguments {
    static encode(message: open_sales_arguments, writer: Writer): void {}

    static decode(reader: Reader, length: i32): open_sales_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new open_sales_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  @unmanaged
  export class open_sales_result {
    static encode(message: open_sales_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): open_sales_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new open_sales_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  @unmanaged
  export class set_paused_arguments {
    static encode(message: set_paused_arguments, writer: Writer): void {
      if (message.paused != false) {
        writer.uint32(8);
        writer.bool(message.paused);
      }
    }

    static decode(reader: Reader, length: i32): set_paused_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_paused_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.paused = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    paused: bool;

    constructor(paused: bool = false) {
      this.paused = paused;
    }
  }

  @unmanaged
  export class set_paused_result {
    static encode(message: set_paused_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): set_paused_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_paused_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class transfer_arguments {
    static encode(message: transfer_arguments, writer: Writer): void {
      const unique_name_from = message.from;
      if (unique_name_from !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_from);
      }

      const unique_name_to = message.to;
      if (unique_name_to !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_to);
      }

      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(26);
        writer.bytes(unique_name_token_id);
      }
    }

    static decode(reader: Reader, length: i32): transfer_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new transfer_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.from = reader.bytes();
            break;

          case 2:
            message.to = reader.bytes();
            break;

          case 3:
            message.token_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    from: Uint8Array | null;
    to: Uint8Array | null;
    token_id: Uint8Array | null;

    constructor(
      from: Uint8Array | null = null,
      to: Uint8Array | null = null,
      token_id: Uint8Array | null = null
    ) {
      this.from = from;
      this.to = to;
      this.token_id = token_id;
    }
  }

  @unmanaged
  export class transfer_result {
    static encode(message: transfer_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): transfer_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new transfer_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class approve_arguments {
    static encode(message: approve_arguments, writer: Writer): void {
      const unique_name_approver_address = message.approver_address;
      if (unique_name_approver_address !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_approver_address);
      }

      const unique_name_to = message.to;
      if (unique_name_to !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_to);
      }

      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(26);
        writer.bytes(unique_name_token_id);
      }
    }

    static decode(reader: Reader, length: i32): approve_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new approve_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.approver_address = reader.bytes();
            break;

          case 2:
            message.to = reader.bytes();
            break;

          case 3:
            message.token_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    approver_address: Uint8Array | null;
    to: Uint8Array | null;
    token_id: Uint8Array | null;

    constructor(
      approver_address: Uint8Array | null = null,
      to: Uint8Array | null = null,
      token_id: Uint8Array | null = null
    ) {
      this.approver_address = approver_address;
      this.to = to;
      this.token_id = token_id;
    }
  }

  @unmanaged
  export class approve_result {
    static encode(message: approve_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): approve_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new approve_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class set_approval_for_all_arguments {
    static encode(
      message: set_approval_for_all_arguments,
      writer: Writer
    ): void {
      const unique_name_approver_address = message.approver_address;
      if (unique_name_approver_address !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_approver_address);
      }

      const unique_name_operator_address = message.operator_address;
      if (unique_name_operator_address !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_operator_address);
      }

      if (message.approved != false) {
        writer.uint32(24);
        writer.bool(message.approved);
      }
    }

    static decode(reader: Reader, length: i32): set_approval_for_all_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_approval_for_all_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.approver_address = reader.bytes();
            break;

          case 2:
            message.operator_address = reader.bytes();
            break;

          case 3:
            message.approved = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    approver_address: Uint8Array | null;
    operator_address: Uint8Array | null;
    approved: bool;

    constructor(
      approver_address: Uint8Array | null = null,
      operator_address: Uint8Array | null = null,
      approved: bool = false
    ) {
      this.approver_address = approver_address;
      this.operator_address = operator_address;
      this.approved = approved;
    }
  }

  @unmanaged
  export class set_approval_for_all_result {
    static encode(message: set_approval_for_all_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): set_approval_for_all_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new set_approval_for_all_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class list_token_arguments {
    static encode(message: list_token_arguments, writer: Writer): void {
      const unique_name_seller = message.seller;
      if (unique_name_seller !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_seller);
      }

      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_token_id);
      }

      if (message.price != 0) {
        writer.uint32(24);
        writer.uint64(message.price);
      }

      if (message.expires_at != 0) {
        writer.uint32(32);
        writer.uint64(message.expires_at);
      }
    }

    static decode(reader: Reader, length: i32): list_token_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new list_token_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.seller = reader.bytes();
            break;

          case 2:
            message.token_id = reader.bytes();
            break;

          case 3:
            message.price = reader.uint64();
            break;

          case 4:
            message.expires_at = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    seller: Uint8Array | null;
    token_id: Uint8Array | null;
    price: u64;
    expires_at: u64;

    constructor(
      seller: Uint8Array | null = null,
      token_id: Uint8Array | null = null,
      price: u64 = 0,
      expires_at: u64 = 0
    ) {
      this.seller = seller;
      this.token_id = token_id;
      this.price = price;
      this.expires_at = expires_at;
    }
  }

  @unmanaged
  export class list_token_result {
    static encode(message: list_token_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): list_token_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new list_token_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class cancel_listing_arguments {
    static encode(message: cancel_listing_arguments, writer: Writer): void {
      const unique_name_seller = message.seller;
      if (unique_name_seller !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_seller);
      }

      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_token_id);
      }
    }

    static decode(reader: Reader, length: i32): cancel_listing_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new cancel_listing_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.seller = reader.bytes();
            break;

          case 2:
            message.token_id = reader.bytes();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    seller: Uint8Array | null;
    token_id: Uint8Array | null;

    constructor(
      seller: Uint8Array | null = null,
      token_id: Uint8Array | null = null
    ) {
      this.seller = seller;
      this.token_id = token_id;
    }
  }

  @unmanaged
  export class cancel_listing_result {
    static encode(message: cancel_listing_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): cancel_listing_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new cancel_listing_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }

  export class buy_arguments {
    static encode(message: buy_arguments, writer: Writer): void {
      const unique_name_buyer = message.buyer;
      if (unique_name_buyer !== null) {
        writer.uint32(10);
        writer.bytes(unique_name_buyer);
      }

      const unique_name_token_id = message.token_id;
      if (unique_name_token_id !== null) {
        writer.uint32(18);
        writer.bytes(unique_name_token_id);
      }

      const unique_name_expected_seller = message.expected_seller;
      if (unique_name_expected_seller !== null) {
        writer.uint32(26);
        writer.bytes(unique_name_expected_seller);
      }

      if (message.expected_price != 0) {
        writer.uint32(32);
        writer.uint64(message.expected_price);
      }

      if (message.expected_revision != 0) {
        writer.uint32(40);
        writer.uint64(message.expected_revision);
      }

      if (message.deadline != 0) {
        writer.uint32(48);
        writer.uint64(message.deadline);
      }
    }

    static decode(reader: Reader, length: i32): buy_arguments {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new buy_arguments();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.buyer = reader.bytes();
            break;

          case 2:
            message.token_id = reader.bytes();
            break;

          case 3:
            message.expected_seller = reader.bytes();
            break;

          case 4:
            message.expected_price = reader.uint64();
            break;

          case 5:
            message.expected_revision = reader.uint64();
            break;

          case 6:
            message.deadline = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    buyer: Uint8Array | null;
    token_id: Uint8Array | null;
    expected_seller: Uint8Array | null;
    expected_price: u64;
    expected_revision: u64;
    deadline: u64;

    constructor(
      buyer: Uint8Array | null = null,
      token_id: Uint8Array | null = null,
      expected_seller: Uint8Array | null = null,
      expected_price: u64 = 0,
      expected_revision: u64 = 0,
      deadline: u64 = 0
    ) {
      this.buyer = buyer;
      this.token_id = token_id;
      this.expected_seller = expected_seller;
      this.expected_price = expected_price;
      this.expected_revision = expected_revision;
      this.deadline = deadline;
    }
  }

  @unmanaged
  export class buy_result {
    static encode(message: buy_result, writer: Writer): void {}

    static decode(reader: Reader, length: i32): buy_result {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new buy_result();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    constructor() {}
  }
}

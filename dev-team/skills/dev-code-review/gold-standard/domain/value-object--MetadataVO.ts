import { ValueObject } from "@v4-company/mars-api/core";

export type MetadataType = Record<string, unknown>;

export class MetadataVO extends ValueObject<MetadataType> {
  constructor(value: MetadataType) {
    super(value);
  }

  static empty(): MetadataVO {
    return new MetadataVO({});
  }

  isEmpty(): boolean {
    return Object.keys(this.value).length === 0;
  }

  has(key: string): boolean {
    return key in this.value;
  }

  get(key: string): unknown {
    return this.value[key];
  }
}

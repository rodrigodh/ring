import {
  DateVO,
  EmailVO,
  EntityIdVO,
  RequiredBooleanVO,
  type EntityProps,
  Entity,
  type ToPrimitives,
} from "@v4-company/mars-api/core";

export type EmailAddressProps = EntityProps<{
  email: EmailVO;
  verified: RequiredBooleanVO;
  verifiedAt: DateVO;
  isPrimary: RequiredBooleanVO;
  userId: EntityIdVO;
}>;

export type EmailAddressPrimitives = ToPrimitives<EmailAddressProps>;

export class EmailAddress extends Entity<EmailAddressProps> {
  private constructor(props: EmailAddressProps, id?: EntityIdVO) {
    super(props, id);
  }

  private static build(props: EmailAddressPrimitives): EmailAddressProps {
    return {
      email: new EmailVO(props.email),
      verified: new RequiredBooleanVO(props.verified),
      verifiedAt: new DateVO(props.verifiedAt),
      isPrimary: new RequiredBooleanVO(props.isPrimary),
      userId: new EntityIdVO(props.userId),
    };
  }

  static create(props: EmailAddressPrimitives): EmailAddress {
    const entityProps = this.build(props);
    return new EmailAddress(entityProps);
  }

  static from(props: EmailAddressPrimitives, id: EntityIdVO): EmailAddress {
    const entityProps = this.build(props);
    return new EmailAddress(entityProps, id);
  }

  get email(): EmailVO {
    return this.props.email;
  }

  get verified(): RequiredBooleanVO {
    return this.props.verified;
  }

  get verifiedAt(): DateVO {
    return this.props.verifiedAt;
  }

  get isPrimary(): RequiredBooleanVO {
    return this.props.isPrimary;
  }

  get userId(): EntityIdVO {
    return this.props.userId;
  }
}

export abstract class Mapper<DomainEntity, SchemaEntity> {
  abstract toDomain(schema: SchemaEntity): DomainEntity;
  abstract toAggregate(domain: DomainEntity): SchemaEntity;
}

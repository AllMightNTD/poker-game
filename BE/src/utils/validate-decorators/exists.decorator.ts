import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource } from 'typeorm';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly dataSource: DataSource) {
    // empty
  }

  async validate(value: unknown, args: ValidationArguments) {
    const [EntityClass, findCondition = args.property] = args.constraints;

    const repository = this.dataSource.getRepository(EntityClass);
    const count = await repository.count({
      where:
        typeof findCondition === 'function'
          ? findCondition(args)
          : {
              [findCondition || args.property]: value,
            },
    });

    return count <= 0;
  }
}

export function IsExist(
  validationOptions?: ValidationOptions,
  constraints?: unknown[],
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: constraints,
      validator: IsExistConstraint,
    });
  };
}

import {Entity, model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - Users
 * Users
 */
@model({name: 'Users'})
export class User extends Entity {
  constructor(data?: Partial<User>) {
    super(data);
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   *
   */
  @property({

    id: true,
    generated: true,
    type: 'number'

  })
  id?: number;

  /**
   *
   */
  @property({

    type: 'string',
    maxLength: 256,

  })
  username?: string;

  /**
   *
   */
  @property({

    type: 'string',

  })
  firstName?: string;

  /**
   *
   */
  @property({

    type: 'string',

  })
  lastName?: string;

  /**
   *
   */
  @property({

    type: 'string',
    format: 'email',

  })
  email?: string;

  /**
   *
   */
  @property({

    type: 'string',

  })
  phone?: string;

}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;



import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Request, Response, RestBindings, api, operation, param, requestBody} from '@loopback/rest';
import {Users} from '../models/users.model';
import {UsersRepository} from '../repositories/users.repository';



/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by user.
 *
 * Operations about user
 */
@api({
  components: {
    schemas: {
      Users: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            format: 'int64',
          },
          username: {
            type: 'string',
            maxLength: 256,
          },
          firstName: {
            type: 'string',
          },
          lastName: {
            type: 'string',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          phone: {
            type: 'string',
          },
          isAdmin: {
            type: 'boolean',
          }
        },
      },
      Error: {
        type: 'object',
        required: [
          'code',
          'message',
        ],
        properties: {
          code: {
            type: 'integer',
            format: 'int32',
          },
          message: {
            type: 'string',
          },
        },
      },
    },
    requestBodies: {
      UserArray: {
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Users',
              },
            },
          },
        },
        description: 'List of user object',
        required: true,
      },
    },
  },
  paths: {},
})
export class UserController {
  constructor(
    @repository(UsersRepository) private userRepo: UsersRepository,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
    @inject(RestBindings.Http.REQUEST) private request: Request
  ) { }
  // /**
  //  * This can only be done by the logged in user.
  //  *
  //  * @param _requestBody Created user object
  //  */
  // @operation('post', '/user', {
  //   tags: [
  //     'user',
  //   ],
  //   summary: 'Create user',
  //   description: 'This can only be done by the logged in user.',
  //   operationId: 'createUser',
  //   responses: {
  //     default: {
  //       description: 'successful operation',
  //     },
  //   },
  //   requestBody: {
  //     content: {
  //       'application/json': {
  //         schema: {
  //           $ref: '#/components/schemas/Users',
  //         },
  //         examples: {
  //           'sample-user': {
  //             summary: 'Example',
  //             value: {
  //               username: 'johndoe589',
  //               firstName: 'John',
  //               lastName: 'Doe',
  //               email: 'bestjohn@doe.com',
  //               phone: '+71002003040',
  //             },
  //           },
  //         },
  //       },
  //     },
  //     description: 'Created user object',
  //     required: true,
  //   },
  // })
  // async createUser(@requestBody({
  //   content: {
  //     'application/json': {
  //       schema: {
  //         $ref: '#/components/schemas/Users',
  //       },
  //       examples: {
  //         'sample-user': {
  //           summary: 'Example',
  //           value: {
  //             username: 'johndoe589',
  //             firstName: 'John',
  //             lastName: 'Doe',
  //             email: 'bestjohn@doe.com',
  //             phone: '+71002003040',
  //           },
  //         },
  //       },
  //     },
  //   },
  //   description: 'Created user object',
  //   required: true,
  // }) user: Users): Promise<any | undefined> {

  //   const filter = {
  //     where: {
  //       username: user.username,
  //     }
  //   };

  //   const sameName = await this.userRepo.findOne(filter)
  //   if (sameName) return this.response.status(400).send(this.errorRes(400, 'Это имя пользователя уже занято!'))

  //   const newUser = await this.userRepo.create(user);
  //   let balance = new SvcConnector(CONFIG.balance.host, 60000, CONFIG.trace);
  //   let balanceReq = new Balance();
  //   if (!newUser.id) return this.response.status(400).send(this.errorRes(400, 'Неудача при создании пользователя!'))
  //   balanceReq.user_id = newUser.id;
  //   balanceReq.balance = 0;
  //   balanceReq.account = uuidv4();

  //   let balanceRes = await balance.postReq(balanceReq);
  //   console.log(balanceRes);

  //   console.log('User ' + user.username + ' created. ID: ' + newUser.id);
  //   return this.response.status(200).send(newUser);
  // }
  /**
   * Returns a user based on a single ID, if the user does not have access to the
user
   *
   * @param userId ID of user
   * @returns user response
   */
  @operation('get', '/user/{userId}', {
    tags: [
      'user',
    ],
    description: 'Returns a user based on a single ID, if the user does not have access to the user',
    operationId: 'find user by id',
    responses: {
      '200': {
        description: 'user response',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Users',
            },
          },
        },
      },
      default: {
        description: 'unexpected error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
    },
    parameters: [
      {
        name: 'userId',
        in: 'path',
        description: 'ID of user',
        required: true,
        schema: {
          type: 'integer',
          format: 'int64',
        },
      },
    ],
  })
  async findUserById(@param({
    name: 'userId',
    in: 'path',
    description: 'ID of user',
    required: true,
    schema: {
      type: 'integer',
      format: 'int64',
    },
  }) userId: number): Promise<Users | any> {
    console.log("GET USER");
    let id = this.request.get('X-UserId');
    if (!id) return this.response.status(401).send(this.errorRes(401, "Please go to login and provide Login/Password"));
    if (+id != userId) return this.response.status(403).send(this.errorRes(403, "Forbidden"));
    const user = await this.userRepo.findById(userId);
    console.log("GET USER: ", user.username);
    return user
  }
  /**
   * deletes a single user based on the ID supplied
   *
   * @param userId ID of user
   */
  @operation('delete', '/user/{userId}', {
    tags: [
      'user',
    ],
    description: 'deletes a single user based on the ID supplied',
    operationId: 'deleteUser',
    responses: {
      '204': {
        description: 'user deleted',
      },
      default: {
        description: 'unexpected error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
    },
    parameters: [
      {
        name: 'userId',
        in: 'path',
        description: 'ID of user',
        required: true,
        schema: {
          type: 'integer',
          format: 'int64',
        },
      },
    ],
  })
  async deleteUser(@param({
    name: 'userId',
    in: 'path',
    description: 'ID of user',
    required: true,
    schema: {
      type: 'integer',
      format: 'int64',
    },
  }) userId: number) {
    console.log("DELETE USER");
    let id = this.request.get('X-UserId');
    if (!id) return this.response.status(401).send(this.errorRes(401, "Please go to login and provide Login/Password"));
    if (+id != userId) return this.response.status(403).send(this.errorRes(403, "Forbidden"));
    const user = await this.userRepo.findById(userId)
    await this.userRepo.delete(user);
    console.log("DELETE USER: ", user.username);
    return this.response.status(200).send();
  }
  /**
   * Update user with User ID supplied
   *
   * @param userId ID of user
   * @param _requestBody
   */
  @operation('put', '/user/{userId}', {
    tags: [
      'user',
    ],
    description: 'Update user with User ID supplied',
    operationId: 'updateUser',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Users',
          },
          examples: {
            'sample-user': {
              summary: 'Example',
              value: {
                firstName: 'Julie',
                lastName: 'Doe',
                email: 'bestjohn@doe.com',
                phone: '+71004242424',
              },
            },
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'user updated',
      },
      '404': {
        description: 'unexpected error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
    },
    parameters: [
      {
        name: 'userId',
        in: 'path',
        description: 'ID of user',
        required: true,
        schema: {
          type: 'integer',
          format: 'int64',
        },
      },
    ],
  })
  async updateUser(@param({
    name: 'userId',
    in: 'path',
    description: 'ID of user',
    required: true,
    schema: {
      type: 'integer',
      format: 'int64',
    },
  }) userId: number, @requestBody({
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Users',
        },
        // examples: {
        //   'sample-user': {
        //     summary: 'Example',
        //     value: {
        //       username: 'johndoe589',
        //       firstName: 'John',
        //       lastName: 'Doe',
        //       email: 'bestjohn@doe.com',
        //       phone: '+71002003040',
        //     },
        //   },
        // },
      },
    },
    description: 'Created user object',
    required: true,
  }) newData: Users) {
    console.log("PUT USER");
    let id = this.request.get('X-UserId');
    if (!id) return this.response.status(401).send(this.errorRes(401, "Please go to login and provide Login/Password"));
    if (+id != userId) return this.response.status(403).send(this.errorRes(403, "Forbidden"));
    await this.userRepo.updateById(userId, newData);
    console.log("PUT USER", newData)
    return this.response.status(200).send();
  }

  /**
    * Update user with User ID supplied
    *
    * @param userId ID of user
    * @param _requestBody
    */
  @operation('put', '/user/me', {
    tags: [
      'user',
    ],
    description: 'Update user with User ID supplied',
    operationId: 'updateUser',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/Users',
          },
          examples: {
            'sample-user': {
              summary: 'Example',
              value: {
                username: 'johndoe589',
                firstName: 'John',
                lastName: 'Doe',
                email: 'bestjohn@doe.com',
                phone: '+71002003040',
              },
            },
          },
        },
      },
      description: 'Created user object',
      required: true,
    },
    responses: {
      '200': {
        description: 'user updated',
      },
      '404': {
        description: 'unexpected error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
    }
  })
  async updateMe(@requestBody({
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/Users',
        },
        examples: {
          'sample-user': {
            summary: 'Example',
            value: {
              username: 'johndoe589',
              firstName: 'John',
              lastName: 'Doe',
              email: 'bestjohn@doe.com',
              phone: '+71002003040',
            },
          },
        },
      },
    },
    description: 'Created user object',
    required: true,
  }) newData: Users) {
    console.log("UPDATE ME");
    //console.log(newData)
    let id = this.request.get('X-UserId');
    if (!id) return this.response.status(403).send(this.errorRes(403, "Please go to login and provide Login/Password"));
    await this.userRepo.updateById(+id, newData);
    console.log("UPDATE ME", newData);
    return this.response.status(200).send();
  }

  errorRes(code: number, mes: string): any {
    return {
      statusCode: code,
      code: "error",
      message: mes
    }
  }
}


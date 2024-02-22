// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-todo-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {authenticate} from '@loopback/authentication';
import {
  Credentials,
  MyUserService,
  //TokenServiceBindings,
  User,
  UserRepository,
  UserServiceBindings
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {model, property, repository} from '@loopback/repository';
import {
  Request,
  Response,
  RestBindings,
  SchemaObject,
  get,
  getModelSchemaRef,
  post,
  requestBody
} from '@loopback/rest';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';
import {genSalt, hash} from 'bcryptjs';
import {parse} from 'cookie';
import _ from 'lodash';
import {v4 as uuidv4} from 'uuid';
import {CONFIG} from '../config';
import {SvcConnector} from '../connector/svc.connector';
import {Balance} from '../models';
import {Users} from '../models/users.model';
import {UsersRepository} from '../repositories/users.repository';

let SESSIONS = new Map();

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

export class AuthController {
  constructor(
    // @inject(TokenServiceBindings.TOKEN_SERVICE)
    // public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(UsersRepository) public dataUserRepo: UsersRepository,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
    @inject(RestBindings.Http.REQUEST) private request: Request
  ) { }

  @post('/login', {
    responses: {
      '200': {
        description: 'Session',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                sessionID: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<any> {
    // ensure the user exists, and the password is correct
    console.log("LOGIN START");
    console.log("LOGIN cred", credentials)
    const user = await this.userService.verifyCredentials(credentials);

    console.log("LOGIN usr", user)
    // convert a User object into a UserProfile object (reduced set of properties)
    //const userProfile = this.userService.convertToUserProfile(user);
    // create a JSON Web Token based on the user profile
    //const token = await this.jwtService.generateToken(userProfile);

    const filter = {
      where: {
        username: user.username,
      }
    };
    let userID = await this.dataUserRepo.findOne(filter);
    if (!userID) return this.response.status(401).send(this.errorRes(401, "The user doesn't exist"))

    let sessionID = uuidv4();
    let userInfo = {
      userID: userID.id,
      userName: userID.username,
      email: userID.email

    }
    SESSIONS.set(sessionID, userInfo);
    this.response.set('X-UserId', userID.id?.toString());
    this.response.set('X-User', userID.username);
    this.response.set('X-Email', userID.email);
    this.response.set('X-Admin', (userID.isAdmin == true).toString());
    this.response.cookie("session_id", sessionID);
    console.log("LOGIN END: ", userID.username);
    return;
  };

  @post('/auth', {
    responses: {
      '200': {
        description: 'Session',
      },
    },
  })
  async auth(): Promise<any> {
    console.log("AUTH START");
    let cookies = this.request.get("Set-cookie")
    if (!cookies) cookies = this.request.get("Cookie")
    console.log('cookies:', cookies);
    if (!cookies) return this.response.status(403).send(this.errorRes(403, "Please go to login and provide Login/Password (no cookie)"))
    let objCookies = parse(cookies[0])
    console.log('obj with cookies:', objCookies);
    let sessionID = objCookies.session_id
    if (!SESSIONS.has(sessionID)) return this.response.status(403).send(this.errorRes(403, "Please go to login and provide Login/Password (no session_id)"))
    let userData = SESSIONS.get(sessionID);

    const filter = {
      where: {
        username: userData.userName,
      }
    };
    let userID = await this.dataUserRepo.findOne(filter);
    if (!userID) return this.response.status(401).send(this.errorRes(401, "The user doesn't exist"))
    this.response.set('X-UserId', userID.id?.toString());
    this.response.set('X-User', userID.username);
    this.response.set('X-Email', userID.email);
    this.response.set('X-Admin', (userID.isAdmin ?? false).toString());
    console.log("AUTH: ", userID.username);
    console.log(this.response);
    this.response.status(200);
    return {user_id: userID};
  }

  @post('/logout', {
    responses: {
      '200': {
        description: 'Session',
      },
    },
  })
  async logout(): Promise<any> {
    console.log("LOGAUTH START");
    let cookies = this.request.get("Set-cookie")
    if (!cookies) return this.response.status(200).send();
    let objCookies = parse(cookies[0])
    let sessionID = objCookies.session_id
    if (!SESSIONS.has(sessionID)) return this.response.status(200).send();
    SESSIONS.delete(sessionID);
    console.log("LOGAUTH END");
    return this.response.status(200).send();
  }

  @get('/signin', {
    responses: {
      default: {
        description: 'Please go to login and provide Login/Password',
      },
    }
  })
  async signin(
  ): Promise<any> {
    console.log("SIGNIN");
    return {message: 'Please go to login and provide Login/Password'}
  }

  @authenticate('jwt')
  @get('/whoAmI', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async whoAmI(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<string> {
    return currentUserProfile[securityId];
  }

  @post('/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NewUserRequest, {
            title: 'NewUser',
          }),
        },
      },
    })
    newUserRequest: NewUserRequest,
  ): Promise<User | any> {
    console.log("SIGNUP START");
    const filter = {
      where: {
        username: newUserRequest.username,
      }
    };

    const sameName = await this.dataUserRepo.findOne(filter)
    if (sameName) {
      return this.response.status(400).send(this.errorRes(400, 'Это имя пользователя уже занято!'))
    }

    const filter2 = {
      where: {
        email: newUserRequest.email,
      }
    };

    const sameMail = await this.dataUserRepo.findOne(filter2)
    if (sameMail) {
      return this.response.status(400).send(this.errorRes(400, 'Этот email уже зарегистрирован!'))
    }

    const password = await hash(newUserRequest.password, await genSalt());
    const savedUser = await this.userRepository.create(
      _.omit(newUserRequest, 'password'),
    );

    await this.userRepository.userCredentials(savedUser.id).create({password});

    let dataUser = new Users();
    dataUser.email = newUserRequest.email;
    dataUser.username = newUserRequest.username;
    dataUser.firstName = "";
    dataUser.lastName = "";
    dataUser.phone = "";
    dataUser.isAdmin = false;
    const newUser = await this.dataUserRepo.create(dataUser);
    let balance = new SvcConnector(CONFIG.balance.host, 60000, CONFIG.trace);
    let balanceReq = new Balance();
    if (!newUser.id) return this.response.status(400).send(this.errorRes(400, 'Неудача при создании пользователя!'))
    balanceReq.user_id = newUser.id;
    balanceReq.balance = 0;
    balanceReq.account = uuidv4();

    let balanceRes = await balance.postReq(balanceReq);
    console.log(balanceRes);

    console.log('User ' + dataUser.username + ' created. ID: ' + newUser.id);
    //console.log("SIGNUP: ", newUserRequest.username);
    return savedUser;
  }

  errorRes(code: number, mes: string): any {
    return {
      statusCode: code,
      code: "error",
      message: mes
    }
  }
}


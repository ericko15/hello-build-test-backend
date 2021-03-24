"use strict"

import {verify} from "jsonwebtoken"
import config from "@config/index"
import {Action, ForbiddenError, UnauthorizedError} from "routing-controllers"
import {UserRepository} from "@data_access/repositories/UserRepository"
import * as httpStatus from 'http-status-codes'

export class AuthenticationService {
  public static async authorizationChecker(action: Action) {
    const userRepository = new UserRepository()
    try {
      const {headers} = action.request
      const token: string = AuthenticationService.getToken(headers)
      const userUuid = await AuthenticationService.verifyToken(token)
      const user = await userRepository.getByUuid(userUuid)
      action.request.user = user
      const isAuthenticated = !!user
      if (!isAuthenticated || !user) {
        // noinspection ExceptionCaughtLocallyJS
        throw new ForbiddenError("Access denied")
      }
      return isAuthenticated
    } catch (err) {
      const errStatusCode = err.httpCode || httpStatus.StatusCodes.FORBIDDEN
      action.response.status(errStatusCode).json(err).end()
    }
  }

  public static async currentUserChecker(action: Action) {
    try {
      const headers: any = action.request.headers
      const token: string = AuthenticationService.getToken(headers)
      return verify(token, config.auth.secret, function (err, user) {
        if (err) throw new ForbiddenError(err.message)
        if (!user) throw new ForbiddenError("Not Found User")
        return user
      })
    } catch (error) {
      action.response.status(error.httpCode).json(error)
    }
  }

  private static verifyToken(token): Promise<string> {
    return new Promise((resolve, reject) => {
      verify(token, config.auth.secret, function (err, payload: any) {
        if (err) return reject(new UnauthorizedError(""))
        if (!payload || !payload.uuid) return reject(new UnauthorizedError("Invalid user"))
        return resolve(payload.uuid)
      })
    })
  }

  private static getToken(headers: any): string {
    let token: string
    if (headers && headers.authorization) {
      token = headers.authorization
      token = token.replace("Bearer ", "")
    }
    return token
  }
}

import 'reflect-metadata'
import express from 'express'
import config from "./config";
import {
  RoutingControllersOptions,
  useContainer as useRoutingControllerContainer,
  useExpressServer
} from 'routing-controllers'
import { Container } from 'typedi'
import { AuthenticationService } from '@interfaces/API/services/AuthenticationService';
import apiControllers from '@interfaces/API/controllers'
import apiMiddlewares from '@interfaces/API/middlewares'
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from "mongoose";
import chalk from "chalk";
import Debug = require('debug')

const debug = Debug('hello-build:startup')

class Server {

  app: express.Application
  port: number

  constructor() {
    this.app = express()
    this.port = parseInt(config.app.port) || 3000
    this.configureDatabase()
      .then(() => this.configureExpressServer())
      .catch(debug)
  }

  private async configureDatabase() {
    return new Promise((resolve) => {
      const conn = mongoose.connection

      debug(chalk.yellowBright(`Trying to connect to database ${config.db.url}`))

      mongoose.connect(config.db.url, config.db.options)

      conn.on("connected", () => {
        debug(chalk.greenBright(`[database] Connected to database ${config.db.url}`))
        resolve(conn)
      })

      conn.on("connecting", () => {
        debug(chalk.yellowBright(`[database] Trying to conect to database ${config.db.url}`))
      })

      conn.on("error", err => {
        console.log(chalk.redBright(`[database] Database error: ${err.message}`))
        console.error(err.stack)
      })

      conn.on("reconnected", () => {
        console.log('[database] MongoDB reconnected!');
      })

      conn.on("reconnectFailed", () => {
        console.log(chalk.redBright('[database] reconnected failed'))
      })

      conn.on("disconnected", () => {
        console.log(chalk.redBright("[database] Disconnected from database"))
      })
    })
  }

  configureExpressServer() {
    // Dependency Injection
    useRoutingControllerContainer(Container)
    const routingControllersOptions: RoutingControllersOptions = {
      classTransformer: true,
      routePrefix: '/api',
      defaultErrorHandler: false,
      authorizationChecker: AuthenticationService.authorizationChecker,
      cors: true,
      currentUserChecker: AuthenticationService.currentUserChecker,
      controllers: apiControllers,
      middlewares: apiMiddlewares,
    }
    this.app = useExpressServer(this.app, routingControllersOptions)
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({extended: true}))
    this.app.use(cors({exposedHeaders: ["Content-Type", "token"]}))
    this.app.listen(this.port, () => {
      debug(`Server Listening on port ${this.port}`)
    })
  }

}

export default new Server().app

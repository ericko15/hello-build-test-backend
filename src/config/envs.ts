import * as path from "path"
import chalk = require('chalk')
import Debug = require('debug')

const debug = Debug('hello-build:env-loader')

export const load = () => {
  const environment = process.env.NODE_ENV
  const envPath = path.join(__dirname, "../../", ".envs", `.${environment}`)

  require("dotenv").config({path: envPath})

  debug(chalk.greenBright(`Load ${environment} environment from path ${envPath}`))
}

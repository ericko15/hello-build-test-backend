import * as envs from './envs'

envs.load()

const config = {
  app: {
    port: process.env.PORT
  },
  db: {
    url: process.env.MONGO_URL,
    options: {
      useNewUrlParser: true,
      useCreateIndex: true,
      autoIndex: true,
      useUnifiedTopology: true
    },
  },
  auth: {
    secret: process.env.SECRET
  }
}

export default config

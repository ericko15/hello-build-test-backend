import {ExpressErrorMiddlewareInterface, Middleware} from "routing-controllers"
import {Service} from "typedi";

@Middleware({type: "after"})
@Service()
export default class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(err: any, req: any, res: any, next: (err?: any) => any) {
    const responseError = {
      err: err.name,
      message: err.message
    }

    if (!res.headersSent) {
      if (err.name === "UploadError") {
        res.status(400).send(responseError)
      } else if (err.name === "ValidationError") {
        res.status(400).send(responseError)
      } else if (err instanceof TypeError) {
        res.status(400).send({message: err.message})
      } else if (err.type === "ValidationError") {
        res.status(400).send(responseError)
      } else if (err.type === "NotFound" || err.name === "NotFound") {
        res.status(404).send(responseError)
      } else if (err.name === "AuthorizationRequiredError") {
        res.status(403).send(responseError)
      } else {
        res.status(500).send(responseError)
      }
    }

    res.end()
  }
}

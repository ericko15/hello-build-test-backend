import {Response} from "express";
import {Service} from "typedi";
import {Body, JsonController, Post, Res, UnauthorizedError} from "routing-controllers";
import {UserRepository} from "@data_access/repositories/UserRepository";
import jwt, {Algorithm} from 'jsonwebtoken'
import config from "@config/index";

@JsonController('/users')
@Service()
export class UsersController {

  constructor(private userRepository: UserRepository) {}

  @Post('/signup')
  async signOut(@Res() res: Response, @Body({required: true, validate: true}) body: { username, password }) {
    const {username, password} = body
    const user = await this.userRepository.create(username, password)
    const token = this.createToken({...user._doc})
    res.send({user: user._doc, token})
  }

  @Post('/login')
  async login(@Res() res: Response, @Body({required: true, validate: true}) body: { username, password }) {
    const {username, password} = body
    const user = await this.userRepository.findByUsername(username)
    if (!user) throw new UnauthorizedError('Unauthorized user')
    const verified = await user.verifyPassword(password)
    if (!verified) throw new UnauthorizedError('Unauthorized user')
    delete user._doc.password
    const token = this.createToken({...user._doc})
    res.send({user: user._doc, token})
  }

  private createToken(payload) {
    return jwt.sign(payload, config.auth.secret, {expiresIn: "7d"})
  }
}

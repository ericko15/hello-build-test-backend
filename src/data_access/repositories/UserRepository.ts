import User from "@data_access/models/User"
import {Service} from "typedi";
import {hashSync} from 'bcrypt'

@Service()
export class UserRepository {

  /**
   * Create user
   *
   * @param username
   * @param password
   *
   */
  async create(username: string, password: string) {
    const created = await User.create({username, password})
    delete created._doc.password
    return created
  }

  /**
   * find user by username
   *
   * @param username
   *
   */
  async findByUsername(username: string) {
    return User.findOne({username}).select('+password')
  }

  /**
   * Find user by uuid
   *
   * @param uuid
   */
  async getByUuid(uuid: string) {
    return User.findOne({uuid});
  }
}

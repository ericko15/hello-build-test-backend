import {getModelForClass, modelOptions, plugin, pre, prop} from '@typegoose/typegoose'
import * as mongoose from 'mongoose'
import {IsNotEmpty, IsUUID} from 'class-validator'
import {compare, hashSync} from "bcrypt";
import mongooseDelete = require('mongoose-delete');
import {v4 as uuidV4} from 'uuid'

@modelOptions({
  existingMongoose: mongoose,
  schemaOptions: {
    timestamps: true
  }
})
@pre('save', function (next) {
  if (!this.isModified('password')) return next();
  this.password = hashSync(this.password, 10)
  this.uuid = uuidV4()
  return next()
})
@plugin(mongooseDelete, {overrideMethods: true, deletedAt: true})
export class User {
  public _id: string

  @IsUUID()
  @IsNotEmpty()
  @prop({index: true})
  public uuid: string

  @IsNotEmpty()
  @prop({unique: true, required: true})
  public username: string

  @prop({index: true})
  public email: string

  @prop({index: true})
  public phone_number: string

  @prop()
  public first_name: string

  @prop()
  public last_name?: string

  @IsNotEmpty()
  @prop({required: true, select: false})
  public password?: string

  public delete: (query?: any, userId?: mongoose.Schema.Types.ObjectId) => Promise<User>

  async verifyPassword(candidatePassword) {
    return compare(candidatePassword, this.password)
  }
}


export default getModelForClass(User)

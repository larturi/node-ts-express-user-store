import { bcryptAdapter } from '../../config/bcrypt.adapter'
import { UserModel } from '../../data'
import { CustomError } from '../../domain'
import { RegisterUserDto } from '../../domain/dtos/auth/register.dto'
import { UserEntity } from '../../domain/entities/user.entity'

export class AuthService {
  constructor() {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({ email: registerUserDto.email })
    if (existUser) throw CustomError.badRequest('Email already exist')

    try {
      const user = new UserModel(registerUserDto)
      // Encriptar la contraseña
      user.password = bcryptAdapter.hash(registerUserDto.password)
      await user.save()
      const { password, ...userEntity } = UserEntity.fromObject(user)
      return {
        user: userEntity,
        token: 'ABC'
      }
    } catch (error) {
      throw CustomError.internalServer(`${error}`)
    }
  }
}

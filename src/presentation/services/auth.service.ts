import { JwtAdapter, envs } from '../../config'
import { BcryptAdapter } from '../../config/bcrypt.adapter'
import { UserModel } from '../../data'
import { CustomError } from '../../domain'
import { LoginUserDto } from '../../domain/dtos/auth/login.dto'
import { RegisterUserDto } from '../../domain/dtos/auth/register.dto'
import { UserEntity } from '../../domain/entities/user.entity'
import { EmailService } from './email.service'

export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({ email: registerUserDto.email })
    if (existUser) throw CustomError.badRequest('Email already exist')

    try {
      const user = new UserModel(registerUserDto)
      // Encriptar la contraseña
      user.password = BcryptAdapter.hash(registerUserDto.password)
      await user.save()

      // Envia email de confirmacion
      await this.sendEmailValidationLink(user.email)

      const token = await JwtAdapter.generateToken({
        id: user.id
      })

      if (!token) throw CustomError.internalServer('Error wile creating JWT')

      const { password, ...userEntity } = UserEntity.fromObject(user)
      return {
        user: userEntity,
        token: token
      }
    } catch (error) {
      throw CustomError.internalServer(`${error}`)
    }
  }

  public async loginUser(loginUserDto: LoginUserDto) {
    const user = await UserModel.findOne({ email: loginUserDto.email })
    if (!user) throw CustomError.badRequest('User / Password incorrect')

    const isMatch = BcryptAdapter.compare(loginUserDto.password, user.password)
    if (!isMatch) throw CustomError.badRequest('User / Password incorrect')

    const { password, ...userEntity } = UserEntity.fromObject(user)

    const token = await JwtAdapter.generateToken({
      id: user.id
    })

    if (!token) throw CustomError.internalServer('Error wile creating JWT')

    return {
      user: userEntity,
      token: token
    }
  }

  private sendEmailValidationLink = async (email: string) => {
    const token = await JwtAdapter.generateToken({ email })

    if (!token) throw CustomError.internalServer('Error to generate token')

    const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`

    const htmlBody = `
    <h1>Validate your email</h1>
    <p>Click on the following link to validate your email</p>
    <a href="${link}">Validate your email</a>
    `

    const options = {
      to: email,
      subject: 'Validate your email',
      htmlBody
    }

    const isSent = await this.emailService.sendEmail(options)
    if (!isSent) throw CustomError.internalServer('Error sending email')

    return true
  }

  public validateEmail = async (token: string) => {
    const payload = await JwtAdapter.validateToken(token)
    if (!payload) throw CustomError.unauthorized('Invalid token')

    const { email } = payload as { email: string }
    if (!email) throw CustomError.internalServer('Email not exists in token')

    const user = await UserModel.findOne({ email })
    if (!user) throw CustomError.internalServer('User not exists')

    user.emailValidated = true
    user.save()

    return true
  }
}

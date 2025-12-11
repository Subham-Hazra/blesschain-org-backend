import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email: string | undefined;

  @IsString()
  public password: string | undefined;
}

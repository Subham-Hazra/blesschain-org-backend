import {IsString } from 'class-validator';

export class CreateUserMobileDto {
  @IsString()
  public mobile: string | undefined;
}

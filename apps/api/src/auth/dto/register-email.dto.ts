import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterEmailDto {
  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  referralCode?: string;
}

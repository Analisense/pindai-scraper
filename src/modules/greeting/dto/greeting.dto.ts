import { IsMongoId, IsString } from 'class-validator';

export default class GreetingDto {
  @IsMongoId()
  id?: string;

  @IsString()
  name: string;

  @IsString()
  username: string;

  @IsString()
  greetingMsg: string;
}

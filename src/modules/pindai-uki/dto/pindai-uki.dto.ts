import { IsArray, IsMongoId, IsString } from 'class-validator';

export default class PindaiUkiDto {
  @IsMongoId()
  id?: string;

  @IsString()
  uuid: string;

  @IsString()
  name: string;

  @IsString()
  jenis_pt: string;

  @IsString()
  jenis_satker: string;

  @IsString()
  aksi: string;

  @IsArray()
  data: Array<string>;
}

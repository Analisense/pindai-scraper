import { IsJSON, IsMongoId, IsNumber, IsString } from 'class-validator';

export default class PindaiPtDto {
  @IsMongoId()
  id?: string;

  @IsNumber()
  univCode: number;

  @IsString()
  name: string;

  @IsJSON()
  progress: JSON;

  @IsString()
  aksi: string;

  @IsJSON()
  detailPt: JSON;
}

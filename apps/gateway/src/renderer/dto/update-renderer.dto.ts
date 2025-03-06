import { PartialType } from '@nestjs/mapped-types';
import { CreateRendererDto } from './create-renderer.dto';

export class UpdateRendererDto extends PartialType(CreateRendererDto) {
  id: number;
}

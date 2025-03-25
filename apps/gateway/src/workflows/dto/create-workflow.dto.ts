import { IsString, MinLength, MaxLength, Matches, IsUUID } from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  title: string;

  @IsString()
  @IsUUID()
  copyFromFlowId?: string;

  @IsString()
  @IsUUID()
  authorId: string;
}
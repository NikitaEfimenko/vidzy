import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { CreateInviteLinkDto } from './dto/create-invite-dto';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  create(@Body() createWorkflowDto: CreateWorkflowDto) {
    return this.workflowsService.create(createWorkflowDto, createWorkflowDto.authorId);
  }

  @Get()
  findAll(@Body() { userId }: {userId: string}) {
    return this.workflowsService.findAll(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkflowDto: UpdateWorkflowDto) {
    if (!updateWorkflowDto.authorId) return new BadRequestException()
    return this.workflowsService.update(id, updateWorkflowDto, updateWorkflowDto.authorId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body() { userId }: {userId: string}) {
    return this.workflowsService.remove(id, userId);
  }

  @Post(':id/invites')
  createInvite(
    @Param('id') workflowId: string,
    @Body() createInviteDto: CreateInviteLinkDto,
  ) {
    return this.workflowsService.createInviteLink(workflowId, createInviteDto.userId, createInviteDto);
  }

  @Post('invites/:token/accept')
  acceptInvite(@Param('token') token: string, @Body() { userId }: {userId: string}) {
    console.log(userId, "console!!")
    return this.workflowsService.acceptInvite(token, userId);
  }

  @Delete('invites/:id')
  removeInvite(@Param('id') id: string, @Body() { userId }: {userId: string}) {
    return this.workflowsService.removeInviteLink(id, userId);
  }
}

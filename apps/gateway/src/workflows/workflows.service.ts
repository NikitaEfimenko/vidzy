import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE } from 'src/database/database.module';
import { DrizzleDB } from 'src/database/types';
import { renderWorkflows, workflowInviteLinks, workflowAccess } from '@vidzy/database';
import { or, eq, exists, and, isNull, gt, gte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { CreateInviteLinkDto } from './dto/create-invite-dto';

@Injectable()
export class WorkflowsService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
  ) { }

  async create(createWorkflowDto: CreateWorkflowDto, authorId: string) {
    let flowDataToInsert: Record<string, any> | undefined = undefined

    // Если указан copyFromFlowId, копируем данные из существующего workflow
    if (createWorkflowDto.copyFromFlowId) {
      const [sourceWorkflow] = await this.db
        .select({ flowData: renderWorkflows.flowData })
        .from(renderWorkflows)
        .where(eq(renderWorkflows.id, createWorkflowDto.copyFromFlowId))
        .execute();
  
      if (!sourceWorkflow) {
        throw new NotFoundException('Source workflow not found');
      }
  
      // Проверяем, есть ли у пользователя доступ к исходному workflow
      const hasAccess = await this.checkWorkflowAccess(
        createWorkflowDto.copyFromFlowId,
        authorId
      );
  
      if (!hasAccess) {
        throw new ForbiddenException('No access to source workflow');
      }
  
      flowDataToInsert = sourceWorkflow.flowData as Record<string, any>;
    }
  
    const [workflow] = await this.db
      .insert(renderWorkflows)
      .values({
        ...createWorkflowDto,
        authorId,
        flowData: flowDataToInsert ?? {}
      })
      .returning();

    return workflow;
  }

  private async checkWorkflowAccess(workflowId: string, userId: string): Promise<boolean> {
    // Проверяем, является ли пользователь автором или имеет доступ через invite
    const [workflow] = await this.db
      .select()
      .from(renderWorkflows)
      .where(
        and(
          eq(renderWorkflows.id, workflowId),
          or(
            eq(renderWorkflows.authorId, userId),
            eq(renderWorkflows.public, true),
            exists(
              this.db
                .select()
                .from(workflowAccess)
                .where(
                  and(
                    eq(workflowAccess.workflowId, workflowId),
                    eq(workflowAccess.userId, userId)
                  )
                )
            )
          )
        )
      );
  
    return !!workflow;
  }

  async findAll(userId: string) {
    return this.db
      .select()
      .from(renderWorkflows)
      .where(
        or(
          eq(renderWorkflows.authorId, userId),
          eq(renderWorkflows.public, true),
          exists(
            this.db
              .select()
              .from(workflowAccess)
              .where(
                and(
                  eq(workflowAccess.workflowId, renderWorkflows.id),
                  eq(workflowAccess.userId, userId)
                )
              )
          )
        )
      );
  }

  async findOne(id: string, userId: string) {
    const [workflow] = await this.db
      .select()
      .from(renderWorkflows)
      .where(
        and(
          eq(renderWorkflows.id, id),
          or(
            eq(renderWorkflows.authorId, userId),
            eq(renderWorkflows.public, true),
            exists(
              this.db
                .select()
                .from(workflowAccess)
                .where(
                  and(
                    eq(workflowAccess.workflowId, id),
                    eq(workflowAccess.userId, userId)
                  )
                )
            )
          )
        ))

    if (!workflow) {
      throw new NotFoundException('Workflow not found or access denied');
    }
    return workflow;
  }

  async update(id: string, updateWorkflowDto: UpdateWorkflowDto, userId: string) {
    const [workflow] = await this.db
      .update(renderWorkflows)
      .set(updateWorkflowDto)
      .where(
        and(
          eq(renderWorkflows.id, id),
          eq(renderWorkflows.authorId, userId)
        )
      )
      .returning();

    if (!workflow) {
      throw new NotFoundException('Workflow not found or you are not the author');
    }
    return workflow;
  }

  async remove(id: string, userId: string) {
    const [workflow] = await this.db
      .delete(renderWorkflows)
      .where(
        and(
          eq(renderWorkflows.id, id),
          eq(renderWorkflows.authorId, userId)
        )
      )
      .returning();

    if (!workflow) {
      throw new NotFoundException('Workflow not found or you are not the author');
    }
    return workflow;
  }

  async createInviteLink(
    workflowId: string,
    creatorId: string,
    createInviteDto: CreateInviteLinkDto
  ) {
    // Проверяем, что workflow существует и пользователь - автор
    const [workflow] = await this.db
      .select()
      .from(renderWorkflows)
      .where(
        and(
          eq(renderWorkflows.id, workflowId),
          eq(renderWorkflows.authorId, creatorId)
        )
      );

    if (!workflow) {
      throw new NotFoundException('Workflow not found or you are not the author');
    }

    const token = uuidv4();
    const [inviteLink] = await this.db
      .insert(workflowInviteLinks)
      .values({
        workflowId,
        creatorId,
        token,
        ...createInviteDto,
      })
      .returning();

    return inviteLink;
  }

  async acceptInvite(token: string, userId: string) {
    const [invite] = await this.db
      .select()
      .from(workflowInviteLinks)
      .where(
        and(
          eq(workflowInviteLinks.token, token),
          or(
            isNull(workflowInviteLinks.expiresAt),
            gt(workflowInviteLinks.expiresAt, new Date())
          ),
          or(
            isNull(workflowInviteLinks.maxUses),
            gt(workflowInviteLinks.maxUses, 0)
          )
        )
      );

    if (!invite) {
      throw new NotFoundException('Invite link not found, expired or reached max uses');
    }

    // Проверяем, есть ли уже доступ
    const [existingAccess] = await this.db
      .select()
      .from(workflowAccess)
      .where(
        and(
          eq(workflowAccess.workflowId, invite.workflowId),
          eq(workflowAccess.userId, userId)
        )
      );

    if (existingAccess) {
      throw new ConflictException('You already have access to this workflow');
    }

    // Создаем запись о доступе
    const [access] = await this.db
      .insert(workflowAccess)
      .values({
        workflowId: invite.workflowId,
        userId,
        invitedById: invite.creatorId,
        inviteLinkId: invite.id,
      })
      .returning();

    // Обновляем счетчик использований, если есть maxUses
    if (invite.maxUses) {
      await this.db
        .update(workflowInviteLinks)
        .set({ maxUses: invite.maxUses - 1 })
        .where(eq(workflowInviteLinks.id, invite.id));
    }

    return access;
  }

  async removeInviteLink(id: string, userId: string) {
    // Проверяем, что invite принадлежит пользователю
    const [invite] = await this.db
      .select()
      .from(workflowInviteLinks)
      .where(
        and(
          eq(workflowInviteLinks.id, id),
          eq(workflowInviteLinks.creatorId, userId)
        )
      );

    if (!invite) {
      throw new NotFoundException('Invite link not found or you are not the creator');
    }

    // Удаляем связанные доступы
    await this.db
      .delete(workflowAccess)
      .where(eq(workflowAccess.inviteLinkId, id));

    // Удаляем саму ссылку
    const [deletedInvite] = await this.db
      .delete(workflowInviteLinks)
      .where(eq(workflowInviteLinks.id, id))
      .returning();

    return deletedInvite;
  }
}

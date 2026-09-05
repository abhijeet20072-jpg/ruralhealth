import { db } from './db';
import crypto from 'crypto';

export type NotificationType = 
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_REMINDER'
  | 'REFERRAL_CREATED'
  | 'REFERRAL_ACCEPTED'
  | 'DIAGNOSTIC_READY'
  | 'DIAGNOSTIC_REVIEWED'
  | 'FOLLOW_UP_DUE'
  | 'FOLLOW_UP_OVERDUE'
  | 'TRIAGE_ESCALATION'
  | 'SYSTEM_ALERT';

export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface CreateNotificationParams {
  recipientUserId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  priority?: Priority;
}

export const createNotification = (params: CreateNotificationParams, runInTx = true): void => {
  const insert = () => {
    db.prepare(`
      INSERT INTO notifications (id, recipientUserId, type, title, message, relatedEntityType, relatedEntityId, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      params.recipientUserId,
      params.type,
      params.title,
      params.message,
      params.relatedEntityType || null,
      params.relatedEntityId || null,
      params.priority || 'NORMAL'
    );
  };
  
  if (runInTx) {
    db.transaction(insert)();
  } else {
    insert();
  }
};

export const createNotifications = (paramsList: CreateNotificationParams[]): void => {
  db.transaction(() => {
    for (const params of paramsList) {
      createNotification(params, false);
    }
  })();
};

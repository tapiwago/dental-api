const Notification = require('../models/Notification');
const { v4: uuidv4 } = require('uuid');

/**
 * Notification service for handling all notification logic
 */
class NotificationService {
  
  /**
   * Create and send a notification
   */
  static async createNotification({
    recipientId,
    recipientEmail,
    title,
    message,
    type,
    priority = 'Medium',
    relatedEntityType,
    relatedEntityId,
    channels = ['inApp', 'email'],
    scheduledFor = null,
    metadata = {}
  }) {
    try {
      const notification = new Notification({
        notificationId: uuidv4(),
        recipientId,
        recipientEmail,
        title,
        message,
        type,
        priority,
        relatedEntityType,
        relatedEntityId,
        channels: channels.map(channel => ({ type: channel })),
        scheduledFor: scheduledFor || new Date(),
        metadata
      });
      
      await notification.save();
      
      // Send immediately if not scheduled for later
      if (!scheduledFor || scheduledFor <= new Date()) {
        await this.sendNotification(notification._id);
      }
      
      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }
  
  /**
   * Send a notification through configured channels
   */
  static async sendNotification(notificationId) {
    try {
      const notification = await Notification.findById(notificationId)
        .populate('recipientId', 'firstName lastName email');
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      // Update status
      notification.status = 'sent';
      
      // Send through each channel
      for (const channel of notification.channels) {
        try {
          switch (channel.type) {
            case 'email':
              await this.sendEmail(notification);
              channel.status = 'sent';
              channel.sentAt = new Date();
              break;
              
            case 'inApp':
              // In-app notifications are handled by storing in DB
              channel.status = 'delivered';
              channel.sentAt = new Date();
              channel.deliveredAt = new Date();
              break;
              
            case 'sms':
              await this.sendSMS(notification);
              channel.status = 'sent';
              channel.sentAt = new Date();
              break;
              
            case 'push':
              await this.sendPush(notification);
              channel.status = 'sent';
              channel.sentAt = new Date();
              break;
          }
        } catch (channelError) {
          console.error(`Failed to send via ${channel.type}:`, channelError);
          channel.status = 'failed';
          channel.failureReason = channelError.message;
        }
      }
      
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }
  
  /**
   * Send email notification
   */
  static async sendEmail(notification) {
    // Implement email sending logic here
    // This would integrate with services like SendGrid, AWS SES, etc.
    console.log(`Sending email to ${notification.recipientEmail}: ${notification.title}`);
    
    // Mock email sending
    return new Promise(resolve => setTimeout(resolve, 100));
  }
  
  /**
   * Send SMS notification
   */
  static async sendSMS(notification) {
    // Implement SMS sending logic here
    // This would integrate with services like Twilio, AWS SNS, etc.
    console.log(`Sending SMS: ${notification.message}`);
    
    // Mock SMS sending
    return new Promise(resolve => setTimeout(resolve, 100));
  }
  
  /**
   * Send push notification
   */
  static async sendPush(notification) {
    // Implement push notification logic here
    // This would integrate with Firebase, Apple Push, etc.
    console.log(`Sending push notification: ${notification.title}`);
    
    // Mock push sending
    return new Promise(resolve => setTimeout(resolve, 100));
  }
  
  /**
   * Create task assignment notification
   */
  static async notifyTaskAssigned(task, assignedUser, assignedBy) {
    return this.createNotification({
      recipientId: assignedUser._id,
      recipientEmail: assignedUser.email,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: "${task.name}"`,
      type: 'TaskAssigned',
      priority: task.priority || 'Medium',
      relatedEntityType: 'Task',
      relatedEntityId: task._id,
      metadata: {
        triggeredBy: assignedBy._id,
        triggerEvent: 'taskAssignment',
        taskName: task.name,
        dueDate: task.dueDate
      }
    });
  }
  
  /**
   * Create task overdue notification
   */
  static async notifyTaskOverdue(task, assignedUser) {
    return this.createNotification({
      recipientId: assignedUser._id,
      recipientEmail: assignedUser.email,
      title: 'Task Overdue',
      message: `Task "${task.name}" is overdue. Due date was ${task.dueDate.toDateString()}`,
      type: 'TaskOverdue',
      priority: 'High',
      relatedEntityType: 'Task',
      relatedEntityId: task._id,
      metadata: {
        triggerEvent: 'taskOverdue',
        taskName: task.name,
        dueDate: task.dueDate,
        daysPastDue: Math.ceil((new Date() - task.dueDate) / (1000 * 60 * 60 * 24))
      }
    });
  }
  
  /**
   * Create status update notification
   */
  static async notifyStatusUpdate(entity, entityType, oldStatus, newStatus, updatedBy, champion) {
    return this.createNotification({
      recipientId: champion._id,
      recipientEmail: champion.email,
      title: `${entityType} Status Updated`,
      message: `${entityType} status changed from "${oldStatus}" to "${newStatus}"`,
      type: 'StatusUpdate',
      priority: 'Medium',
      relatedEntityType: entityType,
      relatedEntityId: entity._id,
      metadata: {
        triggeredBy: updatedBy._id,
        triggerEvent: 'statusUpdate',
        oldStatus,
        newStatus
      }
    });
  }
  
  /**
   * Create document upload notification
   */
  static async notifyDocumentUploaded(document, uploadedBy, champion) {
    return this.createNotification({
      recipientId: champion._id,
      recipientEmail: champion.email,
      title: 'Document Uploaded',
      message: `New document "${document.name}" has been uploaded`,
      type: 'DocumentUploaded',
      priority: document.isVital ? 'High' : 'Medium',
      relatedEntityType: 'Document',
      relatedEntityId: document._id,
      metadata: {
        triggeredBy: uploadedBy._id,
        triggerEvent: 'documentUpload',
        documentName: document.name,
        isVital: document.isVital
      }
    });
  }
  
  /**
   * Create workflow guide assignment notification
   */
  static async notifyGuideAssigned(guide, onboardingCase, assignedBy, teamMembers) {
    const notifications = [];
    
    for (const member of teamMembers) {
      const notification = await this.createNotification({
        recipientId: member._id,
        recipientEmail: member.email,
        title: 'Workflow Guide Assigned',
        message: `A new workflow guide "${guide.title}" has been assigned to your onboarding case`,
        type: 'GuideAssigned',
        priority: 'Medium',
        relatedEntityType: 'WorkflowGuide',
        relatedEntityId: guide._id,
        metadata: {
          triggeredBy: assignedBy._id,
          triggerEvent: 'guideAssignment',
          guideName: guide.title,
          caseId: onboardingCase.caseId
        }
      });
      
      notifications.push(notification);
    }
    
    return notifications;
  }
  
  /**
   * Create case completion notification
   */
  static async notifyCaseCompleted(onboardingCase, completedBy, stakeholders) {
    const notifications = [];
    
    for (const stakeholder of stakeholders) {
      const notification = await this.createNotification({
        recipientId: stakeholder._id,
        recipientEmail: stakeholder.email,
        title: 'Onboarding Case Completed',
        message: `Onboarding case for client has been completed successfully`,
        type: 'CaseCompleted',
        priority: 'High',
        relatedEntityType: 'OnboardingCase',
        relatedEntityId: onboardingCase._id,
        metadata: {
          triggeredBy: completedBy._id,
          triggerEvent: 'caseCompletion',
          caseId: onboardingCase.caseId,
          completionDate: new Date()
        }
      });
      
      notifications.push(notification);
    }
    
    return notifications;
  }
  
  /**
   * Process scheduled notifications
   */
  static async processScheduledNotifications() {
    try {
      const scheduledNotifications = await Notification.find({
        status: 'pending',
        scheduledFor: { $lte: new Date() }
      });
      
      for (const notification of scheduledNotifications) {
        await this.sendNotification(notification._id);
      }
      
      console.log(`Processed ${scheduledNotifications.length} scheduled notifications`);
    } catch (error) {
      console.error('Failed to process scheduled notifications:', error);
    }
  }
  
  /**
   * Check for overdue tasks and send notifications
   */
  static async checkOverdueTasks() {
    try {
      const Task = require('../models/Task');
      const User = require('../models/User');
      
      const overdueTasks = await Task.find({
        status: { $nin: ['Completed', 'Cancelled'] },
        dueDate: { $lt: new Date() },
        overdueNotificationSent: false
      }).populate('assignedTo');
      
      for (const task of overdueTasks) {
        for (const assignedUser of task.assignedTo) {
          await this.notifyTaskOverdue(task, assignedUser);
        }
        
        // Mark as notified to avoid duplicate notifications
        task.overdueNotificationSent = true;
        await task.save();
      }
      
      console.log(`Sent overdue notifications for ${overdueTasks.length} tasks`);
    } catch (error) {
      console.error('Failed to check overdue tasks:', error);
    }
  }
}

module.exports = NotificationService;

import { messaging } from '../config/firebase.js';

export const NotificationService = {
  async sendToTopic(topic, title, body, data = {}) {
    const payload = {
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ),
      topic
    };

    try {
      await messaging.send(payload);
      return { delivered: true };
    } catch (error) {
      return { delivered: false, reason: error.message };
    }
  }
};

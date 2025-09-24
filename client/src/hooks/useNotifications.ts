import { useState, useEffect } from 'react';

export interface TabNotification {
  tabId: string;
  count: number;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

const NOTIFICATIONS_STORAGE_KEY = 'ttrpg-tab-notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<TabNotification[]>([]);
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set());

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data && typeof data === 'object') {
          if (Array.isArray(data.notifications)) {
            setNotifications(data.notifications);
          }
          if (Array.isArray(data.visitedTabs)) {
            setVisitedTabs(new Set(data.visitedTabs));
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load notification state:', error);
      // Reset to safe defaults if localStorage is corrupted
      setNotifications([]);
      setVisitedTabs(new Set());
    }
  }, []);

  // Save notifications to localStorage when updated
  useEffect(() => {
    try {
      const data = {
        notifications,
        visitedTabs: Array.from(visitedTabs)
      };
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save notification state:', error);
    }
  }, [notifications, visitedTabs]);

  const addNotification = (notification: TabNotification) => {
    setNotifications(prev => {
      const existing = prev.find(n => n.tabId === notification.tabId);
      if (existing) {
        return prev.map(n => 
          n.tabId === notification.tabId 
            ? { ...notification, count: Math.max(n.count, notification.count) }
            : n
        );
      }
      return [...prev, notification];
    });
  };

  const clearNotification = (tabId: string) => {
    setNotifications(prev => prev.filter(n => n.tabId !== tabId));
  };

  const markTabAsVisited = (tabId: string) => {
    setVisitedTabs(prev => new Set([...Array.from(prev), tabId]));
    // Clear notification when tab is visited
    clearNotification(tabId);
  };

  const getNotificationForTab = (tabId: string): TabNotification | undefined => {
    return notifications.find(n => n.tabId === tabId && !visitedTabs.has(tabId));
  };

  const hasNotification = (tabId: string): boolean => {
    return notifications.some(n => n.tabId === tabId && !visitedTabs.has(tabId));
  };

  const getTotalNotificationCount = (): number => {
    return notifications
      .filter(n => !visitedTabs.has(n.tabId))
      .reduce((sum, n) => sum + n.count, 0);
  };

  const resetAllNotifications = () => {
    setNotifications([]);
    setVisitedTabs(new Set());
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  };

  return {
    notifications,
    addNotification,
    clearNotification,
    markTabAsVisited,
    getNotificationForTab,
    hasNotification,
    getTotalNotificationCount,
    resetAllNotifications
  };
}
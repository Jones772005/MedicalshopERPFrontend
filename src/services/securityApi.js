import { mockSessions } from '../data/sessions';

export const getSessions = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockSessions });
    }, 500);
  });
};

export const revokeSession = async (sessionId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true, sessionId } });
    }, 500);
  });
};

export const revokeAllOtherSessions = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true } });
    }, 800);
  });
};

export const getSessions = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let currentUser = null;
      try {
        currentUser = JSON.parse(localStorage.getItem('erp_user') || 'null');
      } catch {
        currentUser = null;
      }

      if (!currentUser) {
        resolve({ data: [] });
        return;
      }

      const activeSession = [{
        id: 'SESS-CURRENT',
        userId: currentUser.id || 'USR-001',
        userName: currentUser.name || 'User',
        device: typeof navigator !== 'undefined' && navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Computer',
        browser: 'Current Browser Session',
        os: typeof navigator !== 'undefined' ? (navigator.platform || 'Operating System') : 'Current OS',
        ipAddress: '127.0.0.1 (Local)',
        location: 'Active Session',
        loginTime: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        status: 'Current'
      }];
      resolve({ data: activeSession });
    }, 200);
  });
};

export const revokeSession = async (sessionId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true, sessionId } });
    }, 200);
  });
};

export const revokeAllOtherSessions = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { success: true } });
    }, 200);
  });
};

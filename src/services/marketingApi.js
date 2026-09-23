import localDb from './localDb';
import { KEYS } from '../data/storageKeys';
import { recordAuditEvent } from './auditApi';

export const getCampaigns = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: localDb.get(KEYS.CAMPAIGNS) };
};

export const getCampaignById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const camp = localDb.getById(KEYS.CAMPAIGNS, id);
  if (!camp) throw new Error('Campaign not found');
  return { data: camp };
};

export const createCampaign = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const newCamp = localDb.insert(KEYS.CAMPAIGNS, {
    ...data,
    status: data.status || 'Draft',
    qrScans: 0,
    websiteVisits: 0,
    offerViews: 0,
    couponUsage: 0,
    newCustomers: 0,
    returningCustomers: 0,
    revenue: 0
  });
  
  await recordAuditEvent('CREATE', 'Marketing', `Created campaign ${newCamp.campaignName}`, newCamp.id);
  return { data: newCamp };
};

export const updateCampaign = async (id, data) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const updatedCamp = localDb.update(KEYS.CAMPAIGNS, id, data);
  await recordAuditEvent('UPDATE', 'Marketing', `Updated campaign ${updatedCamp.campaignName}`, id);
  return { data: updatedCamp };
};

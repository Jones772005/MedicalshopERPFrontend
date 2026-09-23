import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Save, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: 'SMS',
    targetAudience: 'All Customers',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // eslint-disable-next-line react/set-state-in-effect
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e, asDraft = false) => {
    e.preventDefault();
    console.log("Saving campaign", formData, asDraft ? "Draft" : "Active");
    navigate('/marketing/campaigns');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/marketing/campaigns')} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader title="Create Campaign" description="Design a new SMS or Email marketing campaign." />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <form className="space-y-6" onSubmit={(e) => handleSubmit(e, false)}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Campaign Name" 
              name="name"
              placeholder="e.g. Winter Wellness Promo"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Channel</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
              >
                <option value="SMS">SMS</option>
                <option value="Email">Email</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
            <select 
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
            >
              <option value="All Customers">All Customers</option>
              <option value="Active (Purchased in last 30 days)">Active (Purchased in last 30 days)</option>
              <option value="Inactive (No purchase > 90 days)">Inactive (No purchase &gt; 90 days)</option>
              <option value="Chronic Patients (Regular refills)">Chronic Patients (Regular refills)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message Template</label>
            <textarea 
              name="message"
              rows={5}
              placeholder="Type your message here... Use {name} for customer name."
              value={formData.message}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Character count: {formData.message.length}</p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-slate-700">
            <Button variant="outline" type="button" onClick={(e) => handleSubmit(e, true)}>
              <Save className="w-4 h-4 mr-2" /> Save as Draft
            </Button>
            <Button type="submit">
              <Send className="w-4 h-4 mr-2" /> Schedule / Send
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;

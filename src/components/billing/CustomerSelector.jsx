import { useState, useEffect, useRef } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { getCustomers, createCustomer } from '../../services/customerApi';
import Input from '../common/Input';
import Button from '../common/Button';

const CustomerSelector = ({ onSelect }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phoneNumber: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wrapperRef = useRef(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (err) {
      console.error('Failed to load customers', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
    if (selectedCustomer) {
      setSelectedCustomer(null);
      onSelect(null);
    }
  };

  const handleSelect = (customer) => {
    setSelectedCustomer(customer);
    setSearchTerm(customer ? `${customer.name} (${customer.phoneNumber})` : 'Walk-in Customer');
    setIsDropdownOpen(false);
    onSelect(customer);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phoneNumber && c.phoneNumber.includes(searchTerm))
  );

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phoneNumber) return;
    setIsSubmitting(true);
    try {
      const res = await createCustomer({ ...newCustomer, type: 'New', loyaltyPoints: 0, outstandingPayment: 0, status: 'Active' });
      await fetchCustomers();
      handleSelect(res.data);
      setShowModal(false);
      setNewCustomer({ name: '', phoneNumber: '' });
    } catch (err) {
      console.error('Failed to create customer', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mb-4" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
      <div className="flex space-x-2">
        <div className="relative flex-grow">
          <Input
            placeholder="Search Customer (Name/Phone)..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsDropdownOpen(true)}
            icon={<Search className="w-4 h-4" />}
          />
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <ul className="divide-y divide-gray-200 dark:divide-slate-700">
                <li 
                  className="p-3 hover:bg-gray-50 dark:hover:bg-slate-750 cursor-pointer font-medium text-gray-900 dark:text-white"
                  onClick={() => handleSelect(null)}
                >
                  Walk-in Customer
                </li>
                {filteredCustomers.map(c => (
                  <li 
                    key={c.id}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-slate-750 cursor-pointer"
                    onClick={() => handleSelect(c)}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{c.name}</div>
                    <div className="text-sm text-gray-500">{c.phoneNumber}</div>
                  </li>
                ))}
                {filteredCustomers.length === 0 && searchTerm && (
                  <li className="p-3 text-sm text-gray-500">No customers found.</li>
                )}
              </ul>
            </div>
          )}
        </div>
        <Button type="button" variant="outline" onClick={() => setShowModal(true)} className="px-3" title="New Customer">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white dark:bg-slate-800 rounded-lg max-w-sm w-full p-6 shadow-xl border border-gray-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Customer</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <Input 
                label="Name *" 
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                required
              />
              <Input 
                label="Phone Number *" 
                value={newCustomer.phoneNumber}
                onChange={(e) => setNewCustomer({...newCustomer, phoneNumber: e.target.value})}
                required
              />
              <div className="pt-2 flex justify-end space-x-2">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting || !newCustomer.name || !newCustomer.phoneNumber}>
                  {isSubmitting ? 'Saving...' : 'Save Customer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;

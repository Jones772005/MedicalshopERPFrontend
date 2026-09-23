import { useState, useRef } from 'react';
import { ScanBarcode } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const BarcodeInput = ({ onBarcodeDetected }) => {
  const [barcode, setBarcode] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (barcode.trim()) {
      onBarcodeDetected(barcode.trim());
      setBarcode('');
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <div className="flex-grow">
        <Input
          ref={inputRef}
          placeholder="Scan or Enter Barcode..."
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          icon={<ScanBarcode className="w-4 h-4 text-blue-500" />}
          autoFocus
        />
      </div>
      <Button type="submit" variant="secondary">
        Add
      </Button>
    </form>
  );
};

export default BarcodeInput;

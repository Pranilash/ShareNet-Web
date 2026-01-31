import { useState } from 'react';
import { Input, Button } from '../ui';

export default function AgreementForm({ item, onSubmit, isLoading }) {
    const [formData, setFormData] = useState({
        agreedPrice: item?.price || '',
        agreedDuration: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        terms: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const minDate = new Date().toISOString().split('T')[0];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Agreed Price ($)"
                name="agreedPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.agreedPrice}
                onChange={handleChange}
                required
            />

            {item?.mode === 'RENT' && (
                <>
                    <Input
                        label="Duration (days)"
                        name="agreedDuration"
                        type="number"
                        min="1"
                        value={formData.agreedDuration}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Start Date"
                        name="startDate"
                        type="date"
                        min={minDate}
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="End Date"
                        name="endDate"
                        type="date"
                        min={formData.startDate || minDate}
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                    />
                </>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms & Conditions (Optional)
                </label>
                <textarea
                    name="terms"
                    value={formData.terms}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional terms or notes..."
                />
            </div>

            <Button type="submit" loading={isLoading} className="w-full">
                Propose Agreement
            </Button>
        </form>
    );
}

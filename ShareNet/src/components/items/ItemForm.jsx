import { useState } from 'react';
import { Input, Select, Button } from '../ui';
import { Upload, X } from 'lucide-react';

const categories = [
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Books', label: 'Books' },
    { value: 'Furniture', label: 'Furniture' },
    { value: 'Clothing', label: 'Clothing' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Kitchen', label: 'Kitchen' },
    { value: 'Other', label: 'Other' },
];

const modes = [
    { value: 'RENT', label: 'For Rent' },
    { value: 'SELL', label: 'For Sale' },
    { value: 'GIVE', label: 'Give Away (Free)' },
];

export default function ItemForm({ initialData, onSubmit, isLoading }) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        category: initialData?.category || '',
        mode: initialData?.mode || '',
        price: initialData?.price || '',
    });
    const [photos, setPhotos] = useState([]);
    const [previews, setPreviews] = useState(initialData?.photos || []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setPhotos(prev => [...prev, ...files]);
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews(prev => [...prev, e.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value) data.append(key, value);
        });
        photos.forEach(photo => {
            data.append('photos', photo);
        });
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="What are you sharing?"
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your item, its condition, and any details..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    options={categories}
                    placeholder="Select category"
                    required
                />

                <Select
                    label="Mode"
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    options={modes}
                    placeholder="Select mode"
                    required
                />

                {formData.mode !== 'GIVE' && (
                    <Input
                        label={formData.mode === 'RENT' ? 'Price per day ($)' : 'Price ($)'}
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        required={formData.mode !== 'GIVE'}
                    />
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos (up to 5)
                </label>
                <div className="flex flex-wrap gap-4">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative w-24 h-24">
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    {previews.length < 5 && (
                        <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                            <Upload size={24} className="text-gray-400" />
                            <span className="text-xs text-gray-400 mt-1">Add</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            </div>

            <Button type="submit" loading={isLoading} className="w-full">
                {initialData ? 'Update Item' : 'Create Listing'}
            </Button>
        </form>
    );
}

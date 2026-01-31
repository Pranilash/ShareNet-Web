import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button, Loader } from '../components/ui';
import { ItemCard, ItemFilters } from '../components/items';
import useItemStore from '../stores/itemStore';
import useAuthStore from '../stores/authStore';

export default function Items() {
    const { items, isLoading, filters, setFilters, fetchItems } = useItemStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        fetchItems();
    }, [filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleReset = () => {
        setFilters({
            category: '',
            mode: '',
            priceMin: '',
            priceMax: '',
            search: ''
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Browse Items</h1>
                {isAuthenticated && (
                    <Link to="/my-items/new">
                        <Button>
                            <Plus size={18} />
                            List Item
                        </Button>
                    </Link>
                )}
            </div>

            <ItemFilters 
                filters={filters} 
                onChange={handleFilterChange} 
                onReset={handleReset}
            />

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader size="lg" />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No items found</p>
                    <p className="text-gray-400 mt-2">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map(item => (
                        <ItemCard key={item._id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}

import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { Package, Users, Shield, Clock, Search, MessageSquare } from 'lucide-react';
import useAuthStore from '../stores/authStore';

const features = [
    {
        icon: Package,
        title: 'Share Items',
        description: 'Rent, sell, or give away items you no longer need.'
    },
    {
        icon: Users,
        title: 'Campus Community',
        description: 'Connect with fellow students at your university.'
    },
    {
        icon: Shield,
        title: 'Trust System',
        description: 'Build your reputation through successful transactions.'
    },
    {
        icon: Clock,
        title: 'Smart Reminders',
        description: 'Never forget a return date with automatic reminders.'
    },
    {
        icon: Search,
        title: 'Lost & Found',
        description: 'Report or find lost items on campus.'
    },
    {
        icon: MessageSquare,
        title: 'Private Chat',
        description: 'Communicate securely with transaction partners.'
    },
];

export default function Home() {
    const { isAuthenticated } = useAuthStore();

    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <section className="text-center py-16">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Share More, <span className="text-blue-600">Spend Less</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        The campus sharing platform where students rent, sell, and share items with each other.
                        Join your university community today.
                    </p>
                    <div className="flex justify-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <Link to="/items">
                                    <Button size="lg">Browse Items</Button>
                                </Link>
                                <Link to="/my-items/new">
                                    <Button size="lg" variant="outline">List an Item</Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/register">
                                    <Button size="lg">Get Started</Button>
                                </Link>
                                <Link to="/items">
                                    <Button size="lg" variant="outline">Browse Items</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section>
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                    Why ShareNet?
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div 
                            key={index}
                            className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <feature.icon className="text-blue-600" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 rounded-2xl p-12 text-center text-white">
                <h2 className="text-3xl font-bold mb-4">
                    Ready to start sharing?
                </h2>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                    Join hundreds of students who are already saving money and reducing waste
                    by sharing items on ShareNet.
                </p>
                {!isAuthenticated && (
                    <Link to="/register">
                        <Button size="lg" variant="secondary">
                            Sign Up with Campus Email
                        </Button>
                    </Link>
                )}
            </section>
        </div>
    );
}

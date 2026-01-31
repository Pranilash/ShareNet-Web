import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Card, Button, Loader } from '../components/ui';
import { Bell, Check, MessageSquare, Package, AlertTriangle, Clock } from 'lucide-react';
import useNotificationStore from '../stores/notificationStore';

const typeIcons = {
    REQUEST_RECEIVED: Package,
    REQUEST_ACCEPTED: Check,
    AGREEMENT_PROPOSED: MessageSquare,
    AGREEMENT_ACCEPTED: Check,
    REMINDER: Clock,
    OVERDUE: AlertTriangle,
    RETURN_CONFIRMED: Check,
    DISPUTE: AlertTriangle
};

const typeColors = {
    REQUEST_RECEIVED: 'bg-blue-100 text-blue-600',
    REQUEST_ACCEPTED: 'bg-green-100 text-green-600',
    AGREEMENT_PROPOSED: 'bg-yellow-100 text-yellow-600',
    AGREEMENT_ACCEPTED: 'bg-green-100 text-green-600',
    REMINDER: 'bg-orange-100 text-orange-600',
    OVERDUE: 'bg-red-100 text-red-600',
    RETURN_CONFIRMED: 'bg-green-100 text-green-600',
    DISPUTE: 'bg-red-100 text-red-600'
};

export default function Notifications() {
    const navigate = useNavigate();
    const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
        if (notification.relatedTransaction) {
            navigate(`/transactions/${notification.relatedTransaction}`);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                    <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
                        Mark all as read
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader size="lg" />
                </div>
            ) : notifications.length === 0 ? (
                <Card>
                    <Card.Body className="text-center py-12">
                        <Bell size={48} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No notifications yet</p>
                    </Card.Body>
                </Card>
            ) : (
                <div className="space-y-2">
                    {notifications.map(notification => {
                        const Icon = typeIcons[notification.type] || Bell;
                        const colorClass = typeColors[notification.type] || 'bg-gray-100 text-gray-600';

                        return (
                            <Card 
                                key={notification._id}
                                hover
                                onClick={() => handleClick(notification)}
                                className={!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}
                            >
                                <Card.Body className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {notification.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                </Card.Body>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

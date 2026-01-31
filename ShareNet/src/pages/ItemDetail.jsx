import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, Button, Badge, Avatar, TrustScore, Modal, Loader } from '../components/ui';
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import useItemStore from '../stores/itemStore';
import useRequestStore from '../stores/requestStore';
import useAuthStore from '../stores/authStore';

const modeColors = {
    RENT: 'primary',
    SELL: 'success',
    GIVE: 'warning'
};

export default function ItemDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentItem, isLoading, fetchItem } = useItemStore();
    const { createRequest } = useRequestStore();
    const { user, isAuthenticated } = useAuthStore();
    const [currentPhoto, setCurrentPhoto] = useState(0);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        fetchItem(id);
    }, [id]);

    const handleRequest = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setIsRequesting(true);
        try {
            await createRequest({
                item: id,
                description: requestMessage || `I'd like to ${currentItem.mode.toLowerCase()} this item.`
            });
            toast.success('Request sent successfully!');
            setShowRequestModal(false);
            setRequestMessage('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setIsRequesting(false);
        }
    };

    if (isLoading || !currentItem) {
        return (
            <div className="flex justify-center py-12">
                <Loader size="lg" />
            </div>
        );
    }

    const isOwner = user?._id === currentItem.owner?._id;
    const photos = currentItem.photos || [];

    return (
        <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
                        {photos.length > 0 ? (
                            <>
                                <img
                                    src={photos[currentPhoto]}
                                    alt={currentItem.title}
                                    className="w-full h-full object-cover"
                                />
                                {photos.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentPhoto(p => (p - 1 + photos.length) % photos.length)}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPhoto(p => (p + 1) % photos.length)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No images
                            </div>
                        )}
                        {!currentItem.isAvailable && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-xl font-medium">Currently Unavailable</span>
                            </div>
                        )}
                    </div>

                    {photos.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto">
                            {photos.map((photo, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPhoto(index)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                                        index === currentPhoto ? 'border-blue-500' : 'border-transparent'
                                    }`}
                                >
                                    <img src={photo} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Item Details */}
                <div className="space-y-6">
                    <div>
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="text-3xl font-bold text-gray-900">{currentItem.title}</h1>
                            <Badge variant={modeColors[currentItem.mode]} className="text-sm">
                                {currentItem.mode}
                            </Badge>
                        </div>
                        <p className="text-gray-500 mt-1">{currentItem.category}</p>
                    </div>

                    {currentItem.price > 0 && (
                        <div className="text-3xl font-bold text-blue-600">
                            ${currentItem.price}
                            {currentItem.mode === 'RENT' && <span className="text-lg font-normal">/day</span>}
                        </div>
                    )}

                    <Card>
                        <Card.Body>
                            <h3 className="font-semibold mb-2">Description</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{currentItem.description}</p>
                        </Card.Body>
                    </Card>

                    {/* Owner Info */}
                    <Card>
                        <Card.Body className="flex items-center gap-4">
                            <Avatar src={currentItem.owner?.avatar} name={currentItem.owner?.fullName} size="lg" />
                            <div className="flex-1">
                                <h3 className="font-semibold">{currentItem.owner?.fullName}</h3>
                                <p className="text-gray-500 text-sm">@{currentItem.owner?.username}</p>
                            </div>
                            <TrustScore score={currentItem.owner?.trustScore} />
                        </Card.Body>
                    </Card>

                    {/* Actions */}
                    {!isOwner && currentItem.isAvailable && (
                        <Button 
                            size="lg" 
                            className="w-full"
                            onClick={() => setShowRequestModal(true)}
                        >
                            <MessageSquare size={20} />
                            Request This Item
                        </Button>
                    )}

                    {isOwner && (
                        <div className="flex gap-4">
                            <Button 
                                variant="outline"
                                onClick={() => navigate(`/my-items/${id}/edit`)}
                                className="flex-1"
                            >
                                Edit Item
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Request Modal */}
            <Modal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
                title="Request Item"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Send a request to {currentItem.owner?.fullName} for "{currentItem.title}"
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message (Optional)
                        </label>
                        <textarea
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add a message to your request..."
                        />
                    </div>
                    <div className="flex gap-4">
                        <Button 
                            onClick={handleRequest} 
                            loading={isRequesting}
                            className="flex-1"
                        >
                            Send Request
                        </Button>
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowRequestModal(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

import { useNavigate } from 'react-router-dom';
import { Card, Badge, Avatar, TrustScore } from '../ui';

const modeColors = {
    RENT: 'primary',
    SELL: 'success',
    GIVE: 'warning'
};

export default function ItemCard({ item }) {
    const navigate = useNavigate();

    return (
        <Card 
            hover 
            onClick={() => navigate(`/items/${item._id}`)}
            className="overflow-hidden"
        >
            <div className="aspect-video relative bg-gray-100">
                {item.photos?.[0] ? (
                    <img 
                        src={item.photos[0]} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                    </div>
                )}
                <Badge 
                    variant={modeColors[item.mode]} 
                    className="absolute top-2 right-2"
                >
                    {item.mode}
                </Badge>
                {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-medium">Unavailable</span>
                    </div>
                )}
            </div>
            <Card.Body>
                <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                {item.price > 0 && (
                    <p className="text-lg font-bold text-blue-600 mt-2">
                        ${item.price}{item.mode === 'RENT' && '/day'}
                    </p>
                )}
                {item.owner && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <Avatar src={item.owner.avatar} name={item.owner.fullName} size="sm" />
                        <span className="text-sm text-gray-600 flex-1">{item.owner.fullName}</span>
                        <TrustScore score={item.owner.trustScore} size="sm" />
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}

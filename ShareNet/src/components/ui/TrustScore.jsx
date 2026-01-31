export default function TrustScore({ score, size = 'md' }) {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-sm',
        lg: 'w-16 h-16 text-base'
    };

    const getColor = (score) => {
        if (score >= 80) return 'text-green-600 border-green-500';
        if (score >= 60) return 'text-blue-600 border-blue-500';
        if (score >= 40) return 'text-yellow-600 border-yellow-500';
        return 'text-red-600 border-red-500';
    };

    return (
        <div 
            className={`
                ${sizes[size]} 
                ${getColor(score)}
                rounded-full border-2 flex items-center justify-center font-bold
            `}
            title={`Trust Score: ${score}/100`}
        >
            {score}
        </div>
    );
}

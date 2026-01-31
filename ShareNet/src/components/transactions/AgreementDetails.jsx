import { format } from 'date-fns';
import { Card, Button } from '../ui';

export default function AgreementDetails({ transaction, isOwner, onConfirm, isLoading }) {
    const canConfirm = !isOwner && transaction.status === 'AGREEMENT_PROPOSED';

    return (
        <Card>
            <Card.Header>
                <h3 className="font-semibold">Agreement Details</h3>
            </Card.Header>
            <Card.Body className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Agreed Price</span>
                    <span className="font-bold text-lg">${transaction.agreedPrice || 0}</span>
                </div>

                {transaction.agreedDuration && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium">{transaction.agreedDuration} days</span>
                    </div>
                )}

                {transaction.startDate && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Start Date</span>
                        <span className="font-medium">
                            {format(new Date(transaction.startDate), 'MMMM d, yyyy')}
                        </span>
                    </div>
                )}

                {transaction.endDate && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">End Date</span>
                        <span className="font-medium">
                            {format(new Date(transaction.endDate), 'MMMM d, yyyy')}
                        </span>
                    </div>
                )}

                {transaction.terms && (
                    <div>
                        <span className="text-gray-600 text-sm">Terms</span>
                        <p className="mt-1 text-gray-800">{transaction.terms}</p>
                    </div>
                )}

                {canConfirm && (
                    <Button 
                        onClick={onConfirm} 
                        loading={isLoading}
                        className="w-full"
                        variant="success"
                    >
                        Confirm Agreement
                    </Button>
                )}
            </Card.Body>
        </Card>
    );
}

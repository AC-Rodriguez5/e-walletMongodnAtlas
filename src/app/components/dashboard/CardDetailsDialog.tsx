import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

interface PaymentCard {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
}

interface CardDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: PaymentCard | null;
  onAddMoney?: () => void;
  onTransfer?: () => void;
  onRemove?: () => void;
}

export function CardDetailsDialog({ open, onOpenChange, card, onAddMoney, onTransfer, onRemove }: CardDetailsDialogProps) {
  if (!card) return null;

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getCardInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  // Generate a simple QR code representation (in real app, use qrcode library)
  const generateQRCodeSVG = () => {
    return (
      <svg width="200" height="200" viewBox="0 0 200 200" className="border border-gray-300 rounded">
        <rect width="200" height="200" fill="white" />
        {/* Simple QR pattern representation */}
        <g fill="black">
          {/* Top-left finder pattern */}
          <rect x="10" y="10" width="50" height="50" />
          <rect x="20" y="20" width="30" height="30" fill="white" />
          <rect x="25" y="25" width="20" height="20" />
          
          {/* Top-right finder pattern */}
          <rect x="140" y="10" width="50" height="50" />
          <rect x="150" y="20" width="30" height="30" fill="white" />
          <rect x="155" y="25" width="20" height="20" />
          
          {/* Bottom-left finder pattern */}
          <rect x="10" y="140" width="50" height="50" />
          <rect x="20" y="150" width="30" height="30" fill="white" />
          <rect x="25" y="155" width="20" height="20" />
          
          {/* Random data pattern */}
          {Array.from({ length: 20 }).map((_, i) => (
            <g key={i}>
              {Array.from({ length: 20 }).map((_, j) => (
                Math.random() > 0.5 && (
                  <rect
                    key={`${i}-${j}`}
                    x={70 + i * 5}
                    y={70 + j * 5}
                    width="4"
                    height="4"
                    fill="black"
                  />
                )
              ))}
            </g>
          ))}
        </g>
      </svg>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{card.name}</DialogTitle>
          <DialogDescription>{card.type}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Card Display */}
          <div className={`bg-gradient-to-br ${card.color} text-white p-6 rounded-lg`}>
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-sm opacity-90">{card.type}</p>
                <h3 className="text-2xl mt-1">{card.name}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-lg">{getCardInitials(card.name)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs opacity-75">Available Balance</p>
              <p className="text-3xl">
                {formatCurrency(card.balance)}
              </p>
            </div>
          </div>

          {/* Card Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Card Information</h4>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{card.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-medium">{formatCurrency(card.balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Added:</span>
                <span className="font-medium">Dec 15, 2025</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => {
                onAddMoney?.();
              }}
              className="w-full"
              variant="default"
            >
              Add Money
            </Button>
            <Button
              onClick={() => {
                onTransfer?.();
              }}
              className="w-full"
              variant="outline"
            >
              Transfer
            </Button>
            <Button
              onClick={() => {
                onRemove?.();
              }}
              className="w-full"
              variant="destructive"
            >
              Remove
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full"
              variant="ghost"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

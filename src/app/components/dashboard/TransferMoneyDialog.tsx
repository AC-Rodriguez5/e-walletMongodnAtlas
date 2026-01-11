import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { walletAPI } from "../../../api/client";

interface PaymentCard {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
}

interface TransferMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromCard: PaymentCard | null;
  cards: PaymentCard[];
  onTransfer: (fromCardId: string, toCardId: string, amount: number) => void;
}

export function TransferMoneyDialog({ open, onOpenChange, fromCard, cards, onTransfer }: TransferMoneyDialogProps) {
  const [formData, setFormData] = useState({
    toCardId: "",
    amount: "",
    description: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!fromCard || !formData.toCardId || !formData.amount) {
      setError("Please fill in all required fields");
      return;
    }

    if (fromCard.id === formData.toCardId) {
      setError("Cannot transfer to the same card");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (fromCard.balance < amount) {
      setError(`Insufficient balance! Your ${fromCard.name} has only ₱${fromCard.balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      return;
    }

    setIsProcessing(true);
    
    try {
      const toCard = cards.find(c => c.id === formData.toCardId);
      
      // Call the API to transfer money
      await walletAPI.transferMoney(
        fromCard.id,
        formData.toCardId,
        amount,
        formData.description || `Transfer from ${fromCard.type} to ${toCard?.type}`
      );
      
      // Update local state
      onTransfer(fromCard.id, formData.toCardId, amount);
      
      alert(`Successfully transferred ₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} from ${fromCard.name} to ${toCard?.name}!`);
      
      // Reset form and close dialog
      setFormData({
        toCardId: "",
        amount: "",
        description: ""
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to transfer money. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Money</DialogTitle>
          <DialogDescription>
            Transfer funds from {fromCard?.name} to another card
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="toCardId">Transfer To *</Label>
            <Select
              value={formData.toCardId}
              onValueChange={(value) => setFormData({ ...formData, toCardId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipient card" />
              </SelectTrigger>
              <SelectContent>
                {cards.map((card) => (
                  card.id !== fromCard?.id && (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name} - ₱{card.balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="pl-8"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="e.g., Monthly savings"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Transfer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

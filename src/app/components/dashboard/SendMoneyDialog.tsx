import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { walletAPI } from "../../../api/client";

interface PaymentCard {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
}

interface SendMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardName?: string;
  cards: PaymentCard[];
  onSendMoney: (cardId: string, amount: number) => void;
}

export function SendMoneyDialog({ open, onOpenChange, cardName, cards, onSendMoney }: SendMoneyDialogProps) {
  const [formData, setFormData] = useState({
    cardId: "",
    recipientType: "",
    recipient: "",
    amount: "",
    description: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const recipientTypes = [
    { value: "phone", label: "Phone Number" },
    { value: "email", label: "Email Address" },
    { value: "account", label: "Account Number" },
    { value: "contact", label: "Saved Contact" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.cardId || !formData.recipientType || !formData.recipient || !formData.amount) {
      setError("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    const selectedCard = cards.find(c => c.id === formData.cardId);
    if (selectedCard && selectedCard.balance < amount) {
      setError(`Insufficient balance! Your ${selectedCard.name} has only ₱${selectedCard.balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      return;
    }

    setIsProcessing(true);
    
    try {
      // Call the API to send money
      await walletAPI.sendMoney(
        amount,
        formData.description || `Send money via ${formData.recipientType}`,
        formData.recipientType,
        formData.recipient,
        formData.cardId
      );
      
      // Update card balance in local state
      onSendMoney(formData.cardId, amount);
      
      alert(`Successfully sent ₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to ${formData.recipient}!`);
      
      // Reset form and close dialog
      setFormData({
        cardId: "",
        recipientType: "",
        recipient: "",
        amount: "",
        description: ""
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to send money. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Money</DialogTitle>
          <DialogDescription>
            Transfer funds from your account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="cardId">Select Card *</Label>
            <Select
              value={formData.cardId}
              onValueChange={(value) => setFormData({ ...formData, cardId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a card" />
              </SelectTrigger>
              <SelectContent>
                {cards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.type} - ₱{card.balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientType">Recipient Type *</Label>
            <Select
              value={formData.recipientType}
              onValueChange={(value) => setFormData({ ...formData, recipientType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipient type" />
              </SelectTrigger>
              <SelectContent>
                {recipientTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient {formData.recipientType && `(${recipientTypes.find(t => t.value === formData.recipientType)?.label})`} *</Label>
            <Input
              id="recipient"
              placeholder={
                formData.recipientType === "phone" ? "09123456789" :
                formData.recipientType === "email" ? "recipient@example.com" :
                formData.recipientType === "account" ? "1234567890" :
                "Select recipient..."
              }
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              required
            />
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
            <Label htmlFor="description">Message (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a message for the recipient..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="resize-none"
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
              {isProcessing ? "Processing..." : "Send Money"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

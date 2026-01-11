import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cardAPI } from "../../../api/client";

interface PaymentCard {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
}

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCard: (card: PaymentCard) => void;
  onCardAdded?: () => void;
}

const cardColors = [
  "from-blue-500 to-blue-700",
  "from-green-500 to-green-700",
  "from-purple-500 to-purple-700",
  "from-pink-500 to-pink-700",
  "from-red-500 to-red-700",
  "from-yellow-500 to-yellow-700",
  "from-indigo-500 to-indigo-700",
  "from-teal-500 to-teal-700",
];

const cardTypeMap: { [key: string]: string } = {
  "gcash": "GCash",
  "paymaya": "PayMaya",
  "gotyme": "GoTyme Bank",
  "bdo": "BDO",
  "bpi": "BPI",
  "unionbank": "UnionBank",
  "metrobank": "Metrobank",
  "landbank": "Landbank",
  "seabank": "SeaBank",
  "maya": "Maya",
  "other": "Other"
};

export function AddCardDialog({ open, onOpenChange, onAddCard, onCardAdded }: AddCardDialogProps) {
  const [formData, setFormData] = useState({
    cardType: "",
    accountName: "",
    accountNumber: "",
    initialBalance: ""
  });
  const [loading, setLoading] = useState(false);

  const cardTypes = [
    { value: "gcash", label: "GCash" },
    { value: "paymaya", label: "PayMaya" },
    { value: "gotyme", label: "GoTyme Bank" },
    { value: "bdo", label: "BDO" },
    { value: "bpi", label: "BPI" },
    { value: "unionbank", label: "UnionBank" },
    { value: "metrobank", label: "Metrobank" },
    { value: "landbank", label: "Landbank" },
    { value: "seabank", label: "SeaBank" },
    { value: "maya", label: "Maya" },
    { value: "other", label: "Other" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.cardType || !formData.accountName || !formData.accountNumber) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      
      // Call backend API to add card
      const response = await cardAPI.addCard(
        formData.accountNumber,
        formData.accountName,
        "12/25", // Dummy expiry
        "000", // Dummy CVV
        formData.cardType,
        cardTypeMap[formData.cardType] || formData.cardType,
        parseFloat(formData.initialBalance) || 0
      );

      // Create new card object for local state
      const newCard: PaymentCard = {
        id: response.card?.id || `card-${Date.now()}`,
        name: formData.accountName,
        type: cardTypeMap[formData.cardType] || formData.cardType,
        balance: parseFloat(formData.initialBalance) || 0,
        color: cardColors[Math.floor(Math.random() * cardColors.length)]
      };

      console.log("Card added successfully:", newCard);
      
      // Call the callback to update local state
      onAddCard(newCard);
      onCardAdded?.(); // Refresh cards from backend
      
      alert(`Successfully added ${newCard.type} card!`);
      
      // Reset form and close dialog
      setFormData({
        cardType: "",
        accountName: "",
        accountNumber: "",
        initialBalance: ""
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding card:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add card. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Card</DialogTitle>
          <DialogDescription>
            Connect a new payment method to your E-wallet
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardType">Card Type *</Label>
            <Select
              value={formData.cardType}
              onValueChange={(value) => setFormData({ ...formData, cardType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select card type" />
              </SelectTrigger>
              <SelectContent>
                {cardTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name *</Label>
            <Input
              id="accountName"
              placeholder="Juan Dela Cruz"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account/Mobile Number *</Label>
            <Input
              id="accountNumber"
              placeholder="09123456789"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Enter your mobile number or account number
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialBalance">Current Balance (Optional)</Label>
            <Input
              id="initialBalance"
              type="number"
              placeholder="0.00"
              value={formData.initialBalance}
              onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              This helps track your total balance across all cards
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Card"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

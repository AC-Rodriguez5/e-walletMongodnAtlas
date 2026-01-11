import { useState, useEffect } from "react";
import { CreditCard, Eye, EyeOff, Plus } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { AddMoneyDialog } from "./AddMoneyDialog";
import { TransferMoneyDialog } from "./TransferMoneyDialog";
import { RemoveCardDialog } from "./RemoveCardDialog";
import { CardDetailsDialog } from "./CardDetailsDialog";

interface PaymentCard {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
  logo?: string;
}

interface PaymentCardsProps {
  onAddCard: () => void;
  cards: PaymentCard[];
  onAddMoney: (cardId: string, amount: number) => void;
  onSendMoney: (cardId: string, amount: number) => void;
  onTransferMoney: (fromCardId: string, toCardId: string, amount: number) => void;
}

export function PaymentCards({ onAddCard, cards: externalCards, onAddMoney, onSendMoney, onTransferMoney }: PaymentCardsProps) {
  const [showBalances, setShowBalances] = useState(true);
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);
  const [isCardDetailsOpen, setIsCardDetailsOpen] = useState(false);
  const [isTransferMoneyOpen, setIsTransferMoneyOpen] = useState(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isRemoveCardOpen, setIsRemoveCardOpen] = useState(false);
  const [isRemovingCard, setIsRemovingCard] = useState(false);
  
  // Use external cards - no fallback to hardcoded data
  const [cards, setCards] = useState<PaymentCard[]>(externalCards);

  // Sync local cards state with external cards prop
  useEffect(() => {
    if (externalCards.length > 0) {
      setCards(externalCards);
    }
  }, [externalCards]);

  const handleRemoveCard = async () => {
    setIsRemovingCard(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (selectedCard) {
      console.log("Removing card:", selectedCard.name);
      setCards(cards.filter(card => card.id !== selectedCard.id));
      alert(`${selectedCard.name} has been removed successfully!`);
    }
    
    setIsRemovingCard(false);
    setIsRemoveCardOpen(false);
    setSelectedCard(null);
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getCardInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">My Payment Cards</h2>
          <p className="text-sm text-muted-foreground">
            Manage all your payment methods in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowBalances(!showBalances)}
          >
            {showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button onClick={onAddCard}>
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`bg-gradient-to-br ${card.color} text-white border-0 cursor-pointer hover:scale-105 transition-transform`}
            onClick={() => {
              setSelectedCard(card);
              setIsCardDetailsOpen(true);
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-sm opacity-90">{card.type}</p>
                  <h3 className="text-xl mt-1">{card.name}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-sm">{getCardInitials(card.name)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs opacity-75">Available Balance</p>
                <p className="text-2xl">
                  {showBalances ? formatCurrency(card.balance) : "••••••"}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs opacity-75">Tap to view details</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Card Button */}
        <Card
          className="border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={onAddCard}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[240px]">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg mb-1">Add New Card</h3>
            <p className="text-sm text-muted-foreground text-center">
              Connect another payment method
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Card Details Dialog */}
      <CardDetailsDialog 
        open={isCardDetailsOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCardDetailsOpen(false);
          } else {
            setIsCardDetailsOpen(true);
          }
        }}
        card={selectedCard}
        onAddMoney={() => {
          setIsCardDetailsOpen(false);
          setIsAddMoneyOpen(true);
        }}
        onTransfer={() => {
          setIsCardDetailsOpen(false);
          setIsTransferMoneyOpen(true);
        }}
        onRemove={() => {
          setIsCardDetailsOpen(false);
          setIsRemoveCardOpen(true);
        }}
      />

      {/* Transfer Money Dialog */}
      <TransferMoneyDialog
        open={isTransferMoneyOpen}
        onOpenChange={setIsTransferMoneyOpen}
        fromCard={selectedCard}
        cards={cards}
        onTransfer={(fromCardId, toCardId, amount) => {
          onTransferMoney(fromCardId, toCardId, amount);
          setSelectedCard(null);
        }}
      />

      {/* Add Money Dialog */}
      <AddMoneyDialog
        open={isAddMoneyOpen}
        onOpenChange={setIsAddMoneyOpen}
        receiverCard={selectedCard}
        onMoneyAdded={() => {
          if (selectedCard) {
            onAddMoney(selectedCard.id, 0); // Trigger parent refresh
          }
          setSelectedCard(null);
        }}
      />

      {/* Remove Card Dialog */}
      <RemoveCardDialog
        open={isRemoveCardOpen}
        onOpenChange={setIsRemoveCardOpen}
        cardName={selectedCard?.name}
        onConfirm={handleRemoveCard}
        isProcessing={isRemovingCard}
      />
    </div>
  );
}

/**
 * ================================================================
 * ADD MONEY DIALOG COMPONENT
 * ================================================================
 * 
 * PURPOSE:
 * Provides a dual-purpose dialog for:
 * 1. Viewing account information (QR code, account details)
 * 2. Adding funds to a specific card
 * 
 * FEATURES:
 * - Two tabs: "Account Info" and "Add Funds"
 * - QR code generation for easy account sharing
 * - Account number display and details
 * - Form to add money to selected card
 * - Real-time balance updates after successful addition
 */

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { cardAPI } from "../../../api/client";

// ================================================================
// TYPE DEFINITIONS
// ================================================================
interface PaymentCard {
  id: string;           // Unique card identifier
  name: string;         // Card/bank name (e.g., "PayMaya", "GoTyme Bank")
  type: string;         // Card type (e.g., "debit", "credit")
  balance: number;      // Current card balance
  color: string;        // Tailwind gradient class for card styling
}

interface AddMoneyDialogProps {
  open: boolean;                        // Whether dialog is visible
  onOpenChange: (open: boolean) => void; // Callback to control dialog visibility
  receiverCard?: PaymentCard | null;    // Selected card to add money to
  onMoneyAdded?: () => void;            // Callback when money is successfully added
}

export function AddMoneyDialog({ open, onOpenChange, receiverCard, onMoneyAdded }: AddMoneyDialogProps) {
  
  // ================================================================
  // STATE MANAGEMENT
  // ================================================================
  const [amount, setAmount] = useState("");              // Amount to add (string for input)
  const [loading, setLoading] = useState(false);        // Loading state during API call
  const [tab, setTab] = useState<"info" | "add">("info"); // Active tab

  // Return early if no card selected
  if (!receiverCard) return null;

  // ================================================================
  // UTILITY FUNCTIONS
  // ================================================================
  
  /**
   * Formats a number as Philippine Peso currency
   * @param num - Number to format
   * @returns Formatted string (e.g., "₱1,234.56")
   */
  const formatCurrency = (num: number) => {
    return `₱${num.toLocaleString('en-PH', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  /**
   * Extracts first 2 characters of card name for avatar
   * @param name - Card name
   * @returns Uppercase 2-letter initials
   */
  const getCardInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  /**
   * Generates a mock account number based on card details
   * In production, this would come from backend
   * @param cardId - Card identifier
   * @returns Mock account number
   */
  const generateAccountNumber = (cardId: string) => {
    return `${receiverCard.name.substring(0, 3).toUpperCase()}${cardId}000`;
  };

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!receiverCard?.id) {
      alert("No card selected");
      return;
    }

    try {
      setLoading(true);
      console.log('💰 Adding money to card:', receiverCard.id, 'amount:', parseFloat(amount));
      const response = await cardAPI.addMoneyToCard(receiverCard.id, parseFloat(amount), `Deposit to ${receiverCard.name}`);
      console.log('✅ Add money response:', response);
      alert("Money added successfully!");
      setAmount("");
      onMoneyAdded?.();
      onOpenChange(false);
    } catch (error) {
      console.error("❌ Error adding money:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add money. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Generate a simple QR code representation
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
          <DialogTitle>Add Money</DialogTitle>
          <DialogDescription>
            {tab === "info" ? "Share your account details to receive money" : "Add money to your wallet"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={tab === "info" ? "default" : "outline"}
            onClick={() => setTab("info")}
            className="flex-1"
          >
            Account Info
          </Button>
          <Button
            variant={tab === "add" ? "default" : "outline"}
            onClick={() => setTab("add")}
            className="flex-1"
          >
            Add Funds
          </Button>
        </div>

        <div className="space-y-6 py-4">
          {tab === "info" ? (
            <>
              {/* Account Display */}
              <div className={`bg-gradient-to-br ${receiverCard.color} text-white p-6 rounded-lg`}>
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-sm opacity-90">{receiverCard.type}</p>
                    <h3 className="text-2xl mt-1">{receiverCard.name}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-lg">{getCardInitials(receiverCard.name)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs opacity-75">Account Number</p>
                  <p className="text-xl font-mono">
                    {generateAccountNumber(receiverCard.id)}
                  </p>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">Account QR Code</p>
                <p className="text-xs text-muted-foreground">Share this QR code to receive money</p>
                <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                  {generateQRCodeSVG()}
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Account Information</h4>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Name:</span>
                    <span className="font-medium">{receiverCard.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Number:</span>
                    <span className="font-mono font-medium text-sm">{generateAccountNumber(receiverCard.id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{receiverCard.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                Close
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount (₱)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {amount && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">You will add:</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(parseFloat(amount) || 0)}</p>
                  </div>
                )}

                <Button
                  onClick={handleAddMoney}
                  disabled={loading || !amount}
                  className="w-full"
                >
                  {loading ? "Adding..." : "Add Money"}
                </Button>

                <Button
                  onClick={() => onOpenChange(false)}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { AlertCircle } from "lucide-react";

interface RemoveCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardName?: string;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export function RemoveCardDialog({ 
  open, 
  onOpenChange, 
  cardName, 
  onConfirm,
  isProcessing = false 
}: RemoveCardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Card</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this card?
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-900">
                  {cardName ? `You are about to remove ${cardName}` : "You are about to remove this card"}
                </p>
                <p className="text-sm text-red-700">
                  This action cannot be undone. Make sure you have no pending transactions on this card.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "Removing..." : "Remove Card"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

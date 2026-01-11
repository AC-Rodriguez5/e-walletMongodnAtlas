import { ArrowDown, ArrowUp, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { useState, useEffect } from "react";
import { transactionAPI } from "../../../api/client";

interface TransactionHistoryProps {
  limit?: number;
}

export function TransactionHistory({ limit }: TransactionHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await transactionAPI.getTransactions();
        if (response && response.transactions) {
          setTransactions(response.transactions);
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const displayedTransactions = showAll || !limit ? transactions : transactions.slice(0, limit);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "received":
      case "deposit":
        return <ArrowDown className="h-4 w-4 text-green-600" />;
      case "expense":
      case "withdrawal":
        return <ArrowUp className="h-4 w-4 text-red-600" />;
      case "transfer":
      case "send":
        return <Send className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "received":
      case "deposit":
        return "text-green-600";
      case "expense":
      case "withdrawal":
        return "text-red-600";
      case "transfer":
      case "send":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const formatCurrency = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return amount >= 0 ? `+₱${formatted}` : `-₱${formatted}`;
  };

  return (
    <Card className={limit ? "" : "col-span-full"}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">
          {limit && !showAll ? "Recent Transactions" : "Transaction History"}
        </CardTitle>
        {limit && transactions.length > (limit || 0) && (
          <button 
            className="text-sm text-blue-600 hover:underline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Less" : "View All"}
          </button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className={limit ? "h-[300px]" : "h-[600px]"}>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading transactions...</p>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
            ) : (
              displayedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-full ${
                      transaction.type === "received" || transaction.transactionType === "deposit" ? "bg-green-100" :
                      transaction.type === "expense" || transaction.transactionType === "withdrawal" ? "bg-red-100" :
                      transaction.type === "send" || transaction.transactionType === "send" || 
                      transaction.type === "transfer" || transaction.transactionType === "transfer" ? "bg-blue-100" : "bg-gray-100"
                    } flex items-center justify-center`}>
                      {getTransactionIcon(transaction.type || transaction.transactionType)}
                    </div>
                    <div>
                      <p className="text-sm">{transaction.title || transaction.description}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {transaction.description || transaction.type}
                        </p>
                        <Badge variant="outline" className="text-xs h-5">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${getTransactionColor(transaction.type || transaction.transactionType)}`}>
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.date || new Date(transaction.transactionDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

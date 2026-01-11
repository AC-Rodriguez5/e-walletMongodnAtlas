import { useState, useEffect } from "react";
import { Wallet, Menu, Bell, Settings, LogOut, Plus, Eye, EyeOff, History } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FinancialOverview } from "./dashboard/FinancialOverview";
import { TransactionHistory } from "./dashboard/TransactionHistory";
import { PaymentCards } from "./dashboard/PaymentCards";
import { AuthenticatorSettings } from "./dashboard/AuthenticatorSettings";
import { AddCardDialog } from "./dashboard/AddCardDialog";
import { AddMoneyDialog } from "./dashboard/AddMoneyDialog";
import { SendMoneyDialog } from "./dashboard/SendMoneyDialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cardAPI, transactionAPI, walletAPI } from "../../api/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface PaymentCard {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
}

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

export function Dashboard({ userEmail, onLogout }: DashboardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false);
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [monthlyReceived, setMonthlyReceived] = useState(0);
  const [bankTransfers, setBankTransfers] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch user's data on mount and when refreshKey changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch cards
        console.log('📦 Fetching cards...');
        const cardsResponse = await cardAPI.getCards();
        console.log('📦 Cards response:', cardsResponse);
        if (cardsResponse && cardsResponse.cards) {
          console.log(`✅ Found ${cardsResponse.cards.length} cards`);
          const mappedCards = cardsResponse.cards.map((card: any, index: number) => ({
            id: card.id,
            name: card.bank || card.cardType,
            type: card.cardType,
            balance: card.balance || 0,
            color: [
              "from-blue-500 to-blue-700",
              "from-green-500 to-green-700",
              "from-purple-500 to-purple-700",
              "from-orange-500 to-orange-700",
            ][index % 4],
          }));
          setCards(mappedCards);
          
          // Calculate total balance from all cards
          const calculatedTotal = mappedCards.reduce((sum, card) => sum + (card.balance || 0), 0);
          setTotalBalance(calculatedTotal);
          console.log('💰 Total balance calculated from cards:', calculatedTotal);
        } else {
          console.warn('⚠️ No cards in response');
          setTotalBalance(0);
        }

        // Fetch wallet stats
        const statsResponse = await walletAPI.getStats();
        if (statsResponse && statsResponse.stats) {
          setMonthlyExpenses(statsResponse.stats.monthlyExpenses);
          setMonthlyReceived(statsResponse.stats.monthlyReceived);
          setBankTransfers(statsResponse.stats.bankTransfers);
          setTransactionCount(statsResponse.stats.transactionCount);
        }
      } catch (error) {
        console.error("❌ Failed to fetch data:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  const userName = userEmail.split("@")[0];
  const initials = userName.substring(0, 2).toUpperCase();

  // Refresh wallet data after adding money
  const refreshWalletData = async () => {
    try {
      // Refresh cards and calculate total from card balances
      const cardsResponse = await cardAPI.getCards();
      if (cardsResponse && cardsResponse.cards) {
        const mappedCards = cardsResponse.cards.map((card: any, index: number) => ({
          id: card.id,
          name: card.bank || card.cardType,
          type: card.cardType,
          balance: card.balance || 0,
          color: [
            "from-blue-500 to-blue-700",
            "from-green-500 to-green-700",
            "from-purple-500 to-purple-700",
            "from-orange-500 to-orange-700",
          ][index % 4],
        }));
        setCards(mappedCards);
        
        // Calculate total balance from all cards
        const calculatedTotal = mappedCards.reduce((sum, card) => sum + (card.balance || 0), 0);
        setTotalBalance(calculatedTotal);
      }

      const statsResponse = await walletAPI.getStats();
      if (statsResponse && statsResponse.stats) {
        setMonthlyExpenses(statsResponse.stats.monthlyExpenses);
        setMonthlyReceived(statsResponse.stats.monthlyReceived);
        setBankTransfers(statsResponse.stats.bankTransfers);
        setTransactionCount(statsResponse.stats.transactionCount);
      }
      
      // Trigger full refresh to update transactions
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Failed to refresh wallet data:", error);
    }
  };

  // Refresh cards from backend
  const refreshCards = async () => {
    try {
      const response = await cardAPI.getCards();
        if (response && response.cards) {
        const mappedCards = response.cards.map((card: any, index: number) => ({
          id: card.id,
          name: card.bank || card.cardType,
          type: card.cardType,
          balance: card.balance || 0,
          color: [
            "from-blue-500 to-blue-700",
            "from-green-500 to-green-700",
            "from-purple-500 to-purple-700",
            "from-orange-500 to-orange-700",
          ][index % 4],
        }));
        setCards(mappedCards);
      }
    } catch (error) {
      console.error("Failed to refresh cards:", error);
    }
  };

  const handleTransferMoney = async (fromCardId: string, toCardId: string, amount: number) => {
    // Update local state immediately for UI responsiveness
    setCards(cards.map(card => {
      if (card.id === fromCardId) {
        return { ...card, balance: card.balance - amount };
      }
      if (card.id === toCardId) {
        return { ...card, balance: card.balance + amount };
      }
      return card;
    }));
    
    // Refresh cards, wallet and stats from backend
    await refreshCards();
    await refreshWalletData();
  };

  const handleAddMoney = async (cardId: string, amount: number) => {
    // Update local state immediately
    setCards(cards.map(card => 
      card.id === cardId 
        ? { ...card, balance: card.balance + amount }
        : card
    ));
    
    // Refresh cards, wallet and stats from backend
    await refreshCards();
    await refreshWalletData();
  };

  const handleSendMoney = async (cardId: string, amount: number) => {
    // Update local state immediately
    setCards(cards.map(card => 
      card.id === cardId 
        ? { ...card, balance: card.balance - amount }
        : card
    ));
    
    // Refresh cards, wallet and stats from backend
    await refreshCards();
    await refreshWalletData();
  };

  const handleAddCard = (newCard: PaymentCard) => {
    setCards([...cards, newCard]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl">E-Wallet</span>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => alert("You have 2 new notifications:\n\n1. New transaction: ₱5,000 received from John Doe\n2. Security: Your account login from new device")}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{userName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cards">My Cards</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <FinancialOverview 
              showBalance={showBalance} 
              onToggleBalance={() => setShowBalance(!showBalance)}
              walletBalance={totalBalance}
              monthlyExpenses={monthlyExpenses}
              monthlyReceived={monthlyReceived}
              bankTransfers={bankTransfers}
              transactionCount={transactionCount}
            />
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab("transactions")}
                  >
                    <History className="mr-2 h-4 w-4" />
                    View History
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setIsSendMoneyOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Send Money
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      setIsAddCardOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Card
                  </Button>
                </CardContent>
              </Card>

              <TransactionHistory limit={5} key={`transactions-overview-${refreshKey}`} />
            </div>
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-6">
            <PaymentCards onAddCard={() => setIsAddCardOpen(true)} cards={cards} onAddMoney={handleAddMoney} onSendMoney={handleSendMoney} onTransferMoney={handleTransferMoney} />
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <TransactionHistory key={`transactions-full-${refreshKey}`} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <AuthenticatorSettings userEmail={userEmail} onLogout={onLogout} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Card Dialog */}
      <AddCardDialog 
        open={isAddCardOpen}
        onOpenChange={setIsAddCardOpen}
        onAddCard={handleAddCard}
        onCardAdded={refreshCards}
      />

      {/* Add Money Dialog */}
      <AddMoneyDialog 
        open={isAddMoneyOpen}
        onOpenChange={setIsAddMoneyOpen}
        receiverCard={cards.length > 0 ? cards[0] : null}
        onMoneyAdded={() => {
          refreshWalletData();
          // Force refresh of transaction history by updating a state that TransactionHistory watches
        }}
      />

      {/* Send Money Dialog */}
      <SendMoneyDialog 
        open={isSendMoneyOpen}
        onOpenChange={setIsSendMoneyOpen}
        cards={cards}
        onSendMoney={handleSendMoney}
      />
    </div>
  );
}

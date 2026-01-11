/**
 * ================================================================
 * FINANCIAL OVERVIEW COMPONENT
 * ================================================================
 * 
 * PURPOSE:
 * Displays the user's financial summary including total balance,
 * monthly expenses, money received, and bank transfers.
 * 
 * FEATURES:
 * - Total balance with toggle visibility
 * - Three statistics cards showing financial metrics
 * - Fully responsive layout (mobile, tablet, desktop)
 * - Currency formatting for Philippine Peso (₱)
 * - Percentage change indicators
 */

import { Eye, EyeOff, TrendingUp, TrendingDown, Send, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

// ================================================================
// COMPONENT PROPS INTERFACE
// ================================================================
interface FinancialOverviewProps {
  showBalance: boolean;           // Whether to show actual numbers or hide them
  onToggleBalance: () => void;    // Callback to toggle balance visibility
  walletBalance?: number;         // Total balance across all cards
  monthlyExpenses?: number;       // Total spent this month
  monthlyReceived?: number;       // Total received this month
  bankTransfers?: number;         // Total transferred to banks
  transactionCount?: number;      // Number of transactions this month
}

export function FinancialOverview({ 
  showBalance, 
  onToggleBalance,
  walletBalance = 0,
  monthlyExpenses = 0,
  monthlyReceived = 0,
  bankTransfers = 0,
  transactionCount = 0,
}: FinancialOverviewProps) {
  
  // ================================================================
  // DATA PREPARATION
  // ================================================================
  // Use provided values or fallback to defaults (0)
  const totalBalance = walletBalance;
  const monthlyExp = monthlyExpenses;
  const monthlyRecv = monthlyReceived;
  const transfers = bankTransfers;

  // ================================================================
  // CURRENCY FORMATTER
  // ================================================================
  /**
   * Formats numbers as Philippine Peso currency
   * Example: 1234.56 → ₱1,234.56
   */
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // ================================================================
  // RENDER: FINANCIAL OVERVIEW UI
  // ================================================================
  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* ============================================================
          TOTAL BALANCE CARD
          - Prominent card showing combined balance from all cards
          - Eye icon to toggle visibility (privacy feature)
          - Gradient background for visual emphasis
          ============================================================ */}
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base sm:text-lg">Total Balance</CardTitle>
          
          {/* Toggle visibility button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleBalance}
            className="text-white hover:bg-white/20"
          >
            {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Display balance or hide with dots */}
          <div className="text-2xl sm:text-3xl font-bold">
            {showBalance ? formatCurrency(totalBalance) : "••••••"}
          </div>
          <p className="text-xs sm:text-sm text-blue-100 mt-2">
            Available across all your cards
          </p>
        </CardContent>
      </Card>

      {/* ============================================================
          STATISTICS GRID
          - 3 cards showing financial metrics
          - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop
          - Icons and color coding for quick recognition
          ============================================================ */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* ========================================================
            CARD 1: MONTHLY EXPENSES
            - Shows total amount spent this month
            - Red color scheme indicates outgoing money
            - Down arrow icon for visual clarity
            ======================================================== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              This Month's Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
          </CardHeader>
          
          <CardContent>
            {/* Display amount or hide with dots */}
            <div className="text-xl sm:text-2xl font-bold">
              {showBalance ? formatCurrency(monthlyExp) : "••••••"}
            </div>
            
            {/* Percentage change from last month */}
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-600">↓ 12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        {/* ========================================================
            CARD 2: MONEY RECEIVED
            - Shows total amount received this month
            - Green color scheme indicates incoming money
            - Up arrow icon for visual clarity
            ======================================================== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Money Received
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
          </CardHeader>
          
          <CardContent>
            {/* Display amount or hide with dots */}
            <div className="text-xl sm:text-2xl font-bold">
              {showBalance ? formatCurrency(monthlyRecv) : "••••••"}
            </div>
            
            {/* Percentage change from last month */}
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">↑ 8.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        {/* ========================================================
            CARD 3: BANK TRANSFERS
            - Shows total amount transferred to banks
            - Blue color scheme for neutral/transfer operations
            - Shows transaction count for context
            ======================================================== */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Bank Transfers
            </CardTitle>
            <Send className="h-4 w-4 text-blue-600 flex-shrink-0" />
          </CardHeader>
          
          <CardContent>
            {/* Display amount or hide with dots */}
            <div className="text-xl sm:text-2xl font-bold">
              {showBalance ? formatCurrency(transfers) : "••••••"}
            </div>
            
            {/* Transaction count this month */}
            <p className="text-xs text-muted-foreground mt-1">
              {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} this month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { CircleCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";

interface VerificationSuccessProps {
  onContinue: () => void;
}

export function VerificationSuccess({ onContinue }: VerificationSuccessProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center pb-6 pt-8">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CircleCheck className="h-12 w-12 text-green-600" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="text-center space-y-4 pb-6">
          <h2 className="text-2xl">Email Verified!</h2>
          <p className="text-gray-600">
            Your email has been successfully verified. Your E-wallet account is now ready to use.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-800">
              Welcome to E-wallet! You can now securely manage your finances, send money, and track your transactions.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button 
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Continue to Dashboard
          </Button>
          
          <div className="text-center text-xs text-gray-500">
            You can now access all E-wallet features
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

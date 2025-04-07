import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Define access levels
export type AccessLevel = 'user' | 'admin';

// Define properties for the PasscodeLogin component
interface PasscodeLoginProps {
  onSuccess: (level: AccessLevel) => void;
}

// User passcode: 7796
// Admin passcode: 7799
const USER_PASSCODE = "7796";
const ADMIN_PASSCODE = "7799";

export default function PasscodeLogin({ onSuccess }: PasscodeLoginProps) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasscodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPasscode(value);
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    
    setIsSubmitting(true);
    
    // Check passcode after a short delay to simulate verification
    setTimeout(() => {
      if (passcode === ADMIN_PASSCODE) {
        onSuccess('admin');
      } else if (passcode === USER_PASSCODE) {
        onSuccess('user');
      } else {
        setError("Invalid passcode. Please try again.");
      }
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-1">
            Enter your passcode
          </label>
          <div className="flex space-x-2">
            <Input
              id="passcode"
              type="password"
              value={passcode}
              onChange={handlePasscodeChange}
              disabled={isSubmitting}
              className="text-center"
              autoComplete="off"
            />
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          type="submit"
          className="w-full bg-[#2C5E1A] hover:bg-[#4C8033]"
        >
          {isSubmitting ? "Verifying..." : "Access Documents"}
        </Button>
      </form>
      
      <div className="mt-3 text-xs text-center text-gray-500">
        <p>Enter your passcode to access Ranch documents.</p>
      </div>
    </div>
  );
}
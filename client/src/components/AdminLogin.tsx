import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [pinInput, setPinInput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();
  
  const ADMIN_PIN = "7799";
  const MAX_ATTEMPTS = 5;
  
  useEffect(() => {
    // Reset error when input changes
    if (error) setError(null);
  }, [pinInput]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if max attempts reached
    if (attempts >= MAX_ATTEMPTS) {
      setError("Too many failed attempts. Please try again later.");
      toast({
        title: "Access Locked",
        description: "Too many failed attempts. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate PIN
    if (pinInput === ADMIN_PIN) {
      toast({
        title: "Admin Access Granted",
        description: "You now have administrative access.",
      });
      onSuccess();
    } else {
      setAttempts(prev => prev + 1);
      setError(`Incorrect PIN. ${MAX_ATTEMPTS - attempts - 1} attempts remaining.`);
      setPinInput("");
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-100">
        <ShieldAlert className="h-8 w-8 text-amber-600" />
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold">Admin Authentication Required</h3>
        <p className="text-sm text-gray-500 mt-1">
          Please enter the admin PIN to access document management features.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <Input
            type="password"
            maxLength={4}
            placeholder="Enter 4-digit PIN"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="text-center text-lg tracking-widest"
            autoFocus
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
        
        <Button
          type="submit"
          className="w-full bg-[#2C5E1A] hover:bg-[#4C8033]"
          disabled={pinInput.length !== 4 || attempts >= MAX_ATTEMPTS}
        >
          Verify Admin Access
        </Button>
        
        {attempts >= MAX_ATTEMPTS && (
          <p className="text-xs text-center text-red-500">
            Your access has been temporarily restricted due to too many failed attempts.
          </p>
        )}
      </form>
    </div>
  );
}
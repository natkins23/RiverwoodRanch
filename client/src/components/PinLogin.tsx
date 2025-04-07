import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

interface PinLoginProps {
  onSuccess: () => void;
}

export default function PinLogin({ onSuccess }: PinLoginProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check against hardcoded PIN 7796
    if (pin === "7796") {
      toast({
        title: "Access Granted",
        description: "You now have access to restricted documents.",
        variant: "default",
      });
      onSuccess();
    } else {
      setError(true);
      toast({
        title: "Access Denied",
        description: "Incorrect PIN code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4 text-center">
        <Lock className="w-12 h-12 mx-auto text-[#2C5E1A] mb-2" />
        <h2 className="text-xl font-bold text-[#2C5E1A]">Restricted Area</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter your PIN to access restricted documents
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <Input
          type="password"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            if (error) setError(false);
          }}
          className={`mb-4 text-center text-lg tracking-widest ${
            error ? "border-red-500" : ""
          }`}
          maxLength={4}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-[#2C5E1A] hover:bg-[#4C8033]"
          disabled={pin.length !== 4}
        >
          Submit
        </Button>
      </form>
    </div>
  );
}
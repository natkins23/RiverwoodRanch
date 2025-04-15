import { useState } from "react";
import { useLocation } from "wouter";
import { ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getBaseApiUrl } from "@/lib/utils";

// Define access levels
export type AccessLevel = "user" | "admin";

// Define properties for the PasscodeLogin component
interface PasscodeLoginProps {
  onSuccess: (level: AccessLevel) => void;
}

export default function PasscodeLogin({ onSuccess }: PasscodeLoginProps) {
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [, setLocation] = useLocation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use the utility function to get the base API URL
      const baseApiUrl = getBaseApiUrl();
      
      const response = await fetch(`${baseApiUrl}/api/validate-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: passcode }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Invalid passcode. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        setPasscode("");
        return;
      }
      
      if (data.success) {
        const accessLevel = data.accessLevel as AccessLevel;
        // Call onSuccess to update the access level
        onSuccess(accessLevel);
        
        // Explicitly redirect to ranch portal using wouter
        setLocation('/ranch-portal');
        
        toast({
          title: accessLevel === "admin" 
            ? "Welcome, Board Member" 
            : "Welcome",
          description: accessLevel === "admin"
            ? "You now have access to all documents and features."
            : "You now have access to protected documents.",
        });
      } else {
        toast({
          title: "Invalid Passcode",
          description: data.message || "Please try again with the correct passcode.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error validating passcode:", error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setPasscode("");
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="flex text-xl items-center justify-center">
          Enter Password
        </DialogTitle>
        <DialogDescription>
          Please enter your property owner or board member passcode to access
          protected content.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="text-center text-lg tracking-widest"
            autoFocus
          />
        </div>
        {/* Access level information removed as requested */}
        <Button
          type="submit"
          className="w-full bg-[#2C5E1A] hover:bg-[#4C8033]"
          disabled={isLoading || passcode.length === 0}
        >
          {isLoading ? "Verifying..." : "Submit"}
        </Button>
      </form>
    </DialogContent>
  );
}

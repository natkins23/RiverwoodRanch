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

// Define access levels
export type AccessLevel = "user" | "admin";

// Define properties for the PasscodeLogin component
interface PasscodeLoginProps {
  onSuccess: (level: AccessLevel) => void;
}

// Passcodes stored in constants
const USER_PASSCODE = "7796";
const ADMIN_PASSCODE = "7799";

export default function PasscodeLogin({ onSuccess }: PasscodeLoginProps) {
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [, setLocation] = useLocation();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      if (passcode === ADMIN_PASSCODE) {
        onSuccess("admin");
        toast({
          title: "Welcome, Board Member",
          description: "You now have access to all documents and features.",
        });
        setLocation("/ranch-portal");
      } else if (passcode === USER_PASSCODE) {
        onSuccess("user");
        toast({
          title: "Welcome",
          description: "You now have access to protected documents.",
        });
        setLocation("/ranch-portal");
      } else {
        toast({
          title: "Invalid Passcode",
          description: "Please try again with the correct passcode.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
      setPasscode("");
    }, 500);
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

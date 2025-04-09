import { useState } from "react";
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

// User passcode: 7796
// Admin passcode: 7799
const USER_PASSCODE = "7796";
const ADMIN_PASSCODE = "7799";

export default function PasscodeLogin({ onSuccess }: PasscodeLoginProps) {
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      } else if (passcode === USER_PASSCODE) {
        onSuccess("user");
        toast({
          title: "Welcome",
          description: "You now have access to protected documents.",
        });
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
        <DialogTitle>Enter Passcode</DialogTitle>
        <DialogDescription>
          Please enter your passcode to access protected content.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Enter password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="text-center text-lg tracking-widest"
            autoFocus
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span>User: {USER_PASSCODE}</span>
          </div>
          <div className="flex items-center">
            <ShieldCheck className="h-4 w-4 mr-1" />
            <span>Admin: {ADMIN_PASSCODE}</span>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-[#2C5E1A] hover:bg-[#4C8033]"
          disabled={isLoading || passcode.length !== 4}
        >
          {isLoading ? "Verifying..." : "Submit"}
        </Button>
      </form>
    </DialogContent>
  );
}
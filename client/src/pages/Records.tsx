import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  File,
  FileText,
  FileSpreadsheet,
  ClipboardList,
  MapPin,
  Calendar,
  Upload,
  ShieldCheck,
  Eye,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PasscodeLogin, {
  AccessLevel as LoginAccessLevel,
} from "@/components/PasscodeLogin";
import { useAccessLevel } from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DocumentUpload from "@/components/DocumentUpload";
import { Document } from "@shared/schema";
import ScrollToTop from "@/components/ScrollToTop";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Documents from "@/components/Documents";

export default function RecordsPage() {
  return <Documents/>
}
import {
  ArrowRight,
  Trash2,
  Archive,
  Download,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Document } from "@shared/schema";

type Props = {
  doc: Document;
  isAdmin: boolean;
  icon: JSX.Element;
  badge: JSX.Element | null;
  onDelete?: (id: number) => void;
  onArchive?: (id: number) => void;
};

export default function RecordCard({
  doc,
  isAdmin,
  icon,
  badge,
  onDelete,
  onArchive,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {icon}
            <h3 className="font-semibold text-lg">{doc.title}</h3>
          </div>
          {badge}
        </div>
        <p className="text-sm mb-4 text-gray-600">{doc.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Updated: {new Date(doc.uploadDate).toLocaleDateString()}
          </span>
          <div className="flex gap-3">
            <a href={doc.fileContent} download target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4 text-gray-500 hover:text-[#2C5E1A]" />
            </a>
            <a href={doc.fileContent} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 text-gray-500 hover:text-[#2C5E1A]" />
            </a>
            {isAdmin && (
              <>
                <button onClick={() => onArchive?.(doc.id)} title="Archive">
                  <Archive className="w-4 h-4 text-gray-500 hover:text-amber-600" />
                </button>
                <button onClick={() => onDelete?.(doc.id)} title="Delete">
                  <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
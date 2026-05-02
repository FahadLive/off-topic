import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { MemberCard } from "./MemberCard";
import { Member } from "../../types/data";

interface MemberDetailDialogProps {
  member: Member | null;
  index: number;
  membersById: Map<string, Member>;
  vouchCounts: Map<string, number>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberDetailDialog({
  member,
  index,
  membersById,
  vouchCounts,
  open,
  onOpenChange,
}: MemberDetailDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          onClick={(e) => {
            if (e.target === e.currentTarget) onOpenChange(false);
          }}
        >
          {member && (
            <div className="relative my-auto">
              <DialogPrimitive.Title className="sr-only">
                {member.name}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">
                Full details for {member.name}
              </DialogPrimitive.Description>
              <MemberCard
                member={member}
                index={index}
                membersById={membersById}
                vouchCounts={vouchCounts}
                expanded
              />
              <DialogPrimitive.Close
                aria-label="Close"
                className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border-2 border-[#1b66f3] text-[#1b66f3] shadow-lg flex items-center justify-center hover:bg-[#1b66f3] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#1b66f3] focus:ring-offset-2"
              >
                <X className="w-4 h-4" />
              </DialogPrimitive.Close>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

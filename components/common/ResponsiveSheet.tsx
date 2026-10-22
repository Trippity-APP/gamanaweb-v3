"use client";

import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type ResponsiveSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/** Dialog from 768px up, bottom drawer below. */
export function ResponsiveSheet({ open, onOpenChange, title, description, children, footer, className }: ResponsiveSheetProps) {
  const desktop = useMediaQuery("(min-width: 768px)");

  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn("max-h-[85vh] overflow-y-auto rounded-3xl sm:max-w-lg", className)}>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          {children}
          {footer}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={cn("max-h-[90vh]", className)}>
        <DrawerHeader className="text-left">
          <DrawerTitle className="font-display text-xl">{title}</DrawerTitle>
          {description ? <DrawerDescription>{description}</DrawerDescription> : null}
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-4">{children}</div>
        {footer && <div className="border-t border-sand-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">{footer}</div>}
      </DrawerContent>
    </Drawer>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const value = controlledValue ?? uncontrolled;
  const handleChange = onValueChange ?? setUncontrolled;

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleChange }}>
      <div data-slot="tabs" className={cn("flex flex-col", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  value,
  className,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx?.value === value;

  return (
    <button
      data-slot="tabs-trigger"
      data-state={isActive ? "active" : "inactive"}
      onClick={() => ctx?.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all",
        "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        "hover:text-foreground",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  value,
  className,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const ctx = React.useContext(TabsContext);
  if (ctx?.value !== value) return null;

  return (
    <div
      data-slot="tabs-content"
      data-state={ctx?.value === value ? "active" : "inactive"}
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

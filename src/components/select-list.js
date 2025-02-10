"use client";

import { ChevronDown, List } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Blocks,
  Brain,
  Cpu,
  Database,
  Globe,
  Layout,
  LineChart,
  Network,
  Search,
  Server,
} from "lucide-react";

function SelectList({
  items = [],
  selected = "",
  minW = 200,
  onChanged,
  allowAll = false,
  placeholder = "Select data",
  idDisabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    if (items.length > 0) {
      setData(items);
    }
    if (selected) {
      setValue(selected);
    }
  }, [items, selected]);

  return (
    <div className={`space-y-2 min-w-[${minW}px] w-full`}>
      {/* <Label htmlFor="select-45">Options with icon and number</Label> */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={idDisabled}>
          <Button
            id="select-45"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background px-3 py-5 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20"
          >
            {value ? (
              <span className="flex min-w-0 items-center gap-2">
                {(() => {
                  const selectedItem = items.find(
                    (item) => item.value === value
                  );
                  if (selectedItem) {
                    const Icon = selectedItem.icon;
                    return <Icon className="h-4 w-4 text-muted-foreground" />;
                  }
                  return null;
                })()}
                <span className="truncate">
                  {items.find((item) => item.value === value)?.label}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown
              size={16}
              strokeWidth={2}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search data..." />
            <CommandList className="overflow-y-auto scrollbar-thin scrollbar-track-background scrollbar-thumb-muted-foreground">
              <CommandEmpty>No data found.</CommandEmpty>
              <CommandGroup>
                {allowAll && (
                  <CommandItem
                    value={""}
                    onSelect={() => {
                      setValue("");
                      setOpen(false);
                      onChanged("");
                    }}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <List className="h-4 w-4 text-muted-foreground" />

                      {"All"}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {items.reduce((a, b) => a + b?.number || 0, 0)}
                    </span>
                  </CommandItem>
                )}
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue);
                      setOpen(false);
                      onChanged(currentValue);
                    }}
                    className="flex items-center justify-between  cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.number.toLocaleString()}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default SelectList;

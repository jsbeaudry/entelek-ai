"use client";

import { Label } from "@/components/ui/label";
import { ChevronDown, X } from "lucide-react";
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

function MultiSelectList({ items = [], selected = [], onChanged, max = 7 }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (items.length > 0) {
      setData(items);
    }
    if (selected.length > 0) {
      setValues(selected);
    }
  }, [items, selected]);

  const toggleValue = (currentValue) => {
    setValues((prevValues) =>
      prevValues.includes(currentValue)
        ? prevValues.filter((val) => val !== currentValue)
        : values?.length < max
        ? [...values, currentValue]
        : [...values]
    );

    onChanged(
      values.includes(currentValue)
        ? values.filter((val) => val !== currentValue)
        : values?.length < max
        ? [...values, currentValue]
        : [...values]
    );
  };

  const removeValue = (valueToRemove) => {
    const newValues = values.filter((val) => val !== valueToRemove);
    setValues(newValues);
    onChanged(newValues);
  };

  return (
    <div className="space-y-2 w-full min-w-[400px]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="multiselect-45"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full h-[90px] justify-between bg-background px-3 py-0 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20"
          >
            {values.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1 py-1">
                {values.map((value) => {
                  const selectedItem = items.find(
                    (item) => item.value === value
                  );
                  return selectedItem ? (
                    <div
                      key={value}
                      className="flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-xs"
                    >
                      <selectedItem.icon className="h-3 w-3 text-muted-foreground" />
                      <span>{selectedItem.label}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeValue(value);
                        }}
                        className="hover:bg-muted-foreground/20 rounded-full"
                      >
                        <X size={12} className="text-muted-foreground" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <span className="text-muted-foreground">Select data</span>
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
            <CommandList>
              <CommandEmpty>No data found.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={() => {
                      toggleValue(item.value);
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon
                        className={`h-4 w-4 ${
                          values.includes(item.value)
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      {item.label}
                      {values.includes(item.value) && (
                        <span className="ml-2 text-xs text-primary">✓</span>
                      )}
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

export default MultiSelectList;

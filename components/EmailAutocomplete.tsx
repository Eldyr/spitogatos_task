"use client";

import { useState, useRef, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Customer } from "@/lib/types";
import { useDebounce } from "@/hooks/useDebounce";

interface EmailAutocompleteProps {
  selectedEmails: string[];
  onEmailsChange: (emails: string[]) => void;
  onBlur: () => void;
}

export function EmailAutocomplete({
  selectedEmails,
  onEmailsChange,
  onBlur,
}: EmailAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debounce = useDebounce(inputValue, 300);

  //fetching the customer emails

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debounce) {
        setIsLoading(true);
        try {
          const response = await fetch(
            "https://686547495b5d8d0339808f5d.mockapi.io/spitogatos/api/customer-email-lookup"
          );
          if (!response.ok) throw new Error("Network response was not ok.");
          const data: Customer[] = await response.json();
          const filtered = data
            .filter(
              (c) =>
                c.email.toLowerCase().includes(debounce.toLowerCase()) ||
                c.name.toLowerCase().includes(debounce.toLowerCase())
            )
            .filter((c) => !selectedEmails.includes(c.email));
          setSuggestions(filtered);
          setIsPopoverOpen(filtered.length > 0);
        } catch (error) {
          console.error("Failed to fetch customers:", error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsPopoverOpen(false);
      }
    };

    fetchSuggestions();
  }, [debounce, selectedEmails]);

  const handleSelectEmail = (email: string) => {
    onEmailsChange([...selectedEmails, email]);
    setInputValue("");
    setSuggestions([]);
    setIsPopoverOpen(false);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    onEmailsChange(selectedEmails.filter((email) => email !== emailToRemove));
  };

  return (
    //displaying the loaded emails

    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div
          className="flex flex-wrap gap-2 rounded-md border border-input bg-background p-2 text-sm ring-offset-background"
          onClick={() => inputRef.current?.focus()}
        >
          {selectedEmails.map((email) => (
            <Badge key={email} variant="secondary" className="gap-1.5">
              {email}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveEmail(email);
                }}
                className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={`Remove ${email}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            ref={inputRef}
            type="email"
            placeholder="Search or type email..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={onBlur}
            className="flex-1 border-0 shadow-none h-7 p-0 focus-visible:ring-0"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {suggestions.length > 0 ? (
              suggestions.map((customer) => (
                <button
                  type="button"
                  key={customer.id}
                  className="w-full text-left p-3 hover:bg-accent focus:bg-accent outline-none"
                  onClick={() => handleSelectEmail(customer.email)}
                >
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.email}
                  </p>
                </button>
              ))
            ) : (
              <p className="p-4 text-sm text-muted-foreground">
                No results found.
              </p>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

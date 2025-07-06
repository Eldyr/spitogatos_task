"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Mail, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { EmailAutocomplete } from "./EmailAutocomplete";
import type { Customer } from "@/lib/types";

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  destinationEmails: z
    .array(z.string().email("Invalid email address."))
    .min(1, "At least one recipient email is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function EmailComposer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      description: "",
      destinationEmails: [],
    },
  });

  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    console.log("Form Submitted:", values);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsOpen(false);
      form.reset();
      toast("Email Sent!");
    }, 1000);
  };

  const handleLoadAll = async () => {
    setIsLoadingAll(true);
    try {
      const response = await fetch(
        "https://686547495b5d8d0339808f5d.mockapi.io/spitogatos/api/customer-email-lookup"
      );
      if (!response.ok) throw new Error("Network response was not ok.");
      const customers: Customer[] = await response.json();
      const allEmails = customers.map((c) => c.email);
      const currentEmails = form.getValues("destinationEmails") ?? [];
      const newEmails = [...new Set([...currentEmails, ...allEmails])];
      form.setValue("destinationEmails", newEmails, {
        shouldValidate: true,
        shouldDirty: true,
      });
      toast("All customer emails loaded");
    } catch (error) {
      toast("Failed to load customer emails.");
    } finally {
      setIsLoadingAll(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="default" className="cursor-pointer">
          <Mail className="mr-2 h-5 w-5 " />
          New Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compose New Email</DialogTitle>
          <DialogDescription>
            Fill in the details below to send an email to your customers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Exciting News!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Start writing your email content here..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destinationEmails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Emails</FormLabel>
                    <FormControl>
                      <EmailAutocomplete
                        selectedEmails={field.value ?? []}
                        onEmailsChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleLoadAll}
                disabled={isLoadingAll}
              >
                {isLoadingAll ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Users className="mr-2 h-4 w-4" />
                )}
                Load All Customers
              </Button>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send Email
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

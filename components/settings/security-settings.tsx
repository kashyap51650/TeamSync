"use client";

import { updatePasswordAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { useToast } from "@/hooks/use-toast";
import { UpdatePasswordForm, updatePasswordSchema } from "@/schema/user-settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

export function SecuritySettings() {
  const [isLoading, setTransition] = useTransition();

  const form = useForm<UpdatePasswordForm>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { toast } = useToast();

  const handleUpdatePassword = async (formData: UpdatePasswordForm) => {
    setTransition(async () => {
      try {
        await updatePasswordAction({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
        toast({
          title: "Success",
          description: "Password updated successfully",
        });
        form.reset();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to update password";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpdatePassword)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="••••••••" label="current password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="••••••••" label="new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="••••••••" label="confirm password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button size="sm" variant="outline" type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update password"}
        </Button>
      </form>
    </Form>
  );
}

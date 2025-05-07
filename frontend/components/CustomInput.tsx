// frontend/components/CustomInput.tsx
'use client';

import React from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
// import { z } from 'zod'; // Not strictly needed in this component anymore
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils"; // Make sure this path is correct

// Define prop types using React's ComponentPropsWithoutRef
type ShadInputProps = React.ComponentPropsWithoutRef<typeof Input>;
type ShadTextareaProps = React.ComponentPropsWithoutRef<typeof Textarea>;


interface CustomInputProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: React.HTMLInputTypeAttribute | 'textarea';
  // Use the inferred prop types. Make them optional.
  inputProps?: Partial<ShadInputProps>;
  textareaProps?: Partial<ShadTextareaProps>;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
}

const CustomInput = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  type = 'text',
  inputProps,
  textareaProps, // Added textareaProps
  className,
  labelClassName,
  inputClassName,
}: CustomInputProps<TFieldValues>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col w-full", className)}>
          <FormLabel className={cn(labelClassName)}>{label}</FormLabel>
          <FormControl>
            {type === 'textarea' ? (
              <Textarea
                placeholder={placeholder}
                className={cn("input-class", inputClassName)}
                {...textareaProps} // Use textareaProps here
                {...field}
                value={field.value || ''} // Ensure textarea has a controlled string value
              />
            ) : (
              <Input
                placeholder={placeholder}
                className={cn("input-class", inputClassName)}
                type={type}
                {...inputProps} // Use inputProps here
                {...field}
              />
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage className="form-message" />
        </FormItem>
      )}
    />
  );
};

export default CustomInput;
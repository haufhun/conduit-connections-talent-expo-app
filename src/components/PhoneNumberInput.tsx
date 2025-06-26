import React, { useState } from "react";
import type { TextInputProps } from "react-native";
import { Input, InputField } from "./ui/input";

export interface PhoneNumberInputProps
  extends Omit<TextInputProps, "value" | "onChangeText" | "keyboardType"> {
  value?: string;
  onChangeText?: (phoneNumber: string) => void;
  placeholder?: string;
  variant?: "outline" | "underlined" | "rounded";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const numericValue = value.replace(/\D/g, "");

  // Format based on length
  if (numericValue.length <= 3) {
    return numericValue;
  } else if (numericValue.length <= 6) {
    return `(${numericValue.slice(0, 3)}) ${numericValue.slice(3)}`;
  } else if (numericValue.length <= 10) {
    return `(${numericValue.slice(0, 3)}) ${numericValue.slice(
      3,
      6
    )}-${numericValue.slice(6)}`;
  } else {
    // Limit to 10 digits and format
    const limitedValue = numericValue.slice(0, 10);
    return `(${limitedValue.slice(0, 3)}) ${limitedValue.slice(
      3,
      6
    )}-${limitedValue.slice(6)}`;
  }
};

const extractNumericValue = (formattedValue: string): string => {
  return formattedValue.replace(/\D/g, "");
};

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value = "",
  onChangeText,
  placeholder = "Enter phone number",
  variant = "outline",
  size = "md",
  className,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(formatPhoneNumber(value));

  const handleTextChange = (text: string) => {
    // Extract only numeric characters
    const numericValue = extractNumericValue(text);

    // Format the display value
    const formattedValue = formatPhoneNumber(numericValue);
    setDisplayValue(formattedValue);

    // Call the parent's onChangeText with the raw numeric value
    if (onChangeText) {
      onChangeText(numericValue);
    }
  };

  // Update display value when prop value changes
  React.useEffect(() => {
    setDisplayValue(formatPhoneNumber(value));
  }, [value]);

  return (
    <Input variant={variant} size={size} className={className}>
      <InputField
        {...props}
        value={displayValue}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        keyboardType="phone-pad"
        maxLength={14} // Max length for formatted phone number: (123) 456-7890
        autoComplete="tel"
        textContentType="telephoneNumber"
      />
    </Input>
  );
};

export default PhoneNumberInput;

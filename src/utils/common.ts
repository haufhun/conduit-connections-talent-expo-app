/**
 * Formats a string of digits into a pretty phone number format
 * @param phoneNumber - Raw phone number string (digits only or with separators)
 * @returns Formatted phone number string in (XXX) XXX-XXXX format
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, "");

  // Handle different lengths
  if (digits.length === 0) return "";

  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else if (digits.length <= 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else {
    // For numbers longer than 10 digits, include country code
    return `+${digits.slice(0, digits.length - 10)} (${digits.slice(
      -10,
      -7
    )}) ${digits.slice(-7, -4)}-${digits.slice(-4)}`;
  }
};

/**
 * Validates if a phone number string contains a valid US phone number
 * @param phoneNumber - Phone number string to validate
 * @returns Boolean indicating if the phone number is valid
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const digits = phoneNumber.replace(/\D/g, "");
  return (
    digits.length === 10 || (digits.length === 11 && digits.startsWith("1"))
  );
};

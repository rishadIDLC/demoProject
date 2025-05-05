import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "../../utils"; 

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const countryCodes = [
  { code: "+1", country: "US", name: "United States" },
  { code: "+44", country: "UK", name: "United Kingdom" },
  { code: "+91", country: "IN", name: "India" },
  { code: "+86", country: "CN", name: "China" },
  { code: "+81", country: "JP", name: "Japan" },
  { code: "+33", country: "FR", name: "France" },
  { code: "+49", country: "DE", name: "Germany" },
  { code: "+7", country: "RU", name: "Russia" },
  { code: "+55", country: "BR", name: "Brazil" },
  { code: "+61", country: "AU", name: "Australia" },
];

const DEFAULT_COUNTRY_CODE = "+1";

export function PhoneInput({
  value,
  onChange,
  placeholder = "Enter phone number",
  className,
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = React.useState(DEFAULT_COUNTRY_CODE);
  const [phoneNumber, setPhoneNumber] = React.useState("");

  React.useEffect(() => {
    if (value) {
      // Parse the value to extract country code and phone number
      const code = countryCodes.find((cc) => value.startsWith(cc.code));
      if (code) {
        setCountryCode(code.code);
        setPhoneNumber(value.replace(code.code, ""));
      } else {
        // If no country code found, use default and treat entire value as phone number
        setCountryCode(DEFAULT_COUNTRY_CODE);
        setPhoneNumber(value);
        onChange(`${DEFAULT_COUNTRY_CODE}${value}`);
      }
    } else {
      // Reset to default when value is empty
      setCountryCode(DEFAULT_COUNTRY_CODE);
      setPhoneNumber("");
    }
  }, [value, onChange]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = e.target.value.replace(/\D/g, ""); // Remove non-digits
    setPhoneNumber(newPhoneNumber);
    onChange(`${countryCode}${newPhoneNumber}`);
  };

  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value);
    onChange(`${value}${phoneNumber}`);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Select value={countryCode} onValueChange={handleCountryCodeChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Code" />
        </SelectTrigger>
        <SelectContent>
          {countryCodes.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.code} ({country.name})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        placeholder={placeholder}
        className="flex-1"
      />
    </div>
  );
} 
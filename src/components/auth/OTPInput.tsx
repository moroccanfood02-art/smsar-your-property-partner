import React from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="flex justify-center">
      <InputOTP
        maxLength={6}
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        <InputOTPGroup className="gap-2">
          <InputOTPSlot index={0} className="w-12 h-14 text-xl font-bold border-2 rounded-lg" />
          <InputOTPSlot index={1} className="w-12 h-14 text-xl font-bold border-2 rounded-lg" />
          <InputOTPSlot index={2} className="w-12 h-14 text-xl font-bold border-2 rounded-lg" />
          <InputOTPSlot index={3} className="w-12 h-14 text-xl font-bold border-2 rounded-lg" />
          <InputOTPSlot index={4} className="w-12 h-14 text-xl font-bold border-2 rounded-lg" />
          <InputOTPSlot index={5} className="w-12 h-14 text-xl font-bold border-2 rounded-lg" />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
};

export default OTPInput;
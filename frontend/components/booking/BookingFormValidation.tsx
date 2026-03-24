"use client";

import { useBookingValidation } from "@/lib/hooks/useBookingValidation";

interface BookingFormValidationProps {
  date: Date | null;
  startTime: string;
  endTime: string;
  pricePerHour: string;
  children: (validation: {
    isValid: boolean;
    errors: string[];
    validate: () => void;
  }) => React.ReactNode;
}

export default function BookingFormValidation({
  date,
  startTime,
  endTime,
  pricePerHour,
  children,
}: BookingFormValidationProps) {
  const { validateBooking } = useBookingValidation();
  
  const validation = validateBooking(date, startTime, endTime, pricePerHour);

  return <>{children({ ...validation, validate: () => validation })}</>;
}





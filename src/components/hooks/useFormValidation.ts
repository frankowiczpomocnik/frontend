import { useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";


interface FormState {
  step: number;
  loading: boolean;
  message: string;
  phoneError: string;
  otpError: string;
  otp: string;
  token: string | null;
}

interface UseFormValidationOptions {
  host: string;
  onStepChange?: (step: number) => void;
  onSuccess?: () => void;
}

// Generic custom hook for form validation with OTP flow
export function useFormValidation({ host, onStepChange, onSuccess }: UseFormValidationOptions) {
  const [state, setState] = useState<FormState>({
    step: 1,
    loading: false,
    message: "",
    phoneError: "",
    otpError: "",
    otp: "",
    token: null,
  });

  const setStep = (step: number) => {
    setState(prev => ({ ...prev, step }));
    onStepChange?.(step);
  };

  const setMessage = (message: string) => {
    setState(prev => ({ ...prev, message }));
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  // Phone validation logic
  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+48\s?[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const phoneError = validatePhone(value) ? "" : "Niepoprawny format numeru telefonu";
    setState(prev => ({ ...prev, phoneError }));
    return value;
  };

  // OTP handling
  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (!/^[0-9]?$/.test(value)) return;
    
    const newOtp = state.otp.split("");
    newOtp[index] = value;
    
    setState(prev => ({
      ...prev,
      otp: newOtp.join(""),
      otpError: newOtp.length === 4 ? "" : prev.otpError
    }));
    
    // Focus management
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    } else if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // API interaction methods
  const sendPhone = async (phone: string) => {
    const cleanedPhone = phone.replace(/\s+/g, "").trim();

    if (!validatePhone(cleanedPhone)) {
      setState(prev => ({ ...prev, phoneError: "Podaj poprawny numer telefonu!" }));
      return false;
    }

    setLoading(true);
    setMessage("");
    
    try {
      const response = await fetch(`${host}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanedPhone }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ Kod weryfikacyjny wysłany! Poczekaj na SMS.");
        setStep(2);
        return true;
      } else {
        setMessage(`❌ Błąd: ${result.error}`);
        return false;
      }
    } catch (error) {
      setMessage("❌ Błąd serwera. Spróbuj ponownie później.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const validateOtp = async (phone: string) => {
    // Check if OTP has exactly 4 digits
    if (state.otp.length !== 4 || state.otp.split('').some(digit => digit === '')) {
      setState(prev => ({ ...prev, otpError: "❌ Wprowadź pełny 4-cyfrowy kod weryfikacyjny" }));
      return false;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${host}/validate-otp`, {
        phone, 
        otp: state.otp
      }, {
        withCredentials: true
      });

      setMessage("✅ Kod weryfikacyjny potwierdzony!");
      setState(prev => ({ ...prev, token: response.data.token }));
      console.log("TOKEN", response.data.token);
      setStep(3);       
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(`❌ Błąd: ${error.response.data.error}`);
      } else {
        setMessage("❌ Błąd serwera. Spróbuj ponownie później.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  
  };

  const resetForm = (finishMessage:string) => {
    setState({
      step: 1,
      loading: false,
      message: finishMessage,
      phoneError: "",
      otpError: "",
      otp: "",
      token: null,
    });
    onSuccess?.();
  };

  return {
    ...state,
    validatePhone,
    handlePhoneChange,
    handleOtpChange,
    sendPhone,
    validateOtp,
    setMessage,
    setLoading,
    resetForm
  };
}
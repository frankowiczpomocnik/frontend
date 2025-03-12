import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import PhoneStep from "./PhoneStep";
import OtpStep from "./OtpStep";
import { useFormValidation } from "./hooks/useFormValidation";

interface FormDataState {
  name: string;
  phone: string;
  link: string;
}

interface ClientLinkProps {
  host: string;
}

const LinkForm: React.FC<ClientLinkProps> = ({ host }) => {
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    phone: "",
    link: "",
  });

  const {
    step,
    loading,
    message,
    phoneError,
    otpError: optError,
    otp,
    token,
    handlePhoneChange,
    handleOtpChange,
    sendPhone,
    validateOtp,
    setMessage,
    setLoading,
    resetForm
  } = useFormValidation({ host });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      handlePhoneChange(e);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendPhone = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    await sendPhone(formData.phone);
  };

  const handleValidateOtp = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    await validateOtp(formData.phone);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const response = await fetch(`${host}/links`, {
        method: "POST",
        credentials: "include",
        // headers: { "Content-Type": "application/json" , Authorization: `Bearer ${token}`,},
        headers: { "Content-Type": "application/json" },
        
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      if (response.ok) {
        setMessage("✅ Link został pomyślnie dodany!");
        setFormData({ name: "", phone: "", link: "" });
        resetForm("✅ Link został pomyślnie dodany!");
      } else {
        setMessage(`❌ Błąd: ${result.error}`);
      }
    } catch {
      setMessage("❌ Błąd serwera. Spróbuj ponownie później.");
    }
    
    setLoading(false);
  };

  return (
    <div className="my-5">
      <div className="row fs-4">
        <div className="mx-auto col-lg-6 py-3 px-4 border">
          {message && <div className="alert alert-info">{message}</div>}
          
          {step === 1 && (
            <PhoneStep
              phone={formData.phone}
              onPhoneChange={handleChange}
              onSubmit={handleSendPhone}
              loading={loading}
              phoneError={phoneError}
            />
          )}
          
          {step === 2 && (
            <OtpStep
              otp={otp}
              onOtpChange={handleOtpChange}
              onSubmit={handleValidateOtp}
              loading={loading}
              optError={optError}
            />
          )}
          
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Imię i nazwisko" 
                required 
                className="form-control mb-2" 
              />
              <input 
                type="text" 
                name="link" 
                value={formData.link} 
                onChange={handleChange} 
                placeholder="Wprowadź link" 
                required 
                className="form-control mb-2" 
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? "Wysyłanie..." : "Dodaj link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkForm;

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import PhoneStep from "./PhoneStep";
import OtpStep from "./OtpStep";
import { useFormValidation } from "./hooks/useFormValidation";

interface FormDataState {
  name: string;
  phone: string;
  files: File[];
}

interface ClientFormProps {
  host: string;
}

const ClientForm: React.FC<ClientFormProps> = ({ host }) => {
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    phone: "",
    files: [],
  });

  const {
    step,
    loading,
    message,
    phoneError,
    otpError: optError,
    otp,
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData((prev) => {
        const newFiles = [...prev.files];
        newFiles[index] = files[0];
        return { ...prev, files: newFiles };
      });
    }
  };

  const handleFileRemove = (index: number) => {
    setFormData((prev) => {
      const newFiles = prev.files.filter((_, i) => i !== index);
      return { ...prev, files: newFiles };
    });
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
    
    if (formData.files.length === 0) {
      setMessage("❌ Musisz dodać co najmniej jeden plik!");
      return;
    }
    
    setLoading(true);
    setMessage("");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    formData.files.forEach((file) => data.append("files", file));

    try {
      const response = await fetch(`${host}/clients`, {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ Pliki zostały pomyślnie dodany!");
        setFormData({ name: "", phone: "", files: [] });
        resetForm("✅ Pliki zostały pomyślnie dodany!");
      } else {
        setMessage(`❌ Błąd: ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ Błąd serwera. Spróbuj ponownie później.");
    }

    setLoading(false);
  };

  return (
    <div className="my-5">
      <div className="row fs-4">
        <div className="mx-auto col-lg-6 py-3 px-4 border">
          {message && <div className="alert alert-info fs-5">{message}</div>}

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
              <div className="mb-3">
                <label className="form-label">Imię i nazwisko</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Pliki</label>
                {Array.from({ length: Math.min(formData.files.length + 1, 10) }).map((_, index) => (
                  <div key={index} className="d-flex align-items-center gap-2 mb-2">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleFileChange(e, index)}
                      disabled={formData.files.length >= 10}
                      value={index === formData.files.length ? "" : undefined}
                    />
                    {index < formData.files.length && (
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        onClick={() => handleFileRemove(index)}
                      >
                        Usuń
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? "Wysyłanie..." : "Dodaj dokumenty"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientForm;


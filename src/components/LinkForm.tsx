import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import PhoneStep from "./PhoneStep";
import OtpStep from "./OtpStep";
import { useFormValidation } from "./hooks/useFormValidation";

interface FormDataState {
  name: string;
  phone: string;
  link: string;
  description: string;
}

interface ClientLinkProps {
  host: string;
  setChoice: () => void;
  setSuccess: (message: string) => void;
}

const LinkForm: React.FC<ClientLinkProps> = ({ host, setChoice, setSuccess }) => {
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    phone: "",
    link: "",
    description: "",
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
    resetForm,
  } = useFormValidation({ host });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        const successMessage = "✅ Link został pomyślnie dodany!";
        setMessage(successMessage);
        setFormData({ name: "", phone: "", link: "", description: "" });
        resetForm(successMessage);

        setSuccess(successMessage);
        setChoice();
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
              <div className="mb-3">
                <label className="form-label">Imię i nazwisko</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Wprowadź link</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Dodatkowe informacje</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  rows={4}
                  placeholder="Wpisz dodatkowe informacje dotyczące linku..."
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
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

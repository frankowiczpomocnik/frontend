import { useState } from "react";
import axios from "axios";
import type { ChangeEvent, FormEvent } from "react";
import PhoneStep from "./PhoneStep";
import OtpStep from "./OtpStep";
import { useFormValidation } from "./hooks/useFormValidation";

interface FormDataState {
  name: string;
  phone: string;
  files: File[];
  message: string;
}

interface ClientFormProps {
  host: string;
  setChoice: () => void;
  setSuccess: (message: string) => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ host, setChoice, setSuccess }) => {
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    phone: "",
    files: [],
    message: "",
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      handlePhoneChange(e);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target.files;
    
    if (fileInput && fileInput.length > 0) {
      if (formData.files.length >= 10) {
        return;
      }
      
      const newFile = fileInput[0];
      
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, newFile]
      }));
      
      e.target.value = "";
    }
  };

  const handleFileRemove = (index: number) => {
    setFormData((prev) => {
      const newFiles = [...prev.files];
      newFiles.splice(index, 1);
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
    data.append("description", formData.message);
    formData.files.forEach((file) => {
      if (file) {
        data.append("files", file);
      }
    });
    
    try {
      const response = await axios.post(`${host}/files`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      const successMessage = "✅ Pliki zostały pomyślnie dodane!";
      setMessage(successMessage);
      setFormData({ name: "", phone: "", files: [], message: "" });
      resetForm(successMessage);
      
      setSuccess(successMessage);
      setChoice();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(`❌ Błąd: ${error.response.data.error}`);
      } else {
        setMessage("❌ Błąd serwera. Spróbuj ponownie później.");
      }
    } finally {
      setLoading(false);
    }
  };
   console.log(formData.message);
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
                {formData.files.map((file, index) => (
                  file && (
                    <div key={index} className="d-flex align-items-center mb-2 p-2 rounded bg-royalgreen">
                      <div className="flex-grow-1 text-truncate fs-6">
                        {file.name}
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-danger btn-sm ms-2" 
                        onClick={() => handleFileRemove(index)}
                      >
                        Usuń
                      </button>
                    </div>
                  )
                ))}
                
                {formData.files.length < 10 && (
                  <div className="mt-2">
                    <input
                      type="file"
                      className="form-control"
                      onChange={handleFileChange}
                    />
                    <div className="text-white fs-6">
                      Możesz dodać {10 - formData.files.length} więcej {10 - formData.files.length === 1 ? 'plik' : 'plików'}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Dodatkowe informacje</label>
                <textarea
                  name="message"
                  className="form-control"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Wpisz dodatkowe informacje dotyczące Twojego zgłoszenia..."
                />
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

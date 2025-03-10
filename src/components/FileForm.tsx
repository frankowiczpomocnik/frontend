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
  setChoice: ()=>void;
}

const ClientForm: React.FC<ClientFormProps> = ({ host, setChoice }) => {
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target.files;
    
    if (fileInput && fileInput.length > 0) {
      // Проверяем, что не превышен лимит в 10 файлов
      if (formData.files.length >= 10) {
        return;
      }
      
      const newFile = fileInput[0];
      
      // Добавляем новый файл в массив, создавая новый массив
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, newFile]
      }));
      
      // Очищаем input после добавления файла
      e.target.value = "";
    }
  };

  const handleFileRemove = (index: number) => {
    // Более безопасное удаление файла
    setFormData((prev) => {
      // Создаем копию массива файлов
      const newFiles = [...prev.files];
      // Удаляем файл по индексу
      newFiles.splice(index, 1);
      // Возвращаем обновленное состояние
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
    formData.files.forEach((file) => {
      if (file) {
        data.append("files", file);
      }
    });

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
        setTimeout(()=>{setChoice()}, 2000);
        setChoice()
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
                
                {/* Список загруженных файлов с проверкой на существование */}
                {formData.files.map((file, index) => (
                  file && (
                    <div key={index} className="d-flex align-items-center mb-2 p-2 rounded bg-royalgreen ">
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
                
                {/* Инпут для загрузки следующего файла (если не превышен лимит в 10 файлов) */}
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
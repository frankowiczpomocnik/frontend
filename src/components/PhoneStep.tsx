import type { ChangeEvent } from "react";



interface PhoneStepProps {
  phone: string;
  onPhoneChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  loading: boolean;
  phoneError: string;
}

const PhoneStep: React.FC<PhoneStepProps> = ({
  phone,
  onPhoneChange,
  onSubmit,
  loading,
  phoneError,
}) => {
  return (
    <div>
      <div className="mb-3">
        <label className="form-label">Numer telefonu</label>
        <input
          type="text"
          name="phone"
          className="form-control"
          value={phone}
          onChange={onPhoneChange}
          placeholder="+48 123456789"
          required
        />
        {phoneError && <div className="text-danger fs-6">{phoneError}</div>}
      </div>
      <button
        type="button"
        className="btn btn-primary"
        onClick={onSubmit}
        disabled={loading}
      >
        {loading ? "Wysyłanie..." : "Wyślij kod weryfikacyjny"}
      </button>
    </div>
  );
};

export default PhoneStep;


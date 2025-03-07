import type { ChangeEvent } from "react";


interface OtpStepProps {
  otp: string;
  onOtpChange: (e: ChangeEvent<HTMLInputElement>, index: number) => void;
  onSubmit: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  loading: boolean;
  optError: string;
}

const OtpStep: React.FC<OtpStepProps> = ({
  otp,
  onOtpChange,
  onSubmit,
  loading,
  optError,
}) => {
  const otpArray = otp.split("");
  
  return (
    <div>
      <div className="mb-3">
        <label className="form-label">Kod weryfikacyjny (4 cyfry)</label>
        <div className="d-flex gap-2 justify-content-center">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              className="form-control text-center"
              style={{ width: "4rem" }}
              maxLength={1}
              value={otpArray[i] || ""}
              onChange={(e) => onOtpChange(e, i)}
              required
            />
          ))}
        </div>
        {optError && <div className="text-danger fs-6 text-center mt-2">{optError}</div>}
      </div>
      <div className="d-flex justify-content-center">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? "Weryfikacja..." : "Zweryfikuj kod"}
        </button>
      </div>
    </div>
  );
};

export default OtpStep;


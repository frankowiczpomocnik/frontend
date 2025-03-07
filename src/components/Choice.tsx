import { useState } from "react";
import Form from "./FileForm";
import LinkForm from "./LinkForm";

interface ChoiseProps {
  host: string; // Add the host prop here
}

const Choice: React.FC<ChoiseProps> = ({host}) => {
  const [selectedOption, setSelectedOption] = useState<"files" | "link" | null>(null); 
  return (
    <div className="container text-center mt-5 ">
      <div className="py-3 px-4">
      {!selectedOption ? (
        <div className="" >
          <p className="text-uppercase text-center text-light mb-4 fs-5">Wybierz sposób przesyłania danych</p>
          <p className="mb-3">Możesz przesłać pliki bezpośrednio lub podać link do Google Drive/Dropbox.</p>
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-primary" onClick={() => setSelectedOption("files")}>📂 Prześlij pliki</button>
            <button className="btn btn-secondary" onClick={() => setSelectedOption("link")}>🔗 Podaj link</button>
          </div>
        </div>
      ) : (
        <div>
          <button className="btn btn-dark mb-3" onClick={() => setSelectedOption(null)}>
            ⬅ Wróć do wyboru
          </button>
          {selectedOption === "files" ? <Form host={host}/> : <LinkForm host={host}/>}
        </div>
      )}
    </div>
    </div>
  );
};

export default Choice;

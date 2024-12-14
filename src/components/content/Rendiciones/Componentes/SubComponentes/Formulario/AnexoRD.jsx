import { FileUpload } from "primereact/fileupload";
import React, { useEffect, useRef, useState } from "react";
import { uploadAdjunto } from "../../../../../../services/axios.service";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import CardTem from "./Sub/CardTem";

function AnexoRD({
  anexos,
  setAnexos,
  setDocumento,
  showSuccess,
  showError,
  STR_ANEXO_ADJUNTO,
  fileUploadRef,
  changeFileTitle,
  files,
  setFiles,
  editable,
}) {
  const [isUploadEnabled, setIsUploadEnabled] = useState(true);

  const fileInputRef = useRef(null);
  const toast = useRef(null);

  const onUpload = () => {
    toast.current.show({
      severity: "info",
      summary: "Success",
      detail: "File Uploaded",
    });
  };

  const handleUpload = (event) => {
    if (STR_ANEXO_ADJUNTO.length == 0) {
      setAnexos(event.files);
      let listaFiles = [];

      setFiles(event.files);
      event.files.forEach(async (file) => {
        await uploadAdjunto(file)
          .then((response) => {
            if (response.data.codRespuesta == 0) {
              listaFiles.push(response.data.filePath);
              setDocumento((prevDocumento) => ({
                ...prevDocumento,
                STR_ANEXO_ADJUNTO: listaFiles,
              }));
            }
            changeFileTitle();
            showSuccess("Se cargó adjunto exitosamente");
          })
          .catch((err) => {
            showError("Error al subir adjunto");
          })
          .finally(() => {
          });
      });
    } else {
      showError("Solo se puede adjunntar un Archivo por documento");
    }
  };

  function updateListUpload() {
    let listaFiles = [];

    anexos.forEach.forEach(async (file) => {
      await uploadAdjunto(file)
        .then((response) => {
          if (response.data.codRespuesta == 0) {
            listaFiles.push(response.data.filePath);
            setDocumento((prevDocumento) => ({
              ...prevDocumento,
              STR_ANEXO_ADJUNTO: listaFiles,
            }));

            //showSuccess("Se guardó exitosamente");
          }
          changeFileTitle();
        })
        .catch((err) => {
          showError(err.message);
        })
        .finally(() => {
        });
    });
  }

  useEffect(() => {
    changeFileTitle();
    if (fileUploadRef.current != null) {
      fileUploadRef.current.setFiles(anexos);
      changeFileTitle();
    }
  }, []);

  useEffect(() => {
    files.forEach((e) => {
    });
  }, [files]);

  return (
    <div>
      <div className="m-2">
        {files.map((e, key) => {
          return (
            <CardTem
              key={key}
              setAnexos={setAnexos}
              setDocumento={setDocumento}
              setFiles={setFiles}
              fileUploadRef={fileUploadRef}
            >
              {e}
            </CardTem>
          );
        })}
      </div>
      {/* <div>{files}</div> */}
      <div className="card flex justify-content-center">
        <Toast ref={toast}></Toast>
        <FileUpload
          ref={fileUploadRef}
          emptyTemplate={
            <p className="m-0">
              Arrastre y suelte archivos aquí para cargarlos.
            </p>
          }
          files={anexos}
          mode="basic"
          name="demo[]"
          url="/api/upload"
          accept="*"
          //maxFileSize={1000000}
          onUpload={onUpload}
          customUpload
          uploadHandler={handleUpload}
          disabled={editable}
        />
      </div>
    </div>
  );
}

export default AnexoRD;

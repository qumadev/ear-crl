import { Button } from "primereact/button";
import { Card } from "primereact/card";
import React, { useEffect } from "react";

function CardTem({
  children,
  setAnexos,
  setDocumento,
  setFiles,
  fileUploadRef,
}) {
  function handleDeletAnexo() {
    setAnexos([]);
    setDocumento((prevDocumento) => ({
      ...prevDocumento,
      STR_ANEXO_ADJUNTO: [],
    }));
    setFiles([]);
    fileUploadRef.current.clear();
  }

  function handleDownloadAnexos() {
    if (children != null) {
      const base64Data = children.data;
      const binaryData = atob(base64Data);
      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }

      // Crear un objeto Blob desde el array buffer
      const blob = new Blob([arrayBuffer], {
        type: children.type,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", children.name); // Cambia el nombre del archivo según tu respuesta
      document.body.appendChild(link);
      link.click();

      // Liberar recursos después de la descarga
      window.URL.revokeObjectURL(url);
    }
  }

  const header =
    children.type == "image/png" ? (
      <img alt="Card" src={`${children.objectURL}`} />
    ) : (
      <></>
    );

  const footer = (
    <>
      <Button
        label="Cancelar"
        severity="secondary"
        icon="pi pi-times"
        style={{ marginLeft: "0.5em" }}
        onClick={handleDeletAnexo}
      />
    </>
  );

  return (
    <div className="card flex justify-content-start">
      <Card
        title="Anexo"
        subTitle="Anexo"
        footer={footer}
        header={header}
        className="md:w-25rem  cursor-pointer"
        onDoubleClick={handleDownloadAnexos}
      >
        <p className="m-0">{children.name}</p>
      </Card>
    </div>
  );
}

export default CardTem;

import React, { Children, useRef, useState } from "react";
import { FileUpload } from "primereact/fileupload";
import { useEffect } from "react";
import ReactDOM from "react-dom";
import { uploadAdjunto } from "../../../../../services/axios.service";
import Card from "./Anexo/Card";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";

function AnexoSL({
  solicitudRD,
  setSolicitudRD,
  adjuntos,
  setAdjuntos,
  children,
  fileUploadRef,
  changeFileTitle,
  solicitando,
  showError,
  estadosEditables,
  showSuccess,
  usuario,
}) {
  const [loadingSkeleton, setLoadingSkeleton] = useState(false);
  const toast = useRef(null);

  const handleUpload = async (event) => {
    try {
      setLoadingSkeleton(true);
      setAdjuntos(event.files);
      let listaFiles = [];
      //event.uploading = true;

      for (let i = 0; i < event.files.length; i++) {
        const file = event.files[i];
        try {
          const response = await uploadAdjunto(file);
          if (response.data.codRespuesta === 0) {
            listaFiles.push(response.data.filePath);
            setSolicitudRD((prevSolicitudRD) => ({
              ...prevSolicitudRD,
              rutaAnexo: listaFiles,
            }));
          }
          file.status = "Cargado";
          //changeFileTitle();
          showSuccess("Se cargó adjunto exitosamente");
        } catch (err) {
          showError("Error al subir adjunto");
        } finally {
        }
      }
      setLoadingSkeleton(false);
    } finally {
      setLoadingSkeleton(false);
    }
  };

  function updateListUpload() {
    setLoadingSkeleton(true);
    let listaFiles = [];

    adjuntos.forEach.forEach(async (file) => {
      await uploadAdjunto(file)
        .then((response) => {
          if (response.data.codRespuesta == 0) {
            listaFiles.push(response.data.filePath);
            setSolicitudRD((prevSolicitudRD) => ({
              ...prevSolicitudRD,
              rutaAnexo: listaFiles,
            }));

            showSuccess("Se guardó exitosamente");
          }
          changeFileTitle();
        })
        .catch((err) => {
          showError(err.message);
        })
        .finally(() => {
          setLoadingSkeleton(false);
        });
    });
  }

  function eliminarAdjunto(nombreArchivo) {
    const nuevosAdjuntos = adjuntos.filter(
      (adjunto) => adjunto.name !== nombreArchivo
    );
    fileUploadRef.current.setFiles(nuevosAdjuntos);
    setAdjuntos(nuevosAdjuntos);
    // También puedes realizar lógica de eliminación en tu servidor aquí si es necesario
  }

  useEffect(() => {
    changeFileTitle();
    if (fileUploadRef.current != null) {
      fileUploadRef.current.setFiles(adjuntos);
      changeFileTitle();
    }
  }, [fileUploadRef]);

  function descargarAdjuntos() {
    adjuntos.forEach((e) => {
      const base64Data = e.data;
      const binaryData = atob(base64Data);
      const arrayBuffer = new ArrayBuffer(binaryData.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }

      // Crear un objeto Blob desde el array buffer
      const blob = new Blob([arrayBuffer], {
        type: e.type,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", e.name); // Cambia el nombre del archivo según tu respuesta
      document.body.appendChild(link);
      link.click();

      // Liberar recursos después de la descarga
      window.URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="card">
      {solicitando && solicitudRD.rutaAnexo < 1 && (
        <small className="p-error">Adjunto es requerido</small>
      )}
      <FileUpload
        files={adjuntos}
        name="demo[]"
        ref={fileUploadRef}
        onDoubleClick={() => {
          if (adjuntos.length > 0) {
            descargarAdjuntos();
          }
        }}
        itemTemplate={(file) => (
          <Card eliminarAdjunto={eliminarAdjunto} file={file} />
        )}
        className="fileSL"
        multiple
        accept="*"
        emptyTemplate={
          <p className="m-0">Arrastre y suelte archivos aquí para cargarlos.</p>
        }
        on
        onSelect={(e) => {
          setAdjuntos(e.files);
        }}
        onRemove={(e) => {
          let adjs = adjuntos.filter((ad) => ad != e.file);
          setAdjuntos(adjs);
          updateListUpload();
        }}
        onClear={(e) => {
          setAdjuntos([]);
          setSolicitudRD((prevSolicitudRD) => ({
            ...prevSolicitudRD,
            rutaAnexo: [],
          }));
        }}
        uploadLabel="Cargar"
        chooseLabel="Agregar"
        cancelLabel="Cancelar"
        customUpload
        uploadHandler={handleUpload}
        disabled={
          !estadosEditables.includes(solicitudRD.estado) |
          (usuario.TipoUsuario != 1) |
          loadingSkeleton
        }
        uploading={true}
      ></FileUpload>
    </div>
  );
}

export default AnexoSL;

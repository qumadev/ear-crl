import React, { useState, useEffect, useContext, useRef } from "react";
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { downloadAdjuntoPDF, descargarArchivosRendicion, uploadAdjuntoPDF, obtenerRendicion, obtenerArchivosRendicion, eliminarArchivosRendicion } from '../../../../../../../services/axios.service';
import { Document, Page } from 'react-pdf';
import { saveAs } from 'file-saver';
import { AppContext } from "../../../../../../../App";

export default function AnexPDF({
  rendicion,
  showSuccess,
  showError

}) {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [rendicionData, setRendicionData] = useState(null); // Estado para almacenar la rendición
  const { usuario } = useContext(AppContext);
  const fileUploadRef = useRef(null); // Referencia al componente FileUpload

  // Llamar a obtenerRendicion cuando el componente se monta o el ID de rendicion cambia
  useEffect(() => {
    if (rendicion && rendicion.ID) {
      const fetchRendicion = async () => {
        try {
          const response = await obtenerRendicion(rendicion.ID);
          if (response.status === 200) {
            setRendicionData(response.data);
          } else {
            showError("Error al obtener los datos de la rendición");
          }
        } catch (error) {
          console.error('Error al obtener la rendición:', error);
          showError("Error al obtener los datos de la rendición");
        }
      };

      fetchRendicion();
    } else {
      // Resetear el estado si no hay una rendición válida
      setRendicionData(null);
      setPdfFiles([]);
    }
  }, [rendicion, showError]);

  useEffect(() => {
    if (rendicionData) {
      const fetchArchivos = async () => {
        try {
          const response = await obtenerArchivosRendicion(rendicion.STR_NRRENDICION);
          if (response.status === 200) {
            // Suponiendo que response.data.Result es una lista de archivos
            const files = response.data.Result.map(file => ({ id: file.id, name: file.name, ruta: file.ruta }));
            setPdfFiles(files);
          } else {
            showError("Error al obtener los archivos");
          }
        } catch (error) {
          console.error('Error al obtener los archivos:', error);
          showError("Error al obtener los archivos");
        }
      };

      fetchArchivos();
    }
  }, [rendicionData, showError]);

  const handleUpload = async () => {
    const id = rendicion?.STR_NRRENDICION; // Reemplaza con el ID adecuado
    const files = fileUploadRef.current.getFiles(); // Obtener los archivos seleccionados

    try {
      const formData = new FormData();

      files.forEach((file, index) => {
        formData.append(`file${index + 1}`, file); // `file1`, `file2`, etc.
      });

      const response = await uploadAdjuntoPDF(id, formData);
      if (response.status === 200) {
        // Obtener la lista actualizada de archivos
        const updatedFilesResponse = await obtenerArchivosRendicion(rendicion.STR_NRRENDICION);
        if (updatedFilesResponse.status === 200) {
          const files = updatedFilesResponse.data.Result.map(file => ({ id: file.id, name: file.name }));
          setPdfFiles(files);
          fileUploadRef.current.clear(); // Limpiar los archivos pendientes tras la subida exitosa
          showSuccess("Carga de archivo exitosa");
        } else {
          showError("Error al obtener los archivos después de la carga");
        }
      } else {
        showError("Error al subir los archivos");
      }
    } catch (error) {
      console.error('Error al subir los archivos:', error);
      showError("Error al subir los archivos");
    }
  };

  const handleDownload = async (filePath) => {
    try {
      const response = await descargarArchivosRendicion(filePath);

      if (response.status === 200) {
        const contentType = response.headers['content-type'];
        const blob = new Blob([response.data], { type: contentType });

        const fileName = filePath.split('/').pop();  // Extraer el nombre del archivo de la ruta
        saveAs(blob, fileName);  // Guardar el archivo
      } else {
        // showError('Error al descargar el ar2chivo');
      }
    } catch (error) {
      // showError('Error al descargar el archivo');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await eliminarArchivosRendicion(id);
      if (response.status === 200) {
        setPdfFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
        showSuccess("Archivo eliminado exitosamente.");
      } else {
        showError("Error al eliminar el archivo");
      }
    } catch (error) {
      console.error('Error al eliminar el archivo:', error);
      showError("Error al eliminar el archivo.");
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="card">
      {usuario.rol?.id === "1" && rendicion?.STR_ESTADO_INFO.id === "9" ? (
        <>
          <FileUpload
            ref={fileUploadRef} // Referencia al FileUpload
            name="files"
            customUpload
            uploadHandler={handleUpload}
            multiple={true}
            accept="application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            maxFileSize={28000000} // Aumentar el tamaño máximo del archivo
            emptyTemplate={<p className="m-0">Arrastra y suelta archivos aquí para subir.</p>}
            chooseLabel="Seleccionar archivo"
            uploadLabel="Subir archivo"
            cancelLabel="Cancelar"
            chooseOptions={{ style: { fontSize: '18px' } }}
            uploadOptions={{ style: { fontSize: '18px' } }}
            cancelOptions={{ style: { fontSize: '18px' } }}
          />
        </>
      ) : null}

      {pdfFiles.length === 0 && (
        <p>No hay archivos adjuntos disponibles.</p>
      )}

      {selectedFile && (
        <div>
          <Document
            file={selectedFile}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
          </Document>
          <Button icon="pi pi-download" onClick={() => handleDownload(selectedFile.name)} />
        </div>
      )}

      {pdfFiles.length > 0 && (
        <ul>
          {pdfFiles.map((file) => (
            <li key={file.id}>
              <span>{file.name}</span>
              <Button
                icon="pi pi-download"
                onClick={() => handleDownload(file.ruta)}  // Usa `file.name` o la ruta completa del archivo
                style={{ marginLeft: '20px' }}
              />
              <Button
                icon="pi pi-trash"
                onClick={() => handleDelete(file.id)}
                style={{
                  marginLeft: '20px',
                  backgroundColor: 'red',
                  color: 'white',
                  borderColor: 'red'
                }}
                visible={usuario.rol?.id === "1" && rendicion?.STR_ESTADO_INFO.id === "9"}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

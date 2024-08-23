import React, { useState, useEffect, useContext } from "react";
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { downloadAdjuntoPDF, uploadAdjuntoPDF } from '../../../../../../../services/axios.service'
import { Document, Page } from 'react-pdf';
import { id } from "date-fns/locale";
import { saveAs } from 'file-saver';
import { AppContext } from "../../../../../../../App";
const PDF_STORAGE_KEY = 'stored_pdf_file';

export default function AnexPDF({
  rendicion,
  showSuccess,
  showError }) {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const { usuario, ruta } = useContext(AppContext);

  // Al cargar el componente, cargamos la lista de archivos desde la rendición
  useEffect(() => {
    if (rendicion && rendicion.U_STR_FILER) {
      const files = rendicion.U_STR_FILER.split(',');
      const fileNames = files.map(file => file.split('/').pop());
      setPdfFiles(fileNames);
    }
    const storedFiles = localStorage.getItem(PDF_STORAGE_KEY);
    if (storedFiles) {
      setPdfFiles(JSON.parse(storedFiles));
    } else if (rendicion && rendicion.U_STR_FILER) {
      const files = rendicion.U_STR_FILER.split(',');
      const fileNames = files.map(file => file.split('/').pop());
      setPdfFiles(fileNames);
      localStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(fileNames));
    }
  }, [rendicion]);

  const handleUpload = async ({ files }) => {
    // const file = files[0];
    const id = rendicion?.ID; // Reemplaza con el ID adecuado
    try {
      const uploadedFileNames = [];
      for (const file of files) {
        const response = await uploadAdjuntoPDF(id, file);
        if (response.status === 200) {
          alert(`Archivo ${file.name} subido correctamente`);
          // Actualizamos la lista de archivos después de subir cada nuevo archivo
          uploadedFileNames.push(file.name);
        } else {
          alert(`Error al subir el archivo ${file.name}`);
        }
      }
      if (uploadedFileNames.length > 0) {
        setPdfFiles(prevFiles => {
          const updatedFiles = [...prevFiles, ...uploadedFileNames];
          localStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(updatedFiles));
          return updatedFiles;
        });
        alert('Archivos subidos correctamente');
      }
    } catch (error) {
      console.error('Error al subir los archivos:', error);
      alert('Error al subir los archivos');
    }
  };

  const handleDownload = async (fileName) => {
    const id = rendicion?.ID;
    try {
      const response = await downloadAdjuntoPDF(id);
      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        saveAs(blob, fileName);
      } else {
        console.error('Error response:', response);
        alert('Error al descargar el archivo');
      }
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      alert('Error al descargar el archivo');
    }
  };

  const handleDelete = (fileName) => {
    // Eliminar del estado
    setPdfFiles(prevFiles => {
      const updatedFiles = prevFiles.filter(file => file !== fileName);
      // Guardar en localStorage
      localStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(updatedFiles));
      return updatedFiles;
    });
  }; 

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="card">
      {usuario.rol?.id == "1" && rendicion?.STR_ESTADO_INFO.id === "9" ? (
        <FileUpload
          name="demo[]"
          customUpload
          uploadHandler={handleUpload}
          multiple={true}
          accept="application/pdf"
          maxFileSize={1000000}
          emptyTemplate={<p className="m-0">Arrastra y suelta archivos aquí para subir.</p>}
          chooseLabel="Seleccionar archivo"
          uploadLabel="Subir archivo"
          cancelLabel="Cancelar"
          chooseOptions={{ style: { fontSize: '18px' } }}
          uploadOptions={{ style: { fontSize: '18px' } }}
          cancelOptions={{ style: { fontSize: '18px' } }}
        />
      ) : null
      }
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
          {pdfFiles.map((file, index) => (
            <li key={index}>
              <span>{file}</span>
              <Button

                icon="pi pi-download"
                onClick={() => handleDownload(file)}
                style={{ marginLeft: '20px' }}
              />
              <Button

                icon="pi pi-trash"
                onClick={() => handleDelete(file)}
                style={{ marginLeft: '20px', backgroundColor: 'red', color:'white' }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


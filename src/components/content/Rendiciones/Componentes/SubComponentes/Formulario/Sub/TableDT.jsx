import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import React, { useContext, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../../../../../../App'
import { SplitButton } from 'primereact/splitbutton'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import DocumentoSustentado from '../DocumentoSustentado'

import { borrarDocumento, obtenerDocumento } from '../../../../../../../services/axios.service'
import { comma } from 'postcss/lib/list'

export default function TableDT({
  rendicion,
  setRendicion,
  totalRedondeado
}) {
  const navigate = useNavigate();
  const { usuario, ruta } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const toast = useRef(null);

  const showSuccess = (mensaje) => {
    toast.current.show({
      severity: "success",
      summary: "Exitoso",
      detail: mensaje,
      life: 3000,
    });
  };

  const showError = (mensaje) => {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: mensaje,
      life: 3000,
    });
  };

  useEffect(() => {
    const obtenerDocumentosSiEsNecesario = async () => {
      if (rendicion?.documentos?.length > 0) {
        setLoading(true);
        try {
          const documentosActualizados = await Promise.all(
            rendicion.documentos.map(async (doc) => {
              const response = await obtenerDocumento(doc.ID);
              const documentoActualizado = response.data.Result[0];
              return {
                ...doc,
                STR_TOTALDOC: documentoActualizado.STR_TOTALDOC,
                STR_SERIE_DOC: documentoActualizado.STR_SERIE_DOC || '',
                STR_CORR_DOC: documentoActualizado.STR_CORR_DOC || ''
              };
            })
          );

          // Solo actualiza el estado si los documentos realmente cambiaron
          if (JSON.stringify(rendicion.documentos) !== JSON.stringify(documentosActualizados)) {
            setRendicion(prevRendicion => ({
              ...prevRendicion,
              documentos: documentosActualizados
            }));
          }
        } catch (error) {
          console.error("Error al obtener los documentos:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    obtenerDocumentosSiEsNecesario();
  }, [rendicion?.documentos, setRendicion]); // Se ejecuta cuando cambian los documentos

  const items = [
    {
      label: 'Editar',
      icon: 'pi pi-external-link',
      command: () => {
        navigate(ruta + `/rendiciones/${documentos.ID}/documentos/detail`)
        // window.location.href = `/rendiciones/${rendicion.ID}/documentos/detail`;
      }
    },

  ];

  const eliminarDocumento = async (idDoc) => {
    setLoading(true);
    try {
      const documentoResponse = await borrarDocumento(idDoc, rendicion.ID);
      if (documentoResponse.status === 200) {
        const documentosRestantes = rendicion.documentos.filter(doc => doc.ID !== idDoc);

        // Recalcular el nuevo monto total
        const nuevoTotalRendido = documentosRestantes.reduce((total, doc) => total + parseFloat(doc.STR_TOTALDOC_CONVERTIDO), 0);

        // Actualizar la rendición con los documentos restantes y el nuevo total
        setRendicion(prevRendicion => ({
          ...prevRendicion,
          documentos: documentosRestantes,
          STR_TOTALRENDIDO: nuevoTotalRendido // Actualizar el total monto rendido
        }));

        showSuccess("El documento ha sido eliminado exitosamente");
      } else {
        showError("Error al eliminar el documento");
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    } finally {
      setLoading(false);
    }
  }

  const confirmarEliminacion = (idDoc) => {
    confirmDialog({
      message: "¿Estás seguro de eliminar este documento? Esta acción no se puede deshacer",
      header: "Confirmación de eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sí",
      rejectLabel: "No",
      accept: () => eliminarDocumento(idDoc),
    });
  };

  const actionverDoc = (rowData, documentos) => {
    const items = [
      {
        label: "Editar",
        icon: "pi pi-pencil",
        command: () => {
          navigate(ruta + `/rendiciones/${documentos.ID}/documentos/editar`);
        },
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        command: () => confirmarEliminacion(rowData.ID),
      }
    ];

    const showEditButton = usuario.rol?.id == 1 && rendicion?.STR_ESTADO <= 9;
    const filteredItems = showEditButton ? items : [];
    return (
      <div className="split-button">
        {filteredItems.length > 0 ? (
          <SplitButton
            label="Ver"
            icon="pi pi-eye"
            model={filteredItems}
            onClick={() => { navigate(ruta + `/rendiciones/${documentos.ID}/documentos/detail`); }}
          />
        ) : (
          <Button
            label="Ver"
            icon="pi pi-eye"
            className="button-left-align"
            style={{ width: "118px" }}
            onClick={() => { navigate(ruta + `/rendiciones/${documentos.ID}/documentos/detail`); }}
          />
        )}
      </div>
    );
  };

  const comentarioBodyTemplate = (rowData) => {
    const comentario = rowData.STR_COMENTARIOS || "";
    const maxLength = 50;

    return (
      <div
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3, // Limita a 3 líneas
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          wordWrap: "break-word",
          maxWidth: "12rem", // Ajusta el ancho según necesidad
          whiteSpace: "normal",
        }}
      >
        {comentario.length > maxLength ? comentario.substring(0, maxLength) + "..." : comentario}
      </div>
    );
  };


  return (
    <>
      <Toast ref={toast} />
      <div className="card">
        <DataTable
          value={rendicion?.documentos}
          loading={loading}
          sortField="ID"
          sortOrder={-1}
          sortMode="multiple"
          paginator
          rows={50}
          rowsPerPageOptions={[5, 10, 25, 50]}
          tableStyle={{ minWidth: "100rem" }}
          emptyMessage={
            <div style={{ textAlign: 'center', padding: '10px' }}>
              No hay documentos registrados para esta rendición
            </div>
          }
        >
          <Column
            header="#"
            headerStyle={{ width: "3rem" }}
            body={(data, options) => options.rowIndex + 1}
          ></Column>
          <Column
            field='STR_TIPO_DOC.name'
            header="Tipo de comprobante"
            style={{ width: "3rem" }}
          ></Column>
          <Column
            field='STR_NUM_COMPROBANTE'
            header="Número de comprobante"
            style={{ width: "10rem" }}
          ></Column>
          <Column
            field='STR_FECHA_DOC'
            header="Fecha de comprobante"
            style={{ width: "3rem" }}
          ></Column>
          <Column
            field="STR_TOTALDOC"
            header="Monto Base"
            style={{ width: "3rem" }}
            body={(rowData) => {
              const moneda = rowData?.STR_MONEDA?.name ?? ''; // Obtener la moneda si está disponible
              const monto = parseFloat(rowData.STR_TOTALDOC).toFixed(2); // Monto formateado
              return `${moneda} ${monto}`; // Mostrar moneda y monto juntos
            }}
          />
          <Column
            field="STR_TOTALDOC_CONVERTIDO"
            header="Monto Rendido"
            style={{ width: "3rem" }}
            body={(rowData) => {
              const monedaRendicion = rendicion?.STR_MONEDA?.name ?? ''; // Obtener la moneda si está disponible
              const montoConvertido = parseFloat(rowData.STR_TOTALDOC_CONVERTIDO).toFixed(2); // Monto formateado
              return `${monedaRendicion} ${montoConvertido}`;
            }}
          ></Column>
          <Column
            field='STR_PROVEEDOR.CardName'
            header="Proveedor"
            style={{ width: "3rem" }}
          ></Column>
          <Column
            field='STR_COMENTARIOS'
            header="Comentario"
            style={{ width: "3rem" }}
            body={comentarioBodyTemplate}
          ></Column>
          <Column
            header="Acciones"
            style={{ width: "3rem" }}
            body={(rowData) => actionverDoc(rowData, rowData)}
            exportable={false}
            frozen
            alignFrozen="right"
          ></Column>
        </DataTable>
      </div>
    </>
  )
}

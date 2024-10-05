import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import React, { useContext, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../../../../../../App'
import { SplitButton } from 'primereact/splitbutton'
import { Toast } from 'primereact/toast'
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
  console.log("Usuario", usuario)
  console.log("Total redondeados: ", totalRedondeado);

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

  const obtenerDocumentos = async () => {
    try {
      const documentosActualizados = await Promise.all(
        rendicion.documentos.map(async (doc) => {
          // Llama a la API para obtener los detalles de cada documento
          const response = await obtenerDocumento(doc.ID);
          const documentoActualizado = response.data.Result[0]; // Asegúrate de que el formato sea correcto
          return { ...doc, STR_TOTALDOC: documentoActualizado.STR_TOTALDOC }; // Actualiza el documento con STR_TOTALDOC
        })
      );
      // Actualiza la rendición con los documentos actualizados
      setRendicion(prevRendicion => ({
        ...prevRendicion,
        documentos: documentosActualizados
      }));
    } catch (error) {
      console.error('Error al obtener los documentos:', error);
    }
  };

  useEffect(() => {
    const obtenerDocumentosSiEsNecesario = async () => {
      if (rendicion?.documentos?.length > 0) {
        const documentosActualizados = await Promise.all(
          rendicion.documentos.map(async (doc) => {
            const response = await obtenerDocumento(doc.ID);
            const documentoActualizado = response.data.Result[0];
            return { ...doc, STR_TOTALDOC: documentoActualizado.STR_TOTALDOC };
          })
        );

        // Solo actualiza el estado si los documentos realmente cambiaron
        if (JSON.stringify(rendicion.documentos) !== JSON.stringify(documentosActualizados)) {
          setRendicion(prevRendicion => ({
            ...prevRendicion,
            documentos: documentosActualizados
          }));
        }
      }
    };

    obtenerDocumentosSiEsNecesario();
  }, [rendicion?.documentos]); // Se ejecuta cuando cambian los documentos


  // useEffect(() => {
  //   if (rendicion?.documentos?.length > 0) {
  //     obtenerDocumentos(); // Llama a la función para obtener los detalles de cada documento
  //   }
  // }, [rendicion]);

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

  const formatMontoRendido = (rowData) => {
    const moneda = rowData.STR_MONEDA?.name ?? 'N/A';
    const monto = rowData.STR_TOTALDOC ? parseFloat(rowData.STR_TOTALDOC).toFixed(2) : '0'; // Asegúrate de mostrar solo STR_TOTALDOC
    console.log("Moneda:", moneda, "Monto:", monto);
    return `${moneda} ${monto}`;
  };

  const eliminarDocumento = async (idDoc) => {
    setLoading(true);
    try {
      const documentoResponse = await borrarDocumento(idDoc, rendicion.ID);
      if (documentoResponse.status === 200) {
        const documentosRestantes = rendicion.documentos.filter(doc => doc.ID !== idDoc);

        // Recalcular el nuevo monto total
        const nuevoTotalRendido = documentosRestantes.reduce((total, doc) => total + parseFloat(doc.STR_TOTALDOC), 0);

        // Actualizar la rendición con los documentos restantes y el nuevo total
        setRendicion(prevRendicion => ({
          ...prevRendicion,
          documentos: documentosRestantes,
          STR_TOTALRENDIDO: nuevoTotalRendido // Actualizar el total monto rendido
        }));

        showSuccess("Documento eliminado con éxito");
      } else {
        showError("Error al eliminar el documento");
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    } finally {
      setLoading(false);
    }
  }

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
        label: 'Borrar',
        icon: 'pi pi-trash',
        command: () => eliminarDocumento(rowData.ID),
      }
    ];

    const showEditButton = usuario.rol?.id == 1 && rendicion?.STR_ESTADO <= 9;
    console.log("log", rendicion?.STR_ESTADO_INFO)
    const filteredItems = showEditButton ? items : [];
    return (
      <div className="split-button">
        <SplitButton
          label='Ver'
          icon='pi pi-eye'
          model={filteredItems}
          onClick={() => { navigate(ruta + `/rendiciones/${documentos.ID}/documentos/detail`); }}
        />
        {/* {showEditButton ?
          (
            <Button
              onClick={() => {
                navigate(
                  ruta +
                  `/rendiciones/${documentos.ID}/documentos/editar`
                );
              }}
              severity="success"
            >
              <div className="flex gap-3 align-items-center justify-content-center">
                <i className='pi pi-pencil' style={{ fontSize: '1em' }} ></i>
                <span>Editar</span>
              </div>
            </Button>) : null}
        {showEditButton ?
          (
            <Button onClick={() => eliminarDocumento(documentos.ID)} severity='danger'>
              <div className="flex gap-3 align-items-center justify-content-center">
                <i className='pi pi-trash' style={{ fontSize: '1em' }} ></i>
                <span>Borrar</span>
              </div>
            </Button>) : null} */}
        {/* <div className="dropdown-content">
          {showEditButton ?
            (
              items.map((data, key) => (
                <Button
                  key={key}
                  onClick={() => {
                    data.command();
                  }}
                >
                  <i className={`${data.icon}`} style={{ color: "black" }}></i>{" "}
                  {data.label}
                </Button>
              ))
            ) :
            (
              <Button
                disabled
                onClick={() => {
                  navigate(
                    ruta +
                    `/rendiciones/${documentos.ID}/documentos/detail`
                  );
                }}
              >
                <div className="flex gap-3 align-items-center justify-content-center">
                  <span>Ver</span>
                  <i className="pi pi-chevron-down" style={{ color: "white" }}></i>
                </div>
              </Button>
            )
          }
        </div> */}
      </div>
    );
  };

  //exportar po excel 


  return (
    <>
      <Toast ref={toast} />
      <div className="card">
        <DataTable
          value={rendicion?.documentos}
          sortField="ID"
          sortOrder={-1}
          sortMode="multiple"
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          tableStyle={{ minWidth: "100rem" }}
          emptyMessage="No se encontró Data"
        >
          <Column
            header="#"
            headerStyle={{ width: "3rem" }}
            body={(data, options) => options.rowIndex + 1}
          ></Column>
          <Column
            header="N° documento"
            field="ID"
            style={{ width: "8rem" }}
            sortable
          ></Column>
          <Column
            header="Acciones"
            style={{ width: "3rem" }}
            body={(rowData) => actionverDoc(rowData, rowData)}
            exportable={false}
            frozen
            alignFrozen="right"
          ></Column>
          <Column
            field='STR_TIPO_DOC.name'
            header="Tipo"
            style={{ width: "3rem" }}
          ></Column>
          <Column
            field='STR_FECHA_DOC'
            header="Fecha del Documento"
            style={{ width: "3rem" }}
          ></Column>
          <Column
            field="STR_TOTALDOC"
            header="Monto Rendido"
            style={{ width: "3rem" }}
            body={(rowData) => {
              const moneda = rowData?.STR_MONEDA?.name ?? ''; // Obtener la moneda si está disponible
              const monto = parseFloat(rowData.STR_TOTALDOC).toFixed(2); // Monto formateado
              return `${moneda} ${monto}`; // Mostrar moneda y monto juntos
            }}
          />
          <Column
            field='STR_PROVEEDOR.CardName'
            header="Proveedor"
            style={{ width: "3rem" }}
          ></Column>
          <Column
            field='STR_COMENTARIOS'
            header="Comentario"
            style={{ width: "3rem" }}

          ></Column>
          {/* <Column

            header="Estado"
            style={{ width: "3rem" }}

          ></Column> */}

        </DataTable>
      </div>
    </>
  )
}

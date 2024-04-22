import { Checkbox } from '@mui/material';
import { InputNumber } from "primereact/inputnumber";
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import React, { useContext, useEffect, useState } from 'react';
import { obtenerAreas, obtenerArticulos, obtenerCentroCosto, obtenerFilial, obtenerMotivos, obtenerProveedores, obtenerProyectos, obtenerTipos, obtenerUnidadNegocio } from '../../../../../../services/axios.service';
import { Calendar } from 'primereact/calendar';
import FormDetalleDocumento from './FormDetalleDocumento';
import { CodeBracketIcon } from '@heroicons/react/16/solid';
import { AppContext } from '../../../../../../App';
import { Navigate, useNavigate } from 'react-router-dom';


function DocumentoSustentado({ documento, setDocumento, moneda }) {
    //  const {moneda, setmoneda }
    const navigate = useNavigate();
    const { usuario, ruta, config } = useContext(AppContext);

    // const [documento, setDocumento] = useState(
    //     {
    //         ID: null,
    //         STR_RENDICION: null,
    //         STR_FECHA_CONTABILIZA: null,
    //         STR_FECHA_DOC: null,
    //         STR_FECHA_VENCIMIENTO: null,
    //         STR_PROVEEDOR: null,
    //         STR_RUC: null,
    //         STR_TIPO_AGENTE: null,
    //         STR_MONEDA: null,
    //         STR_COMENTARIOS: null,
    //         STR_TIPO_DOC: null,
    //         STR_SERIE_DOC: null,
    //         STR_CORR_DOC: null,
    //         STR_VALIDA_SUNAT: null,
    //         STR_ANEXO_ADJUNTO: null,
    //         STR_OPERACION: null,
    //         STR_PARTIDAFLUJO: null,
    //         STR_RD_ID: null,
    //         STR_TOTALDOC: null,
    //         STR_RAZONSOCIAL: null,
    //         DocumentoDet:[
    //             {
    //                 Cod: {
    //                   ItemCode: null,
    //                   ItemName: null,
    //                   U_BPP_TIPUNMED: null,
    //                   WhsCode: null,
    //                   Stock: 0,
    //                   Precio: 0
    //                 },
    //                 Concepto: null,
    //                 Almacen: null,
    //                 Proyecto: null,
    //                 UnidadNegocio: null,
    //                 Filial: null,
    //                 Areas: null,
    //                 CentroCosto: null,
    //                 IndImpuesto: null,
    //                 Precio: 0,
    //                 Cantidad: 0,
    //                 Impuesto: 0
    //               }
    //         ]
    //     }

    // );

    const actionBodyTemplate = (rowData) => {
        const items = [
          {
            label: "Ver",
            icon: "pi pi-eye",
            command: async () => {
              try {
                if (rowData.STR_ESTADO == 8) {
                  await actualizarRendiEnCarga(rowData);
                  await new Promise((resolve) => setTimeout(resolve, 5000));
                }
              } catch (error) {
              } finally {
                // Navigate(ruta + `/rendiciones/${rowData.ID}/documentos`);
                console.log("entra")
                navigate(ruta + `/rendiciones/8/documentos`);
              }
            },
          },
        ];
    
        if(usuario.rol.id==2){
          items.push(
            {
              label: "Aprobar",
              icon: "pi pi-eye",
              command: () => {
                console.log("aprobando solicitud")
              },
            },
          )
        }
    
        if (
          ((usuario.TipoUsuario == 1) &
            ((rowData.STR_ESTADO == 8) |
              (rowData.STR_ESTADO == 9) |
              (rowData.STR_ESTADO == 12))) |
          ((usuario.TipoUsuario == 3) & (rowData.STR_ESTADO == 10))
        ) {
          items.push({
            label:
              rowData.STR_ESTADO == 8 ||
              rowData.STR_ESTADO == 12 ||
              rowData.STR_ESTADO == 15
                ? "Rendir"
                : "Modificar",
            icon: "pi pi-pencil",
            command: () => {
              try {
                if (
                  rowData.STR_ESTADO == 8 ||
                  rowData.STR_ESTADO == 12 ||
                  rowData.STR_ESTADO == 15
                ) {
                  actualizarRendiEnCarga(rowData);
                }
              } catch (error) {
              } finally {
                navigate(ruta + `/rendiciones/${rowData.ID}/documentos`);
              }
            },
          });
        }
    
        if (
          ((usuario.TipoUsuario != 1) &
            ((rowData.STR_ESTADO == 10) | (rowData.STR_ESTADO == 11))) |
          (rowData.STR_ESTADO == 13)
        ) {
          items.push({
            label: "Aceptar",
            icon: "pi pi-check",
            command: () => {
              confirmAceptacion(
                rowData.STR_SOLICITUD,
                usuario.empId,
                usuario.SubGerencia,
                rowData.STR_ESTADO_INFO.Id,
                rowData.ID,
                usuario.SubGerencia
              );
    
              // aceptacionLocal(rowData);
            },
          });
        }
    
        if (
          ((usuario.TipoUsuario != 1) &
            ((rowData.STR_ESTADO == 10) | (rowData.STR_ESTADO == 11))) |
          (rowData.STR_ESTADO == 13)
        ) {
          items.push({
            label: "Rechazar",
            icon: "pi pi-times",
            command: () => {
              confirmRechazo(
                rowData.STR_SOLICITUD,
                usuario.empId,
                usuario.SubGerencia,
                rowData.STR_ESTADO_INFO.Id,
                rowData.ID,
                usuario.SubGerencia
              );
              //rechazoLocal(rowData);
            },
          });
        }
    
        if (
          ((rowData.STR_ESTADO == 1) | (rowData.STR_ESTADO == 5)) &
          (usuario.TipoUsuario == 1)
        ) {
          items.push({
            label: "Editar",
            icon: "pi pi-pencil",
            command: () => {
              navigate(ruta + `/rendiciones/${rowData.ID}/documentos`);
            },
          });
        }
    
        if (
          (rowData.STR_ESTADO == 16) |
          (rowData.STR_ESTADO == 18) |
          (rowData.STR_ESTADO == 19)
        ) {
          items.push({
            label: "Descargar Liquidación",
            icon: "pi pi-file-pdf",
            command: () => {
              downloadAndOpenPdf(rowData.STR_NRRENDICION);
            },
          });
        }
    
        if ((rowData.STR_ESTADO == 17) & (usuario.TipoUsuario == 4)) {
          items.push({
            label: "Reintentar Migracion",
            icon: "pi pi-pencil",
            command: () => {
              reintentarMigracion(rowData.ID);
              // navigate(`/solicitud/aprobacion/reintentar/${rowData.ID}`);
            },
          });
        }
    
        if ([10, 11, 13, 14, 16, 17, 18, 19].includes(rowData.STR_ESTADO)) {
          items.push({
            label: "Ver Aprobadores",
            icon: "pi pi-eye",
            command: () => {
              //reintentarMigracion(rowData.ID);
              // navigate(`/solicitud/aprobacion/reintentar/${rowData.ID}`);
              navigate(ruta + `rendiciones/aprobadores/${rowData.ID}`);
              //      navigate(ruta + `/rendiciones/${rowData.ID}/documentos`);
            },
          });
        }
    
        if (usuario.TipoUsuario == 1 && rowData.STR_ESTADO == 9) {
          items.push({
            label: "Enviar Aprobación",
            icon: "pi pi-send",
            command: () => {
              confirmEnvio(rowData);
            },
          });
        }
    
        async function reintentarMigracion(id) {
          try {
            setLoading(true);
            let response = await reintentarRendi(id);
            if (response.status < 300) {
              let data = response.data.Result[0];
              showSuccess(
                "Se realizó la migración exitosamente con número " + data.DocNum
              );
            } else {
              showError(response.data.Message);
              console.log(response.data);
            }
          } catch (error) {
            showError(error.response.data.Message);
            console.log(error);
          } finally {
            listarRendicionesLocal();
            setLoading(false);
          }
        }
    
        return (
          <div className="split-button">
            <Button
              onClick={() => {
                try {
                  if (rowData.STR_ESTADO == 8) {
                    actualizarRendiEnCarga(rowData);
                  }
                } catch (error) {
                } finally {
                  // navigate(ruta + "/rendiciones/ver");
                  // navigate(ruta + `/rendiciones/${id}/documentos/agregar`, {
                  // navigate(ruta + `/rendiciones/${rowData.ID}/documentos`);
                  navigate(ruta + `/rendiciones/8/documentos/agregar`);
                }
              }}
              severity="success"
            >
              <div className="flex gap-3 align-items-center justify-content-center">
                <span>Ver</span>
                <i className="pi pi-chevron-down" style={{ color: "white" }}></i>
              </div>
            </Button>
            <div className="dropdown-content">
              {items.map((data, key) => (
                <Button
                  key={key}
                  onClick={() => {
                    data.command();
                  }}
                >
                  <i className={`${data.icon}`} style={{ color: "black" }}></i>{" "}
                  {data.label}
                </Button>
              ))}
            </div>
          </div>
          // <React.Fragment>
          //   <SplitButton
          //     label="Ver"
          //     onClick={() => {
          //       try {
          //         if (rowData.STR_ESTADO == 8) {
          //           actualizarRendiEnCarga(rowData);
          //         }
          //       } catch (error) {
          //       } finally {
          //         navigate(ruta + `/rendiciones/${rowData.ID}/documentos`);
          //       }
          //     }}
          //     disabled={rowData.CREATE == "SAP"}
          //     icon="pi pi-plus"
          //     model={items}
          //     rounded
          //     loading={loadingBtn}
          //   />
          // </React.Fragment>
        );
      };

    const [productDialog, setProductDialog] = useState(false);
    const [visible, setVisible] = useState(false);
    const openNew = () => {
        setProductDialog(true);
    };

    const [selectedMoneda, setSelectedMoneda] = useState(null);
    const [selectedTipo, setSelectedTipo] = useState(null);
    const [selectedMotivo, setSelectedMotivo] = useState(null);
    // const [selectedProveedor, setSelectedProveedor] = useState(null);

    const [tipos, setTipos] = useState(null);
    const [motivos, setMotivos] = useState(null);
    const [proveedores, setProveedores] = useState(null);
    const [articles, setArticles] = useState(null);
    const [filial, setFilial] = useState(null);
    const [proyectos, setProyectos] = useState(null);
    const [areas, setAreas] = useState(null);
    const [centroCostos, setCentroCostos] = useState(null);
    const [unidNegocios, setUnidNegocios] = useState(null);

    const [razon, setRazon] = useState(null);
    const [articulos, setArticulos] = useState([])
    const [DocumentoDet, setDocumentoDet] = useState([]);

    async function obtenerData() {
        const response = await Promise.all([
            obtenerTipos(),
            obtenerMotivos(),
            obtenerProveedores(),
            obtenerArticulos(),
            obtenerFilial(),
            obtenerProyectos(),
            obtenerAreas(),
            obtenerCentroCosto(),
            obtenerUnidadNegocio()
        ]);
        setTipos(response[0].data.Result)
        setMotivos(response[1].data.Result)
        setProveedores(response[2].data.Result)
        setArticles(response[3].data.Result)
        setFilial(response[4].data.Result)
        setProyectos(response[5].data.Result)
        setAreas(response[6].data.Result)
        setCentroCostos(response[7].data.Result)
        setUnidNegocios(response[8].data.Result)
    }
    useEffect(() => {
        obtenerData();
        setDocumentoDet(articulos)
        // setDocumento(...documento, DocumentoDet)
    }, []);

    const monedas = [
        { id: 'SOL', name: 'SOL' },
        { id: 'USD', name: 'USD' },
    ];

    const indImpuestos = [
        { id: 'IGV', name: 'IGV' },
        { id: 'EXO', name: 'EXO' },
    ];

    const [proveedor, handleChangeProveedor] = useState(null);

    const selectedOptionTemplate = (option, props) => {
        if (option) {
            return (
                <div className="flex">
                    <div>{option.LicTradNum}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const complementoOptionTemplate = (option) => {
        return (
            <div className="flex align-items-center border-bottom-1 surface-border w-full">
                <div>
                    {option.LicTradNum} - {option.CardName}
                </div>
            </div>
        );
    };


    const [numero, setNumero] = useState('');
    const [esValido, setEsValido] = useState(true);

    const handleNumeroChange = (e) => {
        const inputValue = e.target.value;
        const regex = /^\d{8}$/; // Expresión regular para validar 8 dígitos
        if (regex.test(inputValue)) {
            setNumero(inputValue);
            setEsValido(true);
        } else {
            setEsValido(false);
        }
    };

    const saveDocumento = () => { }

    const quitArticulo = () => { }


    const showDoc = () => {
        console.log(documento)
        console.log(articulos)
    }
    return (
        <div>
            {visible && <FormDetalleNewSolicitud setVisible={setVisible} />}
            <h1>Agregar Documento Sustentado:</h1>
            <div className="col-12 md:col-6 lg:col-12">
                <div className="mb-3 flex flex-column">
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)¿Es exterior?</label>
                        <Checkbox
                            className='col-6'
                        ></Checkbox>
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)Tipo</label>
                        <Dropdown
                            className='col-6'
                            value={selectedTipo}
                            onChange={
                                (e) => {
                                    setSelectedTipo(e.value);
                                }}
                            options={tipos}
                            optionLabel="name"
                            filter
                            filterBy='name'
                            placeholder='Seleccione Tipo'
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)N° de serie</label>
                        <InputText
                            value={documento.STR_SERIE_DOC}
                            onChange={(e) => {
                                setDocumento((prevState) => ({
                                    ...prevState,
                                    STR_SERIE_DOC: e.target.value,
                                }));
                            }}
                            className='col-6'
                            placeholder='N° de serie'
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)Correlativo</label>
                        <InputText
                            className='col-6'
                            placeholder='Correlativo'
                            value={documento.STR_CORR_DOC}
                            onChange={(e) => {
                                setDocumento((prevState) => ({
                                    ...prevState,
                                    STR_CORR_DOC: e.target.value,
                                }));
                            }}
                            // value={numero}
                            // onChange={handleNumeroChange}
                        />
                        {!esValido && <p style={{ color: 'red' }}>El número debe tener exactamente 8 dígitos.</p>}
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)RUC</label>
                        <Dropdown
                            className='col-6'
                            value={proveedor}
                            onChange={(e) => {
                                handleChangeProveedor(e.value)
                                setRazon(e.value.CardName)
                            }}
                            options={proveedores}
                            optionLabel="LicTradNum"
                            filter
                            filterBy='CardName,LicTradNum'
                            filterMatchMode="contains"
                            placeholder="Selecciona Proveedor"
                            valueTemplate={selectedOptionTemplate}
                            itemTemplate={complementoOptionTemplate}
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)Razon Social</label>
                        <InputText
                            className='col-6'
                            // value={razon}
                            value={documento.STR_RAZONSOCIAL}
                            onChange={(e) => {
                                setDocumento((prevState) => ({
                                    ...prevState,
                                    STR_RAZONSOCIAL: e.target.value,
                                }));
                            }}
                            disabled
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>Direccion</label>
                        <InputText
                            className='col-6'
                            placeholder='Direccion'
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)Motivo</label>
                        <Dropdown
                            className='col-6'
                            value={selectedMotivo}
                            onChange={(e) => {
                                setSelectedMotivo(e.value)
                            }}
                            options={motivos}
                            optionLabel="name"
                            filter
                            filterBy='name'
                            placeholder='Seleccione Motivo'
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)Moneda</label>
                        <Dropdown
                            className='col-6'
                            value={selectedMoneda}
                            onChange={(e) => {
                                setSelectedMoneda(e.value)
                            }}
                            options={monedas}
                            optionLabel="name"
                            filter
                            filterBy='name'
                            placeholder='Seleccione Moneda'
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)Fecha</label>
                        <Calendar
                            className='col-6'
                            // value={}
                            // readOnlyInput
                            // disabled
                            placeholder='Seleccione fecha'
                            dateFormat="dd/mm/yy"
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)Comentario</label>
                        <InputTextarea
                            className='col-6'
                            rows={5}
                            cols={30}
                        />
                    </div>
                    <div className="flex col-12">
                        <Button
                            className='col-6'
                            label="Agregar Detalle"
                            onClick={openNew}
                        />
                        <Button
                            className='col-6'
                            label="Eliminar Seleccionados"
                            onClick={() => { }}
                        />
                    </div>
                    <DataTable
                        value={articulos}
                        sortMode="multiple"
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        tableStyle={{ minWidth: "12rem" }}
                        header="Detalle de Documento Sustentado"
                    // loading={loading}
                    >
                        <Column
                            header="N°"
                            headerStyle={{ width: "3rem" }}
                            body={actionBodyTemplate}
                        >
                        </Column>
                        <Column
                            field="Cod.ItemCode"
                            header="Cod. Articulo/Servicio"
                            style={{ width: "3rem" }}
                            className="font-bold"
                        ></Column>
                        <Column
                            field="Cod.ItemName"
                            header="Concepto"
                            style={{ minWidth: "12rem" }}
                        ></Column>
                        <Column
                            field="Cod.WhsCode"
                            header="Almacen"
                            style={{ minWidth: "8rem" }}
                        // body={statusBodyTemplate}
                        ></Column>
                        <Column
                            field="Proyecto.name"
                            header="Proyecto"
                            style={{ minWidth: "5rem" }}
                        ></Column>
                        <Column
                            field="UnidadNegocio.name"
                            header="Unidad de Negocio"
                            style={{ minWidth: "8rem" }}
                        ></Column>
                        <Column
                            field="Filial.name"
                            header="Filial"
                            style={{ minWidth: "10rem" }}
                        // body={fecBodyTemplate}
                        ></Column>
                        <Column
                            field="Areas.name"
                            // body={priceBodyTemplate}
                            header="Areas"
                            style={{ minWidth: "12rem" }}
                        ></Column>
                        <Column
                            field="CentroCosto.name"
                            header="Centro Costo"
                            style={{ minWidth: "10rem" }}
                        // body={fecBodyTemplate}
                        ></Column>
                        <Column
                            field="IndImpuesto.name"
                            header="Ind. Impuesto"
                            style={{ minWidth: "7rem" }}
                        ></Column>
                        <Column
                            field="Precio"
                            header="Precio"
                            style={{ minWidth: "7rem" }}
                        ></Column>
                        <Column
                            field="Cantidad"
                            header="Cantidad"
                            style={{ minWidth: "7rem" }}
                        ></Column>
                        <Column
                            field="Impuesto"
                            header="Impuesto"
                            style={{ minWidth: "7rem" }}
                        ></Column>
                    </DataTable>

                    <Button
                        className='col-4'
                        label="Guardar Cambios"
                        onClick={saveDocumento}
                    />
                </div>
            </div>

            <FormDetalleDocumento
                documento={documento}
                setDocumento={setDocumento}
                articulos={articulos}
                setArticulos={setArticulos}
                productDialog={productDialog}
                setProductDialog={setProductDialog}
                articles={articles}
                filial={filial}
                proyectos={proyectos}
                areas={areas}
                centroCostos={centroCostos}
                unidNegocios={unidNegocios}
                indImpuestos={indImpuestos}
            >
            </FormDetalleDocumento>

            <Button
                className='col-4'
                label="Show Doc"
                onClick={showDoc}
            />

        </div>
    );
}

export default DocumentoSustentado;
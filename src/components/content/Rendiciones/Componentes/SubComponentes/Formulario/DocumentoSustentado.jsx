import { Checkbox } from '@mui/material';
import { InputNumber } from "primereact/inputnumber";
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import React, { useContext, useEffect, useState } from 'react';
import {
    obtenerAreas, obtenerArticulos, obtenerCentroCosto,
    obtenerFilial, obtenerMotivos, obtenerProveedores, obtenerProyectos,
    obtenerTipoDocs, obtenerTipos, obtenerUnidadNegocio
} from '../../../../../../services/axios.service';
import { Calendar } from 'primereact/calendar';
import FormDetalleDocumento from './FormDetalleDocumento';
import { CodeBracketIcon } from '@heroicons/react/16/solid';
import { AppContext } from '../../../../../../App';
import { Navigate, useNavigate } from 'react-router-dom';
import { Divider } from 'primereact/divider';
import { Toolbar } from 'primereact/toolbar';


function DocumentoSustentado({
    documento,
    setDocumento,
    detalles,
    setDetalle,
    moneda,
    esModo,
    editable,
    showError
}) {

    //  const {moneda, setmoneda }
    const navigate = useNavigate();
    const [esModoValidate] = useState(esModo === "Detalle" ? true : false)
    const { usuario, ruta, config } = useContext(AppContext);

    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    const [visibleEditar, setVisibleEditar] = useState(false);
    const [detalleEditar, setDetalleEditar] = useState(null);
    const [modoEditar, setModoEditar] = useState("agregar");

    const editDetalle = (rowData) => {
        // setDetalleEditar(rowData);
        // setModoEditar("editar");
        setProductDialog(true);
    };



    const deleteProduct = async (rowData) => { 
        const updatedArticulos = articulos.filter((item) => item.ID !== rowData.ID);
        setArticulos(updatedArticulos);
    };
    


    //Modificar  esto para edioa6||
    const actionBodyTemplate1 = (rowData) => {
        const items = [
            {
                label: "Editar",
                icon: "pi pi-eye",
                command: async () => {
                    console.log("logdata",)
                    editDetalle(articles)
                }
                // command: async () => {
                //     try {
                //         if (rowData.STR_ESTADO == 8) {
                //             await actualizarRendiEnCarga(rowData);
                //             await new Promise((resolve) => setTimeout(resolve, 5000));
                //         }
                //     } catch (error) {
                //     } finally {
                //         sw


                //         // Navigate(ruta + `/rendiciones/${rowData.ID}/documentos`);
                //         // console.log("entra")
                //         // navigate(ruta + `/rendiciones/${rowData.ID}/documentos`);
                //     }
                // },
            },
        ];

        if (usuario.rol.id == 2) {
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
                            navigate(ruta + `/rendiciones/${rowData.ID}/documentos/agregar`);
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
        );
    };

    const [productDialog, setProductDialog] = useState(false);
    const [visible, setVisible] = useState(false);
    


    const openNew = () => {
        setProductDialog(true);
        //setDetalle(articulos);
    };

    //console.log("nuevof",articulos)


    const [tipos, setTipos] = useState(null);
    const [afectacion, setAfectacion] = useState(null);
    const [motivos, setMotivos] = useState(null);
    const [proveedores, setProveedores] = useState(null);
    const [articles, setArticles] = useState(null);
    const [filial, setFilial] = useState(null);
    const [proyectos, setProyectos] = useState(null);
    const [areas, setAreas] = useState(null);
    const [centroCostos, setCentroCostos] = useState(null);
    const [unidNegocios, setUnidNegocios] = useState(null);
    const [editing, setEditing] = useState(false);
    const [articulos, setArticulos] = useState([]);
    const [DocumentoDet, setDocumentoDet] = useState([]);

    useEffect(() => {
        setDetalle(articulos);
    }, [articulos])

    
    async function obtenerData() {
        const response = await Promise.all([
            // obtenerTipos(),
            obtenerTipoDocs(),
            obtenerMotivos(),
            obtenerProveedores(),
            obtenerArticulos(),
            obtenerFilial(),
            obtenerProyectos(),
            obtenerAreas(),
            obtenerCentroCosto(),
            obtenerUnidadNegocio()
        ]);
        const dataafectacion = [
            {
                id: '1',
                name: 'Retencion'
            },
            {
                id: '2',
                name: 'Detraccion'
            },
            {
                id: '3',
                name: '-'
            }
        ];

        setAfectacion(dataafectacion)
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
        if (detalles && detalles.length > 0) {
            const articles = detalles.map((detalle) => ({
                ID: detalle.ID ? detalle.ID : null,
                STR_SUBTOTAL: detalle.STR_SUBTOTAL,
                STR_TPO_OPERACION: detalle.STR_TPO_OPERACION,
                STR_DOC_ID: detalle.STR_DOC_ID,
                STR_DIM3: detalle.STR_DIM3 ? detalle.STR_DIM3 : null,
                Cod: detalle.STR_CODARTICULO,
                Concepto: detalle.STR_CONCEPTO,
                Almacen: detalle.STR_ALMACEN,
                Proyecto: detalle.STR_PROYECTO,
                UnidadNegocio: detalle.STR_DIM1,
                Filial: detalle.STR_DIM2,
                Areas: detalle.STR_DIM4,
                CentroCosto: detalle.STR_DIM5,
                IndImpuesto: detalle.STR_INDIC_IMPUESTO,
                Precio: detalle.STR_PRECIO,
                Cantidad: detalle.STR_CANTIDAD,
                Impuesto: detalle.STR_IMPUESTO
            }));
            // Actualizamos el estado articulos con el nuevo array de objetos personalizados
            setArticulos(articles);
        } else {
            setArticulos([]);
        }

    }, [detalles])

    useEffect(() => {
        obtenerData();
        setDocumentoDet(articulos);
        
        // setDocumento(...documento, DocumentoDet)
    }, []);

    // useEffect(() => {
    //     console.log("doc3: ", documento)
    // }, [documento])

    const monedas = [
        { id: 'SOL', name: 'SOL' },
        { id: 'USD', name: 'USD' },
    ];

    const indImpuestos = [
        { id: 'IGV', name: 'IGV' },
        { id: 'EXO', name: 'EXO' },
    ];


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
        console.log("nuevaData",articulos)
        // console.log("d: ", documento)
        // console.log("a: ", articulos)
    }

    // Personalizando campos
    const transformDataForExport = (articulos) => {
        return articulos.map((articulo) => {
            const codValue = articulo.Cod ? articulo.Cod.ItemCode : '';
            const conceptoValue = articulo.Concepto ? articulo.Concepto : '';
            const almacenValue = articulo.Almacen ? articulo.Almacen : '';
            const proyectoValue = articulo.Proyecto ? articulo.Proyecto.name : '';
            const unidadNegocioValue = articulo.UnidadNegocio ? articulo.UnidadNegocio.name : '';
            const filialValue = articulo.Filial ? articulo.Filial.name : '';
            const areasValue = articulo.Areas ? articulo.Areas.name : '';
            const centroCostoValue = articulo.CentroCosto ? articulo.CentroCosto.name : '';
            const indImpuestoValue = articulo.IndImpuesto ? articulo.IndImpuesto.name : '';
            const precioValue = articulo.Precio ? articulo.Precio : '';
            const cantidadValue = articulo.Cantidad ? articulo.Cantidad : '';
            const impuestoValue = articulo.Impuesto ? articulo.Impuesto : '';

            return {
                ...articulo,
                Cod: codValue,
                Concepto: conceptoValue,
                Almacen: almacenValue,
                Proyecto: proyectoValue,
                UnidadNegocio: unidadNegocioValue,
                Filial: filialValue,
                Areas: areasValue,
                CentroCosto: centroCostoValue,
                IndImpuesto: indImpuestoValue,
                Precio: precioValue,
                Cantidad: cantidadValue,
                Impuesto: impuestoValue,
            };
        });
    };
    // Expotar detalle
    const exportExcel = async () => {
        const XLSX = await import("xlsx");
        const transformedData = transformDataForExport(articulos);
        const worksheet = XLSX.utils.json_to_sheet(transformedData);
        const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        saveAsExcelFile(excelBuffer, "detalle");
    };
    const saveAsExcelFile = async (buffer, fileName) => {
        const FileSaver = await import("file-saver");

        if (FileSaver && FileSaver.default) {
            const EXCEL_TYPE =
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
            const EXCEL_EXTENSION = ".xlsx";
            const data = new Blob([buffer], { type: EXCEL_TYPE });

            FileSaver.default.saveAs(
                data,
                fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION
            );
        }
    };

    const leftToolbarTemplate = () => {
        return (<div className="">
            <div className="col-12 md:col-6 lg:col-12">
                <Button
                    className='col-6 md:col-6 lg:col-12'
                    icon="pi pi-plus"
                    label="Agregar Detalle"
                    onClick={openNew}
                />
                <Button
                    className='flex col-12 align-items-center gap-5'
                    label="Eliminar Seleccionados"
                    onClick={() => { }}
                />
            </div>
        </div>
        )
    }
    const [rowData, setRowData] = useState(null); // Define rowData state

    const editDetallep = (rowData) => {

      setRowData(rowData); // Update rowData state
      console.log("f",rowData)
    setProductDialog(true);
    setEditing(true);
    };
    // const editDetallep = (detalles) => {
    //     setDetalle({ ...detalles });
    //     console.log(...detalles)
    //     setProductDialog(true);
    //   };
    
    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
       <Button
        icon={rowData.id? "pi pi-pencil" : "pi pi-plus"}
        rounded
        outlined
        className="mr-2"
        onClick={() => editDetallep(rowData)}
      />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => deleteProduct(rowData)}
                    disabled={editable}
                />
            </React.Fragment>
        );
    };

    return (
        <div>
            {visible && <FormDetalleNewSolicitud setVisible={setVisible} />}
            <h1>{esModo} Documento Sustentado:</h1>
            <div className="col-12 md:col-12 lg:col-12">
                <div className="mb-3 flex flex-column">
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)¿Es exterior?</label>
                        <Checkbox
                            className='col-6'
                            disabled={esModoValidate}
                        ></Checkbox>
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>Afectacion</label>
                        <Dropdown
                            className='col-6'
                            value={documento.STR_AFECTACION}
                            onChange={
                                (e) => {
                                    setDocumento((prevState) => ({
                                        ...prevState,
                                        STR_AFECTACION: e.target.value,
                                    }));
                                }}
                            options={afectacion}
                            optionLabel="name"
                            filter
                            filterBy='name'
                            placeholder='Seleccione Afectacion'
                            disabled={esModoValidate}
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)Tipo</label>
                        <Dropdown
                            className='col-6'
                            value={documento.STR_TIPO_DOC}
                            onChange={
                                (e) => {
                                    setDocumento((prevState) => ({
                                        ...prevState,
                                        STR_TIPO_DOC: e.target.value,
                                    }));
                                    console.log("value: ", e.target.value)
                                }}
                            options={tipos}
                            optionLabel="name"
                            filter
                            filterBy='name'
                            placeholder='Seleccione Tipo'
                            disabled={esModoValidate}
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)N° de serie</label>
                        <InputText
                            value={documento.STR_SERIE_DOC}
                            maxLength={4}
                            onChange={(e) => {
                                setDocumento((prevState) => ({
                                    ...prevState,
                                    STR_SERIE_DOC: e.target.value,
                                }));
                            }}
                            className='col-6'
                            placeholder='N° de serie'
                            disabled={esModoValidate}
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)Correlativo</label>
                        <InputText
                            className='col-6'
                            placeholder='Correlativo'
                            maxLength={8}
                            value={documento.STR_CORR_DOC}
                            onChange={(e) => {
                                const inputValue = e.target.value;
                                setDocumento((prevState) => ({
                                    ...prevState,
                                    STR_CORR_DOC: inputValue,
                                }));
                            }}
                            onBlur={() => {
                                const paddedValue = documento.STR_CORR_DOC.padStart(8, '0'); // Rellenamos con ceros a la izquierda cuando se pierde el foco
                                setDocumento((prevState) => ({
                                    ...prevState,
                                    STR_CORR_DOC: paddedValue,
                                }));
                            }}
                            // value={numero}
                            // onChange={handleNumeroChange}
                            disabled={esModoValidate}
                        />
                        {!esValido && <p style={{ color: 'red' }}>El número debe tener exactamente 8 dígitos.</p>}
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)RUC</label>
                        <Dropdown
                            className='col-6'
                            value={documento.STR_PROVEEDOR}
                            onChange={(e) => {
                                // handleChangeProveedor(e.value)
                                // setRazon(e.value.CardName)
                                setDocumento((prevState) => ({
                                    ...prevState,
                                    STR_PROVEEDOR: e.target.value,
                                    STR_RUC: e.target.value.LicTradNum,
                                    STR_RAZONSOCIAL: e.target.value.CardName
                                }));
                            }}
                            options={proveedores}
                            optionLabel="LicTradNum"
                            filter
                            filterBy='CardName,LicTradNum'
                            filterMatchMode="contains"
                            placeholder="Selecciona Proveedor"
                            valueTemplate={selectedOptionTemplate}
                            itemTemplate={complementoOptionTemplate}
                            disabled={esModoValidate}
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)Razon Social</label>
                        <InputText
                            className='col-6'
                            value={documento.STR_RAZONSOCIAL}
                            disabled
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>Direccion</label>
                        <InputText
                            value={documento.STR_DIRECCION}
                            onChange={(e) => {
                                setDocumento((prevState) => ({
                                    ...prevState,
                                    STR_DIRECCION: e.target.value,
                                }));
                            }}
                            className='col-6'
                            placeholder='Direccion'
                            disabled={esModoValidate}
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)Motivo</label>
                        <Dropdown
                            className='col-6'
                            value={documento.STR_MOTIVORENDICION}
                            onChange={
                                (e) => {
                                    setDocumento((prevState) => ({
                                        ...prevState,
                                        STR_MOTIVORENDICION: e.target.value,
                                    }));
                                }}
                            options={motivos}
                            optionLabel="name"
                            filter
                            filterBy='name'
                            placeholder='Seleccione Motivo'
                            disabled={esModoValidate}
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)Moneda</label>
                        <Dropdown
                            className='col-6'
                            value={documento.STR_MONEDA}
                            onChange={
                                (e) => {
                                    // setSelectedTipo(e.value.value);
                                    setDocumento((prevState) => ({
                                        ...prevState,
                                        STR_MONEDA: e.target.value,
                                    }));
                                }}
                            options={monedas}
                            optionLabel="name"
                            filter
                            filterBy='name'
                            placeholder='Seleccione Moneda'
                            disabled={esModoValidate}
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)Fecha</label>
                        <Calendar
                            className='col-6'
                            value={documento.STR_FECHA_DOC}
                            //value={fecha}
                            // readOnlyInput
                            // disabled
                            placeholder={documento.STR_FECHA_DOC}
                            onChange={
                                (e) => {
                                    // setSelectedTipo(e.value.value);
                                    setDocumento((prevState) => ({
                                        ...prevState,
                                        STR_FECHA_DOC: e.value,
                                    }));
                                }}
                            //dateFormat="dd/mm/yyyy"
                            disabled={esModoValidate}
                            locale="es"
                        />
                    </div>
                    <div className="flex col-12 align-items-center gap-5">
                        <label className='col-2'>(*)Comentario</label>
                        <InputTextarea
                            value={documento.STR_COMENTARIOS}
                            onChange={
                                (e) => {
                                    // setSelectedTipo(e.value.value);
                                    setDocumento((prevState) => ({
                                        ...prevState,
                                        STR_COMENTARIOS: e.target.value,
                                    }));
                                }}
                            className='col-6'
                            rows={5}
                            cols={30}
                            disabled={esModoValidate}
                        />
                    </div>
                    <div className="flex col-12">
                        { esModoValidate ? "" :
                        <>
                            <Button
                                className='col-6'
                                label="Agregar Detalle"
                                onClick={openNew}
                            />
                            {/* <Button 
                                className='col-4'
                                label="Eliminar Seleccionados"
                                onClick={() => { }}
                            /> */}
                        </> 
                        }
                        <Button
                            className='col-6'
                            label="Exportar Detalle"
                            style={{ backgroundColor: "black", borderColor: "black" }}
                            onClick={() => {
                                exportExcel();
                            }}
                        />
                    </div>
                    <Divider />

                    <DataTable
                        value={articulos}
                        sortMode="multiple"
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        tableStyle={{ minWidth: "12rem" }}
                        header="Detalle de Documento Sustentado"
                    >
                        <Column
                            header="N°"
                            headerStyle={{ width: "3rem" }}
                            body={(data, options) => options.rowIndex + 1}

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
                        <Column
                            header="Acciones"
                            headerStyle={{ width: "3rem" }}
                            body={actionBodyTemplate}
                        >

                        </Column>
                    </DataTable>
                    {/* { esModoDetail ? "" :
                        // <Button
                        //     className='col-4'
                        //     label="Guardar Cambios"
                        //     onClick={saveDocumento}
                        // />
                    } */}
                </div>
            </div>
            <FormDetalleDocumento

                visible={visibleEditar}
                setVisible={setVisibleEditar}
                detalle={detalleEditar}
                editing={editing}
                onEdit={editDetallep}
                setEditing={setEditing}
                selectedRowData={rowData}
                documento={documento}
                setDocumento={setDocumento}
                articulos={articulos}
                setArticulos={setArticulos}
                productDialog={productDialog}
                deleteProductDialog={deleteProductDialog}
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

            {/* <Button
                className='col-4'
                label="Show Doc"
                onClick={showDoc}
            />  */}
            {/* <Button
                className='col-4'
                label="Exportar"
                icon="pi pi-upload"
                severity="secondary"
                style={{ backgroundColor: "black" }}
                onClick={() => {
                    exportExcel();
                }}
            />  */}

        </div>
    );
}

export default DocumentoSustentado;
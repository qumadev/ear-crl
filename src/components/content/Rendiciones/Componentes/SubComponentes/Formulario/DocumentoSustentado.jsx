import { Checkbox } from '@mui/material';
import { InputNumber } from "primereact/inputnumber";
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import React, { useContext, useEffect, useState, useRef } from 'react';
import {
	obtenerAreas, obtenerArticulos, obtenerCentroCosto,
	obtenerFilial, obtenerMotivos, obtenerProveedores, obtenerProyectos,
	obtenerTipoDocs, obtenerTipos, obtenerUnidadNegocio, obtenerTiposMonedas, eliminarDetalleEnDocumento
} from '../../../../../../services/axios.service';
import { Calendar } from 'primereact/calendar';
import FormDetalleDocumento from './FormDetalleDocumento';
import { CodeBracketIcon } from '@heroicons/react/16/solid';
import { AppContext } from '../../../../../../App';
import { Navigate, useNavigate } from 'react-router-dom';
import { Divider } from 'primereact/divider';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';


function DocumentoSustentado({
	documento,
	setDocumento,
	detalles,
	setDetalle,
	moneda,
	esModo,
	editable,
	showError,
	setCampoValidoCabecera,
	onTotalChange
}) {


	console.log("Prop recibido de documento: ", documento)
	//  const {moneda, setmoneda }
	const navigate = useNavigate();
	const [esModoValidate] = useState(esModo === "Detalle" ? true : false)
	const { usuario, ruta, config } = useContext(AppContext);

	const [deleteProductDialog, setDeleteProductDialog] = useState(false);
	const [visibleEditar, setVisibleEditar] = useState(false);
	const [detalleEditar, setDetalleEditar] = useState(null);
	const [modoEditar, setModoEditar] = useState("agregar");
	const [monedas, setMonedas] = useState([]);
	const [selectedMoneda, setSelectedMoneda] = useState(null);

	const toast = useRef(null);

	const editDetalle = (rowData) => {
		// setDetalleEditar(rowData);
		// setModoEditar("editar");
		setProductDialog(true);
	};

	const showInfo = (mensaje) => {
		toast.current.show({
			severity: "info",
			summary: "Info",
			detail: mensaje,
			life: 3000,
		});
	};

	// const deleteProduct = async (rowData) => { 
	//     const updatedArticulos = articulos.filter((item) => item.ID !== rowData.ID);
	//     setArticulos(updatedArticulos);
	// };

	// const deleteProduct = async (rowData) => {

	// 	// const updatedArticulos = articulos.filter((item) => item.ID !== rowData.ID);
	// 	// setArticulos(updatedArticulos);
	// 	const updatedArticulos = articulos.map((item) => {
	// 		if (item.ID === rowData.ID) {
	// 			return {
	// 				...item,
	// 				FLG_ELIM: 1
	// 			};
	// 		}
	// 		return item;
	// 	});
	// 	console.log("rowid: ", rowData.ID)
	// 	console.log("elimin: ", updatedArticulos)
	// 	setArticulos(updatedArticulos);
	// };

	const handleEliminarDetalle = async (detalle, rowIndex) => {
		const { ID: idDet, STR_DOC_ID: idDoc } = detalle;
		const idRend = documento.STR_RD_ID;

		if (!idDet) {
			// CASO 1: DETALLE SIN ID (no creado en la BD)
			console.log("El detalle no tiene ID");
			const updatedArticulos = articulos.filter((_, index) => index !== rowIndex);
			setArticulos(updatedArticulos);

			toast.current.show({
				severity: "info",
				summary: "Detalle eliminado",
				detail: `Se eliminó el detalle en la posición ${rowIndex + 1}.`,
				life: 3000,
			});
		} else {
			//CASO 2: DETALLE CON ID (creado en la BD)
			try {
				const response = await eliminarDetalleEnDocumento(idDet, idDoc, idRend);

				if (response.status < 300) {
					const updatedArticulos = articulos.filter((item) => item.ID !== idDet);
					setArticulos(updatedArticulos);

					toast.current.show({
						severity: "success",
						summary: "Éxito",
						detail: "Detalle eliminado correctamente",
						life: 3000,
					});

					calcularMontoTotal();
				} else {
					showError("Error al eliminar el detalle en la base de datos")
				}
			} catch (error) {
				console.error("Error al eliminar el detalle:", error);
				showError("Ocurrió un error al intentar eliminar el detalle.");
			}
		}
	}

	// const deleteProduct = (rowIndex) => {
	// 	const updatedArticulos = articulos.filter((_, index) => index !== rowIndex);
	// 	setArticulos(updatedArticulos);

	// 	// Mostrar mensaje de confirmación
	// 	toast.current.show({
	// 		severity: "info",
	// 		summary: "Detalle eliminado",
	// 		detail: `Se eliminó el detalle en la posición ${rowIndex + 1}`,
	// 		life: 3000,
	// 	});
	// };

	// const editDetalle = (rowData) => {
	//     // setDetalleEditar(rowData);
	//     // setModoEditar("editar");
	//     setProductDialog(true);
	// };







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
		setEditing(false);
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
			obtenerArticulos(usuario.filial?.U_ST_Filial),
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
			// console.log(articles);
			// Actualizamos el estado articulos con el nuevo array de objetos personalizados
			setArticulos(articles);
		} else {
			setArticulos([]);
		}

	}, [detalles])

	// useEffect(() => {
	// 	if (detalles && detalles.length > 0) {
	// 		const articles = detalles.map((detalle, index) => ({
	// 			ID: detalle.ID || `temp-${index}`,  // Asignar un ID temporal si no hay ID
	// 			...detalle
	// 		}));
	// 		setArticulos(articles);
	// 	} else {
	// 		setArticulos([]);
	// 	}
	// }, [detalles]);

	useEffect(() => {
		if (esModo === "Agregar") {
			setDocumento((prevState) => ({
				...prevState,
				STR_AFECTACION: { id: '3', name: '-' },
			}));
		}

	}, [])


	const getTotalSubtotal = () => {
		return articulos.reduce((total, articulo) => total + (parseFloat(articulo.Precio) * parseFloat(articulo.Cantidad)), 0);
	};

	const getTotalImpuesto = () => {
		return articulos.reduce((total, articulo) => total + parseFloat(articulo.Impuesto), 0);
	};

	const getTotal = () => {
		const subtotalTotal = getTotalSubtotal();
		const impuestoTotal = getTotalImpuesto();
		return subtotalTotal + impuestoTotal;
	};

	const getTotalDetalle = () => {
		return articulos.reduce((total, articulo) => total + (parseFloat(articulo.Precio) * parseFloat(articulo.Cantidad)), 0);
	};

	// Estado para almacenar el total
	const [montoTotal, setMontoTotal] = useState(0);

	// Función para calcular el total de la columna "Total Detalle"
	const calcularMontoTotal = () => {
		const total = articulos.reduce((acc, articulo) => {
			const subtotal = parseFloat(articulo.Precio) * parseFloat(articulo.Cantidad) || 0;
			const impuesto = parseFloat(articulo.Impuesto) || 0;
			return acc + (subtotal + impuesto);
		}, 0);
		setMontoTotal(total.toFixed(2)); // Guardar el total con 2 decimales
	};

	// Usar useEffect para calcular el total cada vez que los artículos cambien
	useEffect(() => {
		calcularMontoTotal();
	}, [articulos]);

	useEffect(() => {
		obtenerData();
		setDocumentoDet(articulos);
	}, []);

	useEffect(() => {
		const subtotalTotal = articulos
			.filter(detalle => detalle.FLG_ELIM !== 1)
			.reduce((total, detalle) => total + (parseFloat(detalle.Precio) * parseFloat(detalle.Cantidad)), 0);

		let impuestoTotal = articulos
			.filter(detalle => detalle.FLG_ELIM !== 1)
			.reduce((total, detalle) => total + parseFloat(detalle.Impuesto), 0);

		// Multiplica el impuestoTotal por 3 si la moneda es USD
		if (documento.STR_MONEDA?.name === "USD") {
			impuestoTotal *= 3;
		}

		const totalRedondeado = (subtotalTotal + impuestoTotal).toFixed(2);

		// Verifica y actualiza el estado de `STR_AFECTACION` si es necesario
		if (subtotalTotal > 700 && documento.STR_TIPO_DOC?.name === "Factura") {
			const afectacion = documento.STR_AFECTACION?.name;
			if (afectacion !== 'Detraccion' && afectacion !== '-' && afectacion !== 'Retencion') {
				setDocumento(prevState => ({
					...prevState,
					STR_AFECTACION: { id: '1', name: 'Retencion' }
				}));
			}
		}

		// Actualiza el total
		onTotalChange(totalRedondeado);
	}, [articulos, documento, onTotalChange]);

	// useEffect(()=>{
	//     const articulosConSubtotal = articulos.map((detalle) => ({
	//         ...detalle,
	//         Subtotal: detalle.Precio * detalle.Cantidad,
	//     }));
	//     setArticulos(articulosConSubtotal);
	// },[articulos])
	// useEffect(() => {
	//     console.log("doc3: ", documento)
	// }, [documento])

	const obtenerMonedas = async () => {
		try {
			const response = await obtenerTiposMonedas();
			console.log("Monedas obtenidas:", response.data.Result);
			setMonedas(response.data.Result);
		} catch (error) {
			console.error('Error al obtener monedas: ', error)
		}
	}

	console.log("Moneda del documento:", documento.STR_MONEDA);
	console.log("Opciones disponibles de monedas:", monedas);

	useEffect(() => {
		obtenerMonedas();
	}, []);

	// const handleMonedaChange = (e) => {
	// 	console.log("Moneda selected: ", e.value)
	// 	setDocumento((prevState) => ({
	// 		...prevState,
	// 		STR_MONEDA: { id: e.value.Id, name: e.value.Code },  // Asegúrate de pasar el código y nombre correctamente
	// 	}));
	// };

	const indImpuestos = [
		{ id: 'IGV', name: 'IGV (18%)' },
		{ id: 'IGV_LEY', name: 'IGV (10%)' },
		{ id: 'EXO', name: 'EXO' }
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
		console.log("nuevaData", articulos)
		// console.log("d: ", documento)
		// console.log("a: ", articulos)
	}

	console.log("mi", articulos)

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
		console.log("f", rowData)
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
					icon={"pi pi-pencil"}
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

	const formatCurrency = (amount, currencyCode) => {
		// Imprimir valores para depurar
		console.log("currencyCode recibido:", currencyCode);
		const currency = currencyCode || 'SOL';

		try {
			const formattedAmount = new Intl.NumberFormat('es-PE', {
				style: 'currency',
				currency: currency,  // Usamos el 'Code' de la moneda
			}).format(amount);

			console.log("Monto formateado:", formattedAmount); // Ver el resultado del formateo
			return formattedAmount;
		} catch (error) {
			console.error('Error formatting currency:', error);
			return amount; // Devuelve el monto sin formato en caso de error
		}
	};

	useEffect(() => {
		const calcularMontoTotalConTipoCambio = () => {
			const totalBase = articulos
				.filter(item => item.FLG_ELIM !== 1)
				.reduce((acc, articulo) => {
					const precio = parseFloat(articulo.Precio) || 0;
					const cantidad = parseFloat(articulo.Cantidad) || 0;
					const impuesto = parseFloat(articulo.Impuesto) || 0;
					return acc + (precio * cantidad) + impuesto;
				}, 0);

			const tipoCambio = parseFloat(documento.STR_TIPO_CAMBIO) || 1;
			const totalConCambio = totalBase * tipoCambio;

			console.log("Total Base:", totalBase);
			console.log("Tipo de Cambio:", tipoCambio);
			console.log("Total con Cambio:", totalConCambio);

			setMontoTotal(totalConCambio.toFixed(2)); // Actualizar estado
		};

		calcularMontoTotalConTipoCambio();
	}, [articulos, documento.STR_TIPO_CAMBIO]);

	useEffect(() => {
		const subtotalTotal = articulos
			.filter(item => item.FLG_ELIM !== 1) // Solo artículos no eliminados
			.reduce((total, item) => total + (parseFloat(item.Precio) * parseFloat(item.Cantidad)), 0);

		const impuestoTotal = articulos
			.filter(item => item.FLG_ELIM !== 1)
			.reduce((total, item) => total + parseFloat(item.Impuesto || 0), 0);

		const totalRedondeado = (subtotalTotal + impuestoTotal).toFixed(2);

		setMontoTotal(totalRedondeado); // Actualizamos el monto total en el estado
	}, [articulos]); // Se recalcula cada vez que cambian los artículos

	console.log("Moneda del documento:", documento.STR_MONEDA);
	console.log("Opciones disponibles de monedas:", monedas);

	const footerGroup = (
		<ColumnGroup>
			<Row>
				<Column
					footer="Monto Total: "
					colSpan={15}
					footerStyle={{ textAlign: 'right', fontWeight: 'bold' }}
				/>
				<Column
					footer={() => formatCurrency(
						articulos
							.filter(item => item.FLG_ELIM !== 1)
							.reduce((acc, articulo) => {
								const subtotal = parseFloat(articulo.Precio) * parseFloat(articulo.Cantidad) || 0;
								const impuesto = parseFloat(articulo.Impuesto) || 0;
								return acc + subtotal + impuesto;
							}, 0)
						* (parseFloat(documento.STR_TIPO_CAMBIO) || 1),
						documento.STR_MONEDA?.Code || 'SOL'
					)}
					footerStyle={{ textAlign: 'right', fontWeight: 'bold' }}
				/>
			</Row>
		</ColumnGroup>
	);

	return (
		<div>
			<Toast ref={toast} />
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
						<label className='col-2'>(*)Tipo</label>
						{/*console.log(typeof STR_TIPO_DOC)*/}
						<Dropdown
							className='col-6'
							value={documento.STR_TIPO_DOC}
							onChange={
								(e) => {
									setDocumento((prevState) => ({
										...prevState,
										STR_TIPO_DOC: e.target.value,
									}));
									//console.log("value: ", e.target.value)
									setCampoValidoCabecera(prevState => ({
										...prevState,
										STR_TIPO_DOC: Boolean(e.target.value)
									}));
									if (e.target.value.name === 'Factura') {
										showInfo("Las facturas comienzan con 'F' o 'E' en N° de serie");
										//console.log("factura")
									}
									// if (e.target.value.name === 'Boleta de venta') {
									// 	showInfo("Las boletas de venta comienzan con 'B' en N° de serie");
									// 	//console.log("boleta")
									// }
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
								setCampoValidoCabecera(prevState => ({
									...prevState,
									STR_SERIE_DOC: Boolean(e.target.value)
								}));
								if (documento.STR_TIPO_DOC === 'Factura') {
									const primeraLetra = e.target.value.charAt(0).toUpperCase();
									if (primeraLetra === 'F' || primeraLetra === 'E') {
										alert("1");
									} else {
										alert("2");
									}
								}
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
								setCampoValidoCabecera(prevState => ({
									...prevState,
									STR_CORR_DOC: Boolean(e.target.value)
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
								setCampoValidoCabecera(prevState => ({
									...prevState,
									STR_PROVEEDOR: Boolean(e.target.value)
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
									setCampoValidoCabecera(prevState => ({
										...prevState,
										STR_MOTIVORENDICION: Boolean(e.target.value)
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
						{console.log("Opciones de monedas en Dropdown:", monedas)}
						{console.log("Valor de STR_MONEDA:", documento.STR_MONEDA)}
						{useEffect(() => {
							if (documento.STR_MONEDA) {
								const monedaEncontrada = monedas.find(
									(moneda) => moneda.Code === documento.STR_MONEDA.name
								);

								if (monedaEncontrada) {
									setDocumento((prevState) => ({
										...prevState,
										STR_MONEDA: monedaEncontrada,  // Asegúrate de usar el objeto correcto
									}));
								}
							}
						}, [documento, monedas])}
						<Dropdown
							className="col-6"
							value={documento.STR_MONEDA?.Code || null}  // Usar 'Code' para la selección
							onChange={(e) => {
								const selectedMoneda = monedas.find((moneda) => moneda.Code === e.value);
								console.log("Moneda seleccionada:", selectedMoneda);  // Depuración

								setDocumento((prevState) => ({
									...prevState,
									STR_MONEDA: selectedMoneda,  // Guardamos el objeto completo
								}));

								setCampoValidoCabecera((prevState) => ({
									...prevState,
									STR_MONEDA: Boolean(selectedMoneda?.Code),
								}));
							}}
							options={monedas}  // Opciones de monedas
							optionLabel="Code"  // Mostrar 'Code' como etiqueta
							optionValue="Code"  // Usar 'Code' como valor
							filter
							placeholder="Seleccione Moneda"
							disabled={esModoValidate}
						/>
					</div>
					<div className="flex col-12 align-items-center gap-5">
						<label className='col-2'>Afectacion</label>
						<Dropdown
							className='col-6'
							value={documento.STR_AFECTACION?.id}  // Usamos el id para manejar la selección
							onChange={(e) => {
								if (esModo !== 'Ver') {  // Solo permitimos cambios si no estamos en el modo "Ver"
									const selectedAfectacion = afectacion.find(item => item.id === e.value);  // Encuentra el objeto completo
									setDocumento((prevState) => ({
										...prevState,
										STR_AFECTACION: selectedAfectacion  // Guardamos el objeto completo en STR_AFECTACION
									}));
								}
							}}
							options={afectacion}
							optionLabel="name"  // Mostrar el 'name' en el menú desplegable
							optionValue="id"  // Usamos el 'id' para la comparación en el Dropdown
							filter
							filterBy='name'
							placeholder='Seleccione Afectacion'
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
									setCampoValidoCabecera(prevState => ({
										...prevState,
										STR_FECHA_DOC: Boolean(e.target.value)
									}));
								}}
							dateFormat="dd/mm/yy"
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
									setCampoValidoCabecera(prevState => ({
										...prevState,
										STR_COMENTARIOS: Boolean(e.target.value)
									}));
								}}
							className='col-6'
							rows={5}
							cols={30}
							disabled={esModoValidate}
						/>
					</div>
					<div className="flex col-12 align-items-center gap-5">
						<label className='col-2'>Tipo de Cambio</label>
						<InputText
							className='col-6'
							placeholder='Tipo de Cambio'
							value={documento.STR_TIPO_CAMBIO}
							onChange={(e) => {
								const inputValue = e.target.value;
								if (/^\d*\.?\d*$/.test(inputValue)) { // Validación para permitir solo números y decimales
									setDocumento((prevState) => ({
										...prevState,
										STR_TIPO_CAMBIO: inputValue,
									}));
									setCampoValidoCabecera((prevState) => ({
										...prevState,
										STR_TIPO_CAMBIO: Boolean(inputValue),
									}));
								}
							}}
							disabled={esModoValidate}
						/>
					</div>
					<div className="flex col-12">
						{esModoValidate ? "" :
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
						//value={articulos}
						value={articulos.filter(item => item.FLG_ELIM !== 1)}
						key={montoTotal}
						sortMode="multiple"
						paginator
						rows={5}
						rowsPerPageOptions={[5, 10, 25, 50]}
						tableStyle={{ minWidth: "12rem" }}
						header="Detalle de Documento Sustentado"
						footerColumnGroup={footerGroup}
					>
						<Column
							header="N°"
							headerStyle={{ width: "3rem" }}
							body={(data, options) => options.rowIndex + 1}
						>
						</Column>
						{!esModoValidate && usuario.rol?.id == 1 && true ?
							<Column
								header="Acciones"
								headerStyle={{ width: "3rem" }}
								body={(rowData, { rowIndex }) => (  // Accedemos a rowIndex
									<React.Fragment>
										<Button
											icon={"pi pi-pencil"}
											rounded
											outlined
											className="mr-2"
											onClick={() => editDetallep(rowData)}  // Editar el detalle
										/>
										<Button
											icon="pi pi-trash"
											rounded
											outlined
											severity="danger"
											onClick={() => handleEliminarDetalle(rowData, rowIndex)}  // Eliminar usando el índice
											disabled={editable}
										/>
									</React.Fragment>
								)}
							>
							</Column>
							: null
						}
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
							//field="Cantidad*Precio"
							header="Subtotal"
							body={(rowData) => rowData.Cantidad * rowData.Precio}
							style={{ minWidth: "7rem" }}
						></Column>
						<Column
							header="Total Detalle"
							style={{ minWidth: "7rem" }}
							body={(rowData) => {
								const subtotal = rowData.Cantidad && rowData.Precio ? parseFloat(rowData.Cantidad) * parseFloat(rowData.Precio) : 0;
								const impuesto = rowData.Impuesto ? parseFloat(rowData.Impuesto) : 0;
								return (subtotal + impuesto).toFixed(2); // Suma subtotal e impuesto y lo formatea a 2 decimales
							}}
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
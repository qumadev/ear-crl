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
	obtenerTipoDocs, obtenerTipos, obtenerUnidadNegocio, obtenerTiposMonedas,
	eliminarDetalleEnDocumento, obtenerRendicion
} from '../../../../../../services/axios.service';
import { Calendar } from 'primereact/calendar';
import FormDetalleDocumento from './FormDetalleDocumento';
import { CodeBracketIcon } from '@heroicons/react/16/solid';
import { AppContext } from '../../../../../../App';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
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
	setCampoValidoCabecera,
	onTotalChange
}) {
	const { id } = useParams();

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
	const [rendicion, setRendicion] = useState(null); // almacenar la rendcion

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

	const showError = (mensaje) => {
		toast.current.show({
			severity: "error",
			summary: "Error",
			detail: mensaje,
			life: 5000,
		});
	};

	const obtenerRendicionPorId = async (idRendicion) => {
		try {
			const response = await obtenerRendicion(idRendicion)

			if (response.status < 300 && response.data) {
				const datosRendicion = response.data.Result[0];
				setRendicion(datosRendicion);

				compararMonedas(datosRendicion?.STR_MONEDA, documento?.STR_MONEDA?.Code)
			} else {
				showError("No se encontró la rendicion con el ID")
			}
		} catch (error) {
			console.error("Error al obtener la rendicion: ", error);
			showError(`Ocurrió un error al intentar obtener la rendición: ${error.message}`);
		}
	}

	const compararMonedas = (monedaAPI, monedaDocumento) => {
		const apiMonedaId = monedaAPI?.id || monedaAPI?.name;
		const documentoMonedaCode = monedaDocumento?.Code;

		if (apiMonedaId === documentoMonedaCode) {
			console.log("Las monedas coinciden: ", apiMonedaId);
		} else {
			aplicarTipoCambiosSiEsNecesario();
		}
	}

	const aplicarTipoCambiosSiEsNecesario = () => {
		const tipoCambio = rendicion?.STR_TIPO_CAMBIO || 1;

		if (tipoCambio !== 1) {

			const documentoActualizado = {
				...documento,
				STR_MONEDA: rendicion.STR_MONEDA, // Actualizamos la moneda del documento
			};

			setDocumento(documentoActualizado); // Actualiza el estado del documento
		} else {
			console.log("El tipo de cambio es 1, no se aplica conversion");
		}
	}

	const handleEliminarDetalle = async (detalle, rowIndex) => {
		const { ID: idDet, STR_DOC_ID: idDoc } = detalle;
		const idRend = documento.STR_RD_ID;

		if (!idDet) {
			// CASO 1: DETALLE SIN ID (no creado en la BD)
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

	const [productDialog, setProductDialog] = useState(false);
	const [visible, setVisible] = useState(false);

	const openNew = () => {
		setEditing(false);
		setProductDialog(true);
		//setDetalle(articulos);
	};

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
			setArticulos(articles);
		} else {
			setArticulos([]);
		}

	}, [detalles])

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

	const obtenerMonedas = async () => {
		try {
			const response = await obtenerTiposMonedas();
			setMonedas(response.data.Result);
		} catch (error) {
			console.error('Error al obtener monedas: ', error)
		}
	}

	useEffect(() => {
		obtenerMonedas();
	}, []);

	const indImpuestos = [
		{ id: 'IGV', name: 'IGV (18%)' },
		{ id: 'IGV_LEY', name: 'IGV (10%)' },
		{ id: 'EXO', name: 'EXO' },
		{ id: 'NDM', name: 'No domiciliados (24%)' },
		{ id: 'RH', name: 'Recibo por honorarios (8%)' }
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
		setProductDialog(true);
		setEditing(true);
	};

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
		const currency = currencyCode || 'SOL';

		try {
			const formattedAmount = new Intl.NumberFormat('es-PE', {
				style: 'currency',
				currency: currency,  // Usamos el 'Code' de la moneda
			}).format(amount);

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

			let totalConCambio = totalBase;

			if (documento.STR_MONEDA?.Code === 'SOL' && rendicion?.STR_MONEDA?.id === 'USD') {
				// Si la solicitud está en soles y la rendición en dólares, dividimos
				totalConCambio = totalBase / tipoCambio;
			} else if (documento.STR_MONEDA?.Code === 'USD' && rendicion?.STR_MONEDA?.id === 'SOL') {
				// Si la solicitud está en dólares y la rendición en soles, multiplicamos
				totalConCambio = totalBase * tipoCambio;
			} else {
				// Si las monedas son iguales, no se hace ninguna conversión
				totalConCambio = totalBase;
			}

			setMontoTotal(totalConCambio.toFixed(2)); // Actualizar estado
		};

		calcularMontoTotalConTipoCambio();
	}, [articulos, documento.STR_TIPO_CAMBIO, documento?.STR_MONEDA?.Code, rendicion?.STR_MONEDA?.id]);

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

	const footerGroup = (
		<ColumnGroup>
			<Row>
				<Column
					footer="Monto Total Base: "
					colSpan={15}
					footerStyle={{ textAlign: 'right', fontWeight: 'bold' }}
				/>
				<Column
					footer={() => {
						const totalBase = articulos
							.filter(item => item.FLG_ELIM !== 1) // Filtrar los artículos no eliminados
							.reduce((acc, articulo) => {
								const subtotal = parseFloat(articulo.Precio) * parseFloat(articulo.Cantidad) || 0;
								const impuesto = parseFloat(articulo.Impuesto) || 0;
								return acc + subtotal + impuesto; // Sumar subtotal + impuesto
							}, 0);

						return formatCurrency(
							totalBase.toFixed(2),
							documento?.STR_MONEDA?.Code || 'SOL' // Usar siempre la moneda del documento
						);
					}}
					footerStyle={{ textAlign: 'right', fontWeight: 'bold' }}
				/>
			</Row>
			{documento?.STR_MONEDA?.Code && rendicion?.STR_MONEDA?.id !== documento?.STR_MONEDA?.Code && (
				<Row>
					<Column
						footer="Monto Total Convertido: "
						colSpan={15}
						footerStyle={{ textAlign: 'right', fontWeight: 'bold' }}
					/>
					<Column
						footer={() => {
							const totalBase = articulos
								.filter(item => item.FLG_ELIM !== 1) // Filtrar los artículos no eliminados
								.reduce((acc, articulo) => {
									const subtotal = parseFloat(articulo.Precio) * parseFloat(articulo.Cantidad) || 0;
									const impuesto = parseFloat(articulo.Impuesto) || 0;
									return acc + subtotal + impuesto; // Sumar subtotal + impuesto
								}, 0);

							const tipoCambio = parseFloat(documento.STR_TIPO_CAMBIO) || 1;
							let totalConCambio = totalBase;

							// Lógica de conversión de monedas
							if (documento.STR_MONEDA?.Code === 'SOL' && rendicion?.STR_MONEDA?.id === 'USD') {
								totalConCambio = totalBase / tipoCambio; // Dividir si documento en SOL y rendición en USD
							} else if (documento.STR_MONEDA?.Code === 'USD' && rendicion?.STR_MONEDA?.id === 'SOL') {
								totalConCambio = totalBase * tipoCambio; // Multiplicar si documento en USD y rendición en SOL
							}

							return formatCurrency(
								totalConCambio.toFixed(2),
								rendicion?.STR_MONEDA?.id || 'SOL'
							);
						}}
						footerStyle={{ textAlign: 'right', fontWeight: 'bold' }}
					/>
				</Row>
			)}
		</ColumnGroup>
	);

	const handleMonedaChange = (e) => {
		const selectedMoneda = monedas.find((moneda) => moneda.Code === e.value);

		setDocumento((prevState) => ({
			...prevState,
			STR_MONEDA: selectedMoneda,
		}));

		setCampoValidoCabecera((prevState) => ({
			...prevState,
			STR_MONEDA: Boolean(selectedMoneda?.Code),
		}));
	};

	const handleTipoCambioChange = (e) => {
		const inputValue = e.target.value;

		if (/^\d*\.?\d*$/.test(inputValue)) {
			setDocumento((prevState) => ({
				...prevState,
				STR_TIPO_CAMBIO: inputValue,
			}));
			setCampoValidoCabecera((prevState) => ({
				...prevState,
				STR_TIPO_CAMBIO: Boolean(inputValue),
			}));

			// // Verifica si el tipo de cambio es distinto a 1 y actualiza la moneda**
			// if (parseFloat(inputValue) !== 1) {
			// 	console.log("Cambiando moneda a la de la rendición:", rendicion?.STR_MONEDA); // Depuración

			// 	setDocumento((prevState) => ({
			// 		...prevState,
			// 		STR_MONEDA: rendicion?.STR_MONEDA || prevState.STR_MONEDA,
			// 	}));
			// }
		}
	};

	// Detectar el cambio de moneda y ajustar el tipo de cambio
	useEffect(() => {
		if (rendicion?.STR_MONEDA?.id === documento?.STR_MONEDA?.Code) {
			setDocumento((prevState) => ({
				...prevState,
				STR_TIPO_CAMBIO: '1', // Establece el tipo de cambio a 1
			}));
		}
	}, [documento?.STR_MONEDA?.Code, rendicion?.STR_MONEDA?.id]);

	useEffect(() => {
		const rendicionId = documento?.STR_RD_ID ?? id;

		if (rendicionId) {
			obtenerRendicionPorId(rendicionId)
		}
	}, [documento?.STR_RD_ID, id])

	// const monedaCambiada = useRef(false);

	// useEffect(() => {
	// 	if (documento.STR_TIPO_CAMBIO && parseFloat(documento.STR_TIPO_CAMBIO) !== 1 && !monedaCambiada.current) {
	// 		console.log("Aplicando cambio automático de moneda a:", rendicion?.STR_MONEDA);

	// 		setDocumento((prevState) => ({
	// 			...prevState,
	// 			STR_MONEDA: rendicion?.STR_MONEDA || prevState.STR_MONEDA,
	// 		}));

	// 		monedaCambiada.current = true;
	// 	}
	// }, [documento.STR_TIPO_CAMBIO, rendicion]);

	const boletaVentaID = '03';

	const validarBoletaYProveedor = (tipoDoc, proveedor) => {
		// Verificar si el tipo de documento es boleta de venta y si el RUC del proveedor empieza con '20'
		if (tipoDoc?.id === boletaVentaID && proveedor?.LicTradNum.startsWith('20')) {
			showError("No se puede seleccionar un proveedor con RUC que comience con '20' para una Boleta de Venta.");
			return true;  // Indicamos que hubo un error
		}
		return false;  // Si la validación es correcta
	};

	const handleTipoDocChange = (e) => {
		const tipoDocSeleccionado = e.target.value;

		// Validar antes de cambiar el estado
		if (validarBoletaYProveedor(tipoDocSeleccionado, documento.STR_PROVEEDOR)) {
			return;  // No se actualiza el estado si la validación falla
		}

		setDocumento((prevState) => ({
			...prevState,
			STR_TIPO_DOC: tipoDocSeleccionado,
		}));

		setCampoValidoCabecera(prevState => ({
			...prevState,
			STR_TIPO_DOC: Boolean(tipoDocSeleccionado),
		}));
	};

	// Función para manejar el cambio del proveedor
	const handleProveedorChange = (selectedProveedor) => {
		// Validar antes de cambiar el estado
		if (validarBoletaYProveedor(documento.STR_TIPO_DOC, selectedProveedor)) {
			return;  // No se actualiza el estado si la validación falla
		}

		setDocumento((prevState) => ({
			...prevState,
			STR_PROVEEDOR: selectedProveedor,
			STR_RUC: selectedProveedor.LicTradNum,
			STR_RAZONSOCIAL: selectedProveedor.CardName,
		}));

		setCampoValidoCabecera(prevState => ({
			...prevState,
			STR_PROVEEDOR: Boolean(selectedProveedor),
		}));
	};

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
						<Dropdown
							className='col-6'
							value={documento.STR_TIPO_DOC}
							onChange={handleTipoDocChange}
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
								const upperValue = e.target.value.toUpperCase();

								setDocumento((prevState) => ({
									...prevState,
									STR_SERIE_DOC: upperValue,
								}));
								setCampoValidoCabecera(prevState => ({
									...prevState,
									STR_SERIE_DOC: Boolean(upperValue)
								}));
								if (documento.STR_TIPO_DOC === 'Factura') {
									const primeraLetra = upperValue.charAt(0).toUpperCase();
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
							disabled={esModoValidate}
						/>
						{!esValido && <p style={{ color: 'red' }}>El número debe tener exactamente 8 dígitos.</p>}
					</div>
					<div className="flex col-12 align-items-center gap-5">
						<label className='col-2'>(*)RUC</label>
						<Dropdown
							className='col-6'
							value={documento.STR_PROVEEDOR}
							onChange={(e) => handleProveedorChange(e.value)}
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
						<label className='col-2'>(*)Moneda</label>
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
						}, [documento.STR_MONEDA, monedas])}
						<Dropdown
							className="col-6"
							value={documento.STR_MONEDA?.Code || null}  // Usar 'Code' para la selección
							onChange={handleMonedaChange}
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
							onChange={(e) => {
								const newValue = e.target.value;

								// setSelectedTipo(e.value.value);
								setDocumento((prevState) => ({
									...prevState,
									STR_COMENTARIOS: newValue,
								}));
								setCampoValidoCabecera(prevState => ({
									...prevState,
									STR_COMENTARIOS: Boolean(newValue)
								}));

								if (newValue.length >= 254) {
									showInfo("El comentario ha alcanzado el límite de 254 caracteres.");
								}
							}}
							className='col-6'
							rows={5}
							cols={30}
							maxLength={254}
							disabled={esModoValidate}
						/>
					</div>
					<div className="flex col-12 align-items-center gap-5">
						<label className='col-2'>Tipo de Cambio</label>
						<InputText
							className='col-6'
							placeholder='1'
							value={documento.STR_TIPO_CAMBIO}
							onChange={handleTipoCambioChange}
							disabled={
								esModoValidate ||
								(!rendicion?.STR_MONEDA?.id || !documento?.STR_MONEDA?.Code) ||
								(rendicion?.STR_MONEDA?.id === documento?.STR_MONEDA?.Code)
							}
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
		</div>
	);
}

export default DocumentoSustentado;
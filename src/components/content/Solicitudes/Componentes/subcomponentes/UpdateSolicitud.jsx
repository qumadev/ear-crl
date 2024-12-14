import React, { useContext, useEffect } from 'react';
import { useState } from 'react';
import Direccion from './Direccion';
import { createSolicitud, obtenerMotivos, obtenerProveedores, obtenerSolicitud, obtenerTipoDocs, obtenerTipos } from '../../../../../services/axios.service';
import { Dropdown } from 'primereact/dropdown';
import 'primeflex/primeflex.css';
import Input from 'postcss/lib/input';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import FormDetalleNewSolicitud from './FormDetalleNewSolicitud';
import { Button } from 'primereact/button';
import { FormDetalle } from '../../../Rendiciones/Componentes/SubComponentes/Formulario/FormDetalle';
import { AppContext } from '../../../../../App';



function UpdateSolicitud() {

    const { usuario, ruta, config } = useContext(AppContext);
    const [ solicitud, setSolicitud] = useState(null);
    const [productDialog, setProductDialog] = useState(false);
    const [visible, setVisible] = useState(false);

    const crearSolicitud = async () => {
        try {
            var response = await createSolicitud(solicitudRD);
        } catch (error) {
            showError(error.Message);
        }
    }
    const [tipos, setTipos] = useState(null);
    const [motivos, setMotivos] = useState(null);

    async function obtenerData() {
        const response = await Promise.all([
            obtenerMotivos(),
            obtenerTipos(),
            obtenerSolicitud()
        ]);
        setMotivos(response[0].data.Result)
        setTipos(response[1].data.Result)
        setSolicitud(response[2].data.Result[0])
    }

    useEffect(() => {
        obtenerData();
    }, []);

    function obtieneFecha(fecha) {
        const date = new Date(fecha);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}/${month}/${day}`;
    }

    const [selectedMoneda, setSelectedMoneda] = useState(null);
    const [selectedTipo, setSelectedTipo] = useState(tipos[0]);
    const [selectedMotivo, setSelectedMotivo] = useState(null);

    const monedas = [
        { id: 'SOL', name: 'SOL' },
        { id: 'USD', name: 'USD' },
    ];
    const [monto, setMonto] = useState(null);
    const [comentario, setComentario] = useState('');

    const [solicitudRD, setSolicitudRD] = useState({
        ID: null,
        STR_EMPLDREGI: {
            ...usuario
        },
        STR_EMPLDASIG: {

            ...usuario
        },
        STR_NRSOLICITUD: null,
        STR_NRRENDICION: null,
        STR_ESTADO_INFO: "",
        STR_ESTADO: 1,
        STR_FECHAREGIS: obtieneFecha(new Date()),
        STR_MONEDA: {
            "id": "SOL",
            "name": "SOL"
        },
        STR_TIPORENDICION: {
            "id": "1",
            "name": "Caja Chica"
        },
        STR_MOTIVORENDICION: {
            "id": "VIA",
            "name": "Viaticos"
        },
        STR_TOTALSOLICITADO: monto,
        STR_MOTIVOMIGR: null,
        STR_AREA: "",
        STR_DOCENTRY: null,
        CREATE: "PWB",
        STR_COMENTARIO: comentario
    });

    const showSolicitud = () => {
    }

    return (
        <div>
            <div className="col-12 md:col-6 lg:col-6">
                <div className="mb-3 flex flex-column gap-2">

                    <label htmlFor="">Empleado:</label>
                    <InputText
                        value={solicitud?.STR_EMPLDREGI?.nombres + ' ' + solicitud?.STR_EMPLDREGI?.apellidos}
                        disabled={true}
                    />
                    <label htmlFor="">(*)Tipo:</label>
                    <Dropdown
                        value={selectedTipo}
                        onChange={
                            (e) => {
                                setSelectedTipo(e.value);
                                setSolicitudRD(prevState => ({
                                    ...prevState,
                                    STR_TIPORENDICION: e.value

                                }));
                            }}
                        options={tipos}
                        optionLabel="name"
                        placeholder='Seleccione Tipo'
                    />
                    <label htmlFor="">(*)Moneda:</label>
                    <Dropdown
                        value={selectedMoneda}
                        onChange={(e) => {
                            setSelectedMoneda(e.value)
                            setSolicitudRD(prevState => ({
                                ...prevState,
                                STR_MONEDA: e.value

                            }));
                        }}
                        options={monedas}
                        optionLabel="name"
                        placeholder='Seleccione Moneda'
                    />
                    <label htmlFor="">(*)Monto:</label>
                    <InputText
                        value={monto}
                        onChange={(e) => {
                            setMonto(e.target.value)
                            setSolicitudRD(prevState => ({
                                ...prevState,
                                STR_TOTALSOLICITADO: e.target.value
                            }));
                        }}
                        placeholder='Monto a solicitar'
                    />
                    <label htmlFor="">(*)Motivo:</label>
                    <Dropdown
                        value={selectedMotivo}
                        onChange={(e) => {
                            setSelectedMotivo(e.value)
                            setSolicitudRD(prevState => ({
                                ...prevState,
                                STR_MOTIVORENDICION: e.value
                            }));
                        }}
                        options={motivos}
                        optionLabel="name"
                        placeholder='Seleccione Motivo'
                    />
                    <label htmlFor="">(*)Comentario:</label>
                    <InputTextarea
                        value={comentario}
                        onChange={(e) => {
                            setComentario(e.target.value)
                            setSolicitudRD(prevState => ({
                                ...prevState,
                                STR_COMENTARIO: e.target.value
                            }));
                        }}
                        rows={5}
                        maxLength={254}
                        cols={30}
                    />
                </div>
            </div>

            <Button
                label="Guardar Borrador"
                onClick={crearSolicitud}
            />
            
            <Button
                label="ver"
                onClick={showSolicitud}
            />
        </div>
    );
}

export default UpdateSolicitud;
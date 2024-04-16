import React, { useContext, useEffect } from 'react';
import { useState } from 'react';
import Direccion from './Direccion';
import { createSolicitud, obtenerMotivos, obtenerProveedores, obtenerTipoDocs, obtenerTipos } from '../../../../../services/axios.service';
import { Dropdown } from 'primereact/dropdown';
import 'primeflex/primeflex.css';
import Input from 'postcss/lib/input';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import FormDetalleNewSolicitud from './FormDetalleNewSolicitud';
import { Button } from 'primereact/button';
import { FormDetalle } from '../../../Rendiciones/Componentes/SubComponentes/Formulario/FormDetalle';
import { AppContext } from '../../../../../App';



function VerSolicitud() {

    const { usuario, ruta, config } = useContext(AppContext);
    const [productDialog, setProductDialog] = useState(false);
    const [visible, setVisible] = useState(false);

    const crearSolicitud = async () => {
        try {
            var response = await createSolicitud(solicitudRD);
        } catch (error) {
            showError(error.Message);
            console.log(error.Message);
        }
    }
    const [tipos, setTipos] = useState(null);
    const [motivos, setMotivos] = useState(null);

    async function obtenerData() {
        const response = await Promise.all([
            obtenerMotivos(),
            obtenerTipos()
        ]);
        setMotivos(response[0].data.Result)
        setTipos(response[1].data.Result)
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
    const [selectedTipo, setSelectedTipo] = useState(null);
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

    return (
        <div>
            VerSolicitud
       </div>
    );
}

export default VerSolicitud;
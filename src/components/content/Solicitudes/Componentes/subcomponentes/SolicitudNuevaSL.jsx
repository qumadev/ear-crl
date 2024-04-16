import React, { useEffect } from 'react';
import { useState } from 'react';
import Direccion from './Direccion';
import { createSolicitud, obtenerProveedores, obtenerTipoDocs } from '../../../../../services/axios.service';
import { Dropdown } from 'primereact/dropdown';
import 'primeflex/primeflex.css';
import Input from 'postcss/lib/input';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import FormDetalleNewSolicitud from './FormDetalleNewSolicitud';
import { Button } from 'primereact/button';
import { FormDetalle } from '../../../Rendiciones/Componentes/SubComponentes/Formulario/FormDetalle';
import { AppContext } from '../../../../../App';



function SolicitudNuevaSL() {

    const { usuario, ruta, config } = useContext(AppContext);
    console.log(AppContext)

    const [solicitudRD, setSolicitudRD] = useState({
        "ID": null,
        "STR_EMPLDREGI":{
            ...usuario
          },
        "STR_EMPLDASIG": {
          
            "usuarioId": 1,
            "sapID": 3573,
            "nombres": "MARIA PILAR",
            "apellidos": "DE LA GRECCA",
            "email": "",
            "username": "mdelagrecca",
            "password": "/favYrs44ORVpQxo+9iMCg==",
            "rol": {
              "id": "1",
              "name": "Usuario"
            },
            "filial": {
              "Code": "CHO002",
              "Name": "CHO002 - CHORRILLOS",
              "U_ST_Filial": "001",
              "U_ST_NombreFilial": "CHORRILLOS",
              "U_ST_Ref": "Edificio 7 pisos hasta Badminton"
            }
        },
        "STR_NRSOLICITUD": null,
        "STR_NRRENDICION": null,
        "STR_ESTADO_INFO": "",
        "STR_ESTADO": 1,
        "STR_FECHAREGIS": "2024-04-15",
        "STR_MONEDA": {
                "id": "SOL",
                "name":"SOL"
        },
        "STR_TIPORENDICION": {
              "id": "1",
              "name":"Caja Chica"
        },
        "STR_MOTIVORENDICION": {
              "id": "VIA",
              "name":"Viaticos"
        },
        "STR_TOTALSOLICITADO": 0.0,
        "STR_MOTIVOMIGR": null,
        "STR_AREA": "",
        "STR_DOCENTRY": null,
        "CREATE": "PWB",
        "STR_COMENTARIO": "FASFSA"
      });
    const [productDialog, setProductDialog] = useState(false);
    const [visible, setVisible] = useState(false);
    // const [proveedor, setProveedor] = useState(null);
    const [proveedores, setProveedores] = useState(null);
    const [proveedor, handleChangeProveedor] = useState(null);
    const selectedOptionTemplate = (option, props) => {
        if (option) {
            return (
                <div className="flex">
                    <div>{option.CardCode}</div>
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

    const crearSolicitud = async () => {
        try {
            console.log(solicitudRD);
            var response = await createSolicitud(solicitudRD);
            console.log(response)
        } catch (error) {
            showError(error.Message);
            console.log(error.Message);
          }
    }


    async function obtenerData() {
        const response = await Promise.all([
            obtenerProveedores(),
            obtenerTipoDocs()
        ]);
        setProveedores(response[0].data.Result);
        console.log(response)
        console.log(response[1].data.Result)
    }

    const openNew = () => {
        setProductDialog(true);
    };


    useEffect(() => {
        obtenerData();
    }, []);

    return (
        <div>

            {/* <Button
            label="New"
            onClick={openNew}
            /> */}

            {visible && <FormDetalleNewSolicitud setVisible={setVisible} />}

            <div className="col-12 md:col-6 lg:col-6">
                <div className="mb-3 flex flex-column gap-2">
                    {/* <Dropdown
                        value={proveedor}
                        onChange={(e) => handleChangeProveedor(e.value)}
                        options={proveedores}
                        optionLabel="CardName"
                        placeholder="Selecciona Proveedor"
                        valueTemplate={selectedOptionTemplate}
                        itemTemplate={complementoOptionTemplate}
                    /> */}
                    <label htmlFor="">Empleado:</label>
                    <InputText
                    disabled={true}
                    />
                    <label htmlFor="">(*)Tipo:</label>
                    <Dropdown
                        placeholder='Selecciona Tipo'
                    />
                    <label htmlFor="">(*)Moneda:</label>
                    <Dropdown
                        placeholder='Selecciona Moneda'
                    />
                    <label htmlFor="">(*)Monto:</label>
                    <InputText
                        placeholder='Monto a solicitar'
                    />
                    <label htmlFor="">(*)Motivo:</label>
                    <Dropdown
                        placeholder='Selecciona Motivo'
                    />
                    <label htmlFor="">(*)Comentario:</label>
                    <InputTextarea
                        rows={5}
                        cols={30}
                    />
                </div>
            </div>

            <Button
            label="Guardar Borrador"
            onClick={crearSolicitud}
            />
            {/* <FormDetalleNewSolicitud
                productDialog={productDialog}
                setProductDialog={setProductDialog}
                proveedores={proveedores}
            >
            </FormDetalleNewSolicitud> */}

        </div>
    );
}

export default SolicitudNuevaSL;
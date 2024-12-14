import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import React, { useState } from "react";
import { consultaRuc } from "../../../../../../services/axios.service";

function GeneralRD({
  fechaContabilizacion,
  fechaDocumento,
  fechaVencimiento,
  proveedor,
  ruc,
  razonSocial,
  tipoAgente,
  comentarios,
  setDocumento,
  proveedores,
  agentes,
  selectedOptionDefault,
  complementoOptionDefault,
  setProveedores,
  consultSunat,
  setConsultSunat,
  showError,
  showSuccess,
  existeEnSunat,
  setExisteEnSunat,
  editable,
  fechaSolicitud,
  getFechaLargo,
}) {
  /* UseStates exclusivos para GeneralRD */
  const [loading, setLoading] = useState(false);

  /* Templates para DropDowns y formulario */
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
      <div className="flex">
        <div>
          {option.LicTradNum} - {option.CardName}
        </div>
      </div>
    );
  };

  const handleChangeRuc = (e) => {
    const nuevoRuc = e.target.value;

    setProveedores((prevProveedores) =>
      prevProveedores.map((prov) =>
        prov.CardCode == "P99999999999"
          ? { ...prov, LicTradNum: nuevoRuc }
          : prov
      )
    );
    // Actualiza el estado manteniendo la estructura existente
    setDocumento((prevDocumento) => ({
      ...prevDocumento,
      STR_PROVEEDOR: {
        ...prevDocumento.STR_PROVEEDOR,
        LicTradNum: nuevoRuc, // Asigna el valor a CardName
      },
    }));

    if (existeEnSunat) setExisteEnSunat(false);
  };

  function handleChangeProveedor(e) {
    setDocumento((prevDocumento) => ({
      ...prevDocumento,
      STR_PROVEEDOR: e.target.value,
    }));

    if (e.target.value.CardCode == "P99999999999") {
      setExisteEnSunat(false);
      setConsultSunat(false);
    } else {
      setExisteEnSunat(true);
      setConsultSunat(true);
    }
  }

  async function handleSearchRucEnSunat(e) {
    try {
      setLoading(true);
      //-------------------------------------------------
      // Busca en proveedores
      let _proveedor = proveedores.find((c) => c.LicTradNum == e);

      if ((_proveedor != null) & (_proveedor.CardCode != "P99999999999")) {
        setDocumento((prevDocumento) => ({
          ...prevDocumento,
          STR_PROVEEDOR: _proveedor,
        }));
        setExisteEnSunat(true);
      } else {
        //-------------------------------------------------
        let response = await consultaRuc(e);
        if (response.status == 400) {
          //showError("Ruc no existente en SUNAT");
        }

        if (response.data.CodRespuesta == "00") {
          setProveedores((prevProveedores) =>
            prevProveedores.map((prov) =>
              prov.CardCode == "P99999999999"
                ? { ...prov, CardName: response.data.Result[0].RazonSocial }
                : prov
            )
          );

          setDocumento((prevDocumento) => ({
            ...prevDocumento,
            STR_PROVEEDOR: {
              ...prevDocumento.STR_PROVEEDOR,
              CardCode: "P99999999999",
              CardName: response.data.Result[0].RazonSocial,
            },
          }));

          showSuccess("Ruc existente en SUNAT");
          setExisteEnSunat(true);
        } else {
          showError("Ruc NO existente en SUNAT");
        }
      }
    } catch (error) {
      showError("Ruc NO existente en SUNAT");
    } finally {
      setLoading(false);
    }
  }

  const handleChangeRazonSocial = (e) => {
    const nuevoRazon = e.target.value;

    setProveedores((prevProveedores) =>
      prevProveedores.map((prov) =>
        prov.CardCode == "P99999999999"
          ? { ...prov, CardName: nuevoRazon }
          : prov
      )
    );
    // Actualiza el estado manteniendo la estructura existente
    setDocumento((prevDocumento) => ({
      ...prevDocumento,
      STR_PROVEEDOR: {
        ...prevDocumento.STR_PROVEEDOR,
        CardName: nuevoRazon, // Asigna el valor a CardName
      },
    }));
  };

  return (
    <>
      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Fecha de Contabilización</label>
            <Calendar
              value={fechaContabilizacion}
              readOnlyInput
              onChange={(e) => {
                setDocumento((prevDocumento) => ({
                  ...prevDocumento,
                  STR_FECHA_CONTABILIZA: e.target.value,
                }));
              }}
              //disabled
              dateFormat="dd/mm/yy"
              disabled={editable}
              minDate={getFechaLargo(fechaSolicitud)}
            />
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Fecha de Documento</label>
            <Calendar
              value={fechaDocumento}
              onChange={(e) => {
                setDocumento((prevDocumento) => ({
                  ...prevDocumento,
                  STR_FECHA_DOC: e.target.value,
                  STR_FECHA_VENCIMIENTO: e.target.value,
                }));
              }}
              readOnlyInput
              // disabled
              disabled={editable}
              dateFormat="dd/mm/yy"
              minDate={getFechaLargo(fechaSolicitud)}
            />
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Fecha de Vencimiento</label>
            <Calendar
              value={fechaVencimiento}
              readOnlyInput
              disabled
              dateFormat="dd/mm/yy"
            />
          </div>
        </div>
      </div>
      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Selecciona Proveedor</label>
            <div className="card flex">
              <Dropdown
                value={proveedor}
                onChange={handleChangeProveedor}
                options={proveedores}
                optionLabel="CardName"
                placeholder="Selecciona Proveedor"
                filter
                filterBy="CardName,CardCode"
                filterMatchMode="contains" // Puedes ajustar el modo de filtrado según tus necesidades
                valueTemplate={selectedOptionTemplate}
                itemTemplate={complementoOptionTemplate}
                className="w-8rem md:w-14rem"
                disabled={editable}
                //loading={proveedores.length < 1}
              />
            </div>
            {/* {solicitando && solicitudRD.checkTrcr && !solicitudRD.empldAsig && (
              <small className="p-error">Empleado es requerido</small>
            )} */}
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Número de Ruc</label>
            <div className={"card flex gap-2"}>
              <InputText
                value={ruc}
                onChange={handleChangeRuc}
                //disabled={(proveedor?.CardCode != "P99999999999") | editable}
                placeholder="N° de Ruc"
                className={
                  proveedor?.CardCode != "P99999999999" ? `w-12` : "w-9"
                }
                disabled={editable}
              />
              {/* {!consultSunat && (
                <Button
                  icon={`pi pi-search`}
                  severity="success"
                  aria-label="Search"
                  onClick={(e) => handleSearchRucEnSunat(ruc)}
                  loading={loading}
                  disabled={editable}
                />
              )} */}

              <Button
                icon={`pi pi-search`}
                severity="success"
                aria-label="Search"
                onClick={(e) => handleSearchRucEnSunat(ruc)}
                loading={loading}
                disabled={editable}
              />
            </div>
            {!existeEnSunat && (
              <small className="p-error">
                Validación en SUNAT es requerida
              </small>
            )}
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Razon Social</label>
            <div className="card flex">
              <InputText
                value={razonSocial}
                onChange={handleChangeRazonSocial}
                // onChange={(e) =>
                //   setDocumento((prevDocumento) => ({
                //     ...prevDocumento,
                //     razonSocial: e.target.value,
                //   }))
                // }
                disabled
                placeholder="Razon Social"
                className="w-12"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="grid">
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Retención o Detracción</label>
            <div className="card flex">
              <Dropdown
                value={tipoAgente}
                onChange={(e) =>
                  setDocumento((prevDocumento) => ({
                    ...prevDocumento,
                    STR_TIPO_AGENTE: e.target.value,
                  }))
                }
                options={agentes}
                optionLabel="name"
                placeholder="Selecciona Tipo"
                valueTemplate={selectedOptionDefault}
                itemTemplate={complementoOptionDefault}
                className="w-full md:w-14rem"
                disabled={editable}
              />
            </div>
          </div>
        </div>
        <div className="col-12 md:col-6 lg:col-3">
          <div className="mb-3 flex flex-column gap-2">
            <label htmlFor="countries">Comentarios</label>
            <div className="card flex">
              <InputTextarea
                autoResize
                value={comentarios}
                onChange={(e) =>
                  setDocumento((prevDocumento) => ({
                    ...prevDocumento,
                    STR_COMENTARIOS: e.target.value,
                  }))
                }
                rows={5}
                cols={30}
                disabled={editable}
                //disabled={!estadosEditables.includes(solicitudRD.estado)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default GeneralRD;

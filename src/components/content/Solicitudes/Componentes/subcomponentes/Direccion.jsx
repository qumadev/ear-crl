import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { obtenerDistritos } from "../../../../../services/axios.service";
import { Dropdown } from "primereact/dropdown";

function Direccion({ solicitudRD, setSolicitudRD, estadosEditables, usuario }) {
  const [products, setProducts] = useState([]);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState(
    solicitudRD.ubigeo?.Departamento ?? "LIMA"
  );

  const optionsBusqueda = [
    { id: 'T2."U_CQ_NDIS"', name: "Distrito" },
    { id: 'T1."U_CQ_NPRO"', name: "Provincia" },
    { id: 'T0."U_CQ_NDEP"', name: "Departamento" },
  ];

  const [optnSearch, setOptnSearch] = useState(optionsBusqueda[2]);

  async function obtenerDistritosPrueba() {
    await obtenerDistritos(
      optnSearch.id,
      (search == null) | (search == "") ? "LIMA" : search
    )
      .then((response) => {
        const listaResults = response.data.Result.map((element) => ({
          Ubigeo: element.Ubigeo,
          Departamento: element.Departamento,
          Provincia: element.Provincia,
          Distrito: element.Distrito,
        }));

        setProducts(listaResults);
      })
      .catch((err) => console.log(err.message))
      .finally(() => {
      });
  }

  function CapturaUbigeo(value) {
    setSolicitudRD((prevSolicitudRD) => ({
      ...prevSolicitudRD,
      ubigeo: value,
    }));
  }

  useEffect(() => {
    obtenerDistritosPrueba();
  }, [search, optnSearch]);

  return (
    <>
      <label htmlFor="countries">Direccion</label>
      <div className="card flex ">
        <Button
          label={
            solicitudRD.ubigeo != null
              ? solicitudRD.ubigeo.Ubigeo
              : "Selecciona Dirección"
          }
          icon="pi pi-search"
          onClick={() => setVisible(true)}
          disabled={
            !estadosEditables.includes(solicitudRD.estado) |
            (usuario.TipoUsuario != 1)
          }
        />
        <Dialog
          visible={visible}
          modal
          className="xl:max-w-30rem max-w-20rem"
          onHide={() => setVisible(false)}
          content={({ hide }) => (
            <div
              className="flex flex-column px-3 pt-5 pb-2 gap-4"
              style={{
                borderRadius: "12px",
                backgroundColor: "#ffffff",
              }}
            >
              <div className="grid">
                <div className="col">
                  <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                      placeholder="Search"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                      }}
                    />
                  </span>
                </div>

                <div className="col">
                  <Dropdown
                    value={optnSearch}
                    optionLabel="name"
                    placeholder="Selecciona Filtro"
                    onChange={(e) => {
                      setOptnSearch(e.value);
                    }}
                    options={optionsBusqueda}
                  />
                </div>
              </div>

              <DataTable
                value={products}
                tableStyle={{}}
                size="small"
                scrollable
                scrollHeight="300px"
                selectionMode={"single"}
                selection={
                  solicitudRD.ubigeo == null ? "" : solicitudRD.ubigeo.Distrito
                }
                onSelectionChange={(e) => CapturaUbigeo(e.value)}
                onRowClick={(e) => setVisible(false)}
              >
                <Column field="Departamento" header="Departamento"></Column>
                <Column field="Provincia" header="Provincia"></Column>
                <Column field="Distrito" header="Distrito"></Column>
              </DataTable>
            </div>
          )}
        ></Dialog>
      </div>
      <label>
        {solicitudRD.ubigeo == null
          ? ""
          : solicitudRD.ubigeo.Departamento +
            " - " +
            solicitudRD.ubigeo.Provincia +
            " - " +
            solicitudRD.ubigeo.Distrito}
      </label>
    </>
  );
}

export default Direccion;

import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../../../../../App";
import { Divider } from "primereact/divider";
import { TabPanel, TabView } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { obtieneAprobadoresRd } from "../../../../../../services/axios.service";

export function Aprobadores() {
  const { ruta } = useContext(AppContext);
  const [aprobadores, setAprobadores] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const [state, setstate] = useState("");

  async function obtieneAprobadoreLocal() {
    try {
      let response = await obtieneAprobadoresRd(id);

      if (response.status < 300) {
        let body = response.data.Result;
        let ord = 0;
        let aprobadores1 = body.map((e) => {
          ord += 1;
          e.aprobadores = e.aprobadores.map((r) => {
            return { ...r, orden: ord };
          });
          return e.aprobadores;
        });
        let _aprobadores = [].concat(...aprobadores1);

        // Description: 0 no es aprobador  / 1 ya aprobó
        setAprobadores(_aprobadores);
      } else {
        console.log("Error interno");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const aprobBodyTemplate = (rowData) => {
    return (
      <>
        {rowData.finalizado == 1 ? (
          <i
            className="pi pi-check"
            style={{ fontSize: "1.5rem", color: "green" }}
          ></i>
        ) : aprobadores.filter(
            (e) => e.orden === rowData.orden && e.finalizado === 1
          ).length > 0 ? (
          <i className="pi pi-minus" style={{ fontSize: "1.5rem" }}></i>
        ) : (
          <i
            className="pi pi-minus"
            style={{ fontSize: "1.5rem", color: "#fab710" }}
          ></i>
        )}
      </>
    );
  };

  useEffect(() => {
    obtieneAprobadoreLocal();
  }, []);

  return (
    <div>
      <div className="flex  flex-wrap gap-2">
        <div className="flex text-2xl align-items-center gap-2">
          <i
            className="pi pi-chevron-left cursor-pointer"
            onClick={() => {
              navigate(ruta + "/rendiciones");
            }}
          ></i>
          <div>Lista de Aprobadores - Rendición - #{id}</div>
        </div>
      </div>

      <Divider />

      <TabView>
        <TabPanel header="Aprobadores">
          <div className="card">
            <DataTable
              value={aprobadores}
              tableStyle={{ minWidth: "50rem" }}
              emptyMessage="No se encontraron aprobadores"
            >
              <Column field="orden" header="Nivel"></Column>
              <Column field="aprobadorNombre" header="Usuario"></Column>
              <Column
                field="finalizado"
                header="Aprobado"
                body={aprobBodyTemplate}
              ></Column>
              <Column
                field="fechaRegistro"
                header="Fecha de Aprobación"
              ></Column>
            </DataTable>
          </div>
        </TabPanel>
      </TabView>
    </div>
  );
}

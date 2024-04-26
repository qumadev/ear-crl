import React, { useEffect, useLayoutEffect } from "react";
import { Formulario } from "./Formulario";
import "../../../Public/css/Login.css";

export function Login({ config }) {
  useEffect(() => {
    console.log(config);
  }, [config]);

  return (
    <>
      <div
        className="layoutImage h-screen w-full bg-no-repeat bg-left-top  flex"
        style={{
          backgroundImage: 'url("/src/Public/Imgs/FondoLogin.jpg")',
          backgroundSize: "100% 100%",
        }}
      >
        <div className="flex bg-white border-round-3xl min-h-3 my-auto mx-8">
          <div>
            <Formulario></Formulario>
          </div>
        </div>
      </div>
    </>
  );
}

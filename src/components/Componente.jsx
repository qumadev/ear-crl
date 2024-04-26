import React, { useContext, useEffect, useState } from "react";
import { Header } from "./partials/Header";
import { useNavigate } from "react-router-dom";
import Modulos from "./partials/Modulos";
import { AppContext } from "../App";
import Layout from "./partials/Layout";

export function Componente({ children }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { usuario, showError, ruta } = useContext(AppContext);
  const [SideBarActive, setSideBarActive] = useState(true);
  const navigate = useNavigate();

  const handleResize = () => {
    setWindowWidth(window.innerWidth);
    //setSideBarActive(window.innerWidth >= 992);
  };

  const responsiveSize = () => {
    return window.innerWidth < 992;
  };

  const responsiveSizeMobile = () => {
    return window.innerWidth < 400;
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if ((usuario == null) | (usuario?.empId == null)) {
      navigate(ruta + "/login", { replace: true });
    }
  }, []);

  if (usuario == null) {
    return null;
  }

  return (
    <>
      <Header
        setSideBarActive={setSideBarActive}
        SideBarActive={SideBarActive}
        responsiveSize={responsiveSize()}
        responsiveSizeMobile={responsiveSizeMobile()}
      />
      <Modulos
        responsiveSize={responsiveSize()}
        SideBarActive={SideBarActive}
        setSideBarActive={setSideBarActive}
        responsiveSizeMobile={responsiveSizeMobile()}
      />
      <Layout
        SideBarActive={SideBarActive}
        responsiveSizeMobile={responsiveSizeMobile()}
      >
        {children}
      </Layout>
    </>
  );
}

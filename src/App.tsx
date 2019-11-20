import * as Domain from "@app/domain";
import * as React from "react";
import { Page } from "./container-component";
import "./style.scss";

interface AppProps {
  reducers: Domain.Reducers;
}

export const App = ({ reducers }: AppProps) => {
  return <Page.Container reducers={reducers} />;
};

export { AppProps as Props, App as Container };

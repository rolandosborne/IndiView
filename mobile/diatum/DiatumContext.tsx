import React, { useContext, useState } from "react";
import { Diatum, diatumInstance } from "./Diatum";
import { Alert } from 'react-native';

const DiatumContext = React.createContext<Diatum | undefined>(undefined);

export const DiatumProvider: React.FunctionComponent = function({ children }) {
  return (
    <DiatumContext.Provider value={diatumInstance}>{children}</DiatumContext.Provider>
  );
};

export function useDiatum(): Diatum {
  const diatum = useContext(DiatumContext);
  if (diatum === undefined) {
    Alert.alert("NOT DEFINED");
  }
  return diatum;
}


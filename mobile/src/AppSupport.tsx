import React, { useContext, useState } from "react";
import { Alert } from 'react-native';

export class AppSupport {
  private token: string;

  public getToken(): string {
    return this.token;
  }

  public setToken(value: string) {
    this.token = value;
  }
};

var appSupportInstance: AppSupport = new AppSupport();

const AppSupportContext = React.createContext<AppSupport | undefined>(undefined);

export const AppSupportProvider: React.FunctionComponent = function({ children }) {
  return (
    <AppSupportContext.Provider value={appSupportInstance}>{children}</AppSupportContext.Provider>
  );
};

export function useApp(): AppSupport {
  const appSupport = useContext(AppSupportContext);
  if (appSupport === undefined) {
    Alert.alert("NOT DEFINED");
  }
  return appSupport;
}


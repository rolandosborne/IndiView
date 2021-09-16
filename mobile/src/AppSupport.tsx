import React, { useContext, useState } from "react";
import { Alert } from 'react-native';
import { Config } from 'IndiViewCom';

export class AppSupport {
  private token: string;
  private config: Config;
  private amigoId: string;

  public getToken(): string {
    return this.token;
  }

  public setToken(value: string) {
    this.token = value;
  }

  public getAmigoId(): string {
    return this.amigoId;
  }

  public setAmigoId(value: string) {
    this.amigoId = value;
  }

  public getConfig(): Config {
    return this.config;
  }

  public setConfig(value: Config) {
    this.config = value;
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


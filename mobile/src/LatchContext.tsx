import React, { useContext, useState } from "react";
import { Alert } from 'react-native';

export class Latch {
  private toggleListener: (() => {});
  private colorListener: ((string) => {});

  constructor() {
    this.toggleListener = null;
    this.colorListener = null;
  }

  public setToggleListener(callback: () => {}, color: string) {
    this.toggleListener = callback;
    this.setColor(color);
  }
  public clearToggleListener(callback: () => {}) {
    if(this.toggleListener == callback) {
      this.toggleListener = null;
      this.setColor('#282827');
    }
  }

  public setColorListener(callback: (string) => {}) {
    this.colorListener = callback;
  }
  public clearColorListener(callback: (string) => {}) {
    if(this.colorListener == callback) {
      this.colorListener = null;
    }
  }

  public setColor(color: string) {
    if(this.colorListener != null) {
      this.colorListener(color);
    }
  }

  public toggle() {
    if(this.toggleListener != null) {
      this.toggleListener();
    }
  }
};

var latchInstance: Latch = new Latch();

const LatchContext = React.createContext<Latch | undefined>(undefined);

export const LatchProvider: React.FunctionComponent = function({ children }) {
  return (
    <LatchContext.Provider value={latchInstance}>{children}</LatchContext.Provider>
  );
};

export function useLatch(): Latch {
  const latch = useContext(LatchContext);
  if (latch === undefined) {
    Alert.alert("NOT DEFINED");
  }
  return latch;
}


import React, { useContext, useState } from "react";
import { Alert } from 'react-native';

export class Latch {
  private latchColor: string[] = [];
  private toggleListener: (() => {})[];
  private colorListener: ((string) => {})[];

  constructor() {
    this.toggleListener = [];
    this.colorListener = [];
  }

  public setToggleListener(callback: () => {}) {
    this.toggleListener.push(callback);
  }
  public clearToggleListener(callback: () => {}) {
    if(this.toggleListener.length > 0) {
      this.toggleListener.pop(callback);
    }
  }

  public setColorListener(callback: (string) => {}) {
    this.colorListener.push(callback);
  }
  public clearColorListener(callback: (string) => {}) {
    if(this.colorListener.length > 0) {
      this.colorListener.pop(callback);
    }
  }

  public push(color: string) {
    this.latchColor.push(color);
    this.notifyColor();
  }

  public pop() {
    if(this.latchColor.length > 0) {
      this.latchColor.pop();
    }
    this.notifyColor();
  }

  public setColor(color: string) {
    if(this.latchColor.length > 0) {
      this.latchColor[this.latchColor.length - 1] = color;
    }
    this.notifyColor();
  }

  private getColor(): string {
    if(this.latchColor.length > 0) {
      return this.latchColor[this.latchColor.length - 1];
    }
    return '#272728';
  }

  public toggle() {
    if(this.toggleListener.length > 0) {
      this.toggleListener[this.toggleListener.length - 1]();
    }
  }

  private notifyColor() {
    let color: string = this.getColor();
    if(this.colorListener.length > 0) {
      this.colorListener[this.colorListener.length - 1](color);
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


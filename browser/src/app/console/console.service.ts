import { Injectable, Type, Component } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpEvent } from '@angular/common/http';
import { HttpUrlEncodingCodec } from '@angular/common/http';

import { Stat } from './stat';
import { AppConfig } from './appConfig';

@Injectable()
export class ConsoleService {

  private accessToken: string = null;
  private headers: HttpHeaders;

  constructor(private httpClient: HttpClient) {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' });
  }

  public getStatus(token: string): Promise<void> {
    return this.httpClient.put<void>("console/access?token=" + token,
        { headers: this.headers, observe: 'body' }).toPromise();
  }

  public getStats(token: string): Promise<Stat[]> {
    return this.httpClient.get<Stat[]>("console/stats?token=" + token,
        { headers: this.headers, observe: 'body' }).toPromise();
  }

  public getConfig(token: string): Promise<AppConfig> {
    return this.httpClient.get<AppConfig>("console/config?token=" + token,
        { headers: this.headers, observe: 'body' }).toPromise();
  }

  public setConfig(token: string, config: AppConfig): Promise<void> {
    return this.httpClient.put<void>("console/config?token=" + token,
        config, { headers: this.headers, observe: 'body' }).toPromise();
  }
}



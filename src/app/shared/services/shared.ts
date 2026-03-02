import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { ApiResponse } from '../types/common.types';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Shared {
  private isLoadingSignal = signal<boolean>(false);
  isLoading = computed(() => this.isLoadingSignal());

  constructor(
    private _httpClient: HttpClient
  ) { }

  getCurrentProductionPlans() {
    return this._httpClient.get<ApiResponse>(`${environment.apiUrl}Master/GetTodayProductionPlansWithModelDetails`);
  }

  getChatBotResponse(query: string) {
    return this._httpClient.get<ApiResponse>(`${environment.apiUrl}ChatBot/Chat?query=${query}`);
  }
}

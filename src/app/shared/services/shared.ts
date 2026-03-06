import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { ApiResponse, DefectModalDataI, LgApiResponse } from '../types/common.types';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Shared {
  private isLoadingSignal = signal<boolean>(false);
  isLoading = computed(() => this.isLoadingSignal());
  private currentFiltersSignal = signal<any>({});
  currentFilters = computed(() => this.currentFiltersSignal());

  constructor(
    private _httpClient: HttpClient
  ) { }

  getCurrentProductionPlans(filters?: any) {
    return this._httpClient.get<LgApiResponse>('Json/api.json');
  }

  getChatBotResponse(query: string) {
    return this._httpClient.get<ApiResponse>(`${environment.apiUrl}ChatBot/Chat?query=${query}`);
  }

  getDefectModalData(modelNumber: string){
    return this._httpClient.get<DefectModalDataI>(`${environment.apiUrl}Master/GetModelDefectDetail?modelNumber=${modelNumber}`);
  }

  applyFilters(filters: any) {
    this.currentFiltersSignal.set(filters);
  }

  clearFilters() {
    this.currentFiltersSignal.set({});
  }
}

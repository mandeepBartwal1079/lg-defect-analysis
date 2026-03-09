import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { ApiResponse, DefectModalDataI, ModelNamesResponse } from '../types/common.types';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Shared {
  private isLoadingSignal = signal<boolean>(false);
  isLoading = computed(() => this.isLoadingSignal());
  private currentFiltersSignal = signal<any>({});
  currentFilters = computed(() => this.currentFiltersSignal());
  productionLines = signal<string[]>(['PR1', 'PR2', 'PL1', 'PL2', 'PL3', 'UHD', 'L02', 'PWM1', 'PA1', 'PA2', 'PA4', 'PA5']);
  constructor(
    private _httpClient: HttpClient
  ) { }

  getCurrentProductionPlans(filters?: any) {
    let params = new HttpParams();

    if (filters?.modelNumber) params = params.set('modelNumber', filters.modelNumber);
    if (filters?.productionLine) params = params.set('productionLine', filters.productionLine);
    if (filters?.date) params = params.set('forDate', filters.date);

    return this._httpClient.get<ApiResponse>(
      `${environment.apiUrl}Master/GetTodayProductionPlansWithModelDetails`,
      { params }
    );
  }
  getChatBotResponse(query: string) {
    return this._httpClient.get<ApiResponse>(`${environment.apiUrl}ChatBot/Chat?query=${query}`);
  }

  getDefectModalData(modelNumber: string){
    return this._httpClient.get<DefectModalDataI>(`${environment.apiUrl}Master/GetModelDefectDetail?modelNumber=${modelNumber}`);
  }

  getProductionLines() {
    return this.productionLines();
  }

  getModelNames() {
    return this._httpClient.get<ModelNamesResponse>(`${environment.apiUrl}Master/GetTodayProductionPlanModelNumbers`);
  }

  applyFilters(filters: any) {
    this.currentFiltersSignal.set(filters);
  }

  clearFilters() {
    this.currentFiltersSignal.set({});
  }
}

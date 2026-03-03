import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { ApiResponse } from '../types/common.types';
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

  applyFilters(filters: any) {
    this.currentFiltersSignal.set(filters);
  }

  clearFilters() {
    this.currentFiltersSignal.set({});
  }
}

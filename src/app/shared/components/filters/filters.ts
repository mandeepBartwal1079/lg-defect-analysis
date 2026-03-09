import { Component, computed, inject, signal, HostListener, Input } from '@angular/core';
import { Shared } from '../../services/shared';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ModelName } from '../../types/common.types';

@Component({
  selector: 'app-filters',
  imports: [CommonModule],
  templateUrl: './filters.html',
  styleUrl: './filters.scss',
})
export class Filters {
  sharedService = inject(Shared);
  @Input() showFilters: boolean = false;
  selectedDay = signal<'today' | 'tomorrow' | ''>('');
  readonly today = new Date();
  readonly tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; })();
  
  // Model dropdown states
  selectedModel = signal<ModelName | null>(null);
  modelDropdownOpen = signal<boolean>(false);
  modelSearchQuery = signal<string>('');
  
  // Production line dropdown states
  selectedProductionLine = signal<string>('');
  productionLineDropdownOpen = signal<boolean>(false);
  productionLineSearchQuery = signal<string>('');

  public formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  modelNamesData = toSignal(
    this.sharedService.getModelNames().pipe(map(response => response.data)),
    { initialValue: [] as ModelName[] }
  );

  productionLinesData = computed(() => this.sharedService.getProductionLines());

  // Filtered lists based on search
  filteredModelNames = computed(() => {
    const query = this.modelSearchQuery().toLowerCase();
    const models = this.modelNamesData();
    if (!query) return models;
    return models.filter(model => model.name.toLowerCase().includes(query));
  });

  filteredProductionLines = computed(() => {
    const query = this.productionLineSearchQuery().toLowerCase();
    const lines = this.productionLinesData();
    if (!query) return lines;
    return lines.filter(line => line.toLowerCase().includes(query));
  });

  selectedDate = computed<string | null>(() => {
    if (this.selectedDay() === 'today') return null;
    if (this.selectedDay() === 'tomorrow') return 'tomorrow';
    return '';
  });

  toggleModelDropdown(): void {
    this.modelDropdownOpen.update(open => !open);
    if (this.modelDropdownOpen()) {
      this.productionLineDropdownOpen.set(false);
    }
  }

  toggleProductionLineDropdown(): void {
    this.productionLineDropdownOpen.update(open => !open);
    if (this.productionLineDropdownOpen()) {
      this.modelDropdownOpen.set(false);
    }
  }

  selectModel(model: ModelName): void {
    this.selectedModel.set(model);
    this.modelDropdownOpen.set(false);
    this.modelSearchQuery.set('');
  }

  selectProductionLine(line: string): void {
    this.selectedProductionLine.set(line);
    this.productionLineDropdownOpen.set(false);
    this.productionLineSearchQuery.set('');
  }

  clearModelSelection(): void {
    this.selectedModel.set(null);
    this.modelSearchQuery.set('');
  }

  clearProductionLineSelection(): void {
    this.selectedProductionLine.set('');
    this.productionLineSearchQuery.set('');
  }

  applyFilters(): void {
    const filters: any = {};
    if (this.selectedModel()) filters.modelNumber = this.selectedModel()!.name;
    if (this.selectedProductionLine()) filters.productionLine = this.selectedProductionLine();
    const dateValue = this.selectedDate();
    if (dateValue !== '') filters.date = dateValue;
    this.sharedService.applyFilters(filters);
    this.modelDropdownOpen.set(false);
    this.productionLineDropdownOpen.set(false);
  }

  clearFilters(): void {
    this.selectedModel.set(null);
    this.selectedProductionLine.set('');
    this.selectedDay.set('');
    this.modelSearchQuery.set('');
    this.productionLineSearchQuery.set('');
    this.sharedService.clearFilters();
  }

  hasActiveFilters(): boolean {
    return (
      this.selectedModel() !== null ||
      this.selectedProductionLine() !== '' ||
      this.selectedDay() !== ''
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.custom-dropdown');
    
    if (!clickedInside) {
      this.modelDropdownOpen.set(false);
      this.productionLineDropdownOpen.set(false);
    }
  }

}

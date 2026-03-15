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
  @Input() modelsList: string[] = [];
  @Input() toolsList: string[] = [];
  selectedDay = signal<'today' | 'tomorrow' | ''>('');
  readonly today = new Date();
  readonly tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; })();
  // View type (Models or Tools)
  viewType = signal<'models' | 'tools'>('tools');

  // Model dropdown states
  selectedModel = signal<string>('');
  modelDropdownOpen = signal<boolean>(false);
  modelSearchQuery = signal<string>('');
  // Tool dropdown states
  selectedTool = signal<string>('');
  toolDropdownOpen = signal<boolean>(false);
  toolSearchQuery = signal<string>('');
  // Production line dropdown states
  selectedProductionLine = signal<string>(this.sharedService.currentFilters().productionLine || '');
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
    const models = this.modelsList || [];
    if (!query) return models;
    return models.filter(model => model.toLowerCase().includes(query));
  });

  filteredProductionLines = computed(() => {
    const query = this.productionLineSearchQuery().toLowerCase();
    const lines = this.productionLinesData();
    if (!query) return lines;
    return lines.filter(line => line.toLowerCase().includes(query));
  });

  filteredTools = computed(() => {
    const query = this.toolSearchQuery().toLowerCase();
    const tools = this.toolsList || [];
    if (!query) return tools;
    return tools.filter(tool => tool.toLowerCase().includes(query));
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
      this.toolDropdownOpen.set(false);
    }
  }

  toggleToolDropdown(): void {
    this.toolDropdownOpen.update(open => !open);
    if (this.toolDropdownOpen()) {
      this.modelDropdownOpen.set(false);
      this.productionLineDropdownOpen.set(false);
    }
  }

  selectModel(model: string): void {
    this.selectedModel.set(model);
    this.modelDropdownOpen.set(false);
    this.modelSearchQuery.set('');
  }

  selectProductionLine(line: string): void {
    this.selectedProductionLine.set(line);
    this.productionLineDropdownOpen.set(false);
    this.productionLineSearchQuery.set('');
  }

  selectTool(tool: string): void {
    this.selectedTool.set(tool);
    this.toolDropdownOpen.set(false);
    this.toolSearchQuery.set('');
  }

  clearModelSelection(): void {
    this.selectedModel.set('');
    this.modelSearchQuery.set('');
  }

  clearProductionLineSelection(): void {
    this.selectedProductionLine.set('');
    this.productionLineSearchQuery.set('');
  }

  clearToolSelection(): void {
    this.selectedTool.set('');
    this.toolSearchQuery.set('');
  }

  setViewType(type: 'models' | 'tools'): void {
    this.viewType.set(type);
    if (type === 'tools') {
      this.selectedModel.set('');
      this.selectedProductionLine.set('');
    } else {
      this.selectedTool.set('');
    }
    this.applyFilters();
  }

  applyFilters(): void {    
    const filters: any = {
      viewType: this.viewType()
    };

    if (this.viewType() === 'models') {
      if (this.selectedModel()) filters.selectedModel = this.selectedModel();
      if (this.selectedProductionLine()) {
        filters.productionLine = this.selectedProductionLine();
        console.log('Applied production line:', this.selectedProductionLine());
      }
    } else {
      if (this.selectedTool()) filters.selectedTool = this.selectedTool();
    }
    const dateValue = this.selectedDate();
    if (dateValue !== '') filters.date = dateValue;
    this.sharedService.applyFilters(filters);
    this.modelDropdownOpen.set(false);
    this.toolDropdownOpen.set(false);
    this.productionLineDropdownOpen.set(false);
  }

  clearFilters(): void {
    this.selectedModel.set('');
    this.selectedProductionLine.set('');
    this.selectedTool.set('');
    this.selectedDay.set('');
    this.modelSearchQuery.set('');
    this.productionLineSearchQuery.set('');
    this.toolSearchQuery.set('');
    this.viewType.set('tools');
    this.sharedService.clearFilters();
  }

  hasActiveFilters(): boolean {
    if (this.viewType() === 'models') {
      return (
        this.selectedModel() !== '' ||
        this.selectedProductionLine() !== '' ||
        this.selectedDay() !== ''
      );
    } else {
      return (
        this.selectedTool() !== '' ||
        this.selectedDay() !== ''
      );
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.custom-dropdown');

    if (!clickedInside) {
      this.modelDropdownOpen.set(false);
      this.productionLineDropdownOpen.set(false);
      this.toolDropdownOpen.set(false);
    }
  }

}

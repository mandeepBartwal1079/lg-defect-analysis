import { Component, computed, inject, signal } from '@angular/core';
import { Shared } from '../../services/shared';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filters',
  imports: [CommonModule],
  templateUrl: './filters.html',
  styleUrl: './filters.scss',
})
export class Filters {
  sharedService = inject(Shared);
  searchQuery = signal<string>('');
  productionLineQuery = signal<string>('');
  selectedDay = signal<'today' | 'tomorrow' | ''>('');
  showFilters = signal<boolean>(false);
  readonly today = new Date();
  readonly tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; })();
  public formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Computed date value based on dropdown selection
  selectedDate = computed<string | null>(() => {
    if (this.selectedDay() === 'today') return null;
    if (this.selectedDay() === 'tomorrow') return 'tomorrow';
    return '';
  });

  toggleFilters(): void {
    this.showFilters.update(show => !show);
  }

  applyFilters(): void {
    const filters: any = {};
    if (this.searchQuery().trim()) filters.modelNumber = this.searchQuery().trim();
    if (this.productionLineQuery().trim()) filters.productionLine = this.productionLineQuery().trim();
    const dateValue = this.selectedDate();
    if (dateValue !== '') filters.date = dateValue;
    this.sharedService.applyFilters(filters);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.productionLineQuery.set('');
    this.selectedDay.set('');
    this.sharedService.clearFilters();
  }

  hasActiveFilters(): boolean {
    return (
      this.searchQuery() !== '' ||
      this.productionLineQuery() !== '' ||
      this.selectedDay() !== ''
    );
  }

}

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

  // Computed date string based on dropdown selection
  selectedDate = computed<string>(() => {
    const now = new Date();
    if (this.selectedDay() === 'today') return this.formatDate(now);
    if (this.selectedDay() === 'tomorrow') {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      return this.formatDate(tomorrow);
    }
    return '';
  });

  toggleFilters(): void {
    this.showFilters.update(show => !show);
  }

  applyFilters(): void {
    const filters: any = {};
    if (this.searchQuery().trim()) filters.modelNumber = this.searchQuery().trim();
    if (this.productionLineQuery().trim()) filters.productionLine = this.productionLineQuery().trim();
    if (this.selectedDate()) filters.date = this.selectedDate(); // e.g. '2026-03-12'
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

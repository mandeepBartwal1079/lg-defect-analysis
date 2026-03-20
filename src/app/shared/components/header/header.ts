import { CommonModule } from '@angular/common';
import { Component, Output, signal, EventEmitter, inject, computed } from '@angular/core';
import { Shared } from '../../services/shared';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  sharedService = inject(Shared);
  showFilters = signal<boolean>(false);
  today = new Date();
  @Output() filterToggle = new EventEmitter<boolean>();

  displayDate = computed(() => {
    const d = this.sharedService.currentFilters().date;
    if (d === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    if (d && d !== 'today') {
      const parsed = new Date(d);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  toggleFilters(): void {
    this.showFilters.update(show => !show);
    this.filterToggle.emit(this.showFilters());
  }
}

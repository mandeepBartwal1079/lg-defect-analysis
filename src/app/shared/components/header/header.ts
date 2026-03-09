import { CommonModule } from '@angular/common';
import { Component, Output, signal, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  showFilters = signal<boolean>(false);
  @Output() filterToggle = new EventEmitter<boolean>();

  toggleFilters(): void {
    this.showFilters.update(show => !show);
    this.filterToggle.emit(this.showFilters());
  }
}

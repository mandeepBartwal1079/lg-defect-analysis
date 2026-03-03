import { Component, effect, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shared } from '../../services/shared';
import { DefectModalDataI } from '../../types/common.types';

@Component({
  selector: 'app-defect-modal',
  imports: [CommonModule],
  templateUrl: './defect-modal.html',
  styleUrl: './defect-modal.scss',
})
export class DefectModal {
  isOpen = input.required<boolean>();
  defectDetail = input.required<DefectModalDataI | null>();
  close = output<void>();
  refresh = output<void>();
  sharedService = inject(Shared);

  // Loading state
  isResolving = false;


  constructor() {
    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  onOverlayClick(event: MouseEvent): void {
    this.close.emit();
  }

  onCloseClick(): void {
    this.close.emit();
  }

  onRefreshClick(): void {
    this.refresh.emit();
  }
}

import { CommonModule } from '@angular/common';
import { Component, input, computed } from '@angular/core';
import { Plan, Defect } from '../../types/common.types';

@Component({
  selector: 'app-defect-card',
  imports: [CommonModule],
  templateUrl: './defect-card.html',
  styleUrl: './defect-card.scss',
})
export class DefectCard {
  plan = input.required<Plan>();

  // Extract first three defects from all parts
  displayDefects = computed(() => {
    const allDefects: Defect[] = [];
    const parts = this.plan().parts || [];

    for (const part of parts) {
      if (part.defects) {
        allDefects.push(...part.defects);
      }
    }

    return allDefects.slice(0, 3);
  });
}

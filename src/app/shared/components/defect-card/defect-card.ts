import { CommonModule } from '@angular/common';
import { Component, input, computed, output } from '@angular/core';
import { Plan, Defect, Tool } from '../../types/common.types';

@Component({
  selector: 'app-defect-card',
  imports: [CommonModule],
  templateUrl: './defect-card.html',
  styleUrl: './defect-card.scss',
})
export class DefectCard {
  plan = input<Plan | null>(null);
  tool = input<Tool | null>(null);
  openDetails = output<Plan>();

  // Use top5Defects from either plan or tool
  top5Defects = computed(() => {
    const p = this.plan();
    const t = this.tool();
    if (p) return p.top5Defects || [];
    if (t) return t.top5Defects || [];
    return [];
  });

  openPlanDetails(): void {
    const p = this.plan();
    if (p) {
      this.openDetails.emit(p);
    }
  }
}

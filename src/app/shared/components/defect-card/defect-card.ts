import { CommonModule } from '@angular/common';
import { Component, input, computed, output } from '@angular/core';
import { Plan, Defect, Tool, Top5Defect } from '../../types/common.types';

export interface DefectClickData {
  defect: Top5Defect;
  plan?: Plan;
  tool?: Tool;
  modelName?: string;
  toolName?: string;
}

@Component({
  selector: 'app-defect-card',
  imports: [CommonModule],
  templateUrl: './defect-card.html',
  styleUrl: './defect-card.scss',
})
export class DefectCard {
  plan = input<Plan | null>(null);
  tool = input<Tool | null>(null);
  openDetails = output<DefectClickData>();

  // Use top5Defects from either plan or tool
  top5Defects = computed(() => {
    const p = this.plan();
    const t = this.tool();
    if (p) return p.top5Defects || [];
    if (t) return t.top5Defects || [];
    return [];
  });

  openDefectDetails(defect: Top5Defect): void {
    const p = this.plan();
    const t = this.tool();

    const clickData: DefectClickData = {
      defect: defect
    };

    if (p) {
      clickData.plan = p;
      clickData.modelName = p.modelNumber;
    } else if (t) {
      clickData.tool = t;
      clickData.toolName = t.tool;
    }

    this.openDetails.emit(clickData);
  }
}

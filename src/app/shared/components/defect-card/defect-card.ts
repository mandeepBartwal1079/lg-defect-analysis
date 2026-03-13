import { CommonModule } from '@angular/common';
import { Component, input, computed, output } from '@angular/core';
import { Plan, Defect, Tool, Top5Defect, ModelFilterItem } from '../../types/common.types';

export interface DefectClickData {
  defect: Top5Defect;
  plan?: Plan;
  tool?: Tool;
  model?: ModelFilterItem;
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
  model = input<ModelFilterItem | null>(null);
  openDetails = output<DefectClickData>();

  top5Defects = computed(() => {
    const m = this.model();
    const t = this.tool();
    const p = this.plan();
    if (m) return m.top5Defects || [];
    if (t) return t.top5Defects || [];
    if (p) return p.top5Defects || [];
    return [];
  });

  openDefectDetails(defect: Top5Defect): void {
    const m = this.model();
    const t = this.tool();
    const p = this.plan();

    const clickData: DefectClickData = {
      defect: defect
    };

    if (m) {
      clickData.model = m;
      clickData.modelName = m.modelName;
    } else if (t) {
      clickData.tool = t;
      clickData.toolName = t.tool;
    } else if (p) {
      clickData.plan = p;
      clickData.modelName = p.modelNumber;
    }

    this.openDetails.emit(clickData);
  }
}

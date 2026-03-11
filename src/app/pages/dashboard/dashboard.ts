import { CommonModule } from '@angular/common';
import { Component, inject, signal, DestroyRef, computed, effect, HostListener } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { ChatBot } from '../../shared/components/chat-bot/chat-bot';
import { Shared } from '../../shared/services/shared';
import { ApiResponse, Plan, ToolsApiResponse, Tool } from '../../shared/types/common.types';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DefectCard, DefectClickData } from '../../shared/components/defect-card/defect-card';
import { Filters } from '../../shared/components/filters/filters';
import { switchMap } from 'rxjs';
import { DefectModal } from '../../shared/components/defect-modal/defect-modal';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Header, ChatBot, DefectCard, Filters, DefectModal],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  sharedService = inject(Shared);
  destroyRef = inject(DestroyRef);
  plans = signal<Plan[]>([]);
  toolsData = signal<Tool[]>([]);
  isModalOpen = signal(false);
  selectedDefectClickData = signal<DefectClickData | null>(null);
  windowWidth = signal(window.innerWidth);
  filtersVisible = signal<boolean>(false);

  @HostListener('window:resize')
  onResize() {
    this.windowWidth.set(window.innerWidth);
  }

  currentTodayDate = computed(() => {
    return new Date().toLocaleDateString();
  });

 constructor() {
    toObservable(this.sharedService.currentFilters)
      .pipe(
        switchMap(filters => {
          if (filters.viewType === 'tools') {
            return this.sharedService.getCurrentProductionPlansByTool(filters);
          } else {
            return this.sharedService.getCurrentProductionPlans(filters);
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response: ApiResponse | ToolsApiResponse) => {
        if (response.success) {
          if (this.sharedService.currentFilters().viewType === 'tools') {
            this.toolsData.set((response as ToolsApiResponse).data);
            this.plans.set([]);
          } else {
            this.plans.set((response as ApiResponse).data);
            this.toolsData.set([]);
          }
        } else {
          this.plans.set([]);
          this.toolsData.set([]);
          console.error(response.message);
        }
      });
  }

  showFilters(show: boolean) {
    this.filtersVisible.set(show);
  }

  // Filter plans to show only those starting today
  filteredPlans = computed(() => {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const filters = this.sharedService.currentFilters();
    return this.plans().filter(plan => {
      if (!plan.productionStartDate) return false;
      const planDate = plan.productionStartDate.split('T')[0];
      return planDate === today;
    });
  });


  getPlans() {
    this.sharedService.getCurrentProductionPlans().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: ApiResponse) => {
      if (response.success) {
        this.plans.set(response.data);
      } else {
        this.plans.set([]);
        console.error(response.message);
      }
    });
  }

  openDefectDetails(clickData: DefectClickData) {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   SENDING DATA TO MODAL (Dashboard)       ║');
    console.log('╚════════════════════════════════════════════╝');
    
    if (clickData.plan) {
      console.log('\n📋 PLAN DEFECT CLICKED:');
      console.log('  Model Name:', clickData.modelName || clickData.plan.modelNumber);
      console.log('  Plan ID:', clickData.plan.planId);
      console.log('  Production Line:', clickData.plan.productionLine);
      console.log('  Tool:', clickData.plan.tool);
      console.log('  Total Quantity:', clickData.plan.totalQuantity);
      console.log('  Completed Qty:', clickData.plan.completedQty);
      console.log('  Remaining Qty:', clickData.plan.remainingQty);
      console.log('  Completion %:', clickData.plan.completionPercentage);
      console.log('  Is Overdue:', clickData.plan.isOverdue);
      console.log('  Days Remaining:', clickData.plan.daysRemaining);
    } else if (clickData.tool) {
      console.log('\n🔧 TOOL DEFECT CLICKED:');
      console.log('  Tool Name:', clickData.toolName || clickData.tool.tool);
      console.log('  Total Models:', clickData.tool.totalModels);
      console.log('  Total Defects:', clickData.tool.totalDefects);
      console.log('  Models:', clickData.tool.models);
      console.log('  Production Lines:', clickData.tool.productionLines);
    }
    
    console.log('\n🐛 DEFECT DETAILS:');
    console.log('  Defect Name:', clickData.defect.defectName);
    console.log('  Count:', clickData.defect.count);
    console.log('  Percentage:', clickData.defect.percentage + '%');
    
    console.log('\n📦 Complete Click Data Object:');
    console.log(clickData);
    console.log('═══════════════════════════════════════════\n');

    this.selectedDefectClickData.set(clickData);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedDefectClickData.set(null);
  }

  protected gridCols = computed(() => {
    const width = this.windowWidth();
    const isTools = this.sharedService.currentFilters().viewType === 'tools';
    const n = isTools ? this.toolsData().length : this.filteredPlans().length;

    let maxCols = 4;
    if (width < 480) {
      maxCols = 1; // mobile
    } else if (width < 1024) {
      maxCols = 2; // tablet
    } else if (width < 1400) {
      maxCols = 4; // laptop & desktop
    } else {
      maxCols = 5; // tv and above
    }
    return Math.max(1, Math.min(n, maxCols));
  });
}

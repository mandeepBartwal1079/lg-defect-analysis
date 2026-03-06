import { CommonModule } from '@angular/common';
import { Component, inject, signal, DestroyRef, computed, effect, HostListener } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { ChatBot } from '../../shared/components/chat-bot/chat-bot';
import { Shared } from '../../shared/services/shared';
import { ApiResponse, DefectModalDataI, LgApiData, LgApiResponse, Plan } from '../../shared/types/common.types';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DefectCard } from '../../shared/components/defect-card/defect-card';
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
  plans = signal<LgApiData[]>([]);
  isModalOpen = signal(false);
  selectedDefectDetail = signal<DefectModalDataI | null>(null);
  windowWidth = signal(window.innerWidth);

  @HostListener('window:resize')
  onResize() {
    this.windowWidth.set(window.innerWidth);
  }

  currentTodayDate = computed(() => {
    return new Date().toLocaleDateString();
  });

  constructor() {
    // Converts the filters signal to an observable, switchMap cancels
    // any in-flight request when filters change
    toObservable(this.sharedService.currentFilters)
      .pipe(
        switchMap(filters => this.sharedService.getCurrentProductionPlans(filters)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response: LgApiResponse) => {
        console.log(response, 'response');

        if (response.status === 'success') {
          this.plans.set(response.data);
        } else {
          this.plans.set([]);
          console.error(response, 'error');
        }
      });
  }

  // Transform LgApiData to Plan format
  private transformToPlan(lgData: LgApiData): Plan {
    return {
      planId: parseInt(lgData.WOID) || 0,
      modelNumber: lgData.MODLID ? lgData.MODLID.toString() : lgData.SFFX_NAME || '',
      productionLine: lgData.PCSGID || '',
      partNumber: lgData.PRODID || '',
      productionStartDate: lgData.PRDTN_STRT_DATE || '',
      productionEndDate: lgData.PRDTN_END_DATE || '',
      demandDueDate: lgData.DEMAND_DUE_DATE || '',
      totalQuantity: parseInt(lgData.TOT_QTY) || 0,
      completedQty: parseInt(lgData.COMPLT_QTY) || 0,
      remainingQty: parseInt(lgData.RMN_QTY) || 0,
      dailyProductionQuantity: parseInt(lgData.DILY_PRDTN_QTY) || 0,
      completionPercentage: 0,
      isOverdue: false,
      daysRemaining: 0,
      parts: []
    };
  }

  // Helper to parse "06-MAR-26" format to Date
  private parseLgDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    try {
      // Format: "06-MAR-26" -> DD-MMM-YY
      const [day, month, year] = dateStr.split('-');
      const monthMap: { [key: string]: number } = {
        'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
        'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
      };
      const monthNum = monthMap[month.toUpperCase()];
      const fullYear = 2000 + parseInt(year);
      return new Date(fullYear, monthNum, parseInt(day));
    } catch {
      return null;
    }
  }

  // Helper to check if two dates are the same day
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // Filter plans to show only those starting today and transform to Plan format
  filteredPlans = computed(() => {
    const today = new Date();
    const filters = this.sharedService.currentFilters();
    return this.plans()
      .filter(plan => {
        if (!plan.PRDTN_STRT_DATE) return false;
        const planDate = this.parseLgDate(plan.PRDTN_STRT_DATE);
        if (!planDate) return false;
        return this.isSameDay(planDate, today);
      })
      .map(lgData => this.transformToPlan(lgData));
  });


  getPlans() {
    this.sharedService.getCurrentProductionPlans().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: LgApiResponse) => {
      if (response.status === 'success') {
        this.plans.set(response.data);
        console.log(this.plans(), 'plans');

      } else {
        this.plans.set([]);
        console.error(response, 'error');
      }
    });
  }

  openPlanDetails(plan: Plan) {
    this.isModalOpen.set(true);
    this.selectedDefectDetail.set(null); // Clear previous detail
    this.sharedService.getDefectModalData(plan.modelNumber).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response: DefectModalDataI) => {
      if (response.success) {
        this.selectedDefectDetail.set(response);
      } else {
        console.error(response.message);
      }
    });
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedDefectDetail.set(null);
  }

  protected gridCols = computed(() => {
    const width = this.windowWidth();
    const n = this.filteredPlans().length;

    let maxCols = 4;
    if (width < 480) {
      maxCols = 1; // mobile
    } else if (width < 1024) {
      maxCols = 2; // tablet
    } else if (width < 1400) {
      maxCols = 4; // laptop & desktop
    } else if (width < 2000) {
      maxCols = 5; // tv
    } else {
      maxCols = 5; // and above
    }
    return Math.min(n, maxCols);
  });
}

import { CommonModule } from '@angular/common';
import { Component, inject, signal, DestroyRef, computed, effect } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { ChatBot } from '../../shared/components/chat-bot/chat-bot';
import { Shared } from '../../shared/services/shared';
import { ApiResponse, DefectModalDataI, Plan } from '../../shared/types/common.types';
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
  plans = signal<Plan[]>([]);
  isModalOpen = signal(false);
  selectedDefectDetail = signal<DefectModalDataI | null>(null);

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
      .subscribe((response: ApiResponse) => {
        if (response.success) {
          this.plans.set(response.data);
        } else {
          this.plans.set([]);
          console.error(response.message);
        }
      });
  }

  // Filter plans to show only those starting today
  filteredPlans = computed(() => {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const filters = this.sharedService.currentFilters();
    console.log(filters, 'jjkfhdkjsfksdkjfknsdk');
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
    const n = this.filteredPlans().length;
    if (n <= 4)  return n;              // 1 row  (1–4 cards)
    if (n <= 10) return Math.ceil(n / 2); // 2 rows (5–10 cards)
    if (n <= 18) return Math.ceil(n / 3); // 3 rows (11–18 cards)
    return Math.min(Math.ceil(n / 4), 6); // 4 rows, max 6 cols (19+ cards)
  });
}

import { CommonModule } from '@angular/common';
import { Component, inject, signal, DestroyRef, computed, effect, HostListener } from '@angular/core';
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

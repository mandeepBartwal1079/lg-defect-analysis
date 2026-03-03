import { CommonModule } from '@angular/common';
import { Component, inject, signal, DestroyRef, computed } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { ChatBot } from '../../shared/components/chat-bot/chat-bot';
import { Shared } from '../../shared/services/shared';
import { ApiResponse, Plan } from '../../shared/types/common.types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DefectCard } from '../../shared/components/defect-card/defect-card';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Header, ChatBot, DefectCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  sharedService = inject(Shared);
  destroyRef = inject(DestroyRef);
  plans = signal<Plan[]>([]);

  currentTodayDate = computed(() => {
    return new Date().toLocaleDateString();
  });

  // Filter plans to show only those starting today
  filteredPlans = computed(() => {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    return this.plans().filter(plan => {
      if (!plan.productionStartDate) return false;
      // Extract only the date part (YYYY-MM-DD) from the productionStartDate string
      const planDate = plan.productionStartDate.split('T')[0];
      return planDate === today;
    });
  });

  ngOnInit(): void {
   this.getPlans();
  }

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

  protected gridCols = computed(() => {
    const n = this.filteredPlans().length;
    if (n <= 4)  return n;              // 1 row  (1–4 cards)
    if (n <= 10) return Math.ceil(n / 2); // 2 rows (5–10 cards)
    if (n <= 18) return Math.ceil(n / 3); // 3 rows (11–18 cards)
    return Math.min(Math.ceil(n / 4), 6); // 4 rows, max 6 cols (19+ cards)
  });
}

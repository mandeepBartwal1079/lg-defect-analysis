import { CommonModule } from '@angular/common';
import { Component, inject, signal, DestroyRef, computed, effect, HostListener } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { ChatBot } from '../../shared/components/chat-bot/chat-bot';
import { Shared } from '../../shared/services/shared';
import { ApiResponse, Plan, ToolsApiResponse, Tool, ModelFilterItem, ModelFilterResponse } from '../../shared/types/common.types';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DefectCard, DefectClickData } from '../../shared/components/defect-card/defect-card';
import { Filters } from '../../shared/components/filters/filters';
import { switchMap, map, catchError, of } from 'rxjs';
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
  modelData = signal<ModelFilterItem[]>([]);
  toolsData = signal<Tool[]>([]);
  isModalOpen = signal(false);
  selectedDefectClickData = signal<DefectClickData | null>(null);
  windowWidth = signal(window.innerWidth);
  filtersVisible = signal<boolean>(false);
  tools = signal<string[]>([]);
  models = signal<string[]>([]);
  private allJsonData = signal<any[]>([]);

  private formatToDataJsonDate(date: Date): string {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  }

  @HostListener('window:resize')
  onResize() {
    this.windowWidth.set(window.innerWidth);
  }

  currentTodayDate = computed(() => {
    return new Date().toLocaleDateString();
  });

  constructor() {
    const filters$ = toObservable(this.sharedService.currentFilters);


    filters$
      .pipe(
        switchMap(filters => {
          this.sharedService.setLoading(true);
          return this.sharedService.getDataJson(filters.productionLine).pipe(
            map(response => ({ response, filters })),
            // ✅ getDataJson error aaye toh subscription mat maro
            catchError(err => {
              console.error('getDataJson error:', err);
              this.sharedService.setLoading(false);
              return of({ response: null, filters });
            })
          );
        }),
        switchMap(({ response, filters }) => {
          if (response && (response as any).data) {
            this.allJsonData.set((response as any).data);
          }
          this.sharedService.currentProductionLine.set((response as any).line);
          const targetDate = new Date();
          if (filters.date === 'tomorrow') {
            targetDate.setDate(targetDate.getDate() + 1);
          }
          const dateStr = this.formatToDataJsonDate(targetDate);

          const uniqueModels = new Set<string>();
          const uniqueTools = new Set<string>();

          this.allJsonData().forEach((item: any) => {
            if (item.PRDTN_STRT_DATE === dateStr) {
              if (item.MODLID) uniqueModels.add(item.MODLID);
              if (item.TOOL_NAME) {
                const toolPrefix = item.TOOL_NAME.split('_')[0];
                uniqueTools.add(toolPrefix);
              }
            }
          });

          this.models.set(Array.from(uniqueModels));
          this.tools.set(Array.from(uniqueTools));

          let modelNumbers: string[] | null = null;
          let tools: string[] | null = null;

          if (filters.viewType === 'models') {
            modelNumbers = filters.selectedModel
              ? [filters.selectedModel]
              : (this.models().length > 0 ? this.models() : null);
            tools = null;
          } else {
            tools = filters.selectedTool
              ? [filters.selectedTool]
              : (this.tools().length > 0 ? this.tools() : null);
            modelNumbers = null;
          }

          const payload = { modelNumbers, tools };

          return this.sharedService.GetTodayProductionPlansByFilters(payload).pipe(
            // ✅ API error aaye toh bhi subscription zinda rahe
            catchError(err => {
              console.error('GetTodayProductionPlansByFilters error:', err);
              this.sharedService.setLoading(false);
              return of({ success: false, message: err.message, data: [] } as any);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ModelFilterResponse | ToolsApiResponse) => {
          this.sharedService.setLoading(false);
          if (response.success) {
            if (this.sharedService.currentFilters().viewType === 'tools') {
              this.toolsData.set((response as ToolsApiResponse).data);
              this.modelData.set([]);
            } else {
              this.modelData.set((response as ModelFilterResponse).data);
              this.toolsData.set([]);
            }
          } else {
            this.modelData.set([]);
            this.toolsData.set([]);
          }
        },
        // ✅ error yahan aaya toh bhi subscription nahi marti ab (catchError handle kar leta hai)
        error: (error) => {
          this.sharedService.setLoading(false);
          console.error('Unhandled error:', error);
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
    const n = isTools ? this.toolsData().length : this.modelData().length;

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

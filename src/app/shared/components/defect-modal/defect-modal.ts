import { Component, effect, inject, input, output, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shared } from '../../services/shared';
import { DefectClickData } from '../defect-card/defect-card';
import { ResolutionStep } from '../../types/common.types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-defect-modal',
  imports: [CommonModule],
  templateUrl: './defect-modal.html',
  styleUrl: './defect-modal.scss',
})
export class DefectModal {
  isOpen = input.required<boolean>();
  defectClickData = input.required<DefectClickData | null>();
  close = output<void>();
  refresh = output<void>();
  sharedService = inject(Shared);
  destroyRef = inject(DestroyRef);

  // Loading state
  isResolving = false;
  resolutionSteps = signal<ResolutionStep[]>([]);


  constructor() {
    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Console log all modal details and fetch resolution steps
    effect(() => {
      const clickData = this.defectClickData();
      const open = this.isOpen();

      if (open && clickData) {
        console.log('\n╔═══════════════════════════════════════════╗');
        console.log('║   DEFECT MODAL DATA RECEIVED (Modal)      ║');
        console.log('╚═══════════════════════════════════════════╝');
        
        console.log('\n🐛 DEFECT INFORMATION:');
        console.log('  Defect Name:', clickData.defect.defectName);
        console.log('  Count:', clickData.defect.count);
        console.log('  Percentage:', clickData.defect.percentage + '%');
        
        if (clickData.plan) {
          console.log('\n📋 PLAN DATA:');
          console.log('  Model Name:', clickData.modelName);
          console.log('  Plan ID:', clickData.plan.planId);
          console.log('  Production Line:', clickData.plan.productionLine);
          console.log('  Tool:', clickData.plan.tool);
          
          if (clickData.plan.top5Defects && clickData.plan.top5Defects.length > 0) {
            console.log('\n📊 TOP 5 DEFECTS FOR THIS PLAN:');
            clickData.plan.top5Defects.forEach((defect, index) => {
              console.log(`  ${index + 1}. ${defect.defectName}: ${defect.count} (${defect.percentage}%)`);
            });
          }

          if (clickData.plan.parts && clickData.plan.parts.length > 0) {
            console.log('\n🔧 PARTS:');
            clickData.plan.parts.forEach((part, index) => {
              console.log(`  ${index + 1}. ${part.partName || 'Unknown'} (ID: ${part.partId || 'N/A'})`);
              if (part.defects && part.defects.length > 0) {
                console.log(`     - Defects: ${part.defects.length}`);
              }
            });
          }
        } else if (clickData.tool) {
          console.log('\n🔧 TOOL DATA:');
          console.log('  Tool Name:', clickData.toolName);
          console.log('  Total Models:', clickData.tool.totalModels);
          console.log('  Total Defects:', clickData.tool.totalDefects);
          
          if (clickData.tool.models && clickData.tool.models.length > 0) {
            console.log('\n📱 MODELS USING THIS TOOL:');
            clickData.tool.models.forEach((model, index) => {
              console.log(`  ${index + 1}. ${model}`);
            });
          }

          if (clickData.tool.productionLines && clickData.tool.productionLines.length > 0) {
            console.log('\n🏭 PRODUCTION LINES:');
            clickData.tool.productionLines.forEach((line, index) => {
              console.log(`  ${index + 1}. ${line}`);
            });
          }

          if (clickData.tool.top5Defects && clickData.tool.top5Defects.length > 0) {
            console.log('\n📊 TOP 5 DEFECTS FOR THIS TOOL:');
            clickData.tool.top5Defects.forEach((defect, index) => {
              console.log(`  ${index + 1}. ${defect.defectName}: ${defect.count} (${defect.percentage}%)`);
            });
          }
        }

        console.log('\n📦 COMPLETE CLICK DATA OBJECT:');
        console.log(clickData);
        console.log('═══════════════════════════════════════════\n');
        
        // Fetch resolution steps for the defect
        this.fetchResolutionSteps(clickData.defect.defectName);
      } else {
        // Clear resolution steps when modal closes
        this.resolutionSteps.set([]);
      }
    });
  }

  onOverlayClick(event: MouseEvent): void {
    this.close.emit();
  }

  onCloseClick(): void {
    this.close.emit();
  }

  onRefreshClick(): void {
    this.refresh.emit();
  }

  fetchResolutionSteps(defectName: string): void {
    console.log('\n🔄 FETCHING RESOLUTION STEPS FOR:', defectName);
    
    this.sharedService.getResolutionStepsByDefect(defectName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success && response.data && response.data.length > 0) {
            this.resolutionSteps.set(response.data);
            
            console.log('\n✅ RESOLUTION STEPS RECEIVED:');
            response.data.forEach((resolution) => {
              console.log(`\n  Defect: ${resolution.defectName}`);
              console.log(`  Category: ${resolution.defectCategory}`);
              console.log(`  Part: ${resolution.defectPart}`);
              console.log(`  Type: ${resolution.defectType}`);
              console.log(`  Total Causes: ${resolution.totalCauses}`);
              console.log('  Causes:');
              resolution.causes.forEach((cause) => {
                console.log(`    ${cause.causeNumber}. ${cause.causeDescription}`);
              });
            });
            console.log('\n📋 Complete Resolution Steps Object:');
            console.log(response.data);
          } else {
            console.log('⚠️ No resolution steps found for this defect');
            this.resolutionSteps.set([]);
          }
        },
        error: (error) => {
          console.error('❌ Error fetching resolution steps:', error);
          this.resolutionSteps.set([]);
        }
      });
  }
}

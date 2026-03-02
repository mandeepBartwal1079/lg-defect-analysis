import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Create a SafeHtml pipe
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}

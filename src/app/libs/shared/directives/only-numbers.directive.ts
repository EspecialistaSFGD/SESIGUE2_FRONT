import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[onlyNumbers]',
    standalone: true,
})
export class OnlyNumbersDirective {
    constructor(private el: ElementRef) { }

    @HostListener('input', ['$event']) onInputChange(event: any) {
        const initialValue = this.el.nativeElement.value;
        this.el.nativeElement.value = initialValue.replace(/[^0-9]*/g, '');
        if (initialValue !== this.el.nativeElement.value) {
            event.stopPropagation();
        }
    }

    @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
        if (
            event.key && !event.key.match(/[0-9]/) &&
            event.key !== 'Backspace' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' &&
            event.key !== 'Delete' && event.key !== 'Tab'
        ) {
            event.preventDefault();
        }
    }

    @HostListener('paste', ['$event']) blockPaste(event: ClipboardEvent) {
        let clipboardData = event.clipboardData || (window as any).clipboardData;
        let pastedText = clipboardData.getData('text');
        if (pastedText && !pastedText.match(/^[0-9]*$/)) {
            event.preventDefault();
        }
    }
}

import { CommonModule } from '@angular/common';
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { TinySliderInstance, tns } from 'tiny-slider';

@Component({
  selector: 'app-slider-tiny',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider-tiny.component.html',
  styles: ``
})
export class SliderTinyComponent {
  slide!: TinySliderInstance;
  @ContentChild('items', { static: true }) itemsTemplate!: TemplateRef<any>;

  @Input() dataset: any[] = []
  @Input() responsive: any = {
    575: {
      items: 2
    },
    576: {
      items: 2
    },
    768: {
      items: 3
    },
    992: {
      items: 4
    },
    1200: {
      items: 6
    },
    1600: {
      items: 7,
      "mouseDrag": false,
    },
  }

  ngAfterViewInit(): void {
    this.tinySlider()
  }

  tinySlider() {
    this.slide = tns({
      container: '.slider-container',
      items: 1,
      gutter: 12,
      "mouseDrag": true,
      "slideBy": "page",
      "swipeAngle": false,
      "speed": 400,
      "rewind": true,
      controlsContainer: "#controls-slider-container",
      prevButton: '#prev',
      nextButton: '#next',
      arrowKeys: true,
      "nav": false,
      responsive: this.responsive
    });
  }
}

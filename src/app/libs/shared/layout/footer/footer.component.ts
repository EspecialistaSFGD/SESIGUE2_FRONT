import { Component } from '@angular/core';
import { SocialMedia } from '@core/interfaces';
import { NgZorroModule } from '@libs/ng-zorro/ng-zorro.module';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ NgZorroModule],
  templateUrl: './footer.component.html',
  styles: []
})
export class FooterComponent {
  followUs: SocialMedia[] = [
    { name: 'Facebook', icon: 'facebook', url: 'https://www.facebook.com/descentralizacionperu' },
    { name: 'X', icon: 'twitter', url: 'https://x.com/SdPeru' },
    { name: 'Youtube', icon: 'youtube', url: 'https://www.youtube.com/channel/UCJ9HmmpdeadVknJ8XRRZ8GQ' },
    { name: 'Linkedin', icon: 'linkedin', url: 'https://pe.linkedin.com/in/secretar%C3%ADa-de-descentralizaci%C3%B3n-pcm' }
  ]
}

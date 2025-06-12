import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { ActivationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AuthService } from '../libs/services/auth/auth.service';
import { MenuModel } from '../libs/models/shared/menu.model';
import { Meta, Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { ThemeSwitcherComponent } from '../libs/shared/components/theme-switcher/theme-switcher.component';
import { SuperHeaderComponent } from '../libs/shared/layout/super-header/super-header.component';
import { FooterComponent } from '../libs/shared/layout/footer/footer.component';
import { ResponseModel } from '../libs/models/shared/response.model';


@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzAvatarModule,
    NzDropDownModule,
    ThemeSwitcherComponent,
    SuperHeaderComponent,
    FooterComponent,
  ],
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.less'
})
export class PagesComponent implements OnInit, AfterViewInit {
  isCollapsed: boolean = true;

  public authService = inject(AuthService);
  private router = inject(Router);
  public title = inject(Title);
  public meta = inject(Meta);
  private cdr = inject(ChangeDetectorRef);
  public isSiderCollapsed = localStorage.getItem('isSiderCollapsed') === 'true' ? true : false;

  menuItems: MenuModel[] = [];
  pageTitle: string | undefined;
  descripcionTipo: string | undefined;
  descripcionSector: string | undefined;
  selectedTheme: string = localStorage['theme'] || 'system';
  storedToken: string | null = this.authService.obtenerToken() || null;


  constructor() {
    this.getDataRoute().subscribe((data) => {
      this.pageTitle = data['title'] || 'Panel';

      this.title.setTitle(this.pageTitle!);
      //this.menuItems = JSON.parse(localStorage.getItem('opciones')!);
    });

    const storedMenu = localStorage.getItem('menus');

    this.menuItems = (storedMenu) ? JSON.parse(storedMenu) : [];

    const storedDescripcionTipo = localStorage.getItem('descripcionTipo');

    this.descripcionTipo = (storedDescripcionTipo) ? storedDescripcionTipo : '';

    const storedDescripcionSector = localStorage.getItem('descripcionSector');

    this.descripcionSector = (storedDescripcionSector) ? storedDescripcionSector : undefined;

  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {

  }

  onLogout(): void {

    this.authService.removerLocalStorage();
    this.router.navigate(['/auth']);
    // this.authService.logout(this.authService.token()!).subscribe({
    //   next: () => {
    //   },
    //   error: (err) => console.error(err)
    // });
  }

  getDataRoute() {
    return this.router.events.pipe(
      filter((e: any) => e instanceof ActivationEnd),
      filter((e: ActivationEnd) => e.snapshot.firstChild === null),
      map((e: ActivationEnd) => e.snapshot.data)
    );
  }


  switchCollapseSider(): void {
    if (this.isSiderCollapsed) {
      this.isSiderCollapsed = false;
    } else {
      this.isSiderCollapsed = true;
    }

    localStorage.setItem('isSiderCollapsed', this.isSiderCollapsed.toString());
    // this.isSiderCollapsed = !this.isSiderCollapsed;
    // localStorage.setItem('isSiderCollapsed', this.isSiderCollapsed.toString());
    // this.isCollapsed = !this.isCollapsed
  }
}

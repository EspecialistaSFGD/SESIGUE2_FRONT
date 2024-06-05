import { CommonModule } from '@angular/common';
import { Component, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { ActivationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AuthService } from '../libs/services/auth/auth.service';
import { MenuModel } from '../libs/models/shared/menu.model';
import { Meta, Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs';

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
  ],
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.less'
})
export class PagesComponent implements OnInit, OnChanges {
  isCollapsed = false;

  public authService = inject(AuthService);
  private router = inject(Router);
  public title = inject(Title);
  public meta = inject(Meta);

  menuItems: MenuModel[] = [];
  pageTitle: string | undefined;

  constructor() {
    this.getDataRoute().subscribe((data) => {
      this.pageTitle = data['title'] || 'Panel';

      this.title.setTitle(this.pageTitle!);
      //this.menuItems = JSON.parse(localStorage.getItem('opciones')!);
    });
  }
  ngOnInit(): void {
    const storedMenu = localStorage.getItem('opciones');

    if (storedMenu) {
      this.menuItems = JSON.parse(storedMenu);
    } else {
      // Inicializar con un valor predeterminado si el menú no está presente
      this.menuItems = [];
    }
  }

  getDataRoute() {
    return this.router.events.pipe(
      filter((e: any) => e instanceof ActivationEnd),
      filter((e: ActivationEnd) => e.snapshot.firstChild === null),
      map((e: ActivationEnd) => e.snapshot.data)
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    console.log('changes', changes);
    //this.menuItems = JSON.parse(localStorage.getItem('opciones')!);

  }
}

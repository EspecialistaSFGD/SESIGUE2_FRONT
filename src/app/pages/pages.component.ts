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
export class PagesComponent implements OnInit, AfterViewInit {
  isCollapsed: boolean = true;

  public authService = inject(AuthService);
  private router = inject(Router);
  public title = inject(Title);
  public meta = inject(Meta);
  private cdr = inject(ChangeDetectorRef);

  menuItems: MenuModel[] = [];
  pageTitle: string | undefined;

  constructor() {
    this.getDataRoute().subscribe((data) => {
      this.pageTitle = data['title'] || 'Panel';

      this.title.setTitle(this.pageTitle!);
      //this.menuItems = JSON.parse(localStorage.getItem('opciones')!);
    });

    const storedMenu = localStorage.getItem('menus');

    this.menuItems = (storedMenu) ? JSON.parse(storedMenu) : [];
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnInit(): void { 

  }

  getDataRoute() {
    return this.router.events.pipe(
      filter((e: any) => e instanceof ActivationEnd),
      filter((e: ActivationEnd) => e.snapshot.firstChild === null),
      map((e: ActivationEnd) => e.snapshot.data)
    );
  }
}

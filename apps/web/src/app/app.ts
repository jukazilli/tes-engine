import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PoMenuItem, PoMenuModule, PoPageModule, PoToolbarModule } from '@po-ui/ng-components';

@Component({
  imports: [PoMenuModule, PoPageModule, PoToolbarModule, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = 'TES Engine';
  protected readonly angularVersion = '21.2.17';
  protected readonly poUiVersion = '21.21.0';
  protected readonly menuItems: PoMenuItem[] = [
    { label: 'Início', link: '/', icon: 'an an-house', shortLabel: 'Início' },
  ];
}

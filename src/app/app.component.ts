import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ZenPadComponent } from './components/zen-pad/zen-pad';
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ZenPadComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}

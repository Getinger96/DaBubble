import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MainHelperService } from '../../services/main-helper.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.scss'
})
export class IntroComponent implements OnInit {
  animationShouldPlay = false;
  animationFinished = false;

  constructor(
    private router: Router,
    public mainHelperService: MainHelperService
  ) {}

ngOnInit(): void {
  const alreadyPlayed = localStorage.getItem('introAnimationCompleted');

  if (!alreadyPlayed) {
    this.animationShouldPlay = true;
    this.animationFinished = false;
    localStorage.setItem('introAnimationCompleted', 'true');   
    setTimeout(() => {
      this.animationShouldPlay = false;
      this.animationFinished = true;
    }, 2000); // Dauer der Animation
  } else {
    this.animationShouldPlay = false;
    this.animationFinished = true;
  }
}

}

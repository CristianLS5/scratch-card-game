import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  color: string;
  sway: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly NUMBER_OF_SNOWFLAKES = 300;
  private readonly MAX_SNOWFLAKE_SIZE = 2;
  private readonly MAX_SNOWFLAKE_SPEED = 0.01;
  private readonly SNOWFLAKE_COLOR = '#DDD';

  private elementRef = inject(ElementRef);
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private snowflakes: Snowflake[] = [];
  private animationFrameId?: number;
  private router = inject(Router);

  constructor() {}

  ngOnInit() {
    this.initializeCanvas();
    this.setupEventListeners();
    this.createSnowflakes();
    this.animate();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private initializeCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0px';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.width = window.innerWidth - 24;
    this.canvas.height = window.innerHeight - 16;
    this.canvas.style.maxHeight = '1700px';

    this.elementRef.nativeElement.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
  }

  private createSnowflake(): Snowflake {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      radius: Math.floor(Math.random() * this.MAX_SNOWFLAKE_SIZE) + 1,
      speed: Math.random() * this.MAX_SNOWFLAKE_SPEED + 2,
      color: this.SNOWFLAKE_COLOR,
      sway: Math.random() - 0.5,
    };
  }

  private createSnowflakes() {
    for (let i = 0; i < this.NUMBER_OF_SNOWFLAKES; i++) {
      this.snowflakes.push(this.createSnowflake());
    }
  }

  private drawSnowflake(snowflake: Snowflake) {
    this.ctx.beginPath();
    this.ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = snowflake.color;
    this.ctx.fill();
  }

  private updateSnowflake(snowflake: Snowflake) {
    snowflake.y += snowflake.speed;
    snowflake.x += snowflake.sway;

    if (snowflake.y >= this.canvas.height) {
      Object.assign(snowflake, this.createSnowflake());
      snowflake.y = 0;
    }
  }

  private animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.snowflakes.forEach((snowflake) => {
      this.updateSnowflake(snowflake);
      this.drawSnowflake(snowflake);
    });

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleScroll);
  }

  private handleResize = () => {
    this.canvas.width = window.innerWidth - 24;
    this.canvas.height = window.innerHeight - 16;
  };

  private handleScroll = () => {
    if (window.scrollY > 1700) return;
    this.canvas.style.top = `${window.scrollY}px`;
  };

  private cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll);
  }

  protected onPlayClick() {
    this.router.navigate(['/game']);
  }
}

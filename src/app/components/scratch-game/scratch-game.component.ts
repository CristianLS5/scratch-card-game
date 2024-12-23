import { Component, ElementRef, AfterViewInit, ViewChild, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { environment } from '../../../environments/environment.github';

interface Prize {
  src: string;
  message: string;
  width: number;
  height: number;
}

@Component({
  selector: 'app-scratch-game',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './scratch-game.component.html',
  styleUrl: './scratch-game.component.scss',
})
export class ScratchGameComponent implements AfterViewInit {
  @ViewChild('scratchCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('prizeImage') imageRef!: ElementRef<HTMLImageElement>;

  protected canvasWidth = 300;
  protected canvasHeight = 400;

  private readonly images: Prize[] = [
    {
      src: 'assets/images/winner.jpeg',
      message: '🎉 Congratulations! You Won!',
      width: this.canvasWidth,
      height: this.canvasHeight,
    },
    {
      src: 'assets/images/try-again.jpeg',
      message: 'Try Again! Good Luck Next Time!',
      width: this.canvasWidth,
      height: this.canvasHeight,
    },
    {
      src: 'assets/images/trololo.jpeg',
      message: '😜 Trolololo! Better luck next time!',
      width: this.canvasWidth,
      height: this.canvasHeight,
    },
  ];

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private revealThreshold = 0.8; // 80% scratched to reveal
  private totalPixels = 0;
  private scratchedPixels = 0;

  protected selectedImage = signal<string>('');
  protected message = signal<string>('');
  protected isRevealed = signal(false);

  protected currentImage = signal<Prize>(this.getRandomImage());

  protected winningCode = signal<string>('');
  protected showWinningCode = signal(false);

  ngAfterViewInit() {
    const context = this.canvasRef.nativeElement.getContext('2d', {
      willReadFrequently: true,
    });

    if (!context) {
      console.error('Could not initialize canvas context');
      return;
    }

    this.ctx = context;
    this.initializeGame();
  }

  private initializeGame() {
    const randomPrize = this.getRandomImage();
    this.currentImage.set(randomPrize);
    this.message.set(randomPrize.message);
    this.isRevealed.set(false);
  }

  private getRandomImage(): Prize {
    return this.images[Math.floor(Math.random() * this.images.length)];
  }

  protected onImageLoad() {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d', {
      willReadFrequently: true,
    });

    if (!context) {
      console.error('Could not initialize canvas context');
      return;
    }

    this.ctx = context;

    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;

    // Create scratch layer
    this.ctx.fillStyle = '#888888';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.totalPixels = canvas.width * canvas.height;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    const canvas = this.canvasRef.nativeElement;

    // Mouse events
    canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    canvas.addEventListener('mousemove', this.scratch.bind(this));
    canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    canvas.addEventListener('mouseleave', this.stopDrawing.bind(this));

    // Touch events
    canvas.addEventListener('touchstart', this.handleTouch.bind(this));
    canvas.addEventListener('touchmove', this.handleTouch.bind(this));
    canvas.addEventListener('touchend', this.stopDrawing.bind(this));
  }

  private startDrawing(e: MouseEvent) {
    this.isDrawing = true;
    [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
  }

  private scratch(e: MouseEvent) {
    if (!this.isDrawing) return;

    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.lineWidth = 40;
    this.ctx.lineCap = 'round';
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(e.offsetX, e.offsetY);
    this.ctx.stroke();

    [this.lastX, this.lastY] = [e.offsetX, e.offsetY];

    this.checkRevealThreshold();
  }

  private handleTouch(e: TouchEvent) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (e.type === 'touchstart') {
      this.isDrawing = true;
      [this.lastX, this.lastY] = [x, y];
    } else if (e.type === 'touchmove') {
      this.scratch({ offsetX: x, offsetY: y } as MouseEvent);
    }
  }

  private stopDrawing() {
    this.isDrawing = false;
  }

  private checkRevealThreshold() {
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvasRef.nativeElement.width,
      this.canvasRef.nativeElement.height
    );

    this.scratchedPixels = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] === 0) {
        this.scratchedPixels++;
      }
    }

    if (this.scratchedPixels / this.totalPixels > this.revealThreshold) {
      this.reveal();
    }
  }

  private reveal() {
    this.ctx.clearRect(
      0,
      0,
      this.canvasRef.nativeElement.width,
      this.canvasRef.nativeElement.height
    );
    this.isRevealed.set(true);
    
    // Generate and show code only if it's a winning card
    if (this.currentImage().message.includes('Congratulations')) {
      this.winningCode.set(this.generateWinningCode());
      this.showWinningCode.set(true);
    }
  }

  private generateWinningCode(): string {
    return environment.winningCode;
  }

  protected resetGame() {
    this.initializeGame();
    this.onImageLoad();
    this.showWinningCode.set(false);
  }
}

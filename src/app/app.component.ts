import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ApiService } from './service/api.service';
import { LoaderComponent } from './loading-effect/loader/loader.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule,LoaderComponent,FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})


export class AppComponent implements OnInit{

  showModal = false;
  rating = 0;        // can be 1, 1.5, 2, 2.5, etc.
  feedbackText = '';

  userName:string | null = null;
  title = 'ims';
  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

ngOnInit(): void {
  this.userName = localStorage.getItem("username");
}

  isAuth():boolean{
    return this.apiService.isAuthenticated();
  }

  isAdmin():boolean{
    return this.apiService.isAdmin();
  }

  logOut():void{
    this.apiService.logout();
    this.router.navigate(["/login"])
    this.cdr.detectChanges();
  }


  openFeedback() {
    this.showModal = true;
    this.rating = 0;
    this.feedbackText = '';
  }

  closeModal() {
    this.showModal = false;
  }

  setRating(value: number) {
    // toggle half-star on second click
    if (this.rating === value) {
      this.rating = value - 0.5;
    } else {
      this.rating = value;
    }
  }

  submitFeedback() {
    console.log('Stars:', this.rating, 'Comment:', this.feedbackText);
    // send this.rating and this.feedbackText to backend
    this.closeModal();
  }
}

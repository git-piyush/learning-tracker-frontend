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
  title = 'Tracker';
  message:string | null = null;

  
  feedbackPayload: any = {
      id:'',
      rating:'',
      message:''
  };

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
    this.feedbackPayload = {
      rating: this.rating,
      message: this.feedbackText
    };

    console.log('Stars:'+this.feedbackPayload.rating, 'Comment:'+this.feedbackPayload.message);

      if( 
        this.feedbackPayload.rating==0 || 
        this.feedbackPayload.message==''
      ){
        alert("All fields are required");
        return;
      }

      this.apiService.saveFeedback(this.feedbackPayload).subscribe({
            next: (res:any) => {
                  alert('Feedback Sumitted Sucessfully!');
                },
                error: (err: any) => {
                if(err.error.status===401){
                  alert('Need Access/Login!');
                  this.router.navigate(['/login']);
                }
                alert(err.error.message);
              }
            });
      
    // send this.rating and this.feedbackText to backend
    this.closeModal();
  }
}

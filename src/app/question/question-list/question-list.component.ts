import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionService } from '../service/question.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './question-list.component.html',
  styleUrl: './question-list.component.css'
})
export class QuestionListComponent  implements OnInit {
  constructor(private questionService: QuestionService, private router: Router) {}
  products: any[] = [];
  message: string = '';

  totalPages = 0;
  totalElements = 0;
  page = 0;
  size = 5;
  sortBy = 'id';
  direction = 'asc';

  ngOnInit(): void {
    this.fetchProducts();
  }

  getImageSrc(base64String: string): string {
    if (!base64String) {
      return '';
    }
    return 'data:image/jpeg;base64,' + base64String;
  }

  //FETCH PRODUCTS
  fetchProducts(): void {
    this.questionService.getAllProducts().subscribe({
      next: (res: any) => {
        this.products = res.questionList || [];
      },
      error: (error) => {
        this.showMessage(
          error?.error?.message ||
            error?.message ||
            'Unable to edit category' + error
        );
      },
    });
  }

  //NAVIGATE TO ADD PRODUCT PAGE
  navigateToAddQuestionPage(): void {
    this.router.navigate(['/add-question']);
  }

  //NAVIGATE TO EDIT PRODUCT PAGE
  navigateToEditProductPage(id: string): void {
    this.router.navigate([`/update-question/${id}`]);
  }

  navigateToViewQuestionDetails(id: string):void{
      this.router.navigate([`/question-details/${id}`]);
  }

  deleteQuestion(id:string):void{
    if(!confirm("Are you sure you want to delete this Question?")){
      return;
    }
    this.questionService.deleteQuestionById(id).subscribe({
      next: (res:any)=>{
        alert(res.message);
        const currentUrl = this.router.url;

        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });

      },error:(err)=>{
        alert(err.error.message);
      }
    })
  }

    changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      //this.loadCategories();
    }
  }

  changeSize(event: any): void {
    this.size = event.target.value;
    this.page = 0;
   // this.loadCategories();
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.direction = 'asc';
    }
    //this.loadCategories();
  }


  //SHOW ERROR
  showMessage(message: string) {
    this.message = message;
    setTimeout(() => {
      this.message = '';
    }, 4000);
  }
}

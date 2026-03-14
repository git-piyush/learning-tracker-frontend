import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionService } from '../service/question.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../category/service/category.service';
import { NotificationService } from '../../shared/notificationService';

interface Question {
    id:string;
    category:string;
    subCategory:string;
    type:string;
    question:string;
    answer:string;
    bookmark:string;
    level:string;
    modifiedDate:Date;
    image:string;
}

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [MatSnackBarModule,CommonModule,FormsModule ],
  templateUrl: './question-list.component.html',
  styleUrl: './question-list.component.css'
})
export class QuestionListComponent  implements OnInit {

  searchForm = {
    category: '',
    subCategory: '',
    type: '',
    bookmark: ''
  };


  constructor(private questionService: QuestionService, 
    private router: Router,
    private snackBar: MatSnackBar,
    private categoryService:CategoryService,
    private notify:NotificationService) {}
  
  products: Question[] = [];
  message: string = '';
  categoryList: String[] = [];
  subCategoryList:string[] = [];

  totalPages = 0;
  totalElements = 0;
  page = 0;
  size = 8;
  sortBy = 'id';
  direction = 'asc';

  isTileView: boolean = false;


  ngOnInit(): void {
    this.loadDropdown();
    this.loadQuestions();
  }

  loadDropdown():void{
    this.categoryService.getCategoryList().subscribe({
      next: (res)=>{
        this.categoryList = res.categoryList;
        console.log(this.categoryList);
      },error:(err)=>console.error(err)
    });
  }

  onChangeCategory(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const category1 = selectElement.value;
    this.categoryService.getSubCategoryMap(category1).subscribe({
      next: (res)=>{
        this.subCategoryList = res.subCategoryList;
        console.log(this.subCategoryList);
      },error:(err)=>this.notify.success(err.error.message)
    });
    this.loadQuestions();
  }

  getImageSrc(base64String: string): string {
    if (!base64String) {
      return '';
    }
    return 'data:image/jpeg;base64,' + base64String;
  }

  loadQuestions(): void {
    this.questionService.getAllQuestions(this.page,this.size,this.direction,this.sortBy,this.searchForm).subscribe({
      next: (res) => {
        this.products = res.questionList;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
      },
      error: (err) =>{
        console.error(err);
      }
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
        this.showMessage(res.message);
        const currentUrl = this.router.url;

        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });

      },error:(err)=>{
        this.showMessage(err.error.message);
      }
    })
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadQuestions();
    }
  }

  changeSize(event: any): void {
    this.size = event.target.value;
    this.page = 0;
    this.loadQuestions();
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.direction = 'asc';
    }
    this.loadQuestions();
  }

  goToPage(value: string): void {
  const pageNumber = parseInt(value, 10);

  // Ignore empty / non-numeric input
  if (isNaN(pageNumber)) return;

  // Convert from 1-based (what the user sees) to 0-based (what the API uses)
  const targetPage = pageNumber - 1;

  // Clamp to valid range and only navigate if it's a different page
  if (targetPage >= 0 && targetPage < this.totalPages && targetPage !== this.page) {
    this.changePage(targetPage);
  }}


  //SHOW ERROR
  showMessage(message: string) {
    this.message = message;
    setTimeout(() => {
      this.message = '';
    }, 4000);
  }

  viewMode: 'list' | 'tiles' = 'list';

  toggleTileAndListView(): void {
    this.viewMode = this.viewMode === 'list' ? 'tiles' : 'list';

  }

  get buttonText(): string {
    return this.viewMode === 'list' ? 'Switch to Tiles' : 'Switch to List';
  }


  resetSearch(){
    this.searchForm = {
    category: '',
    subCategory: '',
    type: '',
    bookmark: ''
  };
    this.page = 0; // reset to first page
    this.loadQuestions(); // reload full list
  }

  onImageError(event: Event) {
  (event.target as HTMLImageElement).src = 'defaultquestion.png';
}
}

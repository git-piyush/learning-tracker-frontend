import { CommonModule } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../service/transaction.service';
import { BaseComponent } from '../../shared/baseComponent';
import { CategorySearch } from '../../shared/app.model';
import { CategoryService } from '../../category/service/category.service';

export interface Question {
  pid:number;
  id: number;
  question: string;
  answer: string;
  bookmark: string;
  category: string;
  subCategory: string;
  topic:string;
  type: string;
  createdDate: string;
  modifiedDate: string;
}
  
@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent extends BaseComponent  implements OnInit {

  constructor(injector:Injector ,private transactionService:TransactionService, private categoryService:CategoryService){
    super(injector);
  }

  searchForm = {
    category: '',
    subCategory: '',
    topic:'',
    type: '',
    level:'',
    bookmark: '',
    searchText:''
  };
 
  questions: Question[] = [];
  categoryList: String[] = [];
  subCategoryList: String[] = [];
  topicList: String[] = [];
 
  // Pagination
  totalPages = 0;
  totalElements = 0;
  page = 0;
  size = 2;
  sortBy = 'id';
  direction = 'asc';

 
  ngOnInit(): void {
    this.resetFilters();
    this.lodCategoryDropdown();
    this.loadQuestions();
  }

  lodCategoryDropdown():void{
    this.categoryService.getCategoryList().subscribe({
      next: (res)=>{
        this.categoryList = res.categoryList;
      },error:(err)=>console.error(err)
    });
  }

  onCategoryChange(event:Event):void{
    this.searchForm.subCategory='';
    this.searchForm.topic='';
        const selectElement = event.target as HTMLSelectElement;
        const category = selectElement.value;
      if(category!=''){
        this.categoryService.getSubCategoryList(category).subscribe({
          next: (res)=>{
            this.subCategoryList = res.subCategoryList;
          },error:(err)=>{
            this.notify.error(err.error.message);
          }
      });
    }
    this.loadQuestions();
  }

  onSubCategoryChange(event:Event):void{
        this.searchForm.topic='';
        const selectElement = event.target as HTMLSelectElement;
        const category = selectElement.value;
       if(category!=''){
         this.categoryService.getTopicList(category).subscribe({
          next: (res)=>{
            this.topicList = res.topicList;
          },error:(err)=>{
            this.notify.error(err.error.message);
            }
        });
       }
       this.loadQuestions();
  }


  loadQuestions(): void {
    console.log(this.searchForm);
    this.transactionService.getAllQuestions(this.page,this.size,this.direction,this.sortBy,this.searchForm).subscribe({
      next: (res) => {
        this.questions = res.questionList;
        console.log(this.questions);
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
      },
      error: (err) =>{
        console.error(err);
      }
    });
  }


  resetFilters(): void {
      this.totalPages = 0;
      this.totalElements = 0;
      this.page = 0;
      this.size = 10;
      this.sortBy = 'id';
      this.direction = 'asc';
  }
 
  private updatePagination(): void {
    
  }

  onView(item: Question): void {
    console.log('View:', item);
  }

  toggleBookmark(item: Question):void{
    item.bookmark = item.bookmark === 'Yes' ? 'No' : 'Yes';
      console.log(item.id);
  }
 
  onEdit(item: Question): void {
    console.log('Edit:', item);
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
      }
    }

  deleteQuestion(id:number):void{

  }

  navigateToEditProductPage(id:number):void{

  }

  navigateToViewQuestionDetails(id:number):void{

  }
}
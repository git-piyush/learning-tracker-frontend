import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../service/transaction.service';

export interface Question {
  id: number;
  question: string;
  answer: string;
  bookmarked: string;
  category: string;
  subCategory: string;
  topic:string;
  type: string;
  createdDate: string;
  modifiedDate: string;
}
 
export interface Filters {
  category: string;
  subcategory: string;
  bookmark: string;
  search: string;
}
 

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent  implements OnInit {

  constructor(private transactionService:TransactionService){}

  searchForm = {
    category: '',
    subCategory: '',
    type: '',
    bookmark: ''
  };
 
  questions: Question[] = [];
  filteredQuestions: Question[] = [];
  pagedQuestions: Question[] = [];
 
  filters: Filters = {
    category: '',
    subcategory: '',
    bookmark: '',
    search: ''
  };
 
  categories: string[] = [];
  subcategories: string[] = [];
 
  // Pagination
  totalPages = 0;
  totalElements = 0;
  page = 0;
  size = 2;
  sortBy = 'id';
  direction = 'asc';



 
  ngOnInit(): void {
    this.resetFilters();
    this.loadQuestions();
  }


  loadQuestions(): void {
    this.transactionService.getAllQuestions(this.page,this.size,this.direction,this.sortBy,this.searchForm).subscribe({
      next: (res) => {
        this.questions = res.questionList;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
      },
      error: (err) =>{
        console.error(err);
      }
    });
  }

 
  applyFilters(): void {
    const { category, subcategory, bookmark, search } = this.filters;
    const q = search.toLowerCase();
 
    this.filteredQuestions = this.questions.filter(item => {
      const matchCat  = !category    || item.category    === category;
      const matchSub  = !subcategory || item.subCategory === subcategory;
      const matchBm   = bookmark === '' || String(item.bookmarked) === bookmark;
      const matchText = !q || item.question.toLowerCase().includes(q)
                           || item.answer.toLowerCase().includes(q);
      return matchCat && matchSub && matchBm && matchText;
    });
    this.updatePagination();
  }
 
  resetFilters(): void {
      this.totalPages = 0;
      this.totalElements = 0;
      this.page = 0;
      this.size = 10;
      this.sortBy = 'id';
      this.direction = 'asc';
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
 
  private updatePagination(): void {
    
  }

  onView(item: Question): void {
    console.log('View:', item);
  }

  toggleBookmark(item: Question):void{

  }
 
  onEdit(item: Question): void {
    console.log('Edit:', item);
  }
 
  onDelete(item: Question): void {
    if (confirm(`Delete question: "${item.question}"?`)) {
      this.questions = this.questions.filter(q => q.id !== item.id);
      this.applyFilters();
    }
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
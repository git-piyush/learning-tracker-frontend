import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface Question {
  id: number;
  question: string;
  answer: string;
  bookmarked: boolean;
  category: string;
  subcategory: string;
  type: string;
  createdAt: string;
  modifiedAt: string;
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
  currentPage = 1;
  pageSize = 10;
  pages: number[] = [];

  totalPages = 0;
  totalElements = 0;
  page = 0;
  size = 8;
  sortBy = 'id';
  direction = 'asc';



 
  ngOnInit(): void {
    // TODO: Replace with your service call, e.g.:
    // this.questionService.getAll().subscribe(data => {
    //   this.questions = data;
    //   this.initFilters();
    //   this.applyFilters();
    // });
  }
 
  private initFilters(): void {
    this.categories    = [...new Set(this.questions.map(q => q.category))];
    this.subcategories = [...new Set(this.questions.map(q => q.subcategory))];
  }
 
  applyFilters(): void {
    const { category, subcategory, bookmark, search } = this.filters;
    const q = search.toLowerCase();
 
    this.filteredQuestions = this.questions.filter(item => {
      const matchCat  = !category    || item.category    === category;
      const matchSub  = !subcategory || item.subcategory === subcategory;
      const matchBm   = bookmark === '' || String(item.bookmarked) === bookmark;
      const matchText = !q || item.question.toLowerCase().includes(q)
                           || item.answer.toLowerCase().includes(q);
      return matchCat && matchSub && matchBm && matchText;
    });
 
    this.currentPage = 1;
    this.updatePagination();
  }
 
  resetFilters(): void {
    this.filters = { category: '', subcategory: '', bookmark: '', search: '' };
    this.filteredQuestions = [...this.questions];
    this.currentPage = 1;
    this.updatePagination();
  }
 
  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredQuestions.length / this.pageSize) || 1;
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.slicePage();
  }
 
  private slicePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedQuestions = this.filteredQuestions.slice(start, start + this.pageSize);
  }
 
  // goToPage(page: number): void {
  //   if (page < 1 || page > this.totalPages) return;
  //   this.currentPage = page;
  //   this.slicePage();
  // }
 
  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }
 
  toggleBookmark(item: Question): void {
    item.bookmarked = !item.bookmarked;
  }
 
  onView(item: Question): void {
    console.log('View:', item);
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
     // this.loadQuestions();
    }
  }

  changeSize(event: any): void {
    this.size = event.target.value;
    this.page = 0;
    //this.loadQuestions();
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.direction = 'asc';
    }
    //this.loadQuestions();
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
 
  get startIndex(): number {
    return this.filteredQuestions.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }
 
  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredQuestions.length);
  }
}
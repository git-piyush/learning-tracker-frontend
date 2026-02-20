import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoryService } from '../../category/service/category.service';

interface Category {
  id: number;
  refCode: string;
  refCodeLongName: string;
  category: string;
  subCategory:string;
  active: string;
  refCodeOrder?: number;
}

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css'
})
export class FeedbackComponent implements OnInit {

  searchForm = {
    category: '',
    refCode: '',
    refCodeLongName: '',
    active: '',
    subCategory:''
  };
  categoryList: String[] = [];
  categories: Category[] = [];
  totalPages = 0;
  totalElements = 0;
  page = 0;
  size = 10;
  sortBy = 'id';
  direction = 'asc';

  constructor(private http: HttpClient, private router: Router, private categoryService:CategoryService) {}

  ngOnInit(): void {
    this.loadDropdown();
    this.loadCategories();
  }

  resetSearch(): void {
    this.searchForm = {
      category: '',
      refCode: '',
      refCodeLongName: '',
      active: '',
      subCategory:''
    };
    this.page = 0; // reset to first page
    this.loadCategories(); // reload full list
}


  loadDropdown():void{
    this.categoryService.getCategoryList().subscribe({
      next: (res)=>{
        this.categoryList = res.categoryList;
        console.log(this.categoryList);
      },error:(err)=>console.error(err)
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategory(this.page,this.size,this.direction,this.sortBy,this.searchForm).subscribe({
      next: (res) => {
        this.categories = res.categories;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
      },
      error: (err) => console.error(err)
    });
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadCategories();
    }
  }

  changeSize(event: any): void {
    this.size = event.target.value;
    this.page = 0;
    this.loadCategories();
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.direction = 'asc';
    }
    this.loadCategories();
  }

  addCategory(): void {
    this.router.navigate(['/add-category']);
  }

  viewCategory(id: number): void {
    this.router.navigate(['/view-category', id]);
  }

  updateCategory(id: number): void {
    this.router.navigate(['/update-category', id]);
  }

  deleteCategory(id: number): void {
      if (!confirm("Are you sure you want to delete this Reference Code?")) {
        return ;
      }

      this.categoryService.deleteCategory(id).subscribe({
          next: (res:any) => {
                alert('Category Deleted Sucessfully!');
                window.location.reload();
              },
              error: (err: any) => {
              if(err.error.status===401){
                alert('Need Access/Login!');
                this.router.navigate(['/login']);
              }
              alert(err.error.message);
            }
    });
  }

  // Search method
  search(): void {
    this.page = 0; // reset to first page
    this.loadCategories(); // reload with filters applied
  }


}


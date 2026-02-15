import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../service/category.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-update-category',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule, CommonModule],
  templateUrl: './update-category.component.html',
  styleUrl: './update-category.component.css'
})
export class UpdateCategoryComponent implements OnInit{
  categoryId!: string;

  constructor(private route: ActivatedRoute, private categoryService: CategoryService,
    private router: Router,private fb: FormBuilder, private http: HttpClient
  ){}

    formData: any = {
      id:'',
      refCode: '',
      refCodeLongName: '',
      category: '',
      active: '',
      subCategory:''
  };
  
  message:string | null = null;
  categoryList: String[] = [];
  subCategoryList: String[] = [];



  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('catId') || '';
    this.loadDropdown();
    this.loadCategoryData(this.categoryId);
  }

  loadDropdown():void{
    this.categoryService.getCategoryList().subscribe({
      next: (res)=>{
        this.categoryList = res.categoryList;
        console.log(this.categoryList);
      },error:(err)=>console.error(err)
    });
  }

  loadCategoryData(categoryId: string) {
        this.categoryService.getCategoryById(this.categoryId).subscribe({
          next: (res:any) => {
                this.formData = {
                  id: res.category.id,
                  refCode: res.category.refCode,
                  refCodeLongName: res.category.refCodeLongName,
                  category: res.category.category,
                  active: res.category.active,
                  subCategory: res.category.subCategory
                };
                this.loadSubcategory(res.category.category, res.category.subCategory);
                
              },
              error: (err: any) => {
              if(err.error.status==401){
                alert('Need Access/Login!');
                this.router.navigate(['/login']);
            }
              alert(err.error.message);
        }
    });

  }

  handleSubmit() { 
    if( 
      !this.formData.refCode || 
      !this.formData.refCodeLongName || 
      !this.formData.category || 
      !this.formData.active ||
      !this.formData.subCategory
    ){
      this.showMessage("All fields are required");
      return;
    }
    console.log('Update: '+this.formData.subCategory);
    this.categoryService.updateCategory(this.formData).subscribe({
          next: (res:any) => {
                alert('Category Updated Sucessfully!');
                this.router.navigate(['/all-category']);
              },
              error: (err: any) => {
              if(err.error.status==401){
                alert('Need Access/Login!');
                this.router.navigate(['/login']);
              }
              alert(err.error.message);
            }
    });
  }

  loadSubcategory(cat:string, subCategory:string):void{
      this.categoryService.getSubCategoryMap(cat).subscribe({
        next: (res)=>{
          this.subCategoryList = res.subCategoryList;
        },error:(err)=>console.error(err)
      });
      this.formData.subCategory = subCategory;
  }

 onChangeCategory(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const category = selectElement.value;
    this.categoryService.getSubCategoryMap(category).subscribe({
      next: (res)=>{
        this.subCategoryList = res.subCategoryList;
      },error:(err)=>console.error(err)
    });
  }

  showMessage(message:string){
    this.message = message;
    setTimeout(() =>{
      this.message = null
    }, 4000)
  }

}

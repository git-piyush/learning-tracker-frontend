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
      active: ''
  };
  
  message:string | null = null;
  categoryList: String[] = [];

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
                console.log(res.category);
                this.formData = {
                  id: res.category.id,
                  refCode: res.category.refCode,
                  refCodeLongName: res.category.refCodeLongName,
                  category: res.category.category,
                  active: res.category.active
                };
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
      !this.formData.active 
    ){
      this.showMessage("All fields are required");
      return;
    }
    console.log('pk'+this.formData);
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

  showMessage(message:string){
    this.message = message;
    setTimeout(() =>{
      this.message = null
    }, 4000)
  }

}

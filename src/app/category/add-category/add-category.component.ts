import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../service/api.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CategoryService } from '../service/category.service';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule, CommonModule],
  templateUrl: './add-category.component.html',
  styleUrl: './add-category.component.css'
})
export class AddCategoryComponent implements OnInit {

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,private fb: FormBuilder, private http: HttpClient
  ){}

  formData: any = {
      refCode: '',
      refCodeLongName: '',
      category: '',
      active: ''
  };
  
  message:string | null = null;
  categoryList: String[] = [];
  isNewCat:boolean=false;

  ngOnInit(): void {
    this.loadDropdown();
  }

  addNewRefCodeInExistingCat(){
    this.isNewCat = !this.isNewCat;
  }

  loadDropdown():void{
    this.categoryService.getCategoryList().subscribe({
      next: (res)=>{
        this.categoryList = res.categoryList;
        console.log(this.categoryList);
      },error:(err)=>console.error(err)
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
    this.categoryService.createCategory(this.formData).subscribe({
          next: (res:any) => {
                alert('Category Updated Sucessfully!');
                this.router.navigate(['/all-category']);
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


  showMessage(message:string){
    this.message = message;
    setTimeout(() =>{
      this.message = null
    }, 4000)
  }
    
}
